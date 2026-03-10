import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const redirect = async () => {
      if (user) {
        router.replace("/(drawer)/");
        return;
      }
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
      if (hasOnboarded === "true") {
        router.replace("/(auth)/login");
      } else {
        router.replace("/onboarding");
      }
    };

    redirect();
  }, [loading, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B3D2E" }}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}
