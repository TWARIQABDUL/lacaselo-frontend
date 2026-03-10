import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import apiClient from "../api/apiClient";

export default function CreditsScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", payment: "" });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/credits");
      setEmployees(res.data);
      recalcTotals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recalcTotals = (data) => {
    let sum = 0;
    data.forEach((e) => { sum += Number(e.payment || 0); });
    setTotalPayment(sum);
  };

  useFocusEffect(useCallback(() => {
    fetchEmployees();
  }, []));

  const handleAddEmployee = async () => {
    if (!form.name.trim()) return Alert.alert("Error", "Name is required");
    try {
      const res = await apiClient.post("/credits", {
        name: form.name,
        payment: Number(form.payment || 0),
      });
      const newList = [res.data, ...employees];
      setEmployees(newList);
      recalcTotals(newList);
      setAddModal(false);
      setForm({ name: "", payment: "" });
    } catch (err) {
      Alert.alert("Error", "Failed to add employee");
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderEmployee = ({ item: e, index }) => (
    <TouchableOpacity
      style={styles.employeeRow}
      onPress={() => router.push({ pathname: "/employee/[id]", params: { id: e.id, name: e.name } })}
    >
      <Text style={styles.empIndex}>{index + 1}</Text>
      <View style={styles.empInfo}>
        <Text style={styles.empName}>{e.name}</Text>
        <Text style={styles.empPayment}>RWF {fmt(e.payment)} / month</Text>
      </View>
      <Text style={styles.empArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#D4AF37" }]}>
          <Text style={styles.summaryLabel}>Total Payment</Text>
          <Text style={styles.summaryValue}>RWF {fmt(totalPayment)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#F28B82" }]}>
          <Text style={styles.summaryLabel}>Total Loan</Text>
          <Text style={styles.summaryValue}>RWF 0</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#0E6251" }]}>
          <Text style={[styles.summaryLabel, { color: "#fff" }]}>Remaining</Text>
          <Text style={[styles.summaryValue, { color: "#fff" }]}>RWF 0</Text>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employees</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add Employee</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#145A32" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(e) => String(e.id)}
          renderItem={renderEmployee}
          ListEmptyComponent={<Text style={styles.emptyText}>No employees found</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Employee</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employee Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="Name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Payment</Text>
              <TextInput
                style={styles.input}
                value={form.payment}
                onChangeText={(v) => setForm({ ...form, payment: v })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddEmployee}>
                <Text style={styles.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  cardRow: { flexDirection: "row", padding: 12, gap: 8 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", elevation: 3 },
  summaryLabel: { fontSize: 10, fontWeight: "600", color: "#1C1C1C" },
  summaryValue: { fontSize: 14, fontWeight: "700", marginTop: 4, color: "#1C1C1C" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 14, elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1C" },
  addBtn: { backgroundColor: "#145A32", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  employeeRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 16, elevation: 2,
  },
  empIndex: { width: 28, fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  empInfo: { flex: 1 },
  empName: { fontSize: 16, fontWeight: "700", color: "#1C1C1C" },
  empPayment: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  empArrow: { fontSize: 24, color: "#145A32", fontWeight: "300" },
  emptyText: { textAlign: "center", padding: 40, color: "#666" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1A2238", marginBottom: 16, textAlign: "center" },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: "#374151", fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#000", backgroundColor: "#f9fafb" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#374151" },
  confirmBtn: { flex: 1, backgroundColor: "#145A32", borderRadius: 10, padding: 12, alignItems: "center" },
  confirmText: { fontWeight: "700", color: "#fff" },
});
