import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function ProfitScreen() {
  const [profits, setProfits] = useState([
    {
      id: 1,
      source: "Bar Sales",
      amount: 50000,
      type: "Daily",
      date: "2026-01-25",
      status: "Pending",
    },
    {
      id: 2,
      source: "Gym Membership",
      amount: 30000,
      type: "Monthly",
      date: "2026-01-20",
      status: "Received",
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editProfit, setEditProfit] = useState(null);
  
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Daily");
  const [search, setSearch] = useState("");

  const resetForm = () => {
    setSource("");
    setAmount("");
    setType("Daily");
    setEditProfit(null);
  };

  const handleOpenModal = (p = null) => {
    if (p) {
      setEditProfit(p);
      setSource(p.source);
      setAmount(String(p.amount));
      setType(p.type);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!source || !amount || !type) {
      Alert.alert("Validation", "Please fill in all fields.");
      return;
    }

    if (editProfit) {
      setProfits(
        profits.map((p) =>
          p.id === editProfit.id ? { ...p, source, amount: Number(amount), type } : p
        )
      );
    } else {
      setProfits([
        {
          id: Date.now(),
          source,
          amount: Number(amount),
          type,
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
        },
        ...profits,
      ]);
    }
    setModalVisible(false);
    resetForm();
  };

  const handleReceived = (id) => {
    setProfits(
      profits.map((p) =>
        p.id === id ? { ...p, status: "Received" } : p
      )
    );
  };

  const filteredProfits = profits.filter(p => p.source.toLowerCase().includes(search.toLowerCase()));

  const renderProfit = ({ item: p }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sourceText}>{p.source}</Text>
        <View style={[styles.statusBadge, p.status === "Received" ? styles.bgSuccess : styles.bgWarning]}>
          <Text style={[styles.statusText, p.status === "Received" ? {color: "#fff"} : {color: "#000"}]}>
            {p.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.detailText}>Amount: RWF {Number(p.amount).toLocaleString()}</Text>
        <Text style={styles.detailText}>Type: {p.type}</Text>
        <Text style={styles.detailText}>Date: {p.date}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(p)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        {p.status !== "Received" && (
          <TouchableOpacity style={styles.receiveBtn} onPress={() => handleReceived(p.id)}>
            <Text style={styles.actionText}>Mark Received</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Add Profit</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search profit source..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredProfits}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderProfit}
        ListEmptyComponent={<Text style={styles.emptyText}>No profit records</Text>}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editProfit ? "Edit Profit" : "Add Profit"}</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Source</Text>
                <TextInput
                  style={styles.input}
                  value={source}
                  onChangeText={setSource}
                  placeholder="e.g. Bar Sales"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (RWF)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="e.g. 15000"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={type}
                    onValueChange={(itemValue) => setType(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Daily" value="Daily" />
                    <Picker.Item label="Monthly" value="Monthly" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
                  <Text style={styles.confirmText}>{editProfit ? "Update" : "Save"}</Text>
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
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", elevation: 2
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  addBtn: { backgroundColor: "#10B981", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  searchContainer: { padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  searchInput: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 16, color: "#111827" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sourceText: { fontSize: 18, fontWeight: "700", color: "#111827" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bgSuccess: { backgroundColor: "#10B981" },
  bgWarning: { backgroundColor: "#FBBF24" },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardBody: { marginBottom: 16 },
  detailText: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  cardActions: { flexDirection: "row", gap: 12 },
  editBtn: { backgroundColor: "#3B82F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  receiveBtn: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyText: { textAlign: "center", padding: 40, color: "#6B7280" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, maxHeight: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 20, textAlign: "center" },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: "#4B5563", fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#111827", backgroundColor: "#f9fafb" },
  pickerContainer: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, backgroundColor: "#f9fafb", overflow: "hidden" },
  picker: { color: "#111827", height: 50 },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, backgroundColor: "#e5e7eb", borderRadius: 8, padding: 14, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#374151" },
  confirmBtn: { flex: 1, backgroundColor: "#10B981", borderRadius: 8, padding: 14, alignItems: "center" },
  confirmText: { fontWeight: "700", color: "#fff" },
});
