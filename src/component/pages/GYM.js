import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Gym() {
  const today = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(today);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDaily, setTotalDaily] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  const [formData, setFormData] = useState({
    daily_people: 0,
    monthly_people: 0,
    cash: 0,
    cash_momo: 0,
  });

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

  const API_URL = `${API_BASE_URL}/gym`;

  // ===== FETCH GYM DATA =====
  const fetchEntries = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date } });
      const data = res.data.records || [];
      setEntries(data);
      recalcTotals(data);
    } catch (err) {
      console.error("Error fetching gym data:", err);
      setEntries([]);
      setTotalIncome(0);
      setTotalDaily(0);
      setTotalMonthly(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
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
    let incomeSum = 0;
    let dailySum = 0;
    let monthlySum = 0;

    data.forEach((e) => {
      incomeSum += (Number(e.cash) || 0) + (Number(e.cash_momo) || 0);
      dailySum += Number(e.daily_people) || 0;
      monthlySum += Number(e.monthly_people) || 0;
    });

    setTotalIncome(incomeSum);
    setTotalDaily(dailySum);
    setTotalMonthly(monthlySum);
  };

  // ===== CHANGE DATE =====
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toLocaleDateString("en-CA");
    if (formatted > today) return;
    setSelectedDate(formatted);
  };

  // ===== OPEN MODAL (ADD) =====
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEntry(null);
    setFormData({ daily_people: 0, monthly_people: 0, cash: 0, cash_momo: 0 });
    setShowModal(true);
  };

  // ===== OPEN MODAL (EDIT) =====
  const handleOpenEdit = (entry) => {
    setIsEditing(true);
    setCurrentEntry(entry);
    setFormData({
      daily_people: entry.daily_people,
      monthly_people: entry.monthly_people,
      cash: entry.cash,
      cash_momo: entry.cash_momo,
    });
    setShowModal(true);
  };

  // ===== HANDLE SUBMIT (ADD/EDIT) =====
  const handleSubmit = async () => {
    const { daily_people, monthly_people, cash, cash_momo } = formData;
    const total_people = Number(daily_people) + Number(monthly_people);

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentEntry.id}`, {
          ...currentEntry,
          daily_people: Number(daily_people),
          monthly_people: Number(monthly_people),
          total_people,
          cash: Number(cash),
          cash_momo: Number(cash_momo),
        });
      } else {
        await axios.post(API_URL, {
          date: selectedDate,
          daily_people: Number(daily_people),
          monthly_people: Number(monthly_people),
          total_people,
          cash: Number(cash),
          cash_momo: Number(cash_momo),
        });
      }
      fetchEntries(selectedDate);
      fetchStats();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving entry:", err);
      alert("Failed to save entry");
    }
  };

  // ===== DELETE ENTRY =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchEntries(selectedDate);
      fetchStats();
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry");
    }
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  return (
    <div className="container-fluid mt-4">
      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0B3D2E" }}>
            <div className="card-body text-center">
              <h6>Total Income</h6>
              <h4>RWF {formatNumber(totalIncome)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow border-0" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Total Daily People</h6>
              <h4>{formatNumber(totalDaily)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0E6251" }}>
            <div className="card-body text-center">
              <h6>Total Monthly People</h6>
              <h4>{formatNumber(totalMonthly)}</h4>
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
          <h4 className="fw-bold mb-0">Gym</h4>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>◀</button>
            <strong>{selectedDate}</strong>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => changeDate(1)}
              disabled={selectedDate === today}
            >▶</button>
            <button className="btn btn-success ms-3" onClick={handleOpenAdd}>
              + Add Entry
            </button>
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
                <th>Daily People</th>
                <th>Monthly People</th>
                <th>Total People</th>
                <th>Cash</th>
                <th>Cash Momo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan="7">No gym entries for this date</td></tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{e.daily_people}</td>
                    <td>{e.monthly_people}</td>
                    <td>{e.total_people}</td>
                    <td>RWF {formatNumber(e.cash)}</td>
                    <td>RWF {formatNumber(e.cash_momo)}</td>
                    <td>
                      {/* Only show Edit if not locked OR if user is Admin */}
                      {(!e.is_locked || isAdmin) && (
                        <button className="btn btn-sm btn-info me-2" onClick={() => handleOpenEdit(e)}>Edit</button>
                      )}
                      
                      {/* Show Lock icon if locked for non-admins */}
                      {e.is_locked && !isAdmin && (
                        <span className="badge bg-secondary me-2"><i className="bi bi-lock-fill"></i> Locked</span>
                      )}

                      {/* Only Admin can Delete */}
                      {isAdmin && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD/EDIT MODAL ===== */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit Gym Entry" : "Add Gym Entry"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Daily People</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.daily_people}
                    onChange={(e) => setFormData({ ...formData, daily_people: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Monthly People</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.monthly_people}
                    onChange={(e) => setFormData({ ...formData, monthly_people: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cash</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.cash}
                    onChange={(e) => setFormData({ ...formData, cash: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cash Momo</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.cash_momo}
                    onChange={(e) => setFormData({ ...formData, cash_momo: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {isEditing ? "Update Entry" : "Add Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gym;