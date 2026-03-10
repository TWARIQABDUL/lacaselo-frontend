import { Drawer } from "expo-router/drawer";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter, usePathname } from "expo-router";

const ROLES = {
  BAR: ["SUPER_ADMIN", "ADMIN", "BAR_MAN"],
  KITCHEN: ["SUPER_ADMIN", "ADMIN", "CHIEF_KITCHEN"],
  GUESTHOUSE: ["SUPER_ADMIN", "ADMIN", "LAND_LORD"],
  GYM: ["SUPER_ADMIN", "ADMIN", "GYM"],
  BILLIARD: ["SUPER_ADMIN", "ADMIN"],
  EXPENSES: ["SUPER_ADMIN", "ADMIN"],
  CREDITS: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  LOGS: ["SUPER_ADMIN", "ADMIN"],
};

function hasRole(userRole, allowed) {
  return allowed.includes(userRole);
}

const NAV_ITEMS = [
  { name: "index", label: "Dashboard", icon: "home-outline", lib: "ionicons", roles: null },
  { name: "bar", label: "Bar", icon: "wine-outline", lib: "ionicons", roles: "BAR" },
  { name: "kitchen", label: "Kitchen", icon: "restaurant-outline", lib: "ionicons", roles: "KITCHEN" },
  { name: "guesthouse", label: "Guesthouse", icon: "bed-outline", lib: "ionicons", roles: "GUESTHOUSE" },
  { name: "gym", label: "Gym", icon: "dumbbell", lib: "fa5", roles: "GYM" },
  { name: "billiard", label: "Billiard", icon: "circle", lib: "fa5", roles: "BILLIARD" },
  { name: "expenses", label: "Expenses", icon: "cash-outline", lib: "ionicons", roles: "EXPENSES" },
  { name: "credits", label: "Staff / Credits", icon: "people-outline", lib: "ionicons", roles: "CREDITS" },
  { name: "logs", label: "Activity Logs", icon: "list-outline", lib: "ionicons", roles: "LOGS" },
];

function CustomDrawerContent(props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const role = user?.role || "";

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles === null || hasRole(role, ROLES[item.roles])
  );

  const getIcon = (item, color) => {
    if (item.lib === "fa5") {
      return <FontAwesome5 name={item.icon} size={18} color={color} />;
    }
    return <Ionicons name={item.icon} size={20} color={color} />;
  };

  const isActive = (name) => {
    if (name === "index") return pathname === "/" || pathname === "/(drawer)" || pathname === "/(drawer)/";
    return pathname.includes(name);
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>L</Text>
        </View>
        <Text style={styles.appName}>Lacaselo</Text>
        <Text style={styles.roleBadge}>{user?.role || "User"}</Text>
        <Text style={styles.username}>{user?.username || user?.name || ""}</Text>
      </View>

      {/* Nav Items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {visibleItems.map((item) => {
          const active = isActive(item.name);
          const color = active ? "#D4AF37" : "#ccc";
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => {
                router.push(item.name === "index" ? "/(drawer)/" : `/(drawer)/${item.name}`);
                props.navigation.closeDrawer();
              }}
            >
              {getIcon(item, color)}
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              {active && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerLayout() {
  const { user } = useAuth();
  const role = user?.role || "";

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#0B3D2E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        drawerStyle: { backgroundColor: "#0B3D2E", width: 280 },
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="bar" options={{ title: "Bar", drawerItemStyle: hasRole(role, ROLES.BAR) ? {} : { display: "none" } }} />
      <Drawer.Screen name="kitchen" options={{ title: "Kitchen", drawerItemStyle: hasRole(role, ROLES.KITCHEN) ? {} : { display: "none" } }} />
      <Drawer.Screen name="guesthouse" options={{ title: "Guesthouse", drawerItemStyle: hasRole(role, ROLES.GUESTHOUSE) ? {} : { display: "none" } }} />
      <Drawer.Screen name="gym" options={{ title: "Gym", drawerItemStyle: hasRole(role, ROLES.GYM) ? {} : { display: "none" } }} />
      <Drawer.Screen name="billiard" options={{ title: "Billiard", drawerItemStyle: hasRole(role, ROLES.BILLIARD) ? {} : { display: "none" } }} />
      <Drawer.Screen name="expenses" options={{ title: "Expenses", drawerItemStyle: hasRole(role, ROLES.EXPENSES) ? {} : { display: "none" } }} />
      <Drawer.Screen name="credits" options={{ title: "Staff / Credits", drawerItemStyle: hasRole(role, ROLES.CREDITS) ? {} : { display: "none" } }} />
      <Drawer.Screen name="logs" options={{ title: "Activity Logs", drawerItemStyle: hasRole(role, ROLES.LOGS) ? {} : { display: "none" } }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: "#0B3D2E" },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,175,55,0.3)",
    alignItems: "flex-start",
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#145A32",
    borderWidth: 2,
    borderColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: { color: "#D4AF37", fontSize: 26, fontWeight: "900" },
  appName: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 1.5 },
  roleBadge: {
    marginTop: 6,
    backgroundColor: "rgba(212,175,55,0.2)",
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  username: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  navList: { flex: 1, paddingTop: 12 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 2,
    position: "relative",
  },
  navItemActive: { backgroundColor: "rgba(212,175,55,0.12)" },
  navLabel: { color: "#ccc", fontSize: 15, fontWeight: "500", marginLeft: 14, flex: 1 },
  navLabelActive: { color: "#D4AF37", fontWeight: "700" },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "15%",
    bottom: "15%",
    width: 3,
    backgroundColor: "#D4AF37",
    borderRadius: 4,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    gap: 12,
  },
  logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "700" },
});
