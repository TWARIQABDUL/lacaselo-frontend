import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import apiClient from "../api/apiClient";

const today = new Date().toISOString().split("T")[0];
const CATEGORIES = ["bar", "kitchen", "unprofitable"];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBar, setTotalBar] = useState(0);
  const [totalKitchen, setTotalKitchen] = useState(0);
  const [totalUnprofitable, setTotalUnprofitable] = useState(0);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ expense_name: "", amount: "", category: "unprofitable" });

  const recalcTotals = (data) => {
    let total = 0, bar = 0, kitchen = 0, unprofitable = 0;
    data.forEach((e) => {
      const amount = Number(e.amount || 0);
      total += amount;
      if (e.category === "bar") bar += amount;
      else if (e.category === "kitchen") kitchen += amount;
      else if (e.category === "unprofitable") unprofitable += amount;
    });
    setTotalExpenses(total);
    setTotalBar(bar);
    setTotalKitchen(kitchen);
    setTotalUnprofitable(unprofitable);
  };

  const fetchExpenses = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/expenses", { params: { date } });
      const data = res.data || [];
      setExpenses(data);
      recalcTotals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/expenses/stats/timePeriods");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedDate);
    fetchStats();
  }, [selectedDate]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
  };

  const handleAdd = async () => {
    if (!form.expense_name.trim()) return Alert.alert("Error", "Expense name is required");
    try {
      const res = await apiClient.post("/expenses", {
        date: selectedDate,
        expense_name: form.expense_name,
        amount: Number(form.amount || 0),
        category: form.category,
        is_profit: 0,
      });
      const newData = [res.data, ...expenses];
      setExpenses(newData);
      recalcTotals(newData);
      setAddModal(false);
      setForm({ expense_name: "", amount: "", category: "unprofitable" });
    } catch (err) {
      Alert.alert("Error", "Failed to add expense");
    }
  };

  const handleChange = async (id, field, value) => {
    const updated = expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setExpenses(updated);
    recalcTotals(updated);
    try {
      await apiClient.put(`/expenses/${id}`, { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderExpense = ({ item: e, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.cellNum]}>{index + 1}</Text>
      <View style={{ flex: 2 }}>
        <TextInput
          style={styles.inlineInput}
          value={e.expense_name || ""}
          onEndEditing={(ev) => handleChange(e.id, "expense_name", ev.nativeEvent.text)}
          selectTextOnFocus
        />
      </View>
      <View style={{ flex: 1.5 }}>
        <TextInput
          style={styles.inlineInput}
          value={String(e.amount || 0)}
          keyboardType="numeric"
          onEndEditing={(ev) => handleChange(e.id, "amount", ev.nativeEvent.text)}
          selectTextOnFocus
        />
      </View>
      <Text style={[styles.cell, styles.categoryBadge, {
        backgroundColor: e.category === "bar" ? "#DBEAFE" : e.category === "kitchen" ? "#D1FAE5" : "#FEE2E2",
        color: e.category === "bar" ? "#1D4ED8" : e.category === "kitchen" ? "#065F46" : "#DC2626",
      }]}>{e.category}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        {[
          { label: "Total Expenses", value: `RWF ${fmt(totalExpenses)}`, bg: "#0B3D2E", color: "#fff" },
          { label: "Bar", value: `RWF ${fmt(totalBar)}`, bg: "#D4AF37", color: "#000" },
          { label: "Kitchen", value: `RWF ${fmt(totalKitchen)}`, bg: "#0E6251", color: "#fff" },
          { label: "Unprofitable", value: `RWF ${fmt(totalUnprofitable)}`, bg: "#C0392B", color: "#fff" },
        ].map((c, i) => (
          <View key={i} style={[styles.summaryCard, { backgroundColor: c.bg }]}>
            <Text style={[styles.summaryLabel, { color: c.color }]}>{c.label}</Text>
            <Text style={[styles.summaryValue, { color: c.color }]}>{c.value}</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[{ label: "Today", value: stats.day }, { label: "Week", value: stats.week }, { label: "Month", value: stats.month }, { label: "Year", value: stats.year }].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{fmt(s.value)}</Text>
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(-1)}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(1)} disabled={selectedDate === today}>
            <Text style={[styles.arrowText, selectedDate === today && { opacity: 0.4 }]}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          {["#", "Name", "Amount", "Category"].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color="#145A32" style={{ marginVertical: 20 }} />
        ) : expenses.length === 0 ? (
          <Text style={styles.emptyText}>No expenses for this date</Text>
        ) : (
          <FlatList data={expenses} keyExtractor={(e) => String(e.id)} renderItem={renderExpense} scrollEnabled={false} />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expense Name</Text>
              <TextInput
                style={styles.input}
                value={form.expense_name}
                onChangeText={(v) => setForm({ ...form, expense_name: v })}
                placeholder="Expense name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catBtn, form.category === cat && styles.catBtnActive]}
                    onPress={() => setForm({ ...form, category: cat })}
                  >
                    <Text style={[styles.catBtnText, form.category === cat && styles.catBtnTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  cardRow: { flexDirection: "row", flexWrap: "wrap", padding: 10, gap: 8 },
  summaryCard: { flex: 1, minWidth: "45%", borderRadius: 12, padding: 14, alignItems: "center", margin: 2, elevation: 3 },
  summaryLabel: { fontSize: 11, fontWeight: "600" },
  summaryValue: { fontSize: 14, fontWeight: "700", marginTop: 4 },
  statsRow: { flexDirection: "row", paddingHorizontal: 10, gap: 6, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 10, alignItems: "center", elevation: 2 },
  statLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },
  statValue: { fontSize: 12, fontWeight: "700", color: "#1F2937", marginTop: 2 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", margin: 10, borderRadius: 12, padding: 14, elevation: 3,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A2238" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  arrowBtn: { backgroundColor: "#1A2238", borderRadius: 6, padding: 6 },
  arrowText: { color: "#fff", fontWeight: "700" },
  dateText: { fontWeight: "700", fontSize: 12, color: "#1A2238" },
  addBtn: { backgroundColor: "#145A32", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginLeft: 6 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  tableContainer: { margin: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1A2238", paddingVertical: 10, paddingHorizontal: 4 },
  th: { flex: 1, color: "#fff", fontSize: 11, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", alignItems: "center" },
  cell: { flex: 1, fontSize: 10, textAlign: "center", color: "#333" },
  cellNum: { flex: 0.5 },
  categoryBadge: { fontSize: 9, fontWeight: "700", borderRadius: 8, paddingVertical: 3, paddingHorizontal: 2, overflow: "hidden", textAlign: "center" },
  emptyText: { textAlign: "center", padding: 20, color: "#666" },
  inlineInput: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6,
    textAlign: "center", fontSize: 10, padding: 4, backgroundColor: "#f9fafb", marginHorizontal: 2,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1A2238", marginBottom: 16, textAlign: "center" },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: "#374151", fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#000", backgroundColor: "#f9fafb" },
  categoryRow: { flexDirection: "row", gap: 8 },
  catBtn: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 20, padding: 10, alignItems: "center" },
  catBtnActive: { backgroundColor: "#145A32", borderColor: "#145A32" },
  catBtnText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  catBtnTextActive: { color: "#fff" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#374151" },
  confirmBtn: { flex: 1, backgroundColor: "#145A32", borderRadius: 10, padding: 12, alignItems: "center" },
  confirmText: { fontWeight: "700", color: "#fff" },
});
