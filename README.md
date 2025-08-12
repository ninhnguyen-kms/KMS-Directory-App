# KMS Directory App

A React Native mobile application for managing and accessing KMS employee contacts and groups.

## Features

### 🔐 Authentication
- **Login/Logout**: Secure authentication with KMS HRM API
- **Demo Mode**: Use `demo/demo` credentials for testing

### 👥 Contact Management
- **List Contacts**: View all contacts with search functionality
- **Search Contacts**: Find contacts by name, email, phone, department, or position
- **Contact Details**: View comprehensive contact information
- **Update Contacts**: Modify contact data (synced with API when authenticated)
- **Contact Actions**:
  - 📞 Call contact
  - ✉️ Send email
  - 💬 Send SMS
  - 📤 Share contact (vCard format)
  - 📱 Add to phone contacts

### 👨‍👩‍👧‍👦 Group Management
- **Create Groups**: Organize contacts into custom groups
- **Add/Remove Members**: Manage group membership
- **List Groups**: View all created groups and their members
- **Delete Groups**: Remove groups when no longer needed

### 💾 Local Storage
- **Offline Support**: All data cached locally for offline access
- **Smart Sync**: API calls only when needed or manually triggered
- **Data Persistence**: Contacts and groups saved on device


## Demo Instructions

### Quick Start with Demo Data
1. Open the app
2. Go to the Profile tab
3. Tap "Sign In"
4. Use credentials:
   - Username: `demo`
   - Password: `demo`
5. Explore the sample contacts and groups

### Features to Test

#### Contacts Tab
- Browse the contact list
- Use the search bar to find contacts
- Tap on a contact to view details
- Try the action buttons (Call, Email, SMS, Share, Add to Phone)
- Pull down to refresh the list

#### Groups Tab
- View existing groups
- Tap "Create Group" to add a new group
- Tap on a group to view members
- Add/remove members from groups
- Delete groups you no longer need

#### Profile Tab
- View your profile information
- See contact and group statistics
- Sign out when done

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + useReducer
- **Storage**: AsyncStorage for local data persistence
- **HTTP Client**: Axios for API calls
- **Contacts**: expo-contacts for phone integration
- **Sharing**: expo-sharing for contact sharing

## Project Structure

```
├── app/                     # Expo Router screens
│   ├── (tabs)/             # Tab navigation screens
│   │   ├── index.tsx       # Contacts screen
│   │   ├── groups.tsx      # Groups screen
│   │   └── profile.tsx     # Profile/Login screen
│   └── _layout.tsx         # Root layout
├── lib/                    # Core services
│   ├── api.ts             # KMS API service
│   ├── storage.ts         # Local storage service
│   ├── contactActions.ts  # Contact sharing/actions
│   └── sampleData.ts      # Demo data
├── context/               # React context
│   └── AppContext.tsx     # Global app state
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
└── components/            # Reusable UI components
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Use Expo Go app to scan the QR code

## Real API Usage

To use with real KMS HRM API:

1. Implement the actual login endpoint in `lib/api.ts`
2. Update the contact data transformation to match actual API response
3. Remove or modify the demo login credentials
4. Configure proper authentication token handling

## Dependencies

- `@react-native-async-storage/async-storage`: Local storage
- `expo-contacts`: Phone contacts integration
- `expo-sharing`: File sharing capabilities
- `axios`: HTTP client
- `react-native-url-polyfill`: URL polyfill for React Native

## Notes

- Contact data is stored locally and only synced when needed
- The app works offline after initial data load
- Demo mode provides realistic sample data for testing
- All contact actions integrate with native phone capabilities
- Groups are managed locally and can be synced with future API endpoints