import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const fmt = (n) => Number(n || 0).toLocaleString();

const currentMonth = () => new Date().toISOString().slice(0, 7);

const shiftMonth = (month, delta) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
};

// > 0 means money is missing, < 0 means extra
const Gap = ({ value }) => {
  if (value === null || value === undefined) return <span className="text-muted">-</span>;
  if (value === 0) return <span className="text-success fw-semibold">OK</span>;
  return value > 0 ? (
    <span className="text-danger fw-semibold">-{fmt(value)}</span>
  ) : (
    <span className="text-warning fw-semibold">+{fmt(Math.abs(value))}</span>
  );
};

function MonthlyClosings() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState({ days: [], totals: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxMonth = currentMonth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE_URL}/closings/month`, {
          params: { month },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load monthly closings", err);
        setError(err.response?.data?.message || "Failed to load monthly closings");
        setData({ days: [], totals: null });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  const t = data.totals;

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-cash-coin text-success me-2"></i> Monthly Closings
        </h3>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-dark btn-sm" onClick={() => setMonth(shiftMonth(month, -1))}>◀</button>
          <input
            type="month"
            className="form-control form-control-sm"
            value={month}
            max={maxMonth}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
          />
          <button className="btn btn-outline-dark btn-sm" onClick={() => setMonth(shiftMonth(month, 1))} disabled={month >= maxMonth}>▶</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {t && (
        <div className="row g-3 mb-4">
          {[
            { label: "Days closed", value: t.days_closed },
            { label: "Stock sold value", value: fmt(t.system_sales) },
            { label: "Money on code", value: fmt(t.momo_amount) },
            { label: "Money in cash", value: fmt(t.cash_amount) },
            { label: "Cash received", value: fmt(t.received_amount) },
          ].map((c) => (
            <div key={c.label} className="col-6 col-md-4 col-lg">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">{c.label}</div>
                  <div className="fw-bold fs-5">{c.value}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center py-3">
                <div className="text-muted small">Code+cash vs stock</div>
                <div className="fw-bold fs-5"><Gap value={t.sales_gap} /></div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center py-3">
                <div className="text-muted small">Cash vs received</div>
                <div className="fw-bold fs-5"><Gap value={t.cash_gap} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ minWidth: "1100px" }}>
            <thead className="table-light">
              <tr>
                <th className="text-nowrap px-3 py-3">Date</th>
                <th className="text-end text-nowrap px-3 py-3">Stock value</th>
                <th className="text-end text-nowrap px-3 py-3">On code</th>
                <th className="text-end text-nowrap px-3 py-3">In cash</th>
                <th className="text-end text-nowrap px-3 py-3">Code+cash vs stock</th>
                <th className="text-end text-nowrap px-3 py-3">Received</th>
                <th className="text-end text-nowrap px-3 py-3">Cash vs received</th>
                <th className="text-nowrap px-3 py-3">By</th>
                <th className="px-3 py-3" style={{ minWidth: "300px" }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center text-muted py-4">Loading...</td></tr>
              ) : data.days.length === 0 ? (
                <tr><td colSpan="9" className="text-center text-muted fst-italic py-4">No closings or comments for this month.</td></tr>
              ) : (
                data.days.map((d) => (
                  <tr key={d.date}>
                    <td className="fw-semibold text-nowrap px-3">{d.date}</td>
                    {d.closing ? (
                      <>
                        <td className="text-end text-nowrap px-3">{fmt(d.closing.system_sales)}</td>
                        <td className="text-end text-nowrap px-3">{fmt(d.closing.momo_amount)}</td>
                        <td className="text-end text-nowrap px-3">{fmt(d.closing.cash_amount)}</td>
                        <td className="text-end text-nowrap px-3"><Gap value={d.closing.sales_gap} /></td>
                        <td className="text-end text-nowrap px-3">{d.closing.received_amount === null ? <span className="text-muted">-</span> : fmt(d.closing.received_amount)}</td>
                        <td className="text-end text-nowrap px-3"><Gap value={d.closing.cash_gap} /></td>
                        <td className="text-nowrap px-3">{d.closing.username}</td>
                      </>
                    ) : (
                      <td colSpan="7" className="text-muted fst-italic px-3">No closing submitted</td>
                    )}
                    <td className="small px-3 py-2">
                      {d.comments.length === 0 ? (
                        <span className="text-muted">-</span>
                      ) : (
                        d.comments.map((c, i) => (
                          <div key={i}>
                            <span className="badge bg-primary text-uppercase me-1">{c.department}</span>
                            {c.comment}
                            <span className="text-muted"> — {c.username || "Staff"}</span>
                          </div>
                        ))
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-muted small mt-2 mb-0">
        Red means money is missing, amber means extra. Stock value is bar + kitchen sales for that day. Record received cash from the Home dashboard.
      </p>
    </div>
  );
}

export default MonthlyClosings;
