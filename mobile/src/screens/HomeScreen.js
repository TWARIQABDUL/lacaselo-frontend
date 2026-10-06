import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import ClosingsAdminSection from "../components/ClosingsAdminSection";

const SECTIONS = [
  { name: "Drinks", key: "drinks", route: "/(drawer)/bar", icon: <Ionicons name="wine-outline" size={36} color="#145A32" /> },
  { name: "Kitchen", key: "kitchen", route: "/(drawer)/kitchen", icon: <Ionicons name="restaurant-outline" size={36} color="#145A32" /> },
  { name: "Billiard", key: "billiard", route: "/(drawer)/billiard", icon: <FontAwesome5 name="circle" size={30} color="#145A32" /> },
  { name: "Gym", key: "gym", route: "/(drawer)/gym", icon: <FontAwesome5 name="dumbbell" size={30} color="#145A32" /> },
  { name: "Guest House", key: "guesthouse", route: "/(drawer)/guesthouse", icon: <Ionicons name="bed-outline" size={36} color="#145A32" /> },
  { name: "Expenses", key: "expenses", route: "/(drawer)/expenses", icon: <Ionicons name="cash-outline" size={36} color="#145A32" /> },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);

  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - offset).toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(localToday);
  const [comments, setComments] = useState([]);

  const [totals, setTotals] = useState({ drinks: 0, kitchen: 0, billiard: 0, gym: 0, guesthouse: 0, expenses: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTotals();
  }, []);

  useEffect(() => {
    fetchComments(selectedDate);
  }, [selectedDate]);

  const shiftDate = (days) => {
    const d = new Date(`${selectedDate}T00:00:00Z`);
    if (isNaN(d.getTime())) return;
    d.setUTCDate(d.getUTCDate() + days);
    const next = d.toISOString().split("T")[0];
    if (next > localToday) return;
    setSelectedDate(next);
  };

  const fetchComments = async (date) => {
    try {
      const res = await apiClient.get("/comments", { params: { date } });
      setComments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTotals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/total-money");
      const { drinks, kitchen, billiard, gym, guesthouse, expenses } = res.data;
      const grandTotal = (drinks || 0) + (kitchen || 0) + (billiard || 0) + (gym || 0) + (guesthouse || 0);
      setTotals({ drinks: drinks || 0, kitchen: kitchen || 0, billiard: billiard || 0, gym: gym || 0, guesthouse: guesthouse || 0, expenses: expenses || 0, grandTotal });
    } catch (e) {
      setError("Failed to load totals.");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>La Cielo GARDEN</Text>
      <Text style={styles.subtitle}>Overview of all sections and profits</Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchTotals} disabled={loading}>
        <Text style={styles.refreshText}>{loading ? "Loading..." : "Refresh"}</Text>
      </TouchableOpacity>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.grid}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={styles.card}
            onPress={() => router.push(s.route)}
          >
            <View style={styles.iconWrap}>{s.icon}</View>
            <Text style={styles.cardName}>{s.name}</Text>
            <Text style={styles.cardValue}>
              {loading ? "..." : fmt(totals[s.key])} RWF
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Profit (Expenses Excluded)</Text>
        {loading ? (
          <ActivityIndicator color="#145A32" size="large" style={{ marginTop: 12 }} />
        ) : (
          <Text style={styles.totalValue}>{fmt(totals.grandTotal)} RWF</Text>
        )}
      </View>

      {/* COMMENTS SECTION */}
      <View style={styles.commentsSection}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Closing Comments</Text>
          <View style={styles.datePickerWrap}>
            <TouchableOpacity style={styles.dateArrowBtn} onPress={() => shiftDate(-1)}>
              <Text style={styles.dateArrowText}>◀</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.dateInput}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
            />
            <TouchableOpacity style={styles.dateArrowBtn} onPress={() => shiftDate(1)} disabled={selectedDate >= localToday}>
              <Text style={[styles.dateArrowText, selectedDate >= localToday && { opacity: 0.35 }]}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {comments.length === 0 ? (
          <View style={styles.noCommentsCard}>
            <Text style={styles.noCommentsText}>No closing comments recorded for this date.</Text>
          </View>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeaderRow}>
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>{String(c.department).toUpperCase()}</Text>
                </View>
                <Text style={styles.commentTime}>
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.commentText}>"{c.comment}"</Text>
              <View style={styles.commentAuthorRow}>
                <Ionicons name="person-circle" size={18} color="#6b7280" />
                <Text style={styles.commentAuthor}>{c.username || 'Staff'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {isAdmin && <ClosingsAdminSection selectedDate={selectedDate} onDateChange={setSelectedDate} maxDate={localToday} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: "#1C1C1C", textAlign: "center", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 14 },
  refreshBtn: {
    alignSelf: "center",
    backgroundColor: "#145A32",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  refreshText: { color: "#fff", fontWeight: "600" },
  errorBox: { backgroundColor: "#fee2e2", padding: 12, borderRadius: 10, marginBottom: 14 },
  errorText: { color: "#DC2626", textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  iconWrap: { marginBottom: 10 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#1C1C1C", marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: "700", color: "#145A32" },
  totalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1C1C1C", textAlign: "center" },
  totalValue: { fontSize: 32, fontWeight: "700", color: "#145A32", marginTop: 10 },
  commentsSection: { marginTop: 24 },
  commentsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 8, marginBottom: 12 },
  commentsTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1C" },
  datePickerWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateArrowBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
  dateArrowText: { fontSize: 12, color: "#1C1C1C" },
  dateInput: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontSize: 14, minWidth: 100, textAlign: "center" },
  noCommentsCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, alignItems: "center" },
  noCommentsText: { color: "#9ca3af", fontStyle: "italic" },
  commentCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  commentHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  deptBadge: { backgroundColor: "#e0e7ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deptBadgeText: { color: "#4338ca", fontSize: 10, fontWeight: "700" },
  commentTime: { fontSize: 10, color: "#6b7280" },
  commentText: { fontSize: 14, color: "#374151", marginBottom: 12, lineHeight: 20 },
  commentAuthorRow: { flexDirection: "row", alignItems: "center" },
  commentAuthor: { fontSize: 12, fontWeight: "700", color: "#6b7280", marginLeft: 4 },
});
