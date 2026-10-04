import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const fmt = (n) => Number(n || 0).toLocaleString();

function ClosingSubmit({ selectedDate }) {
  const userStr = localStorage.getItem("user");
  const role = userStr ? JSON.parse(userStr)?.role : null;
  const canClose = ["BAR_MAN", "MANAGER"].includes(role);

  const [closing, setClosing] = useState(null);
  const [momo, setMomo] = useState("");
  const [cash, setCash] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isPastDate = selectedDate < today;

  const fetchClosing = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/closings`, {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleSave = async () => {
    if (momo === "" || cash === "" || Number(momo) < 0 || Number(cash) < 0) {
      alert("Enter both the amount on code and the amount in cash (0 if none).");
      return;
    }
    if (!window.confirm("Once submitted this closing cannot be changed. Submit?")) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/closings`,
        {
          date: selectedDate,
          momo_amount: Number(momo),
          cash_amount: Number(cash),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Closing submitted successfully!");
      await fetchClosing();
    } catch (err) {
      console.error("Failed to submit closing", err);
      alert(err.response?.data?.message || "Failed to submit closing");
      fetchClosing();
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = !closing && !isPastDate;

  if (!canClose) return null;

  return (
    <>
      <button
        className="btn btn-outline-success btn-sm shadow-sm"
        onClick={() => setShowModal(true)}
        style={{ fontWeight: "600", borderRadius: "20px", padding: "6px 15px", marginLeft: "10px" }}
      >
        <i className="bi bi-cash-coin me-1"></i> {isPastDate ? "View Closing" : "Submit Closing"}
      </button>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Closing Money</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-start">
                {loading ? (
                  <div className="text-muted">Loading closing...</div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">
                      Date: {selectedDate} · All departments combined
                    </p>

                    {closing ? (
                      <>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Money on code</span>
                          <strong>{fmt(closing.momo_amount)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Money in cash</span>
                          <strong>{fmt(closing.cash_amount)}</strong>
                        </div>
                        <div className="alert alert-secondary py-2 small mb-0">
                          Closing submitted and locked.
                        </div>
                      </>
                    ) : isPastDate ? (
                      <div className="text-muted fst-italic">No closing was submitted for this date.</div>
                    ) : (
                      <>
                        <label className="form-label fw-semibold">Amount on code (MoMo)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control mb-3"
                          value={momo}
                          onChange={(e) => setMomo(e.target.value)}
                          placeholder="0"
                        />
                        <label className="form-label fw-semibold">Amount in cash</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={cash}
                          onChange={(e) => setCash(e.target.value)}
                          placeholder="0"
                        />
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Close</button>
                {canSubmit && !loading && (
                  <button type="button" className="btn btn-success px-4 fw-bold" onClick={handleSave} disabled={saving}>
                    {saving ? "Submitting..." : "Submit Closing"}
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

export default ClosingSubmit;
