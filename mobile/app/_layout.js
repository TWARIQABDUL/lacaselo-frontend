import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { BusinessProvider } from "../src/context/BusinessContext";
import { checkToken } from "../src/utils/checkToken";

function AuthGate() {
  const { user, loading, logout } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkToken(logout);
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (user && (inAuthGroup || inOnboarding)) {
      router.replace("/(drawer)/");
    } else if (!user && !inAuthGroup && !inOnboarding) {
      // Let index.js handle the onboarding check first
      if (segments[0] !== undefined) {
        router.replace("/(auth)/login");
      }
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <BusinessProvider>
            <AuthGate />
          </BusinessProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
