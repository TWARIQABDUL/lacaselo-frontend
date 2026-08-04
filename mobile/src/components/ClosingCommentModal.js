import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from "react-native";
import apiClient from "../api/apiClient";

export default function ClosingCommentModal({ selectedDate, department }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Format today's date in local time for correct comparison
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - offset).toISOString().split("T")[0];
  const isPastDate = selectedDate < localToday;

  const fetchComment = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/comments", {
        params: { date: selectedDate, department }
      });
      if (res.data && res.data.length > 0) {
        setComment(res.data[0].comment);
      } else {
        setComment("");
      }
    } catch (err) {
      console.error("Failed to fetch comment", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchComment();
    }
  }, [showModal, selectedDate, department]);

  const handleSave = async () => {
    if (!comment.trim()) return;
    try {
      setSaving(true);
      await apiClient.post("/comments", { date: selectedDate, department, comment });
      Alert.alert("Success", "Comment saved successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save comment", err);
      Alert.alert("Error", "Failed to save comment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.openBtn} 
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.openBtnText}>{isPastDate ? "View Comment" : "Leave Comment"}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isPastDate ? "Closing Comment" : "Add Closing Comment"}
            </Text>
            
            {loading ? (
              <ActivityIndicator color="#0ea5e9" size="large" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <Text style={styles.dateLabel}>Date: {selectedDate}</Text>
                
                {isPastDate ? (
                  <View style={styles.readOnlyBox}>
                    <Text style={comment ? styles.commentText : styles.noCommentText}>
                      {comment ? comment : "No comment recorded for this date."}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Write a comment about today's operations..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              </>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              {!isPastDate && (
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  <Text style={styles.saveText}>{saving ? "Saving..." : "Save Comment"}</Text>
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
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  openBtnText: {
    color: "#0284c7",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2238",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
  },
  readOnlyBox: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  noCommentText: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    minHeight: 120,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "700",
    color: "#374151",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveText: {
    fontWeight: "700",
    color: "#fff",
  },
});
