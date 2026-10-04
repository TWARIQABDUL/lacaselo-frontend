import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const fmt = (n) => Number(n || 0).toLocaleString();

function ClosingsAdmin({ selectedDate }) {
  const [closings, setClosings] = useState([]);
  const [received, setReceived] = useState({});
  const [savingId, setSavingId] = useState(null);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchClosings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/closings`, {
        params: { date: selectedDate },
        ...authHeader(),
      });
      const list = res.data || [];
      setClosings(list);
      const initial = {};
      list.forEach((c) => {
        initial[c.id] = c.received_amount ?? "";
      });
      setReceived(initial);
    } catch (err) {
      console.error("Failed to load closings:", err);
    }
  };

  useEffect(() => {
    fetchClosings();
  }, [selectedDate]);

  const saveReceived = async (c) => {
    const value = received[c.id];
    if (value === "" || value === undefined || Number(value) < 0) {
      alert("Enter the amount received.");
      return;
    }
    try {
      setSavingId(c.id);
      await axios.put(
        `${API_BASE_URL}/closings/${c.id}/received`,
        { received_amount: Number(value) },
        authHeader()
      );
      await fetchClosings();
    } catch (err) {
      console.error("Failed to save received amount", err);
      alert(err.response?.data?.message || "Failed to save received amount");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mt-5">
      <h4 className="fw-bold text-dark mb-4">
        <i className="bi bi-cash-coin text-success me-2"></i> Closing Money
      </h4>

      {closings.length === 0 ? (
        <div className="text-center p-4 bg-white rounded shadow-sm">
          <p className="text-muted mb-0 fst-italic">No closing money submitted for this date.</p>
        </div>
      ) : (
        <div className="row g-3">
          {closings.map((c) => {
            const hasReceived = c.received_amount !== null && c.received_amount !== undefined;
            const missing = hasReceived ? Number(c.cash_amount) - Number(c.received_amount) : null;
            const declared = Number(c.momo_amount) + Number(c.cash_amount);
            const salesGap = Number(c.system_sales) - declared;
            return (
              <div key={c.id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-success text-uppercase">{c.department}</span>
                      <small className="text-muted">{c.username || "Staff"}</small>
                    </div>
                    <div className="d-flex justify-content-between"><span className="text-muted">Stock sold value</span><strong>{fmt(c.system_sales)}</strong></div>
                    <div className="d-flex justify-content-between"><span className="text-muted">Money on code</span><strong>{fmt(c.momo_amount)}</strong></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Money in cash</span><strong>{fmt(c.cash_amount)}</strong></div>
                    {salesGap !== 0 && (
                      <div className="small text-danger mb-2">
                        Code + cash is {fmt(Math.abs(salesGap))} {salesGap > 0 ? "less" : "more"} than sold value
                      </div>
                    )}
                    <hr />
                    <label className="form-label small fw-semibold mb-1">Cash received by admin</label>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={received[c.id] ?? ""}
                        onChange={(e) => setReceived({ ...received, [c.id]: e.target.value })}
                        placeholder="0"
                      />
                      <button className="btn btn-success" onClick={() => saveReceived(c)} disabled={savingId === c.id}>
                        {savingId === c.id ? "..." : "Save"}
                      </button>
                    </div>
                    {hasReceived && (
                      <div className={`fw-bold ${missing === 0 ? "text-success" : "text-danger"}`}>
                        {missing === 0
                          ? "Cash matches"
                          : missing > 0
                          ? `Missing ${fmt(missing)}`
                          : `Extra ${fmt(Math.abs(missing))}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClosingsAdmin;
