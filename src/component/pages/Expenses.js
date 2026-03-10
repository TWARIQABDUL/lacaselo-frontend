import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBar, setTotalBar] = useState(0);
  const [totalKitchen, setTotalKitchen] = useState(0);
  const [totalUnprofitable, setTotalUnprofitable] = useState(0);

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

  const API_URL = `${API_BASE_URL}/expenses`;

  // ===== FETCH DATA =====
  const fetchExpenses = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date }, ...authHeader });
      const data = res.data || [];
      setExpenses(data);
      recalcTotals(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
      setTotalExpenses(0);
      setTotalBar(0);
      setTotalKitchen(0);
      setTotalUnprofitable(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedDate);
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
    let total = 0, bar = 0, kitchen = 0, unprofitable = 0;
    data.forEach((e) => {
      const amount = Number(e.amount || 0);
      total += amount;
      if (e.category === "bar") bar += amount;
      else if (e.category === "kitchen") kitchen += amount;
      else if (e.category === "unprofitable") unprofitable += amount;
    });
    setTotalExpenses(total);
    setTotalBar(bar);
    setTotalKitchen(kitchen);
    setTotalUnprofitable(unprofitable);
  };

  // ===== ADD NEW EXPENSE =====
  const handleAdd = async () => {
    const name = prompt("Expense Name:");
    if (!name) return alert("Expense name is required");

    const amount = Number(prompt("Amount:")) || 0;
    const category = prompt("Category (bar/kitchen/unprofitable):") || "unprofitable";

    try {
      const res = await axios.post(API_URL, { date: selectedDate, expense_name: name, amount, category, is_profit: 0 }, authHeader);
      const newData = [res.data, ...expenses];
      setExpenses(newData);
      recalcTotals(newData);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };
   

  // ===== EDIT FIELD =====
  const handleChange = (item, field, value) => {
    if (item.is_locked && !isAdmin) {
      alert("This record is locked and cannot be edited by staff.");
      return;
    }
    const updatedData = expenses.map((e) => (e.id === item.id ? { ...e, [field]: value } : e));
    setExpenses(updatedData);
    recalcTotals(updatedData);

    axios.put(`${API_URL}/${item.id}`, { [field]: value }, authHeader).catch((err) => console.error(err));
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  // ===== DATE CHANGE =====
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
    fetchExpenses(formatted);
  };

  return (
    <div className="container-fluid mt-4">

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0B3D2E" }}>
            <div className="card-body text-center">
              <h6>Total Expenses</h6>
              <h4>RWF {formatNumber(totalExpenses)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Bar Expenses</h6>
              <h4>RWF {formatNumber(totalBar)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0E6251" }}>
            <div className="card-body text-center">
              <h6>Kitchen Expenses</h6>
              <h4>RWF {formatNumber(totalKitchen)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#C0392B" }}>
            <div className="card-body text-center">
              <h6>Unprofitable</h6>
              <h4>RWF {formatNumber(totalUnprofitable)}</h4>
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
          <h4 className="fw-bold mb-0">Expenses</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>◀</button>
            <strong>{selectedDate}</strong>
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(1)} disabled={selectedDate === today}>▶</button>
            <button className="btn btn-success ms-3" onClick={handleAdd}>+ Add Expense</button>
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
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4">Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4">No expenses for this date</td></tr>
              ) : (
                expenses.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={e.expense_name}
                        disabled={e.is_locked && !isAdmin}
                        onChange={(ev) => handleChange(e, "expense_name", ev.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={e.amount}
                        disabled={e.is_locked && !isAdmin}
                        onChange={(ev) => handleChange(e, "amount", ev.target.value)}
                      />
                    </td>
                    <td>{e.category} {e.is_locked && !isAdmin && <i className="bi bi-lock-fill text-muted ms-1" title="Locked"></i>}</td>
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

export default Expenses;