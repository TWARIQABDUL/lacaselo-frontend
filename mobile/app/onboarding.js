import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "../src/screens/OnboardingScreen";

// Thin wrapper: passes a navigation-compatible prop so OnboardingScreen
// can call navigation.replace("Login") → we intercept and use expo-router instead.
export default function OnboardingRoute() {
  const router = useRouter();

  const navigation = {
    replace: async (screen) => {
      await AsyncStorage.setItem("hasOnboarded", "true");
      router.replace("/(auth)/login");
    },
  };

  return <OnboardingScreen navigation={navigation} />;
}
