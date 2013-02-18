﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using AlarmWorkflow.Shared.Addressing;
using AlarmWorkflow.Shared.Addressing.EntryObjects;
using AlarmWorkflow.Shared.Core;
using AlarmWorkflow.Shared.Diagnostics;
using AlarmWorkflow.Shared.Engine;
using AlarmWorkflow.Shared.Extensibility;
using AlarmWorkflow.Shared.Settings;

namespace AlarmWorkflow.Job.MailingJob
{
    /// <summary>
    /// Implements a Job that send emails with the common alarm information.
    /// </summary>
    [Export("MailingJob", typeof(IJob))]
    sealed class MailingJob : IJob
    {
        #region Fields

        private SmtpClient _smptClient;
        private MailAddress _senderEmail;

        private List<MailAddressEntryObject> _recipients;

        private string _mailSubject;
        private string _mailBodyFormat;

        #endregion

        #region Constructors

        /// <summary>
        /// Initializes a new instance of the MailingJob class.
        /// </summary>
        public MailingJob()
        {
            _recipients = new List<MailAddressEntryObject>();
        }

        #endregion

        #region IJob Members

        bool IJob.Initialize()
        {
            string smtpHostName = SettingsManager.Instance.GetSetting("MailingJob", "HostName").GetString();
            string userName = SettingsManager.Instance.GetSetting("MailingJob", "UserName").GetString();
            string userPassword = SettingsManager.Instance.GetSetting("MailingJob", "Password").GetString();
            int smtpPort = SettingsManager.Instance.GetSetting("MailingJob", "Port").GetInt32();
            bool smtpAuthenticate = SettingsManager.Instance.GetSetting("MailingJob", "Authenticate").GetBoolean();
            bool useSsl = SettingsManager.Instance.GetSetting("MailingJob", "UseSsl").GetBoolean();

            _senderEmail = Helpers.ParseAddress(SettingsManager.Instance.GetSetting("MailingJob", "SenderAddress").GetString());
            if (_senderEmail == null)
            {
                Logger.Instance.LogFormat(LogType.Warning, this, Properties.Resources.NoSenderAddressMessage);
                return false;
            }

            // Create new SMTP client for sending mails
            _smptClient = new SmtpClient(smtpHostName, smtpPort);
            _smptClient.EnableSsl = useSsl;
            if (smtpAuthenticate)
            {
                _smptClient.Credentials = new NetworkCredential(userName, userPassword);
            }

            _mailBodyFormat = SettingsManager.Instance.GetSetting("MailingJob", "EMailBody").GetString();
            _mailSubject = SettingsManager.Instance.GetSetting("MailingJob", "EMailSubject").GetString();
            if (string.IsNullOrWhiteSpace(_mailSubject))
            {
                _mailSubject = AlarmWorkflowConfiguration.Instance.FDInformation.Name + " - Neuer Alarm";
            }

            // Get recipients
            var recipients = AddressBookManager.GetInstance().GetCustomObjects<MailAddressEntryObject>("Mail");
            _recipients.AddRange(recipients.Select(ri => ri.Item2));

            // Require at least one recipient for initialization to succeed
            if (_recipients.Count == 0)
            {
                Logger.Instance.LogFormat(LogType.Warning, this, Properties.Resources.NoRecipientsMessage);
                return false;
            }

            return true;
        }

        void IJob.Execute(IJobContext context, Operation operation)
        {
            SendMail(operation);
        }

        private void SendMail(Operation operation)
        {
            using (MailMessage message = new MailMessage())
            {
                message.From = _senderEmail;
                foreach (var recipient in _recipients)
                {
                    switch (recipient.Type)
                    {
                        case MailAddressEntryObject.ReceiptType.CC: message.CC.Add(recipient.Address); break;
                        case MailAddressEntryObject.ReceiptType.Bcc: message.Bcc.Add(recipient.Address); break;
                        default:
                        case MailAddressEntryObject.ReceiptType.To: message.To.Add(recipient.Address); break;
                    }
                }

                message.Subject = _mailSubject;
                message.Body = ObjectFormatter.ToString(operation, _mailBodyFormat);

                message.BodyEncoding = Encoding.UTF8;
                message.Priority = MailPriority.High;
                message.IsBodyHtml = false;

                try
                {
                    _smptClient.Send(message);
                }
                catch (Exception ex)
                {
                    SmtpException smtpException = ex as SmtpException;
                    if (smtpException != null)
                    {
                        Logger.Instance.LogFormat(LogType.Error, this, Properties.Resources.SendExceptionSMTPMessage, smtpException.StatusCode, smtpException.Message);
                    }
                    else
                    {
                        Logger.Instance.LogFormat(LogType.Error, this, Properties.Resources.SendExceptionMessage);
                    }
                    Logger.Instance.LogException(this, ex);
                }
            }
        }

        bool IJob.IsAsync
        {
            get { return true; }
        }

        #endregion

        #region IDisposable Members

        void System.IDisposable.Dispose()
        {

        }

        #endregion
    }
}
