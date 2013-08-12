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

using System.Linq;
using System.Net.Mail;
using AlarmWorkflow.Shared.Addressing;
using AlarmWorkflow.Shared.Addressing.EntryObjects;
using AlarmWorkflow.Shared.Settings;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlarmWorkflow.Shared.Tests.Shared.Addressing
{
    /// <summary>
    /// Tests the functionality of the addressbook.
    /// </summary>
    [TestClass]
    public class AddressBookTests
    {
        #region Constants

        private static readonly string MailEntryObjectTypeIdentifier = "Mail";

        #endregion

        /// <summary>
        /// Creates an addressbook with one entry, one dataitem and converts it around.
        /// </summary>
        [TestMethod]
        public void SimpleConversionTest()
        {
            string sourceValue = null;

            // Create and convert
            {
                AddressBook addressBook = CreateAddressBookWithOneEntryAndOneDataItem(true);
                sourceValue = ((IStringSettingConvertible)addressBook).ConvertBack();
            }

            // Convert to address book and check values
            {
                AddressBook addressBook = new AddressBook();
                ((IStringSettingConvertible)addressBook).Convert(sourceValue);

                Assert.AreEqual(1, addressBook.Entries.Count);
                Assert.AreEqual(1, addressBook.Entries[0].Data.Count);
                Assert.AreEqual(MailEntryObjectTypeIdentifier, addressBook.Entries[0].Data[0].Identifier);
                Assert.AreEqual(true, addressBook.Entries[0].Data[0].IsEnabled);
                Assert.AreEqual(typeof(MailAddressEntryObject), addressBook.Entries[0].Data[0].Data.GetType());
            }
        }

        /// <summary>
        /// Tests that a data item that has "IsEnabled" set to "false" is not included in the result set.
        /// </summary>
        [TestMethod()]
        public void DontReturnDataItemIfIsEnabledIsFalse()
        {
            AddressBook addressBook = CreateAddressBookWithOneEntryAndOneDataItem(false);
            Assert.AreEqual(1, addressBook.Entries.Count);
            Assert.AreEqual(1, addressBook.Entries[0].Data.Count);

            var results = addressBook.GetCustomObjects<MailAddressEntryObject>(MailEntryObjectTypeIdentifier);
            Assert.AreEqual(0, results.Count());
        }

        private AddressBook CreateAddressBookWithOneEntryAndOneDataItem(bool dataItemIsEnabled)
        {
            AddressBook addressBook = new AddressBook();

            AddressBookEntry entry = new AddressBookEntry();
            entry.FirstName = "John";
            entry.LastName = "Doe";

            MailAddressEntryObject data = new MailAddressEntryObject() { Address = new MailAddress("john.doe@example.com") };
            entry.Data.Add(new EntryDataItem() { Data = data, Identifier = MailEntryObjectTypeIdentifier, IsEnabled = dataItemIsEnabled });

            addressBook.Entries.Add(entry);

            return addressBook;
        }
    }
}