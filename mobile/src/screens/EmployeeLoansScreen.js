import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

export default function EmployeeLoansScreen({ employeeId, employeeName }) {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLoan, setTotalLoan] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  const [addModal, setAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payment, setPayment] = useState({ amount: "", loanId: null, currentRemaining: 0 });
  const [form, setForm] = useState({
    amount: "",
    reason: "",
    loan_date: new Date().toISOString().split("T")[0],
  });

  const recalcTotals = (data) => {
    let loanSum = 0, remainingSum = 0;
    data.forEach((l) => {
      loanSum += Number(l.amount || 0);
      remainingSum += Number(l.remaining || 0);
    });
    setTotalLoan(loanSum);
    setTotalRemaining(remainingSum);
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/credits/${employeeId}/loans`);
      setLoans(res.data);
      recalcTotals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [employeeId]);

  const handleAddLoan = async () => {
    if (!form.amount || !form.loan_date) return Alert.alert("Error", "Amount and date are required");
    try {
      const res = await apiClient.post(`/credits/${employeeId}/loans`, {
        amount: Number(form.amount),
        reason: form.reason,
        loan_date: form.loan_date,
      });
      const newLoans = [res.data, ...loans];
      setLoans(newLoans);
      recalcTotals(newLoans);
      setAddModal(false);
      setForm({ amount: "", reason: "", loan_date: new Date().toISOString().split("T")[0] });
    } catch (err) {
      Alert.alert("Error", "Failed to add loan");
    }
  };

  const handleDeleteLoan = async (loanId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this loan?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
              await apiClient.delete(`/credits/${employeeId}/loans/${loanId}`);
              const newLoans = loans.filter((l) => l.id !== loanId);
              setLoans(newLoans);
              recalcTotals(newLoans);
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete loan");
            }
          }
        }
      ]
    );
  };

  const handlePayLoan = async () => {
    const amount = Number(payment.amount);
    if (!amount || amount <= 0) return Alert.alert("Error", "Invalid amount.");
    if (amount > payment.currentRemaining) return Alert.alert("Error", "Payment exceeds remaining balance.");

    try {
      const res = await apiClient.put(`/credits/${employeeId}/loans/${payment.loanId}/pay`, {
        paymentAmount: amount
      });
      const newLoans = loans.map((l) => l.id === payment.loanId ? res.data : l);
      setLoans(newLoans);
      recalcTotals(newLoans);
      setShowPayModal(false);
      setPayment({ amount: "", loanId: null, currentRemaining: 0 });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to process payment");
    }
  };

  const fmt = (v) => Number(v || 0).toLocaleString();

  const renderLoan = ({ item: l, index }) => (
    <View style={styles.loanRow}>
      <Text style={styles.loanIndex}>{index + 1}</Text>
      <View style={styles.loanInfo}>
        <Text style={styles.loanDate}>{l.loan_date}</Text>
        <Text style={styles.loanReason}>{l.reason || "—"}</Text>
      </View>
      <View style={styles.loanAmounts}>
        <Text style={styles.loanAmount}>RWF {fmt(l.amount)}</Text>
        <Text style={[styles.loanRemaining, { color: Number(l.remaining) >= 0 ? "#16A34A" : "#DC2626" }]}>
          Rem: {fmt(l.remaining)}
        </Text>
      </View>
      <View style={styles.actionBtns}>
        {l.remaining > 0 && (
          <TouchableOpacity 
            style={styles.repayBtn} 
            onPress={() => {
              setPayment({ amount: String(l.remaining), loanId: l.id, currentRemaining: l.remaining });
              setShowPayModal(true);
            }}
          >
            <Text style={styles.repayBtnText}>Repay</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteLoan(l.id)}>
            <Text style={styles.deleteBtnText}>Del</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{employeeName} — Loans</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#F28B82" }]}>
          <Text style={styles.summaryLabel}>Total Loan</Text>
          <Text style={styles.summaryValue}>RWF {fmt(totalLoan)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#0E6251" }]}>
          <Text style={[styles.summaryLabel, { color: "#fff" }]}>Total Remaining</Text>
          <Text style={[styles.summaryValue, { color: "#fff" }]}>RWF {fmt(totalRemaining)}</Text>
        </View>
      </View>

      {/* Loans List */}
      {loading ? (
        <ActivityIndicator color="#145A32" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(l) => String(l.id)}
          renderItem={renderLoan}
          ListEmptyComponent={<Text style={styles.emptyText}>No loans found</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Add Loan Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Loan</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount Taken</Text>
              <TextInput
                style={styles.input}
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason</Text>
              <TextInput
                style={styles.input}
                value={form.reason}
                onChangeText={(v) => setForm({ ...form, reason: v })}
                placeholder="Reason (optional)"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={form.loan_date}
                onChangeText={(v) => setForm({ ...form, loan_date: v })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddLoan}>
                <Text style={styles.confirmText}>Add Loan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pay Modal */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Repay Loan</Text>
            <Text style={{ textAlign: 'center', marginBottom: 15, color: '#666' }}>
              Remaining: RWF {fmt(payment.currentRemaining)}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Amount</Text>
              <TextInput
                style={styles.input}
                value={payment.amount}
                onChangeText={(v) => setPayment({ ...payment, amount: v })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPayModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#2a5298' }]} onPress={handlePayLoan}>
                <Text style={styles.confirmText}>Submit Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", padding: 14, elevation: 3,
  },
  backBtn: { padding: 6 },
  backText: { color: "#145A32", fontWeight: "700", fontSize: 14 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1C", flex: 1, textAlign: "center" },
  addBtn: { backgroundColor: "#145A32", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  cardRow: { flexDirection: "row", padding: 12, gap: 8 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: "center", elevation: 3 },
  summaryLabel: { fontSize: 12, fontWeight: "600", color: "#1C1C1C" },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 6, color: "#1C1C1C" },
  loanRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    marginHorizontal: 12, marginBottom: 8, borderRadius: 12, padding: 14, elevation: 2,
  },
  loanIndex: { width: 28, fontSize: 13, color: "#9CA3AF", fontWeight: "600" },
  loanInfo: { flex: 1 },
  loanDate: { fontSize: 14, fontWeight: "700", color: "#1A2238" },
  loanReason: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  loanAmounts: { alignItems: "flex-end", marginRight: 10 },
  loanAmount: { fontSize: 14, fontWeight: "700", color: "#DC2626" },
  loanRemaining: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  actionBtns: { flexDirection: "column", gap: 6, alignItems: "center" },
  repayBtn: { backgroundColor: "#16A34A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  repayBtnText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#DC2626", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  deleteBtnText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  emptyText: { textAlign: "center", padding: 40, color: "#666" },
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
