import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

// Past dates that are temporarily open for adding a first comment (locked again once saved)
const UNLOCKED_DATES = ["2026-10-01", "2026-10-02", "2026-10-03"];

function ClosingComment({ selectedDate, department }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const userStr = localStorage.getItem("user");
  const role = userStr ? JSON.parse(userStr)?.role : null;
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(role);
  
  const today = new Date().toISOString().split("T")[0];
  const isPastDate = selectedDate < today;
  // staff cannot change a comment once it has been saved
  const isUnlockedDate = UNLOCKED_DATES.includes(selectedDate);
  const isLocked = (isPastDate && !isUnlockedDate) || (saved && !isAdmin);

  const fetchComment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/comments`, {
        params: { date: selectedDate, department },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        setComment(res.data[0].comment);
        setSaved(true);
      } else {
        setComment("");
        setSaved(false);
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
    if (!isAdmin && !window.confirm("Once saved, this comment cannot be edited. Save it?")) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/comments`,
        { date: selectedDate, department, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Comment saved successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save comment", err);
      alert(err.response?.data?.message || "Failed to save comment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-outline-info btn-sm shadow-sm" 
        onClick={() => setShowModal(true)}
        style={{ fontWeight: "600", borderRadius: "20px", padding: "6px 15px", marginLeft: "10px" }}
      >
        <i className="bi bi-chat-text-fill me-1"></i> {isPastDate && !isUnlockedDate ? "View Comment" : "Leave Comment"}
      </button>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">
                  {isLocked ? "Closing Comment" : "Add Closing Comment"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-start">
                {loading ? (
                  <div className="text-muted">Loading comment...</div>
                ) : (
                  <>
                    <p className="text-muted small mb-2">Date: {selectedDate}</p>
                    {isLocked ? (
                      <div className="p-3 bg-light border rounded text-dark" style={{ minHeight: "80px" }}>
                        {comment ? comment : <span className="text-muted fst-italic">No comment recorded.</span>}
                      </div>
                    ) : (
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Write a comment about today's operations..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ borderRadius: "8px" }}
                      ></textarea>
                    )}
                    {isLocked && saved && (
                      <div className="text-muted small mt-2">This comment is saved and cannot be edited.</div>
                    )}
                    {!isLocked && !isAdmin && (
                      <div className="text-warning small mt-2">Once saved, this comment cannot be edited.</div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Close</button>
                {!isLocked && (
                  <button type="button" className="btn btn-info px-4 fw-bold text-white" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Comment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClosingComment;
