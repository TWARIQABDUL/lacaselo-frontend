import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

const fmt = (n) => Number(n || 0).toLocaleString();

const DEPARTMENTS = [
  { key: "bar", label: "Bar" },
  { key: "kitchen", label: "Kitchen" },
  { key: "billiard", label: "Billiard" },
  { key: "gym", label: "Gym" },
  { key: "guesthouse", label: "Guest House" },
];

const currentMonth = () => new Date().toISOString().slice(0, 7);

const shiftMonth = (month, delta) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};

const Net = ({ value }) => (
  <span className={value < 0 ? "text-danger fw-bold" : "text-success fw-bold"}>{fmt(value)}</span>
);

const th = "text-end text-nowrap px-3 py-3";
const td = "text-end text-nowrap px-3";

function Profit() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxMonth = currentMonth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE_URL}/profit/month`, {
          params: { month },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load monthly profit", err);
        setError(err.response?.data?.message || "Failed to load monthly profit");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  const t = data?.totals;

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-graph-up-arrow text-success me-2"></i> Monthly Profit
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
            { label: "Sales", value: fmt(t.sales) },
            { label: "Gross profit", value: fmt(t.profit) },
            { label: "Expenses", value: fmt(t.expenses) },
          ].map((c) => (
            <div key={c.label} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted small">{c.label}</div>
                  <div className="fw-bold fs-5">{c.value}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center py-3">
                <div className="text-muted small">Net profit</div>
                <div className="fs-5"><Net value={t.net} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h5 className="fw-bold mb-2">By department</h5>
      <div className="card border-0 shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ minWidth: "600px" }}>
            <thead className="table-light">
              <tr>
                <th className="text-nowrap px-3 py-3">Department</th>
                <th className={th}>Sales</th>
                <th className={th}>Profit</th>
                <th className={th}>Expenses</th>
                <th className={th}>Net</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">Loading...</td></tr>
              ) : !data ? (
                <tr><td colSpan="5" className="text-center text-muted fst-italic py-4">No data.</td></tr>
              ) : (
                <>
                  {DEPARTMENTS.map((d) => {
                    const x = data.departments[d.key];
                    return (
                      <tr key={d.key}>
                        <td className="fw-semibold px-3">{d.label}</td>
                        <td className={td}>{fmt(x.sales)}</td>
                        <td className={td}>{fmt(x.profit)}</td>
                        <td className={td}>{fmt(x.expenses)}</td>
                        <td className={td}><Net value={x.net} /></td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="fw-semibold px-3">General expenses</td>
                    <td className={td}>-</td>
                    <td className={td}>-</td>
                    <td className={td}>{fmt(t.general_expenses)}</td>
                    <td className={td}><Net value={-t.general_expenses} /></td>
                  </tr>
                  <tr className="table-light fw-bold">
                    <td className="px-3">Total</td>
                    <td className={td}>{fmt(t.sales)}</td>
                    <td className={td}>{fmt(t.profit)}</td>
                    <td className={td}>{fmt(t.expenses)}</td>
                    <td className={td}><Net value={t.net} /></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h5 className="fw-bold mb-2">By day (profit)</h5>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px" }}>
            <thead className="table-light">
              <tr>
                <th className="text-nowrap px-3 py-3">Date</th>
                {DEPARTMENTS.map((d) => (
                  <th key={d.key} className={th}>{d.label}</th>
                ))}
                <th className={th}>Expenses</th>
                <th className={th}>Net</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center text-muted py-4">Loading...</td></tr>
              ) : !data || data.days.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted fst-italic py-4">No records for this month.</td></tr>
              ) : (
                data.days.map((d) => (
                  <tr key={d.date}>
                    <td className="fw-semibold text-nowrap px-3">{d.date}</td>
                    {DEPARTMENTS.map((x) => (
                      <td key={x.key} className={td}>{fmt(d[x.key].profit)}</td>
                    ))}
                    <td className={td}>{fmt(d.expenses)}</td>
                    <td className={td}><Net value={d.net} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-muted small mt-2 mb-0">
        Bar and kitchen profit = sold x (selling price - buying price). Billiard, gym and guest house have no buying cost, so their income counts as profit. Expenses are matched to a department by category; the rest is general.
      </p>
    </div>
  );
}

export default Profit;
