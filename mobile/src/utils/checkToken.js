import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function checkToken(logout) {
  const token = await AsyncStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      if (logout) logout();
    }
  } catch (error) {
    console.error("Invalid token:", error);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    if (logout) logout();
  }
}
