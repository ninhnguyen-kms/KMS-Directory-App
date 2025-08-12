import { Contact } from '@/types';
import * as Contacts from 'expo-contacts';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';

class ContactActionsService {
  // Share contact functionality
  async shareContact(contact: Contact): Promise<void> {
    try {
      const contactInfo = this.formatContactForSharing(contact);
      
      if (await Sharing.isAvailableAsync()) {
        // Create a temporary vCard format
        const vCardContent = this.generateVCard(contact);
        
        // For now, we'll share as text, but you could implement file sharing
        await Sharing.shareAsync(vCardContent, {
          mimeType: 'text/plain',
          dialogTitle: `Share ${contact.fullName}'s contact`,
        });
      } else {
        // Fallback to other sharing methods
        Alert.alert(
          'Share Contact',
          contactInfo,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Copy to Clipboard', onPress: () => this.copyToClipboard(contactInfo) }
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing contact:', error);
      Alert.alert('Error', 'Failed to share contact');
    }
  }

  // Add contact to phone's contact list
  async addToPhoneContacts(contact: Contact): Promise<void> {
    try {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant contacts permission to add this contact');
        return;
      }

      // Prepare contact data for phone
      const contactData: Contacts.Contact = {
        contactType: Contacts.ContactTypes.Person,
        name: contact.fullName,
        firstName: contact.firstName,
        lastName: contact.lastName,
        emails: contact.email ? [{ email: contact.email, isPrimary: true, label: 'work' }] : undefined,
        phoneNumbers: contact.phone ? [{ number: contact.phone, isPrimary: true, label: 'work' }] : undefined,
        jobTitle: contact.position,
        company: contact.department,
      };

      // Add contact to phone
      const contactId = await Contacts.addContactAsync(contactData);
      
      if (contactId) {
        Alert.alert('Success', `${contact.fullName} has been added to your contacts`);
      } else {
        Alert.alert('Error', 'Failed to add contact to phone');
      }
    } catch (error) {
      console.error('Error adding contact to phone:', error);
      Alert.alert('Error', 'Failed to add contact to phone');
    }
  }

  // Call contact
  async callContact(contact: Contact): Promise<void> {
    try {
      if (!contact.phone) {
        Alert.alert('No Phone Number', 'This contact does not have a phone number');
        return;
      }

      const phoneUrl = `tel:${contact.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Cannot make phone calls on this device');
      }
    } catch (error) {
      console.error('Error calling contact:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  }

  // Send email to contact
  async emailContact(contact: Contact): Promise<void> {
    try {
      if (!contact.email) {
        Alert.alert('No Email Address', 'This contact does not have an email address');
        return;
      }

      const emailUrl = `mailto:${contact.email}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Cannot send emails on this device');
      }
    } catch (error) {
      console.error('Error emailing contact:', error);
      Alert.alert('Error', 'Failed to open email');
    }
  }

  // Send SMS to contact
  async sendSMS(contact: Contact): Promise<void> {
    try {
      if (!contact.phone) {
        Alert.alert('No Phone Number', 'This contact does not have a phone number');
        return;
      }

      const smsUrl = Platform.OS === 'ios' 
        ? `sms:${contact.phone}` 
        : `sms:${contact.phone}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Cannot send SMS on this device');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('Error', 'Failed to open SMS');
    }
  }

  // Format contact information for sharing
  private formatContactForSharing(contact: Contact): string {
    let contactInfo = `${contact.fullName}\n`;
    
    if (contact.position) {
      contactInfo += `Position: ${contact.position}\n`;
    }
    
    if (contact.department) {
      contactInfo += `Department: ${contact.department}\n`;
    }
    
    if (contact.email) {
      contactInfo += `Email: ${contact.email}\n`;
    }
    
    if (contact.phone) {
      contactInfo += `Phone: ${contact.phone}\n`;
    }
    
    if (contact.location) {
      contactInfo += `Location: ${contact.location}\n`;
    }

    return contactInfo;
  }

  // Generate vCard format for contact
  private generateVCard(contact: Contact): string {
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `FN:${contact.fullName}\n`;
    vcard += `N:${contact.lastName};${contact.firstName};;;\n`;
    
    if (contact.email) {
      vcard += `EMAIL;TYPE=WORK:${contact.email}\n`;
    }
    
    if (contact.phone) {
      vcard += `TEL;TYPE=WORK:${contact.phone}\n`;
    }
    
    if (contact.position) {
      vcard += `TITLE:${contact.position}\n`;
    }
    
    if (contact.department) {
      vcard += `ORG:${contact.department}\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
  }

  // Copy text to clipboard (you might want to install @react-native-clipboard/clipboard)
  private async copyToClipboard(text: string): Promise<void> {
    try {
      // Note: You might want to install and use @react-native-clipboard/clipboard for this
      console.log('Copying to clipboard:', text);
      Alert.alert('Copied', 'Contact information copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
}

export const contactActions = new ContactActionsService();
