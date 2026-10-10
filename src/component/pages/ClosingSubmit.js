import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

// Past dates still open for submitting a closing (locked again once submitted)
const UNLOCKED_DATES = ["2026-10-01", "2026-10-02", "2026-10-03"];

const fmt = (n) => Number(n || 0).toLocaleString();

function ClosingSubmit({ selectedDate }) {
  const userStr = localStorage.getItem("user");
  const role = userStr ? JSON.parse(userStr)?.role : null;
  const canClose = ["BAR_MAN", "MANAGER"].includes(role);

  const [closing, setClosing] = useState(null);
  const [systemSales, setSystemSales] = useState(0);
  const [momo, setMomo] = useState("");
  const [cash, setCash] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const isPastDate = selectedDate < today;
  const isUnlockedDate = UNLOCKED_DATES.includes(selectedDate);
  const isClosedDate = isPastDate && !isUnlockedDate;
  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchClosing = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/closings`, {
        params: { date: selectedDate },
        ...authHeader(),
      });
      const found = res.data && res.data.length > 0 ? res.data[0] : null;
      setClosing(found);
      if (!found && !isClosedDate) {
        const prev = await axios.get(`${API_BASE_URL}/closings/preview`, {
          params: { date: selectedDate },
          ...authHeader(),
        });
        setSystemSales(Number(prev.data.system_sales) || 0);
      }
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
      setConfirming(false);
      fetchClosing();
    }
  }, [showModal, selectedDate]);

  const entered = Number(momo || 0) + Number(cash || 0);
  const hasInput = momo !== "" || cash !== "";
  const missing = systemSales - entered;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await axios.post(
        `${API_BASE_URL}/closings`,
        { date: selectedDate, momo_amount: Number(momo), cash_amount: Number(cash) },
        authHeader()
      );
      setConfirming(false);
      await fetchClosing();
    } catch (err) {
      console.error("Failed to submit closing", err);
      alert(err.response?.data?.message || "Failed to submit closing");
      setConfirming(false);
      fetchClosing();
    } finally {
      setSaving(false);
    }
  };

  const goConfirm = () => {
    if (momo === "" || cash === "" || Number(momo) < 0 || Number(cash) < 0) {
      alert("Enter both the amount on code and the amount in cash (0 if none).");
      return;
    }
    setConfirming(true);
  };

  const Balance = ({ sales, total }) => {
    const diff = Number(sales) - Number(total);
    if (diff === 0) return <div className="text-success fw-bold">Matches stock value, nothing missing</div>;
    return diff > 0 ? (
      <div className="text-danger fw-bold">Missing balance: {fmt(diff)}</div>
    ) : (
      <div className="text-warning fw-bold">More than stock value by {fmt(Math.abs(diff))}</div>
    );
  };

  if (!canClose) return null;

  const canSubmit = !closing && !isClosedDate;

  return (
    <>
      <button
        className="btn btn-outline-success btn-sm shadow-sm"
        onClick={() => setShowModal(true)}
        style={{ fontWeight: "600", borderRadius: "20px", padding: "6px 15px", marginLeft: "10px" }}
      >
        <i className="bi bi-cash-coin me-1"></i> {isClosedDate ? "View Closing" : "Submit Closing"}
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
                ) : closing ? (
                  <>
                    <p className="text-muted small mb-3">Date: {selectedDate} · All departments combined</p>
                    <div className="d-flex justify-content-between mb-2"><span>Stock value</span><strong>{fmt(closing.system_sales)}</strong></div>
                    <div className="d-flex justify-content-between mb-2"><span>Money on code</span><strong>{fmt(closing.momo_amount)}</strong></div>
                    <div className="d-flex justify-content-between mb-3"><span>Money in cash</span><strong>{fmt(closing.cash_amount)}</strong></div>
                    <Balance sales={closing.system_sales} total={Number(closing.momo_amount) + Number(closing.cash_amount)} />
                    <div className="alert alert-secondary py-2 small mt-3 mb-0">Closing submitted and locked. It cannot be edited.</div>
                  </>
                ) : isClosedDate ? (
                  <div className="text-muted fst-italic">No closing was submitted for this date.</div>
                ) : confirming ? (
                  <>
                    <h6 className="fw-bold mb-3">Are you sure you want to submit?</h6>
                    <div className="d-flex justify-content-between mb-2"><span>Stock value</span><strong>{fmt(systemSales)}</strong></div>
                    <div className="d-flex justify-content-between mb-2"><span>Money on code</span><strong>{fmt(momo)}</strong></div>
                    <div className="d-flex justify-content-between mb-3"><span>Money in cash</span><strong>{fmt(cash)}</strong></div>
                    <Balance sales={systemSales} total={entered} />
                    <div className="alert alert-warning py-2 small mt-3 mb-0">Once submitted this closing is locked and cannot be changed.</div>
                  </>
                ) : (
                  <>
                    <p className="text-muted small mb-3">Date: {selectedDate} · All departments combined</p>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">Stock value (system)</span>
                      <strong>{fmt(systemSales)}</strong>
                    </div>
                    <label className="form-label fw-semibold">Amount on code (MoMo)</label>
                    <input type="number" min="0" className="form-control mb-3" value={momo} onChange={(e) => setMomo(e.target.value)} placeholder="0" />
                    <label className="form-label fw-semibold">Amount in cash</label>
                    <input type="number" min="0" className="form-control" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0" />
                    {hasInput && (
                      <div className="mt-3 small">
                        <div className="d-flex justify-content-between"><span className="text-muted">Code + cash</span><strong>{fmt(entered)}</strong></div>
                        <Balance sales={systemSales} total={entered} />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                {confirming ? (
                  <>
                    <button type="button" className="btn btn-light px-4" onClick={() => setConfirming(false)} disabled={saving}>Go back</button>
                    <button type="button" className="btn btn-success px-4 fw-bold" onClick={handleSubmit} disabled={saving}>
                      {saving ? "Submitting..." : "Yes, submit"}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Close</button>
                    {canSubmit && !loading && (
                      <button type="button" className="btn btn-success px-4 fw-bold" onClick={goConfirm}>Submit Closing</button>
                    )}
                  </>
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
