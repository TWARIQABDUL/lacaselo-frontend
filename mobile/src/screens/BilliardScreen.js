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

export default function BilliardScreen() {
  const [billiards, setBilliards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalToken, setTotalToken] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalMomo, setTotalMomo] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ token: "", cash: "", cash_momo: "" });

  const recalcTotals = (data) => {
    let token = 0, cash = 0, momo = 0, earned = 0;
    data.forEach((b) => {
      token += Number(b.token || 0);
      cash += Number(b.cash || 0);
      momo += Number(b.cash_momo || 0);
      earned += Number(b.total || 0);
    });
    setTotalToken(token);
    setTotalCash(cash);
    setTotalMomo(momo);
    setTotalEarned(earned);
  };

  const fetchBilliards = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/billiard", { params: { date } });
      const data = res.data || [];
      setBilliards(data);
      recalcTotals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/billiard/stats/timePeriods");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBilliards(selectedDate);
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
    try {
      const res = await apiClient.post("/billiard", {
        date: selectedDate,
        token: Number(form.token || 0),
        cash: Number(form.cash || 0),
        cash_momo: Number(form.cash_momo || 0),
      });
      const newData = [res.data, ...billiards];
      setBilliards(newData);
      recalcTotals(newData);
      setAddModal(false);
      setForm({ token: "", cash: "", cash_momo: "" });
    } catch (err) {
      Alert.alert("Error", "Failed to add record");
    }
  };

  const handleChange = async (id, field, value) => {
    const numValue = Number(value);
    const updated = billiards.map((b) => (b.id === id ? { ...b, [field]: numValue } : b));
    setBilliards(updated);
    recalcTotals(updated);
    try {
      await apiClient.put(`/billiard/${id}`, { [field]: numValue });
    } catch (err) {
      console.error(err);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderBilliard = ({ item: b, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.cellNum]}>{index + 1}</Text>
      <BInput value={String(b.token || 0)} onSubmit={(v) => handleChange(b.id, "token", v)} />
      <BInput value={String(b.cash || 0)} onSubmit={(v) => handleChange(b.id, "cash", v)} />
      <BInput value={String(b.cash_momo || 0)} onSubmit={(v) => handleChange(b.id, "cash_momo", v)} />
      <Text style={[styles.cell, styles.textGreen]}>{fmt(b.total)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        {[
          { label: "Total Tokens", value: fmt(totalToken), bg: "#0B3D2E", color: "#fff" },
          { label: "Total Cash", value: `RWF ${fmt(totalCash)}`, bg: "#D4AF37", color: "#000" },
          { label: "Total Momo", value: `RWF ${fmt(totalMomo)}`, bg: "#0E6251", color: "#fff" },
          { label: "Total Earned", value: `RWF ${fmt(totalEarned)}`, bg: "#C0392B", color: "#fff" },
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
        <Text style={styles.headerTitle}>Billiard</Text>
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
          {["#", "Token", "Cash", "Momo", "Total"].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color="#145A32" style={{ marginVertical: 20 }} />
        ) : billiards.length === 0 ? (
          <Text style={styles.emptyText}>No records for this date</Text>
        ) : (
          <FlatList data={billiards} keyExtractor={(b) => String(b.id)} renderItem={renderBilliard} scrollEnabled={false} />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Billiard Record</Text>
            {[
              { label: "Number of Tokens", key: "token" },
              { label: "Cash Amount", key: "cash" },
              { label: "Momo Amount", key: "cash_momo" },
            ].map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
                <Text style={styles.confirmText}>Add Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function BInput({ value, onSubmit }) {
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  return (
    <TextInput
      style={styles.inlineInput}
      value={val}
      onChangeText={setVal}
      keyboardType="numeric"
      onEndEditing={() => onSubmit(val)}
      selectTextOnFocus
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  cardRow: { flexDirection: "row", flexWrap: "wrap", padding: 10, gap: 8 },
  summaryCard: { flex: 1, minWidth: "45%", borderRadius: 12, padding: 14, alignItems: "center", margin: 2, elevation: 3 },
  summaryLabel: { fontSize: 11, fontWeight: "600" },
  summaryValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },
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
  cell: { flex: 1, fontSize: 11, textAlign: "center", color: "#333" },
  cellNum: { flex: 0.6 },
  textGreen: { color: "#145A32", fontWeight: "700" },
  emptyText: { textAlign: "center", padding: 20, color: "#666" },
  inlineInput: {
    flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6,
    textAlign: "center", fontSize: 11, padding: 4, backgroundColor: "#f9fafb", marginHorizontal: 2,
  },
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
