import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import apiClient from "../api/apiClient";

const fmt = (n) => Number(n || 0).toLocaleString();

export default function ClosingsAdminSection({ selectedDate, onDateChange, maxDate }) {
  const [closings, setClosings] = useState([]);
  const [received, setReceived] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchClosings = async () => {
    try {
      const res = await apiClient.get("/closings", { params: { date: selectedDate } });
      const list = res.data || [];
      setClosings(list);
      const initial = {};
      list.forEach((c) => {
        initial[c.id] = c.received_amount === null || c.received_amount === undefined ? "" : String(c.received_amount);
      });
      setReceived(initial);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClosings();
  }, [selectedDate]);

  const saveReceived = async (c) => {
    const value = received[c.id];
    if (value === "" || value === undefined || Number(value) < 0) {
      Alert.alert("Missing amount", "Enter the amount received.");
      return;
    }
    try {
      setSavingId(c.id);
      await apiClient.put(`/closings/${c.id}/received`, { received_amount: Number(value) });
      await fetchClosings();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Failed to save received amount");
    } finally {
      setSavingId(null);
    }
  };

  const changeDate = (days) => {
    const d = new Date(`${selectedDate}T00:00:00Z`);
    if (isNaN(d.getTime())) return;
    d.setUTCDate(d.getUTCDate() + days);
    const next = d.toISOString().split("T")[0];
    if (maxDate && next > maxDate) return;
    onDateChange(next);
  };

  const atMax = !!maxDate && selectedDate >= maxDate;

  return (
    <View style={styles.section}>
      <View style={styles.headerBar}>
        <Text style={styles.titleInline}>Closing Money</Text>
        {onDateChange && (
          <View style={styles.dateNav}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(-1)}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.dateText}>{selectedDate}</Text>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(1)} disabled={atMax}>
              <Text style={[styles.arrowText, atMax && { opacity: 0.35 }]}>▶</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {closings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No closing money submitted for this date.</Text>
        </View>
      ) : (
        closings.map((c) => {
          const hasReceived = c.received_amount !== null && c.received_amount !== undefined;
          const missing = hasReceived ? Number(c.cash_amount) - Number(c.received_amount) : null;
          const salesGap = Number(c.system_sales) - (Number(c.momo_amount) + Number(c.cash_amount));
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>ALL DEPARTMENTS</Text>
                </View>
                <Text style={styles.user}>{c.username || "Staff"}</Text>
              </View>
              <View style={styles.row}><Text style={styles.label}>Stock sold value (system)</Text><Text style={styles.value}>{fmt(c.system_sales)}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Money on code</Text><Text style={styles.value}>{fmt(c.momo_amount)}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Money in cash</Text><Text style={styles.value}>{fmt(c.cash_amount)}</Text></View>
              {salesGap !== 0 && (
                <Text style={styles.warn}>
                  Code + cash is {fmt(Math.abs(salesGap))} {salesGap > 0 ? "less" : "more"} than sold value
                </Text>
              )}
              <Text style={styles.inputLabel}>Cash received by admin</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={received[c.id] ?? ""}
                  onChangeText={(t) => setReceived({ ...received, [c.id]: t })}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveReceived(c)} disabled={savingId === c.id}>
                  <Text style={styles.saveText}>{savingId === c.id ? "..." : "Save"}</Text>
                </TouchableOpacity>
              </View>
              {hasReceived && (
                <Text style={[styles.result, missing === 0 ? styles.ok : styles.bad]}>
                  {missing === 0 ? "Cash matches" : missing > 0 ? `Missing ${fmt(missing)}` : `Extra ${fmt(Math.abs(missing))}`}
                </Text>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  titleInline: { fontSize: 18, fontWeight: "700", color: "#1C1C1C" },
  dateNav: { flexDirection: "row", alignItems: "center", gap: 8 },
  arrowBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
  arrowText: { fontSize: 12, color: "#1C1C1C" },
  dateText: { fontSize: 13, fontWeight: "700", color: "#1C1C1C" },
  emptyCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, alignItems: "center" },
  emptyText: { color: "#9ca3af", fontStyle: "italic" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badge: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#15803d", fontSize: 10, fontWeight: "700" },
  user: { fontSize: 12, color: "#6b7280" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 13, color: "#6b7280" },
  value: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
  warn: { fontSize: 12, color: "#dc2626", marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#374151", marginTop: 12, marginBottom: 6 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: "#f9fafb" },
  saveBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  saveText: { color: "#fff", fontWeight: "700" },
  result: { marginTop: 10, fontWeight: "700", fontSize: 14 },
  ok: { color: "#16a34a" },
  bad: { color: "#dc2626" },
});
