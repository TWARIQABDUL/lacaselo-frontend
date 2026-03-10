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

export default function GuestHouseScreen() {
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalRoomsSold, setTotalRoomsSold] = useState(0);
  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ vip: "", normal: "", vip_price: "", normal_price: "" });

  const recalcTotals = (roomList) => {
    let income = 0, sold = 0;
    roomList.forEach((r) => {
      const vip = Number(r.vip || 0);
      const normal = Number(r.normal || 0);
      income += vip * Number(r.vip_price || 0) + normal * Number(r.normal_price || 0);
      sold += vip + normal;
    });
    setTotalIncome(income);
    setTotalRoomsSold(sold);
  };

  const fetchRooms = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/guesthouse", { params: { date } });
      const roomList = res.data.rooms || [];
      setRooms(roomList);
      recalcTotals(roomList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/guesthouse/stats/timePeriods");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms(selectedDate);
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
      await apiClient.post("/guesthouse", {
        date: selectedDate,
        vip: Number(form.vip || 0),
        normal: Number(form.normal || 0),
        vip_price: Number(form.vip_price || 0),
        normal_price: Number(form.normal_price || 0),
      });
      setAddModal(false);
      setForm({ vip: "", normal: "", vip_price: "", normal_price: "" });
      fetchRooms(selectedDate);
    } catch (err) {
      Alert.alert("Error", "Failed to add room entry");
    }
  };

  const handleRoomChange = async (id, field, value) => {
    const numValue = Number(value);
    const updated = rooms.map((r) => (r.id === id ? { ...r, [field]: numValue } : r));
    setRooms(updated);
    recalcTotals(updated);
    try {
      await apiClient.put(`/guesthouse/${id}`, { [field]: numValue });
    } catch (err) {
      console.error(err);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderRoom = ({ item: r, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.cellNum]}>{index + 1}</Text>
      <Text style={styles.cell}>{r.date}</Text>
      <RoomInput value={String(r.vip || 0)} onSubmit={(v) => handleRoomChange(r.id, "vip", v)} />
      <RoomInput value={String(r.normal || 0)} onSubmit={(v) => handleRoomChange(r.id, "normal", v)} />
      <RoomInput value={String(r.vip_price || 0)} onSubmit={(v) => handleRoomChange(r.id, "vip_price", v)} />
      <RoomInput value={String(r.normal_price || 0)} onSubmit={(v) => handleRoomChange(r.id, "normal_price", v)} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        {[
          { label: "Total Income", value: `RWF ${fmt(totalIncome)}`, bg: "#0B3D2E", color: "#fff" },
          { label: "Total Sales", value: `RWF ${fmt(totalIncome)}`, bg: "#D4AF37", color: "#000" },
          { label: "Rooms Sold", value: fmt(totalRoomsSold), bg: "#0E6251", color: "#fff" },
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
        <Text style={styles.headerTitle}>Guesthouse</Text>
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
          {["#", "Date", "VIP", "Normal", "VIP$", "Norm$"].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color="#145A32" style={{ marginVertical: 20 }} />
        ) : rooms.length === 0 ? (
          <Text style={styles.emptyText}>No room data for this date</Text>
        ) : (
          <FlatList data={rooms} keyExtractor={(r) => String(r.id)} renderItem={renderRoom} scrollEnabled={false} />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Room Entry</Text>
            {[
              { label: "VIP Rooms", key: "vip" },
              { label: "Normal Rooms", key: "normal" },
              { label: "VIP Room Price", key: "vip_price" },
              { label: "Normal Room Price", key: "normal_price" },
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
                <Text style={styles.confirmText}>Add Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function RoomInput({ value, onSubmit }) {
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
  th: { flex: 1, color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", alignItems: "center" },
  cell: { flex: 1, fontSize: 10, textAlign: "center", color: "#333" },
  cellNum: { flex: 0.5 },
  emptyText: { textAlign: "center", padding: 20, color: "#666" },
  inlineInput: {
    flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6,
    textAlign: "center", fontSize: 10, padding: 3, backgroundColor: "#f9fafb", marginHorizontal: 1,
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
