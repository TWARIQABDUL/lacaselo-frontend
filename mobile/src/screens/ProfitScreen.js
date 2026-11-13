import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import apiClient from "../api/apiClient";

const fmt = (n) => Number(n || 0).toLocaleString();

const DEPARTMENTS = [
  { key: "bar", label: "Bar" },
  { key: "kitchen", label: "Kitchen" },
  { key: "billiard", label: "Billiard" },
  { key: "gym", label: "Gym" },
  { key: "guesthouse", label: "Guest House" },
];

const toMonth = (d) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 7);
};

const shiftMonth = (month, delta) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};

function Net({ value }) {
  return <Text style={[styles.value, value < 0 ? styles.bad : styles.ok]}>{fmt(value)}</Text>;
}

function Row({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function ProfitScreen() {
  const maxMonth = toMonth(new Date());
  const [month, setMonth] = useState(maxMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get("/profit/month", { params: { month } });
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load monthly profit");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  const t = data?.totals;

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
      ) : data ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Month total</Text>
            <Row label="Sales"><Text style={styles.value}>{fmt(t.sales)}</Text></Row>
            <Row label="Gross profit"><Text style={styles.value}>{fmt(t.profit)}</Text></Row>
            <Row label="Expenses"><Text style={styles.value}>{fmt(t.expenses)}</Text></Row>
            <Row label="Net profit"><Net value={t.net} /></Row>
          </View>

          <Text style={styles.section}>By department</Text>
          {DEPARTMENTS.map((d) => {
            const x = data.departments[d.key];
            return (
              <View key={d.key} style={styles.card}>
                <Text style={styles.cardTitle}>{d.label}</Text>
                <Row label="Sales"><Text style={styles.value}>{fmt(x.sales)}</Text></Row>
                <Row label="Profit"><Text style={styles.value}>{fmt(x.profit)}</Text></Row>
                <Row label="Expenses"><Text style={styles.value}>{fmt(x.expenses)}</Text></Row>
                <Row label="Net"><Net value={x.net} /></Row>
              </View>
            );
          })}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>General expenses</Text>
            <Row label="Expenses"><Text style={styles.value}>{fmt(t.general_expenses)}</Text></Row>
          </View>

          <Text style={styles.section}>By day</Text>
          {data.days.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.empty}>No records for this month.</Text>
            </View>
          ) : (
            data.days.map((d) => (
              <View key={d.date} style={styles.card}>
                <Text style={styles.cardTitle}>{d.date}</Text>
                {DEPARTMENTS.map((x) => (
                  <Row key={x.key} label={x.label}><Text style={styles.value}>{fmt(d[x.key].profit)}</Text></Row>
                ))}
                <Row label="Expenses"><Text style={styles.value}>{fmt(d.expenses)}</Text></Row>
                <Row label="Net"><Net value={d.net} /></Row>
              </View>
            ))
          )}
          <Text style={styles.note}>
            Bar and kitchen profit = sold x (selling price - buying price). Billiard, gym and guest house have no buying cost, so their income counts as profit.
          </Text>
        </>
      ) : null}
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
  section: { fontSize: 16, fontWeight: "700", color: "#1A2238", marginTop: 6, marginBottom: 8 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A2238", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 13, color: "#6b7280" },
  value: { fontSize: 13, fontWeight: "700", color: "#1f2937" },
  ok: { color: "#16a34a" },
  bad: { color: "#dc2626" },
  empty: { color: "#9ca3af", fontStyle: "italic" },
  note: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
});
