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

const today = new Date().toLocaleDateString("en-CA");

export default function GymScreen() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDaily, setTotalDaily] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  const [addModal, setAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ daily_people: "", monthly_people: "", cash: "", cash_momo: "" });

  const recalcTotals = (data) => {
    let income = 0, daily = 0, monthly = 0;
    data.forEach((e) => {
      income += Number(e.cash || 0) + Number(e.cash_momo || 0);
      daily += Number(e.daily_people || 0);
      monthly += Number(e.monthly_people || 0);
    });
    setTotalIncome(income);
    setTotalDaily(daily);
    setTotalMonthly(monthly);
  };

  const fetchEntries = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/gym", { params: { date } });
      const data = res.data.records || [];
      setEntries(data);
      recalcTotals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/gym/stats/timePeriods");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
    fetchStats();
  }, [selectedDate]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toLocaleDateString("en-CA");
    if (formatted > today) return;
    setSelectedDate(formatted);
  };

  const handleAddEntry = async () => {
    const { daily_people, monthly_people, cash, cash_momo } = newEntry;
    const total_people = Number(daily_people || 0) + Number(monthly_people || 0);
    try {
      await apiClient.post("/gym", {
        date: selectedDate,
        daily_people: Number(daily_people || 0),
        monthly_people: Number(monthly_people || 0),
        total_people,
        cash: Number(cash || 0),
        cash_momo: Number(cash_momo || 0),
      });
      setAddModal(false);
      setNewEntry({ daily_people: "", monthly_people: "", cash: "", cash_momo: "" });
      fetchEntries(selectedDate);
    } catch (err) {
      Alert.alert("Error", "Failed to add entry");
    }
  };

  const handleChange = async (id, field, value) => {
    const numValue = Number(value || 0);
    const updated = entries.map((e) => {
      if (e.id !== id) return e;
      const u = { ...e, [field]: numValue };
      if (field === "daily_people") u.total_people = numValue + Number(e.monthly_people || 0);
      if (field === "monthly_people") u.total_people = Number(e.daily_people || 0) + numValue;
      return u;
    });
    setEntries(updated);
    recalcTotals(updated);
    try {
      await apiClient.put(`/gym/${id}`, updated.find((e) => e.id === id));
    } catch (err) {
      console.error(err);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderEntry = ({ item: e, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.cellNum]}>{index + 1}</Text>
      <GymInput value={String(e.daily_people || 0)} onSubmit={(v) => handleChange(e.id, "daily_people", v)} />
      <GymInput value={String(e.monthly_people || 0)} onSubmit={(v) => handleChange(e.id, "monthly_people", v)} />
      <Text style={styles.cell}>{e.total_people || 0}</Text>
      <GymInput value={String(e.cash || 0)} onSubmit={(v) => handleChange(e.id, "cash", v)} />
      <GymInput value={String(e.cash_momo || 0)} onSubmit={(v) => handleChange(e.id, "cash_momo", v)} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        {[
          { label: "Total Income", value: `RWF ${fmt(totalIncome)}`, bg: "#0B3D2E", color: "#fff" },
          { label: "Daily People", value: fmt(totalDaily), bg: "#D4AF37", color: "#000" },
          { label: "Monthly People", value: fmt(totalMonthly), bg: "#0E6251", color: "#fff" },
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
        <Text style={styles.headerTitle}>Gym</Text>
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
          {["#", "Daily", "Monthly", "Total", "Cash", "Momo"].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color="#145A32" style={{ marginVertical: 20 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.emptyText}>No gym entries for this date</Text>
        ) : (
          <FlatList data={entries} keyExtractor={(e) => String(e.id)} renderItem={renderEntry} scrollEnabled={false} />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Gym Entry</Text>
            {[
              { label: "Daily People", key: "daily_people" },
              { label: "Monthly People", key: "monthly_people" },
              { label: "Cash", key: "cash" },
              { label: "Cash Momo", key: "cash_momo" },
            ].map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry[f.key]}
                  onChangeText={(v) => setNewEntry({ ...newEntry, [f.key]: v })}
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
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddEntry}>
                <Text style={styles.confirmText}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function GymInput({ value, onSubmit }) {
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
  cardRow: { flexDirection: "row", padding: 10, gap: 8 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", elevation: 3 },
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
  th: { flex: 1, color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", alignItems: "center" },
  cell: { flex: 1, fontSize: 11, textAlign: "center", color: "#333" },
  cellNum: { flex: 0.5 },
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
