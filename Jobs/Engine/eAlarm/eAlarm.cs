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
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using AlarmWorkflow.BackendService.AddressingContracts;
using AlarmWorkflow.BackendService.AddressingContracts.EntryObjects;
using AlarmWorkflow.BackendService.EngineContracts;
using AlarmWorkflow.BackendService.SettingsContracts;
using AlarmWorkflow.Shared.Core;
using AlarmWorkflow.Shared.Diagnostics;

namespace AlarmWorkflow.Job.eAlarm
{ //
    /// <summary>
    /// Implements a Job that send notifications to the Android App eAlarm.
    /// </summary>
    [Export(nameof(eAlarm), typeof(IJob))]
    [Information(DisplayName = "ExportJobDisplayName", Description = "ExportJobDescription")]
    class eAlarm : IJob
    {
        #region Constants

        private const string GcmApiKey = "AIzaSyA5hhPTlYxJsEDniEoW8OgfxWyiUBEPiS0";
        private const string FcmApiKey = "AIzaSyB4CKxUDeYC7lU-p0pLsJSJ1kcVRv6AHWk";

        #endregion

        #region Fields

        private ISettingsServiceInternal _settings;
        private IAddressingServiceInternal _addressing;

        #endregion

        #region Enums

        private enum CloudMessagingService { GCM, FCM }

        #endregion

        #region Constructor

        /// <summary>
        /// Initializes a new instance of the <see cref="eAlarm" /> class.
        /// </summary>
        public eAlarm()
        {
        }

        #endregion

        #region IJob Members

        bool IJob.Initialize(IServiceProvider serviceProvider)
        {
            _settings = serviceProvider.GetService<ISettingsServiceInternal>();
            _addressing = serviceProvider.GetService<IAddressingServiceInternal>();

            return true;
        }

        void IJob.Execute(IJobContext context, Operation operation)
        {
            if (context.Phase != JobPhase.AfterOperationStored)
            {
                return;
            }
            
            string body = operation.ToString(_settings.GetSetting("eAlarm", "text").GetValue<string>());
            string header = operation.ToString(_settings.GetSetting("eAlarm", "header").GetValue<string>());
            string location = operation.Einsatzort.ToString();
            string latlng = operation.Einsatzort.GeoLatLng;
            string timestamp = operation.Timestamp.ToString("s");
            string key = operation.OperationGuid.ToString();

            bool encryption = _settings.GetSetting("eAlarm", "Encryption").GetValue<bool>();
            if (encryption)
            {
                string encryptionKey = _settings.GetSetting("eAlarm", "EncryptionKey").GetValue<string>();

                body = Helper.Encrypt(body, encryptionKey);
                header = Helper.Encrypt(header, encryptionKey);
                location = Helper.Encrypt(location, encryptionKey);
                latlng = Helper.Encrypt(latlng, encryptionKey);
                timestamp = Helper.Encrypt(timestamp, encryptionKey);
                key = Helper.Encrypt(key, encryptionKey);
            }

            Content content = new Content()
            {
                data = new Content.Data()
                {
                    awf_key = key,
                    awf_title = header,
                    awf_message = body,
                    awf_location = location,
                    awf_latlng = latlng,
                    awf_timestamp = timestamp
                }
            };

            //Send to eAlarm
            content.registration_ids = GetRecipients(operation)
                .Where(pushEntryObject => pushEntryObject.Consumer == "eAlarm")
                .Select(pushEntryObject => pushEntryObject.RecipientApiKey)
                .ToArray();
            HttpStatusCode result = 0;
            if (!SendNotification(CloudMessagingService.GCM, content, ref result))
            {
                Logger.Instance.LogFormat(LogType.Error, this, Properties.Resources.ErrorSendingNotification, result);
            }

            //Send to fAlarm
            content.registration_ids = GetRecipients(operation)
                .Where(pushEntryObject => pushEntryObject.Consumer == "fAlarm")
                .Select(pushEntryObject => pushEntryObject.RecipientApiKey)
                .ToArray();
            result = 0;
            if (!SendNotification(CloudMessagingService.FCM, content, ref result))
            {
                Logger.Instance.LogFormat(LogType.Error, this, Properties.Resources.ErrorSendingNotification, result);
            }
        }

        private IList<PushEntryObject> GetRecipients(Operation operation)
        {
            var recipients = _addressing.GetCustomObjectsFiltered<PushEntryObject>(PushEntryObject.TypeId, operation);
            return recipients.Select(ri => ri.Item2).ToList();
        }

        bool IJob.IsAsync => true;

        #endregion

        #region Methods

        private bool SendNotification(CloudMessagingService service, Content content, ref HttpStatusCode result)
        {
            if (content.registration_ids.Length == 0)
                return true;

            string message = Json.Serialize(content);
            byte[] byteArray = Encoding.UTF8.GetBytes(message);
            string url = string.Empty, apiKey = string.Empty;

            switch (service)
            {
                case CloudMessagingService.GCM:
                    url = "https://android.googleapis.com/gcm/send";
                    apiKey = GcmApiKey;
                    Logger.Instance.LogFormat(LogType.Debug, this, Properties.Resources.DebugSendMessage, "eAlarm", message);
                    break;
                case CloudMessagingService.FCM:
                    url = "https://fcm.googleapis.com/fcm/send";
                    apiKey = FcmApiKey;
                    Logger.Instance.LogFormat(LogType.Debug, this, Properties.Resources.DebugSendMessage, "fAlarm", message);
                    break;
                default:
                    Logger.Instance.LogFormat(LogType.Error, this, Properties.Resources.ErrorMessagingServiceNotFound);
                    return false;
            }

            ServicePointManager.ServerCertificateValidationCallback += ValidateServerCertificate;

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = WebRequestMethods.Http.Post;
            request.KeepAlive = false;
            request.ContentType = "application/json";
            request.Headers.Add(string.Format("Authorization: key={0}", apiKey));
            request.ContentLength = byteArray.Length;

            using (Stream dataStream = request.GetRequestStream())
            {
                dataStream.Write(byteArray, 0, byteArray.Length);
            }

            try
            {
                using (WebResponse response = request.GetResponse())
                {
                    HttpStatusCode responseCode = ((HttpWebResponse)response).StatusCode;
                    
                    StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8);
                    String responseString = reader.ReadToEnd();

                    Logger.Instance.LogFormat(LogType.Debug, this, Properties.Resources.DebugGetResponse, responseCode, responseString);

                    if (responseCode != HttpStatusCode.OK)
                    {
                        result = responseCode;
                        return false;
                    }
                }
            }
            catch (Exception exception)
            {
                Logger.Instance.LogException(this, exception);
            }

            return true;
        }

        private static bool ValidateServerCertificate(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

        #endregion

        #region IDisposable Members

        void IDisposable.Dispose()
        {
        }

        #endregion
    }
}