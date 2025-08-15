import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppProvider } from "@/context/AppContext";

export default function RootLayout() {
  console.log("API_BASE_URL:", process.env.API_BASE_URL);
  console.log("AUTH_TOKEN:", process.env.AUTH_TOKEN);
  return (
    <AppProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AppProvider>
  );
}
