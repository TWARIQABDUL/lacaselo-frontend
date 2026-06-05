import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { useFocusEffect } from "expo-router";
import apiClient from "../api/apiClient";
import { Picker } from "@react-native-picker/picker";

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BAR_MAN");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("active");

  const roles = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "BAR_MAN",
    "CHIEF_KITCHEN",
    "TOKEN_MAN",
    "LAND_LORD",
    "GYM",
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("BAR_MAN");
    setBranchId("");
    setStatus("active");
    setEditUser(null);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditUser(user);
      setUsername(user.username);
      setRole(user.role);
      setBranchId(user.branch_id || "");
      setStatus(user.status);
      setPassword(""); // Don't show old password
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!username || (!editUser && !password)) {
      Alert.alert("Validation Error", "Username and password are required for new users.");
      return;
    }

    try {
      const userData = { username, role, branch_id: branchId || null, status };
      if (password) userData.password = password;

      if (editUser) {
        await apiClient.put(`/users/${editUser.userId}`, userData);
        Alert.alert("Success", "User updated successfully");
      } else {
        await apiClient.post("/users", userData);
        Alert.alert("Success", "User created successfully");
      }
      setModalVisible(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to save user");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/users/${id}`);
            Alert.alert("Success", "User deleted");
            fetchUsers();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete user");
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const renderUser = ({ item: u }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{u.username}</Text>
        <Text style={styles.userRole}>Role: {u.role}</Text>
        <Text style={styles.userDetails}>Branch: {u.branch_id || "Global"}</Text>
        <Text style={styles.userDetails}>Joined: {formatDate(u.created_at)}</Text>
        <View style={[styles.statusBadge, u.status === "active" ? styles.bgSuccess : styles.bgDanger]}>
          <Text style={styles.statusText}>{u.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(u)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(u.userId)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff Accounts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => String(u.userId)}
          renderItem={renderUser}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editUser ? "Edit User" : "Add New User"}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password {editUser && "(Leave blank to keep current)"}</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Role</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue)}
                    style={styles.picker}
                  >
                    {roles.map((r) => (
                      <Picker.Item key={r} label={r} value={r} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Branch ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={branchId}
                  onChangeText={setBranchId}
                  placeholder="e.g. BR-001"
                  placeholderTextColor="#999"
                />
              </View>

              {editUser && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={status}
                      onValueChange={(itemValue) => setStatus(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Active" value="active" />
                      <Picker.Item label="Inactive" value="inactive" />
                    </Picker>
                  </View>
                </View>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
                  <Text style={styles.confirmText}>{editUser ? "Update" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#1E293B", padding: 16, borderBottomWidth: 1, borderBottomColor: "#334155"
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  addBtn: { backgroundColor: "#2563EB", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  userRow: {
    flexDirection: "row", backgroundColor: "#1E293B", marginHorizontal: 16,
    marginTop: 12, borderRadius: 12, padding: 16, elevation: 3, alignItems: "center"
  },
  userInfo: { flex: 1 },
  username: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  userRole: { fontSize: 14, color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  userDetails: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  bgSuccess: { backgroundColor: "rgba(16,185,129,0.2)" },
  bgDanger: { backgroundColor: "rgba(239,68,68,0.2)" },
  statusText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  userActions: { gap: 8 },
  editBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  deleteBtn: { backgroundColor: "#EF4444", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  emptyText: { textAlign: "center", padding: 40, color: "#9CA3AF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#1E293B", borderRadius: 16, padding: 24, maxHeight: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 20, textAlign: "center" },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: "#9CA3AF", fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#334155", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#fff", backgroundColor: "#0F172A" },
  pickerContainer: { borderWidth: 1, borderColor: "#334155", borderRadius: 8, backgroundColor: "#0F172A", overflow: "hidden" },
  picker: { color: "#fff", height: 50 },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, backgroundColor: "#334155", borderRadius: 8, padding: 14, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#E2E8F0" },
  confirmBtn: { flex: 1, backgroundColor: "#2563EB", borderRadius: 8, padding: 14, alignItems: "center" },
  confirmText: { fontWeight: "700", color: "#fff" },
});
