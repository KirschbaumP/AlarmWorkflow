﻿// This file is part of AlarmWorkflow.
// 
// AlarmWorkflow is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// AlarmWorkflow is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with AlarmWorkflow.  If not, see <http://www.gnu.org/licenses/>.

using System;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using AlarmWorkflow.Shared.Core;
using AlarmWorkflow.Shared.Diagnostics;
using AlarmWorkflow.Shared.Extensibility;

namespace AlarmWorkflow.Parser.Library
{
    [Export("ILSRegensburgParser", typeof(IParser))]
    class ILSRegensburgParser : IParser
    {
        #region Fields

        private readonly string[] _keywords = new[]
            {
                "Einsatznummer", "Name", "Straße", "Abschnitt", "Ort",
                "Gemeinde", "Kreuzung", "Objekt", "Schlagw.",
                "Stichwort", "Prio.", "Alarmiert", "gef. Gerät"
            };

        #endregion

        #region IParser Members

        Operation IParser.Parse(string[] lines)
        {
            Operation operation = new Operation();
            OperationResource last = new OperationResource();

            lines = Utilities.Trim(lines);
            CurrentSection section = CurrentSection.AHeader;
            bool keywordsOnly = true;
            for (int i = 0; i < lines.Length; i++)
            {
                try
                {
                    string line = lines[i];
                    if (line.Length == 0)
                    {
                        continue;
                    }
                    if (GetSection(line.Trim(), ref section, ref keywordsOnly))
                    {
                        continue;
                    }

                    string msg = line;
                    string prefix = "";

                    // Make the keyword check - or not (depends on the section we are in; see above)
                    string keyword = "";
                    if (keywordsOnly)
                    {
                        if (!StartsWithKeyword(line, out keyword))
                        {
                            continue;
                        }

                        int x = line.IndexOf(':');
                        if (x == -1)
                        {
                            // If there is no colon found (may happen occasionally) then simply remove the length of the keyword from the beginning
                            prefix = keyword;
                            msg = line.Remove(0, prefix.Length).Trim();
                        }
                        else
                        {
                            prefix = line.Substring(0, x);
                            msg = line.Substring(x + 1).Trim();
                        }
                        prefix = prefix.Trim().ToUpperInvariant();
                    }

                    // Parse each section
                    switch (section)
                    {
                        case CurrentSection.AHeader:
                            {
                                switch (prefix)
                                {
                                    case "EINSATZNUMMER":
                                        operation.OperationNumber = msg;
                                        break;
                                }
                            }
                            break;
                        case CurrentSection.BMitteiler:
                            operation.Messenger = line.Remove(0, keyword.Length).Trim();
                            break;
                        case CurrentSection.CEinsatzort:
                            {
                                switch (prefix)
                                {
                                    case "STRAßE":
                                        {
                                            operation.Einsatzort.Street = msg;
                                            int empty = msg.LastIndexOf("Haus-Nr.:", StringComparison.Ordinal);
                                            if (empty != -1 && empty != msg.Length)
                                            {
                                                operation.Einsatzort.Street = msg.Substring(0, empty).Trim();
                                                operation.Einsatzort.StreetNumber = GetMessageText(msg.Substring(empty).Trim());
                                            }
                                        }
                                        break;
                                    case "ORT":
                                        {
                                            Match zip = Regex.Match(msg, @"[0-9]{5}");
                                            if (zip.Success)
                                            {
                                                operation.Einsatzort.ZipCode = zip.Value;
                                                operation.Einsatzort.City = msg.Replace(zip.Value, "").Trim();
                                            }
                                            else
                                            {
                                                operation.Einsatzort.City = msg;
                                            }
                                            break;
                                        }
                                    case "GEMEINDE":
                                        {
                                            operation.CustomData.Add("GEMEINDE", msg);
                                        }
                                        break;
                                    case "OBJEKT":
                                        if (msg.Contains("EPN:"))
                                        {
                                            string epn = msg.Substring(msg.IndexOf("EPN", StringComparison.Ordinal));
                                            epn = GetMessageText(epn, "EPN");
                                            operation.OperationPlan = epn;
                                            operation.Einsatzort.Property = msg.Substring(0, msg.IndexOf("EPN", StringComparison.Ordinal));
                                        }
                                        else
                                        {
                                            operation.Einsatzort.Property = msg;
                                        }
                                        break;
                                    case "KREUZUNG":
                                        operation.Einsatzort.Intersection = msg;
                                        break;
                                }
                            }
                            break;
                        case CurrentSection.DEinsatzgrund:
                            {
                                switch (prefix)
                                {
                                    case "SCHLAGW.":
                                        operation.Keywords.Keyword = msg;
                                        break;
                                    case "STICHWORT":
                                        operation.Keywords.EmergencyKeyword = msg;
                                        break;
                                    case "PRIO.":
                                        operation.Priority = msg;
                                        break;
                                }
                            }
                            break;
                        case CurrentSection.EEinsatzmittel:
                            {
                                if (line.StartsWith("NAME", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    msg = GetMessageText(line, "NAME");
                                    last.FullName = msg;
                                }
                                else if (line.StartsWith("ALARMIERT", StringComparison.CurrentCultureIgnoreCase) && !string.IsNullOrEmpty(msg))
                                {
                                    msg = GetMessageText(line, "ALARMIERT");

                                    // In case that parsing the time failed, we just assume that the resource got requested right away.
                                    DateTime dt;
                                    // Most of the time the OCR-software reads the colon as a "1", so we check this case right here.
                                    if (!DateTime.TryParseExact(msg, "dd.MM.yyyy HH1mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out dt))
                                    {
                                        // If this is NOT the case and it was parsed correctly, try it here
                                        DateTime.TryParseExact(msg, "dd.MM.yyyy HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out dt);
                                    }

                                    last.Timestamp = dt.ToString(CultureInfo.InvariantCulture);
                                }
                                else if (line.StartsWith("GEF. GERÄT", StringComparison.CurrentCultureIgnoreCase))
                                {
                                    msg = GetMessageText(line, "GEF. GERÄT");

                                    // Only add to requested equipment if there is some text,
                                    // otherwise the whole vehicle is the requested equipment
                                    if (!string.IsNullOrWhiteSpace(msg))
                                    {
                                        last.RequestedEquipment.Add(msg);
                                    }

                                    operation.Resources.Add(last);
                                    last = new OperationResource();
                                }
                            }
                            break;
                        case CurrentSection.FBemerkung:
                            {
                                // Append with newline at the end in case that the message spans more than one line
                                operation.Comment = operation.Comment += msg + Environment.NewLine;
                            }
                            break;
                        case CurrentSection.GFooter:
                            // The footer can be ignored completely.
                            break;
                    }
                }
                catch (Exception ex)
                {
                    Logger.Instance.LogFormat(LogType.Warning, this, "Error while parsing line '{0}'. The error message was: {1}", i, ex.Message);
                }
            }
            return operation;
        }

        #endregion

        #region Methods

        private bool GetSection(String line, ref CurrentSection section, ref bool keywordsOnly)
        {
            if (line.Contains("MITTEILER"))
            {
                section = CurrentSection.BMitteiler;
                keywordsOnly = true;
                return true;
            }
            if (line.Contains("EINSATZORT"))
            {
                section = CurrentSection.CEinsatzort;
                keywordsOnly = true;
                return true;
            }
            if (line.Contains("EINSATZGRUND"))
            {
                section = CurrentSection.DEinsatzgrund;
                keywordsOnly = true;
                return true;
            }
            if (line.Contains("EINSATZMITTEL"))
            {
                section = CurrentSection.EEinsatzmittel;
                keywordsOnly = true;
                return true;
            }
            if (line.Contains("BEMERKUNG"))
            {
                section = CurrentSection.FBemerkung;
                keywordsOnly = false;
                return true;
            }
            if (line.Contains("ENDE ALARMFAX — V2.0"))
            {
                section = CurrentSection.GFooter;
                keywordsOnly = false;
                return true;
            }
            return false;
        }

        private bool StartsWithKeyword(string line, out string keyword)
        {
            line = line.ToUpperInvariant();
            foreach (string kwd in _keywords.Where(kwd => line.ToLowerInvariant().StartsWith(kwd.ToLowerInvariant())))
            {
                keyword = kwd;
                return true;
            }
            keyword = null;
            return false;
        }

        /// <summary>
        /// Returns the message text, which is the line text but excluding the keyword/prefix and a possible colon.
        /// </summary>
        /// <param name="line"></param>
        /// <param name="prefix">The prefix that is to be removed (optional).</param>
        /// <returns></returns>
        private string GetMessageText(string line, string prefix = null)
        {
            if (prefix == null)
            {
                prefix = "";
            }

            if (prefix.Length > 0)
            {
                line = line.Remove(0, prefix.Length);
            }
            else
            {
                int colonIndex = line.IndexOf(':');
                if (colonIndex != -1)
                {
                    line = line.Remove(0, colonIndex + 1);
                }
            }

            if (line.StartsWith(":"))
            {
                line = line.Remove(0, 1);
            }
            line = line.Trim();
            return line;
        }

        #endregion

        #region Nested types

        private enum CurrentSection
        {
            AHeader,
            BMitteiler,
            CEinsatzort,
            DEinsatzgrund,
            EEinsatzmittel,
            FBemerkung,
            GFooter
        }

        #endregion
    }
}
