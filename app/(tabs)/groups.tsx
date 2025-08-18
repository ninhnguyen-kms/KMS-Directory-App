import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

import { Contact, Group } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupsScreen() {
  const {
    state,
    loadGroups,
    createGroup,
    addUserToGroup,
    removeUserFromGroup,
    deleteGroup,
    selectGroup,
  } = useApp();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      await createGroup(
        newGroupName.trim(),
        newGroupDescription.trim() || undefined
      );
      setNewGroupName("");
      setNewGroupDescription("");
      setShowCreateGroup(false);
      Alert.alert("Success", "Group created successfully");
    } catch (error: any) {
      console.error("Create group error:", error);
      Alert.alert("Error", "Failed to create group");
    }
  };

  const handleGroupPress = (group: Group) => {
    selectGroup(group);
    setShowGroupDetails(true);
  };

  const handleAddMember = async (contactId: string) => {
    if (!state.selectedGroup) return;

    try {
      await addUserToGroup(state.selectedGroup.id, contactId);
      setShowAddMember(false);
      Alert.alert("Success", "Member added to group");
    } catch (error: any) {
      console.error("Add member error:", error);
      Alert.alert("Error", "Failed to add member");
    }
  };

  const handleRemoveMember = async (contactId: string) => {
    if (!state.selectedGroup) return;

    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member from the group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeUserFromGroup(state.selectedGroup!.id, contactId);
            } catch (error: any) {
              console.error("Remove member error:", error);
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!state.selectedGroup) return;

    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(state.selectedGroup!.id);
              setShowGroupDetails(false);
              Alert.alert("Success", "Group deleted successfully");
            } catch (error: any) {
              console.error("Delete group error:", error);
              Alert.alert("Error", "Failed to delete group");
            }
          },
        },
      ]
    );
  };

  const getContactById = (contactId: string): Contact | undefined => {
    return state.contacts.find((contact) => contact.id === contactId);
  };

  const getAvailableContacts = (): Contact[] => {
    if (!state.selectedGroup) return state.contacts;
    return state.contacts.filter(
      (contact) => !state.selectedGroup!.members.includes(contact.id)
    );
  };
  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={[
        styles.groupItem,
        { backgroundColor: Colors["light"].background },
      ]}
      onPress={() => handleGroupPress(item)}
    >
      <View style={styles.groupInfo}>
        <View
          style={[styles.groupIcon, { backgroundColor: Colors["light"].tint }]}
        >
          <IconSymbol name="person.3.fill" size={24} color="white" />
        </View>
        <View style={styles.groupDetails}>
          <ThemedText style={styles.groupName}>{item.name}</ThemedText>
          <ThemedText style={styles.groupSubtitle}>
            {item.members.length} member{item.members.length !== 1 ? "s" : ""}
          </ThemedText>
          {item.description && (
            <ThemedText style={styles.groupDescription}>
              {item.description}
            </ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        { backgroundColor: Colors["light"].background },
      ]}
      onPress={() => handleAddMember(item.id)}
    >
      <View style={styles.contactInfo}>
        <View
          style={[styles.avatar, { backgroundColor: Colors["light"].tint }]}
        >
          <ThemedText style={styles.avatarText}>
            {item.firstName.charAt(0)}
            {item.lastName.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.contactDetails}>
          <ThemedText style={styles.contactName}>{item.fullName}</ThemedText>
          <ThemedText style={styles.contactName}>
            {item.phone || "N/A"}
          </ThemedText>
          <ThemedText style={styles.contactSubtitle}>
            {item.position}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroupMember = ({ item }: { item: string }) => {
    const contact = getContactById(item);
    if (!contact) return null;

    return (
      <TouchableOpacity
        style={[
          styles.memberItem,
          { backgroundColor: Colors["light"].background },
        ]}
        onPress={() => handleRemoveMember(item)}
      >
        <View style={styles.memberInfo}>
          <View
            style={[styles.avatar, { backgroundColor: Colors["light"].tint }]}
          >
            <ThemedText style={styles.avatarText}>
              {contact.firstName.charAt(0)}
              {contact.lastName.charAt(0)}
            </ThemedText>
          </View>
          <View style={styles.memberDetails}>
            <ThemedText style={styles.memberName}>
              {contact.fullName}
            </ThemedText>
            <ThemedText style={styles.memberSubtitle}>
              {contact.position}
            </ThemedText>
          </View>
          <IconSymbol name="minus.circle" size={20} color="#ff4444" />
        </View>
      </TouchableOpacity>
    );
  };

  const CreateGroupModal = () => (
    <Modal
      visible={showCreateGroup}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateGroup(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCreateGroup(false)}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>Create Group</ThemedText>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreateGroup}
          >
            <ThemedText style={styles.saveText}>Create</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>Group Name</ThemedText>
            <TextInput
              style={[styles.textInput, { color: Colors["light"].text }]}
              placeholder="Enter group name"
              placeholderTextColor={Colors["light"].text}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
          </View>

          <View style={styles.inputSection}>
            <ThemedText style={styles.inputLabel}>
              Description (Optional)
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                { color: Colors["light"].text },
              ]}
              placeholder="Enter group description"
              placeholderTextColor={Colors["light"].text}
              value={newGroupDescription}
              onChangeText={setNewGroupDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const GroupDetailsModal = () => {
    if (!state.selectedGroup) return null;

    const group = state.selectedGroup;

    return (
      <Modal
        visible={showGroupDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowGroupDetails(false)}
            >
              <IconSymbol name="xmark" size={24} color={Colors["light"].text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>{group.name}</ThemedText>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteGroup}
            >
              <IconSymbol name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {group.description && (
              <View style={styles.descriptionSection}>
                <ThemedText style={styles.descriptionText}>
                  {group.description}
                </ThemedText>
              </View>
            )}

            <View style={styles.membersSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Members ({group.members.length})
                </ThemedText>
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={() => setShowAddMember(true)}
                >
                  <IconSymbol
                    name="plus"
                    size={20}
                    color={Colors["light"].tint}
                  />
                  <ThemedText
                    style={[
                      styles.addMemberText,
                      { color: Colors["light"].tint },
                    ]}
                  >
                    Add Member
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <FlatList
                data={group.members}
                renderItem={renderGroupMember}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyMembers}>
                    <ThemedText style={styles.emptyText}>
                      No members in this group
                    </ThemedText>
                  </View>
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const AddMemberModal = () => (
    <Modal
      visible={showAddMember}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddMember(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowAddMember(false)}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>Add Member</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={getAvailableContacts()}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          style={styles.modalContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                All contacts are already in this group
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );

  if (!state.isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loginPrompt}>
          <ThemedText style={styles.loginPromptText}>
            Please login to view groups
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Groups</ThemedText>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: Colors["light"].tint },
            ]}
            onPress={() => setShowCreateGroup(true)}
          >
            <IconSymbol name="plus" size={20} color="white" />
            <ThemedText style={styles.createButtonText}>
              Create Group
            </ThemedText>
          </TouchableOpacity>
        </View>

        {state.error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{state.error}</ThemedText>
          </View>
        )}

        <FlatList
          data={state.groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {state.isLoading ? "Loading groups..." : "No groups found"}
              </ThemedText>
            </View>
          }
        />

        <CreateGroupModal />
        <GroupDetailsModal />
        <AddMemberModal />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  groupItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  groupInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "#ffebee",
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loginPromptText: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
  },
  saveText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  descriptionText: {
    fontSize: 16,
    opacity: 0.8,
  },
  membersSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addMemberText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "600",
  },
  memberItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyMembers: {
    padding: 20,
    alignItems: "center",
  },
  contactItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactDetails: {
    flex: 1,
    backgroundColor: "red",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
