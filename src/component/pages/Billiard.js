import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Billiard() {
  const today = new Date().toISOString().split("T")[0];
  const [billiards, setBilliards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalToken, setTotalToken] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [totalMomo, setTotalMomo] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });

  // Get user role from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const API_URL = `${API_BASE_URL}/billiard`;

  // ===== FETCH DATA =====
  const fetchBilliards = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date }, ...authHeader });
      const data = res.data || [];
      setBilliards(data);
      recalcTotals(data);
    } catch (err) {
      console.error("Error fetching billiard data:", err);
      setBilliards([]);
      setTotalToken(0);
      setTotalCash(0);
      setTotalMomo(0);
      setTotalEarned(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilliards(selectedDate);
    fetchStats();
  }, [selectedDate]);

  // ===== FETCH STATS =====
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats/timePeriods`, authHeader);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // ===== RECALCULATE TOTALS =====
  const recalcTotals = (data) => {
    let tokenSum = 0;
    let cashSum = 0;
    let momoSum = 0;
    let earnedSum = 0;

    data.forEach((b) => {
      tokenSum += Number(b.token || 0);
      cashSum += Number(b.cash || 0);
      momoSum += Number(b.cash_momo || 0);
      earnedSum += Number(b.total || 0);
    });

    setTotalToken(tokenSum);
    setTotalCash(cashSum);
    setTotalMomo(momoSum);
    setTotalEarned(earnedSum);
  };

  // ===== ADD NEW RECORD =====
  const handleAdd = async () => {
    const tokenVal = Number(prompt("Number of tokens:")) || 0;
    const cash = Number(prompt("Cash amount:")) || 0;
    const cash_momo = Number(prompt("Momo amount:")) || 0;

    try {
      const res = await axios.post(API_URL, { date: selectedDate, token: tokenVal, cash, cash_momo }, authHeader);
      const newData = [res.data, ...billiards];
      setBilliards(newData);
      recalcTotals(newData);
    } catch (err) {
      console.error("Error adding billiard record:", err);
    }
  };
   

  // ===== EDIT FIELDS =====
  const handleChange = (b, field, value) => {
    if (b.is_locked && !isAdmin) {
      alert("This record is locked and cannot be edited by staff.");
      return;
    }
    const numValue = Number(value);
    const updatedData = billiards.map((item) => (item.id === b.id ? { ...item, [field]: numValue } : item));
    setBilliards(updatedData);
    recalcTotals(updatedData);

    axios.put(`${API_URL}/${b.id}`, { [field]: numValue }, authHeader).catch((err) => console.error(err));
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  // ===== DATE CHANGE =====
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
    fetchBilliards(formatted);
  };

  return (
    <div className="container-fluid mt-4">

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0B3D2E" }}>
            <div className="card-body text-center">
              <h6>Total Tokens</h6>
              <h4>{formatNumber(totalToken)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Total Cash</h6>
              <h4>RWF {formatNumber(totalCash)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0E6251" }}>
            <div className="card-body text-center">
              <h6>Total Momo</h6>
              <h4>RWF {formatNumber(totalMomo)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#C0392B" }}>
            <div className="card-body text-center">
              <h6>Total Earned</h6>
              <h4>RWF {formatNumber(totalEarned)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TIME PERIOD STATS ===== */}
      <div className="row g-4 mb-4">
        {[
          { label: "Today", value: stats.day },
          { label: "This Week", value: stats.week },
          { label: "This Month", value: stats.month },
          { label: "This Year", value: stats.year }
        ].map((stat, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", background: "#FFFFFF" }}>
              <div className="card-body text-center">
                <p style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{stat.label}</p>
                <h3 style={{ color: "#1F2937", fontWeight: "700" }}>
                  RWF {formatNumber(stat.value)}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== HEADER ===== */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Billiard</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>◀</button>
            <strong>{selectedDate}</strong>
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(1)} disabled={selectedDate === today}>▶</button>
            <button className="btn btn-success ms-3" onClick={handleAdd}>+ Add Record</button>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card shadow">
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Token</th>
                <th>Cash</th>
                <th>Momo</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading...</td></tr>
              ) : billiards.length === 0 ? (
                <tr><td colSpan="5">No records found</td></tr>
              ) : (
                billiards.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={b.token}
                        disabled={b.is_locked && !isAdmin}
                        onChange={(e) => handleChange(b, "token", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={b.cash}
                        disabled={b.is_locked && !isAdmin}
                        onChange={(e) => handleChange(b, "cash", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={b.cash_momo}
                        disabled={b.is_locked && !isAdmin}
                        onChange={(e) => handleChange(b, "cash_momo", e.target.value)}
                      />
                    </td>
                    <td>{formatNumber(b.total)} {b.is_locked && !isAdmin && <i className="bi bi-lock-fill text-muted ms-1" title="Locked"></i>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Billiard;