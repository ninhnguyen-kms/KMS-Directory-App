import { Contact, Group } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_KEY = 'kms_contacts';
const GROUPS_KEY = 'kms_groups';
const LAST_SYNC_KEY = 'last_sync_timestamp';

class LocalStorageService {
  // Contact management
  async saveContacts(contacts: Contact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving contacts:', error);
      throw error;
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const contactsJson = await AsyncStorage.getItem(CONTACTS_KEY);
      return contactsJson ? JSON.parse(contactsJson) : [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  async addContact(contact: Contact): Promise<void> {
    try {
      const contacts = await this.getContacts();
      const updatedContacts = [...contacts, contact];
      await this.saveContacts(updatedContacts);
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  async updateContact(contactId: string, updatedData: Partial<Contact>): Promise<void> {
    try {
      const contacts = await this.getContacts();
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex !== -1) {
        contacts[contactIndex] = { ...contacts[contactIndex], ...updatedData };
        await this.saveContacts(contacts);
      } else {
        throw new Error('Contact not found');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(contactId: string): Promise<void> {
    try {
      const contacts = await this.getContacts();
      const filteredContacts = contacts.filter(c => c.id !== contactId);
      await this.saveContacts(filteredContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    try {
      const contacts = await this.getContacts();
      const lowercaseQuery = query.toLowerCase();
      
      return contacts.filter(contact => 
        contact.fullName.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery) ||
        contact.phone.includes(query) ||
        contact.department.toLowerCase().includes(lowercaseQuery) ||
        contact.position.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  // Group management
  async saveGroups(groups: Group[]): Promise<void> {
    try {
      await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving groups:', error);
      throw error;
    }
  }

  async getGroups(): Promise<Group[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(GROUPS_KEY);
      return groupsJson ? JSON.parse(groupsJson) : [];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  async createGroup(name: string, description?: string): Promise<Group> {
    try {
      const groups = await this.getGroups();
      const newGroup: Group = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedGroups = [...groups, newGroup];
      await this.saveGroups(updatedGroups);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async addUserToGroup(groupId: string, contactId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex !== -1) {
        const group = groups[groupIndex];
        if (!group.members.includes(contactId)) {
          group.members.push(contactId);
          group.updatedAt = new Date();
          await this.saveGroups(groups);
        }
      } else {
        throw new Error('Group not found');
      }
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }

  async removeUserFromGroup(groupId: string, contactId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex !== -1) {
        const group = groups[groupIndex];
        group.members = group.members.filter(id => id !== contactId);
        group.updatedAt = new Date();
        await this.saveGroups(groups);
      } else {
        throw new Error('Group not found');
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      await this.saveGroups(filteredGroups);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Utility methods
  async getLastSyncTimestamp(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return 0;
    }
  }

  async shouldSyncContacts(maxAge: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    try {
      const lastSync = await this.getLastSyncTimestamp();
      const now = Date.now();
      return (now - lastSync) > maxAge;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CONTACTS_KEY, GROUPS_KEY, LAST_SYNC_KEY]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const localStorage = new LocalStorageService();
