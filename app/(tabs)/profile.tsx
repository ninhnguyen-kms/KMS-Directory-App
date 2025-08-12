import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

import { LoginCredentials } from '@/types';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  
  const { state, login, logout, clearError } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const handleLogin = async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    const success = await login(credentials);
    if (success) {
      setCredentials({ username: '', password: '' });
      setShowLogin(false);
      Alert.alert('Success', 'Logged in successfully');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Success', 'Logged out successfully');
          }
        }
      ]
    );
  };

  const LoginModal = () => (
    <Modal
      visible={showLogin}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowLogin(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowLogin(false);
              clearError();
            }}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>Login to KMS</ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={state.isLoading}
          >
            <ThemedText style={[styles.loginText, state.isLoading && { opacity: 0.5 }]}>
              {state.isLoading ? 'Logging in...' : 'Login'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.loginForm}>
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Username</ThemedText>
              <TextInput
                style={[styles.textInput, { color: Colors[ 'light'].text }]}
                placeholder="Enter your username"
                placeholderTextColor={Colors[ 'light'].text}
                value={credentials.username}
                onChangeText={(text) => setCredentials({ ...credentials, username: text })}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <TextInput
                style={[styles.textInput, { color: Colors[ 'light'].text }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors[ 'light'].text}
                value={credentials.password}
                onChangeText={(text) => setCredentials({ ...credentials, password: text })}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {state.error && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{state.error}</ThemedText>
              </View>
            )}

            <View style={styles.loginInfo}>
              <ThemedText style={styles.infoText}>
                Use your KMS credentials to access the directory.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (!state.isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <View style={[styles.loginPromptIcon, { backgroundColor: Colors[ 'light'].tint }]}>
              <IconSymbol name="person.circle" size={60} color="white" />
            </View>
            <ThemedText style={styles.loginPromptTitle}>Welcome to KMS Directory</ThemedText>
            <ThemedText style={styles.loginPromptSubtitle}>
              Sign in to access contacts and manage groups
            </ThemedText>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: Colors[ 'light'].tint }]}
              onPress={() => setShowLogin(true)}
            >
              <IconSymbol name="person.badge.key" size={20} color="white" />
              <ThemedText style={styles.primaryButtonText}>Sign In</ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        
        <LoginModal />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Profile</ThemedText>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            <View style={[styles.profileAvatar, { backgroundColor: Colors[ 'light'].tint }]}>
              <ThemedText style={styles.profileAvatarText}>
                {state.user?.firstName.charAt(0)}{state.user?.lastName.charAt(0)}
              </ThemedText>
            </View>
            <ThemedText style={styles.profileName}>
              {state.user?.firstName} {state.user?.lastName}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{state.user?.email}</ThemedText>
          </View>

          <View style={styles.menuSection}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <IconSymbol name="person.2" size={20} color={Colors[ 'light'].tint} />
                <ThemedText style={styles.menuItemText}>Total Contacts</ThemedText>
              </View>
              <ThemedText style={styles.menuItemValue}>{state.contacts.length}</ThemedText>
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <IconSymbol name="person.3" size={20} color={Colors[ 'light'].tint} />
                <ThemedText style={styles.menuItemText}>Total Groups</ThemedText>
              </View>
              <ThemedText style={styles.menuItemValue}>{state.groups.length}</ThemedText>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: Colors[ 'light'].tint }]}
              onPress={() => {
                // This could open a sync modal or just refresh
                Alert.alert('Sync', 'This would sync your contacts with the server');
              }}
            >
              <IconSymbol name="arrow.clockwise" size={20} color={Colors[ 'light'].tint} />
              <ThemedText style={styles.actionText}>Sync Contacts</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: '#ff4444' }]}
              onPress={handleLogout}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ff4444" />
              <ThemedText style={[styles.actionText, { color: '#ff4444' }]}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <ThemedText style={styles.infoTitle}>About</ThemedText>
            <ThemedText style={styles.infoText}>
              KMS Directory App helps you manage and stay connected with your colleagues. 
              All contact data is securely stored on your device and synced with the KMS HRM system.
            </ThemedText>
          </View>
        </ScrollView>
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
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginPromptIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginPromptSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  menuSection: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemValue: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  actionsSection: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  infoSection: {
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  loginText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  loginForm: {
    padding: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  loginInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
});
