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

export default function ActivityLogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/logs");
      setLogs(res.data);
    } catch (err) {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderLog = ({ item: log, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
      <View style={styles.logLeft}>
        <Text style={styles.action}>{log.action}</Text>
        <Text style={styles.meta}>{log.username} · {log.page}</Text>
      </View>
      <View style={styles.logRight}>
        <Text style={styles.branch}>{log.branch_id}</Text>
        <Text style={styles.time}>{new Date(log.created_at).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Activity Logs</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchLogs} disabled={loading}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#fff", padding: 16, elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1A2238" },
  refreshBtn: { backgroundColor: "#145A32", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  refreshText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  errorBox: { backgroundColor: "#fee2e2", margin: 12, padding: 12, borderRadius: 10 },
  errorText: { color: "#DC2626", textAlign: "center" },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  rowAlt: { backgroundColor: "#fafafa" },
  logLeft: { flex: 1, marginRight: 12 },
  action: { fontWeight: "700", color: "#1A2238", fontSize: 13 },
  meta: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  logRight: { alignItems: "flex-end" },
  branch: { fontSize: 11, color: "#145A32", fontWeight: "600" },
  time: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  emptyText: { textAlign: "center", padding: 40, color: "#666" },
});
