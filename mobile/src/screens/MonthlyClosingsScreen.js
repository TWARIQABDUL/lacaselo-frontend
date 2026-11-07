import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import apiClient from "../api/apiClient";

const fmt = (n) => Number(n || 0).toLocaleString();

const toMonth = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 7);
};

const shiftMonth = (month, delta) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};

// > 0 means money is missing, < 0 means extra
function Gap({ value, label }) {
  if (value === null || value === undefined) return <Text style={styles.muted}>{label}: -</Text>;
  if (value === 0) return <Text style={[styles.gap, styles.ok]}>{label}: OK</Text>;
  return value > 0 ? (
    <Text style={[styles.gap, styles.bad]}>{label}: missing {fmt(value)}</Text>
  ) : (
    <Text style={[styles.gap, styles.warn]}>{label}: extra {fmt(Math.abs(value))}</Text>
  );
}

export default function MonthlyClosingsScreen() {
  const maxMonth = toMonth(new Date());
  const [month, setMonth] = useState(maxMonth);
  const [data, setData] = useState({ days: [], totals: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get("/closings/month", { params: { month } });
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load monthly closings");
        setData({ days: [], totals: null });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  const t = data.totals;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setMonth(shiftMonth(month, -1))}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{month}</Text>
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setMonth(shiftMonth(month, 1))} disabled={month >= maxMonth}>
          <Text style={[styles.arrowText, month >= maxMonth && { opacity: 0.35 }]}>▶</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color="#145A32" size="large" style={{ marginTop: 30 }} />
      ) : (
        <>
          {t && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Month totals · {t.days_closed} day(s) closed</Text>
              <View style={styles.row}><Text style={styles.label}>Stock sold value</Text><Text style={styles.value}>{fmt(t.system_sales)}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Money on code</Text><Text style={styles.value}>{fmt(t.momo_amount)}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Money in cash</Text><Text style={styles.value}>{fmt(t.cash_amount)}</Text></View>
              <View style={styles.row}><Text style={styles.label}>Cash received</Text><Text style={styles.value}>{fmt(t.received_amount)}</Text></View>
              <Gap value={t.sales_gap} label="Code + cash vs stock" />
              <Gap value={t.cash_gap} label="Cash vs received" />
            </View>
          )}

          {data.days.length === 0 && !error ? (
            <View style={styles.card}>
              <Text style={styles.empty}>No closings or comments for this month.</Text>
            </View>
          ) : (
            data.days.map((d) => (
              <View key={d.date} style={styles.card}>
                <Text style={styles.cardTitle}>{d.date}</Text>
                {d.closing ? (
                  <>
                    <View style={styles.row}><Text style={styles.label}>Stock sold value</Text><Text style={styles.value}>{fmt(d.closing.system_sales)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Money on code</Text><Text style={styles.value}>{fmt(d.closing.momo_amount)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Money in cash</Text><Text style={styles.value}>{fmt(d.closing.cash_amount)}</Text></View>
                    <Gap value={d.closing.sales_gap} label="Code + cash vs stock" />
                    <View style={[styles.row, { marginTop: 6 }]}>
                      <Text style={styles.label}>Cash received</Text>
                      <Text style={styles.value}>{d.closing.received_amount === null ? "-" : fmt(d.closing.received_amount)}</Text>
                    </View>
                    <Gap value={d.closing.cash_gap} label="Cash vs received" />
                    <Text style={styles.by}>Submitted by {d.closing.username}</Text>
                  </>
                ) : (
                  <Text style={styles.empty}>No closing submitted</Text>
                )}
                {d.comments.map((c, i) => (
                  <View key={i} style={styles.comment}>
                    <Text style={styles.commentDept}>{String(c.department).toUpperCase()}</Text>
                    <Text style={styles.commentText}>"{c.comment}"</Text>
                    <Text style={styles.by}>{c.username || "Staff"}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 12 },
  arrowBtn: { backgroundColor: "#1A2238", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  arrowText: { color: "#fff", fontSize: 12 },
  monthText: { fontSize: 18, fontWeight: "700", color: "#1A2238", minWidth: 100, textAlign: "center" },
  error: { color: "#dc2626", textAlign: "center", marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A2238", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6b7280" },
  value: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
  gap: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  ok: { color: "#16a34a" },
  bad: { color: "#dc2626" },
  warn: { color: "#d97706" },
  muted: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  by: { fontSize: 11, color: "#9ca3af", marginTop: 6 },
  empty: { color: "#9ca3af", fontStyle: "italic" },
  comment: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  commentDept: { fontSize: 10, fontWeight: "700", color: "#4338ca" },
  commentText: { fontSize: 13, color: "#374151", marginTop: 2 },
});
