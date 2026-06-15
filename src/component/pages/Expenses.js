import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Expenses() {
  const today = new Date().toISOString().split("T")[0];
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);

  // Get user role from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = isSuperAdmin || user?.role === "ADMIN";
  const isPastDate = selectedDate < today;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", category: "unprofitable" });

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBar, setTotalBar] = useState(0);
  const [totalKitchen, setTotalKitchen] = useState(0);
  const [totalGuesthouse, setTotalGuesthouse] = useState(0);
  const [totalBilliard, setTotalBilliard] = useState(0);
  const [totalUnprofitable, setTotalUnprofitable] = useState(0);

  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });

  const API_URL = `${API_BASE_URL}/expenses`;

  // ===== FETCH DATA =====
  const fetchExpenses = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date } });
      const data = res.data?.records || [];
      setExpenses(data);
      recalcTotals(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
      setTotalExpenses(0);
      setTotalBar(0);
      setTotalKitchen(0);
      setTotalGuesthouse(0);
      setTotalBilliard(0);
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
      const res = await axios.get(`${API_URL}/stats/timePeriods`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // ===== RECALCULATE TOTALS =====
  const recalcTotals = (data) => {
    let total = 0, bar = 0, kitchen = 0, guesthouse = 0, billiard = 0, unprofitable = 0;
    data.forEach((e) => {
      const amount = Number(e.amount || 0);
      total += amount;
      if (e.category === "bar") bar += amount;
      else if (e.category === "kitchen") kitchen += amount;
      else if (e.category === "guesthouse") guesthouse += amount;
      else if (e.category === "billiard") billiard += amount;
      else if (e.category === "unprofitable") unprofitable += amount;
    });
    setTotalExpenses(total);
    setTotalBar(bar);
    setTotalKitchen(kitchen);
    setTotalGuesthouse(guesthouse);
    setTotalBilliard(billiard);
    setTotalUnprofitable(unprofitable);
  };

  // ===== ADD NEW EXPENSE =====
  const openModal = () => {
    setNewExpense({ name: "", amount: "", category: "unprofitable" });
    setShowModal(true);
  };

  const submitAddExpense = async () => {
    if (!newExpense.name) return alert("Expense name is required");

    const amount = Number(newExpense.amount) || 0;

    try {
      const res = await axios.post(API_URL, { 
        date: selectedDate, 
        expense_name: newExpense.name, 
        amount, 
        category: newExpense.category, 
        is_profit: 0 
      });
      const newData = [res.data, ...expenses];
      setExpenses(newData);
      recalcTotals(newData);
      setShowModal(false);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  // ===== EDIT FIELD =====
  const handleChange = (id, field, value) => {
    if (!isAdmin && isPastDate) {
      alert("Past dates cannot be edited.");
      return;
    }

    const updatedData = expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setExpenses(updatedData);
    recalcTotals(updatedData);

    axios.put(`${API_URL}/${id}`, { [field]: value }).catch((err) => console.error(err));
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
        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0B3D2E" }}>
            <div className="card-body text-center">
              <h6>Total Expenses</h6>
              <h4>RWF {formatNumber(totalExpenses)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Bar Expenses</h6>
              <h4>RWF {formatNumber(totalBar)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0E6251" }}>
            <div className="card-body text-center">
              <h6>Kitchen Expenses</h6>
              <h4>RWF {formatNumber(totalKitchen)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#4A235A" }}>
            <div className="card-body text-center">
              <h6>Guesthouse Expenses</h6>
              <h4>RWF {formatNumber(totalGuesthouse)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#154360" }}>
            <div className="card-body text-center">
              <h6>Billiard Expenses</h6>
              <h4>RWF {formatNumber(totalBilliard)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
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
            <button className="btn btn-success ms-3" onClick={openModal}>+ Add Expense</button>
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
                      {(!isAdmin && isPastDate) ? (
                        <span className="fw-semibold">{e.expense_name}</span>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={e.expense_name}
                          onChange={(ev) => handleChange(e.id, "expense_name", ev.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      {(!isAdmin && isPastDate) ? (
                        <span className="fw-semibold">{e.amount}</span>
                      ) : (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={e.amount}
                          onChange={(ev) => handleChange(e.id, "amount", ev.target.value)}
                        />
                      )}
                    </td>
                    <td>{e.category}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD EXPENSE MODAL ===== */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">Add New Expense</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Expense Name</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    value={newExpense.name} 
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} 
                    placeholder="e.g. Buying water"
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Amount (RWF)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    value={newExpense.amount} 
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} 
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Category</label>
                  <select 
                    className="form-select form-select-lg"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  >
                    <option value="unprofitable">Unprofitable</option>
                    <option value="bar">Bar</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="billiard">Billiard</option>
                  </select>
                </div>

              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success px-4 fw-bold" onClick={submitAddExpense}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Expenses;