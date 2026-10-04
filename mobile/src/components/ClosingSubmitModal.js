import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from "react-native";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";

const fmt = (n) => Number(n || 0).toLocaleString();

export default function ClosingSubmitModal({ selectedDate }) {
  const { user } = useAuth();
  const canClose = ["BAR_MAN", "MANAGER"].includes(user?.role);

  const [closing, setClosing] = useState(null);
  const [momo, setMomo] = useState("");
  const [cash, setCash] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localToday = new Date(now.getTime() - offset).toISOString().split("T")[0];
  const isPastDate = selectedDate < localToday;

  const fetchClosing = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/closings", { params: { date: selectedDate } });
      setClosing(res.data && res.data.length > 0 ? res.data[0] : null);
    } catch (err) {
      console.error("Failed to fetch closing", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      setMomo("");
      setCash("");
      fetchClosing();
    }
  }, [showModal, selectedDate]);

  const submit = async () => {
    try {
      setSaving(true);
      await apiClient.post("/closings", {
        date: selectedDate,
        momo_amount: Number(momo),
        cash_amount: Number(cash),
      });
      Alert.alert("Success", "Closing submitted successfully!");
      await fetchClosing();
    } catch (err) {
      console.error("Failed to submit closing", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to submit closing");
      fetchClosing();
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (momo === "" || cash === "" || Number(momo) < 0 || Number(cash) < 0) {
      Alert.alert("Missing amount", "Enter both the amount on code and the amount in cash (0 if none).");
      return;
    }
    Alert.alert("Submit closing?", "Once submitted this closing cannot be changed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: submit },
    ]);
  };

  const canSubmit = !closing && !isPastDate;

  if (!canClose) return null;

  return (
    <>
      <TouchableOpacity style={styles.openBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.openBtnText}>{isPastDate ? "View Closing" : "Submit Closing"}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Closing Money</Text>
            {loading ? (
              <ActivityIndicator color="#16a34a" size="large" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.dateLabel}>Date: {selectedDate} · All departments combined</Text>

                {closing ? (
                  <>
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Money on code</Text>
                      <Text style={styles.rowValue}>{fmt(closing.momo_amount)}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Money in cash</Text>
                      <Text style={styles.rowValue}>{fmt(closing.cash_amount)}</Text>
                    </View>
                    <Text style={styles.lockedText}>Closing submitted and locked.</Text>
                  </>
                ) : isPastDate ? (
                  <Text style={styles.noText}>No closing was submitted for this date.</Text>
                ) : (
                  <>
                    <Text style={styles.inputLabel}>Amount on code (MoMo)</Text>
                    <TextInput style={styles.input} value={momo} onChangeText={setMomo} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
                    <Text style={styles.inputLabel}>Amount in cash</Text>
                    <TextInput style={styles.input} value={cash} onChangeText={setCash} keyboardType="numeric" placeholder="0" placeholderTextColor="#9ca3af" />
                  </>
                )}
              </>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              {canSubmit && !loading && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  <Text style={styles.saveText}>{saving ? "Submitting..." : "Submit Closing"}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  openBtn: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  openBtnText: { color: "#16a34a", fontWeight: "700", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1A2238", marginBottom: 8 },
  dateLabel: { fontSize: 12, color: "#6b7280", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  rowLabel: { fontSize: 14, color: "#6b7280" },
  rowValue: { fontSize: 14, fontWeight: "700", color: "#1f2937" },
  lockedText: { marginTop: 6, fontSize: 12, color: "#6b7280", fontStyle: "italic" },
  noText: { fontSize: 14, color: "#9ca3af", fontStyle: "italic" },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 12, padding: 14, alignItems: "center" },
  cancelText: { fontWeight: "700", color: "#374151" },
  saveBtn: { flex: 1, backgroundColor: "#16a34a", borderRadius: 12, padding: 14, alignItems: "center" },
  saveText: { fontWeight: "700", color: "#fff" },
});
