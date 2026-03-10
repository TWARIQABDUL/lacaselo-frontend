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
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/apiClient";

const today = new Date().toISOString().split("T")[0];

export default function BarScreen() {
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);

  const [stats, setStats] = useState({ day: 0, week: 0, month: 0, year: 0 });

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", initial_price: "", price: "", opening_stock: "" });

  const fetchProducts = async (date) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/bar", { params: { date } });
      const list = res.data.products || [];
      setProducts(list);
      let sales = 0, profit = 0, stockValue = 0;
      const low = [];
      list.forEach((p) => {
        const opening = Number(p.opening_stock || 0);
        const entree = Number(p.entree || 0);
        const sold = Number(p.sold || 0);
        const price = Number(p.price || 0);
        const cost = Number(p.initial_price || 0);
        const closing = opening + entree - sold;
        sales += sold * price;
        profit += sold * (price - cost);
        stockValue += closing * cost;
        if (closing < 5) low.push({ ...p, closing_stock: closing });
      });
      setTotalSales(sales);
      setTotalProfit(profit);
      setTotalStockValue(stockValue);
      setLowStockProducts(low);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/bar/stats/timePeriods");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts(selectedDate);
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
    if (!form.name.trim()) return Alert.alert("Error", "Product name is required");
    try {
      await apiClient.post("/bar", {
        name: form.name,
        initial_price: Number(form.initial_price),
        price: Number(form.price),
        opening_stock: Number(form.opening_stock),
        date: selectedDate,
      });
      setAddModal(false);
      setForm({ name: "", initial_price: "", price: "", opening_stock: "" });
      fetchProducts(selectedDate);
    } catch (err) {
      Alert.alert("Error", "Failed to add product");
    }
  };

  const handleEntreeChange = async (id, value) => {
    try {
      await apiClient.put(`/bar/entree/${id}`, { entree: Number(value), date: selectedDate });
      fetchProducts(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSoldChange = async (id, value) => {
    try {
      await apiClient.put(`/bar/sold/${id}`, { sold: Number(value), date: selectedDate });
      fetchProducts(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderProduct = ({ item: p, index }) => {
    const opening = Number(p.opening_stock || 0);
    const entree = Number(p.entree || 0);
    const sold = Number(p.sold || 0);
    const price = Number(p.price || 0);
    const total = opening + entree;
    const closing = total - sold;
    const sales = sold * price;
    const isLow = closing < 5;

    return (
      <View style={[styles.row, isLow && styles.rowLow]}>
        <Text style={[styles.cell, styles.cellNum]}>{index + 1}</Text>
        <Text style={[styles.cell, styles.cellName]} numberOfLines={1}>{p.name}</Text>
        <Text style={styles.cell}>{opening}</Text>
        <ProductInput value={String(entree)} onSubmit={(v) => handleEntreeChange(p.id, v)} />
        <Text style={styles.cell}>{total}</Text>
        <ProductInput value={String(sold)} onSubmit={(v) => handleSoldChange(p.id, v)} />
        <Text style={[styles.cell, isLow && styles.textDanger]}>{closing}</Text>
        <Text style={[styles.cell, styles.textGreen]}>{fmt(sales)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.cardRow}>
        {[
          { label: "Total Sales", value: fmt(totalSales), color: "#2563EB" },
          { label: "Total Profit", value: fmt(totalProfit), color: "#16A34A" },
          { label: "Stock Value", value: fmt(totalStockValue), color: "#0EA5E9" },
          { label: "Low Stock", value: String(lowStockProducts.length), color: "#DC2626", onPress: () => setShowLowStock(!showLowStock) },
        ].map((c, i) => (
          <TouchableOpacity key={i} style={styles.summaryCard} onPress={c.onPress} disabled={!c.onPress}>
            <Text style={styles.summaryLabel}>{c.label}</Text>
            <Text style={[styles.summaryValue, { color: c.color }]}>{c.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time Period Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Today", value: stats.day },
          { label: "Week", value: stats.week },
          { label: "Month", value: stats.month },
          { label: "Year", value: stats.year },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{fmt(s.value)}</Text>
          </View>
        ))}
      </View>

      {/* Low Stock Panel */}
      {showLowStock && lowStockProducts.length > 0 && (
        <View style={styles.lowStockPanel}>
          <Text style={styles.lowStockTitle}>Low Stock Drinks</Text>
          {lowStockProducts.map((p) => (
            <View key={p.id} style={styles.lowStockRow}>
              <Text style={styles.lowStockName}>{p.name}</Text>
              <Text style={styles.lowStockQty}>{p.closing_stock}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bar Management</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(-1)}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => changeDate(1)} disabled={selectedDate === today}>
            <Text style={[styles.arrowText, selectedDate === today && styles.disabled]}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          {["#", "Product", "Open", "StockIn", "Total", "Sold", "Close", "Sales"].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color="#145A32" style={{ marginVertical: 20 }} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No drinks for this date</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => String(p.id)}
            renderItem={renderProduct}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Drink</Text>
            {[
              { label: "Product Name", key: "name", keyboard: "default" },
              { label: "Cost Price", key: "initial_price", keyboard: "numeric" },
              { label: "Selling Price", key: "price", keyboard: "numeric" },
              { label: "Opening Stock", key: "opening_stock", keyboard: "numeric" },
            ].map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key]}
                  onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                  keyboardType={f.keyboard}
                  placeholderTextColor="#999"
                  placeholder={f.label}
                />
              </View>
            ))}
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

function ProductInput({ value, onSubmit }) {
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
  summaryCard: {
    flex: 1, minWidth: "45%", backgroundColor: "#fff", borderRadius: 12,
    padding: 14, alignItems: "center", margin: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  summaryLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600", textAlign: "center" },
  summaryValue: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  statsRow: { flexDirection: "row", paddingHorizontal: 10, gap: 6, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 10, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase" },
  statValue: { fontSize: 13, fontWeight: "700", color: "#1F2937", marginTop: 2 },
  lowStockPanel: { margin: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3 },
  lowStockTitle: { backgroundColor: "#DC2626", color: "#fff", padding: 10, fontWeight: "700" },
  lowStockRow: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  lowStockName: { fontWeight: "600" },
  lowStockQty: { color: "#DC2626", fontWeight: "700" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", margin: 10, borderRadius: 12, padding: 14, elevation: 3,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A2238" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  arrowBtn: { backgroundColor: "#1A2238", borderRadius: 6, padding: 6 },
  arrowText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.4 },
  dateText: { fontWeight: "700", fontSize: 12, color: "#1A2238" },
  addBtn: { backgroundColor: "#145A32", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginLeft: 6 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  tableContainer: { margin: 10, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 3 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1A2238", paddingVertical: 10, paddingHorizontal: 4 },
  th: { flex: 1, color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", alignItems: "center" },
  rowLow: { backgroundColor: "#FEE2E2" },
  cell: { flex: 1, fontSize: 10, textAlign: "center", color: "#333" },
  cellNum: { flex: 0.5 },
  cellName: { flex: 1.5, fontWeight: "600" },
  textDanger: { color: "#DC2626", fontWeight: "700" },
  textGreen: { color: "#16A34A", fontWeight: "700" },
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
  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#000", backgroundColor: "#f9fafb",
  },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10, padding: 12, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#374151" },
  confirmBtn: { flex: 1, backgroundColor: "#145A32", borderRadius: 10, padding: 12, alignItems: "center" },
  confirmText: { fontWeight: "700", color: "#fff" },
});
