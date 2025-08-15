import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useApp } from "@/context/AppContext";
import { contactActions } from "@/lib/contactActions";
import { Contact } from "@/types";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactsScreen() {
  const {
    state,
    loadContacts,
    searchContacts,
    refreshContacts,
    selectContact,
  } = useApp();
  const [showContactDetails, setShowContactDetails] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const handleContactPress = (contact: Contact) => {
    selectContact(contact);
    setShowContactDetails(true);
  };

  const handleSearch = (query: string) => {
    searchContacts(query);
  };

  const handleRefresh = () => {
    refreshContacts();
  };

  const handleContactAction = async (action: string, contact: Contact) => {
    try {
      switch (action) {
        case "call":
          await contactActions.callContact(contact);
          break;
        case "email":
          await contactActions.emailContact(contact);
          break;
        case "sms":
          await contactActions.sendSMS(contact);
          break;
        case "share":
          await contactActions.shareContact(contact);
          break;
        case "addToPhone":
          await contactActions.addToPhoneContacts(contact);
          break;
      }
    } catch (error) {
      console.error("Contact action error:", error);
    }
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        { backgroundColor: Colors["light"].background },
      ]}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactInfo}>
        <View
          style={[styles.avatar, { backgroundColor: Colors["light"].tint }]}
        >
          <Text style={styles.avatarText}>
            {item.firstName.charAt(0)}
            {item.lastName.charAt(0)}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <ThemedText style={styles.contactName}>{item.fullName}</ThemedText>
          <ThemedText style={styles.contactSubtitle}>
            {item.position}
          </ThemedText>
          <ThemedText style={styles.contactSubtitle}>
            {item.department}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ContactDetailsModal = () => {
    if (!state.selectedContact) return null;

    const contact = state.selectedContact;

    return (
      <Modal
        visible={showContactDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowContactDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowContactDetails(false)}
            >
              <IconSymbol name="xmark" size={24} color={Colors["light"].text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Contact Details</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.contactHeader}>
              <View
                style={[
                  styles.largeAvatar,
                  { backgroundColor: Colors["light"].tint },
                ]}
              >
                <Text style={styles.largeAvatarText}>
                  {contact.firstName.charAt(0)}
                  {contact.lastName.charAt(0)}
                </Text>
              </View>
              <ThemedText style={styles.contactNameLarge}>
                {contact.fullName}
              </ThemedText>
              <ThemedText style={styles.contactPositionLarge}>
                {contact.position}
              </ThemedText>
            </View>

            <View style={styles.contactInfoSection}>
              {contact.email && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="envelope"
                    size={20}
                    color={Colors["light"].tint}
                  />
                  <ThemedText style={styles.infoText}>
                    {contact.email}
                  </ThemedText>
                </View>
              )}

              {contact.phone && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="phone"
                    size={20}
                    color={Colors["light"].tint}
                  />
                  <ThemedText style={styles.infoText}>
                    {contact.phone}
                  </ThemedText>
                </View>
              )}

              {contact.department && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="building.2"
                    size={20}
                    color={Colors["light"].tint}
                  />
                  <ThemedText style={styles.infoText}>
                    {contact.department}
                  </ThemedText>
                </View>
              )}

              {contact.location && (
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="location"
                    size={20}
                    color={Colors["light"].tint}
                  />
                  <ThemedText style={styles.infoText}>
                    {contact.location}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.actionsSection}>
              <ThemedText style={styles.sectionTitle}>Actions</ThemedText>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: Colors["light"].tint },
                ]}
                onPress={() => handleContactAction("call", contact)}
              >
                <IconSymbol
                  name="phone"
                  size={20}
                  color={Colors["light"].tint}
                />
                <ThemedText style={styles.actionText}>Call</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: Colors["light"].tint },
                ]}
                onPress={() => handleContactAction("email", contact)}
              >
                <IconSymbol
                  name="envelope"
                  size={20}
                  color={Colors["light"].tint}
                />
                <ThemedText style={styles.actionText}>Email</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: Colors["light"].tint },
                ]}
                onPress={() => handleContactAction("sms", contact)}
              >
                <IconSymbol
                  name="message"
                  size={20}
                  color={Colors["light"].tint}
                />
                <ThemedText style={styles.actionText}>Message</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: Colors["light"].tint },
                ]}
                onPress={() => handleContactAction("share", contact)}
              >
                <IconSymbol
                  name="square.and.arrow.up"
                  size={20}
                  color={Colors["light"].tint}
                />
                <ThemedText style={styles.actionText}>Share</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderColor: Colors["light"].tint },
                ]}
                onPress={() => handleContactAction("addToPhone", contact)}
              >
                <IconSymbol
                  name="person.badge.plus"
                  size={20}
                  color={Colors["light"].tint}
                />
                <ThemedText style={styles.actionText}>
                  Add to Contacts
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // if (!state.isAuthenticated) {
  //   return (
  //     <ThemedView style={styles.container}>
  //       <View style={styles.loginPrompt}>
  //         <ThemedText style={styles.loginPromptText}>
  //           Please login to view contacts
  //         </ThemedText>
  //       </View>
  //     </ThemedView>
  //   );
  // }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Contacts</ThemedText>
          <View style={styles.searchContainer}>
            <IconSymbol
              name="magnifyingglass"
              size={20}
              color={Colors["light"].text}
            />
            <TextInput
              style={[styles.searchInput, { color: Colors["light"].text }]}
              placeholder="Search contacts..."
              placeholderTextColor={Colors["light"].text}
              value={state.searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {state.error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{state.error}</ThemedText>
          </View>
        )}

        <FlatList
          data={state.filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors["light"].tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {state.isLoading ? "Loading contacts..." : "No contacts found"}
              </ThemedText>
            </View>
          }
        />

        <ContactDetailsModal />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  list: {
    flex: 1,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 1,
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
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  contactHeader: {
    alignItems: "center",
    padding: 32,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  largeAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 36,
  },
  contactNameLarge: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactPositionLarge: {
    fontSize: 16,
    opacity: 0.7,
  },
  contactInfoSection: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
  },
  actionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
