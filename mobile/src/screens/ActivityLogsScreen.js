import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import apiClient from "../api/apiClient";

const today = new Date().toISOString().split("T")[0];

export default function ActivityLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(today);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/logs", { params: { date } });
      const rawLogs = Array.isArray(res.data) ? res.data : [];
      
      const productCounts = {};
      rawLogs.forEach(l => {
         if (l.product_name && l.product_name !== "-") {
            productCounts[l.product_name] = (productCounts[l.product_name] || 0) + 1;
         }
      });
      
      const finalLogs = rawLogs.map(l => ({
         ...l,
         changeCount: (l.product_name && l.product_name !== "-") ? productCounts[l.product_name] : 0
      }));

      setLogs(finalLogs);
    } catch (err) {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [date]);

  const changeDate = (days) => {
    const baseDate = date ? new Date(date) : new Date(today);
    baseDate.setDate(baseDate.getDate() + days);
    const formatted = baseDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setDate(formatted);
  };

  const renderLog = ({ item: log, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
      <View style={styles.logLeft}>
        <View style={styles.headerFlex}>
          <Text style={styles.username}>{log.username}</Text>
          {log.product_name && log.product_name !== "-" && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{log.product_name}</Text>
            </View>
          )}
        </View>
        <Text style={styles.action}>{log.action_type || log.action}</Text>
        
        {((log.before_val && log.before_val !== "-") || (log.after_val && log.after_val !== "-")) && (
          <View style={styles.changesRow}>
            <Text style={styles.beforeText}>Before: {log.before_val || "-"}</Text>
            <Text style={styles.arrowText}> ➔ </Text>
            <Text style={styles.afterText}>After: {log.after_val || "-"}</Text>
          </View>
        )}
        
        <Text style={styles.meta}>{log.page} · {new Date(log.created_at).toLocaleString()}</Text>
      </View>

      <View style={styles.logRight}>
        {log.changeCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{log.changeCount}x</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Logs</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(-1)}>
            <Text style={styles.arrowTextWhite}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{date || "All"}</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(1)} disabled={date === today}>
            <Text style={[styles.arrowTextWhite, date === today && styles.disabled]}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#145A32" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(log) => String(log.log_id)}
          renderItem={renderLog}
          ListEmptyComponent={<Text style={styles.emptyText}>No logs found</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", padding: 16, elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1A2238" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  arrowBtn: { backgroundColor: "#1A2238", borderRadius: 6, padding: 8 },
  arrowTextWhite: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.4 },
  dateText: { fontWeight: "700", fontSize: 13, color: "#1A2238" },
  errorBox: { backgroundColor: "#fee2e2", margin: 12, padding: 12, borderRadius: 10 },
  errorText: { color: "#DC2626", textAlign: "center" },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  rowAlt: { backgroundColor: "#fafafa" },
  logLeft: { flex: 1, marginRight: 12 },
  headerFlex: { flexDirection: "row", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 },
  username: { fontWeight: "700", fontSize: 14, color: "#111827" },
  badge: { backgroundColor: "#3B82F6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  action: { fontWeight: "600", color: "#1A2238", fontSize: 13, marginBottom: 4 },
  changesRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  beforeText: { color: "#DC2626", fontSize: 12, fontWeight: "600" },
  arrowText: { color: "#6B7280", fontSize: 12 },
  afterText: { color: "#16A34A", fontSize: 12, fontWeight: "600" },
  meta: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  logRight: { alignItems: "flex-end", justifyContent: "center" },
  countBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  emptyText: { textAlign: "center", padding: 40, color: "#666" },
});
