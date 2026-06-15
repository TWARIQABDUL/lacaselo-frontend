import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useAuth } from "../../context/Authcontext";

function Billiard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const today = new Date().toISOString().split("T")[0];
  const [billiards, setBilliards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const isPastDate = selectedDate < today;

  const [showModal, setShowModal] = useState(false);
  const [newToken, setNewToken] = useState("");

  const [tokenPrice, setTokenPrice] = useState(500);

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

  const API_URL = `${API_BASE_URL}/billiard`;

  // ===== FETCH DATA =====
  const fetchBilliards = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date } });
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

  const fetchTokenPrice = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`, { params: { key: "token_price" } });
      if (res.data && res.data.setting_value) {
        setTokenPrice(Number(res.data.setting_value));
      }
    } catch (err) {
      console.error("Failed to fetch token price:", err);
    }
  };

  useEffect(() => {
    fetchTokenPrice();
  }, []);

  useEffect(() => {
    fetchBilliards(selectedDate);
    fetchStats();
  }, [selectedDate, tokenPrice]); // re-fetch if tokenPrice changes

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
  const openModal = () => {
    setNewToken("");
    setShowModal(true);
  };

  const submitAddRecord = async () => {
    const token = Number(newToken) || 0;
    const cash = 0;
    const cash_momo = 0;

    try {
      const res = await axios.post(API_URL, { date: selectedDate, token, cash, cash_momo });
      const newData = [res.data, ...billiards];
      setBilliards(newData);
      recalcTotals(newData);
      fetchStats();
      setShowModal(false);
    } catch (err) {
      console.error("Error adding billiard record:", err);
    }
  };

  // ===== CHANGE TOKEN PRICE =====
  const handleChangeTokenPrice = async () => {
    const newPrice = prompt(`Enter new Token Price (current is ${tokenPrice}):`);
    if (!newPrice || isNaN(newPrice)) return;

    try {
      await axios.put(`${API_BASE_URL}/settings`, { 
        setting_key: "token_price", 
        setting_value: newPrice 
      });
      setTokenPrice(Number(newPrice));
    } catch (err) {
      console.error("Error updating token price:", err);
      alert("Failed to update token price.");
    }
  };

  // ===== EDIT FIELDS =====
  const handleChange = (id, field, value) => {
    if (!isAdmin && isPastDate) {
      alert("Past dates cannot be edited.");
      return;
    }
    const numValue = Number(value);
    const updatedData = billiards.map((b) => {
      if (b.id === id) {
        const updated = { ...b, [field]: numValue };
        updated.total = (Number(updated.token || 0) * tokenPrice) + Number(updated.cash || 0) + Number(updated.cash_momo || 0);
        return updated;
      }
      return b;
    });
    setBilliards(updatedData);
    recalcTotals(updatedData);

    axios.put(`${API_URL}/${id}`, { [field]: numValue }).then(() => {
        fetchStats();
    }).catch((err) => console.error(err));
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  // ===== DATE CHANGE =====
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
    // Note: useEffect handles fetching data
  };

  return (
    <div className="container-fluid mt-4">

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4 justify-content-center">
        <div className="col-md-4">
          <div className="card text-white shadow border-0" style={{ backgroundColor: "#0B3D2E" }}>
            <div className="card-body text-center">
              <h6>Total Tokens</h6>
              <h4>{formatNumber(totalToken)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
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
          <h4 className="fw-bold mb-0">
            Billiard 
            <small className="text-muted ms-2" style={{fontSize: "0.5em"}}>(Price: RWF {tokenPrice}/token)</small>
          </h4>
          <div className="d-flex gap-2 align-items-center">
            {isAdmin && (
              <button className="btn btn-warning btn-sm me-2" onClick={handleChangeTokenPrice}>
                Set Token Price
              </button>
            )}
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>◀</button>
            <strong>{selectedDate}</strong>
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(1)} disabled={selectedDate === today}>▶</button>
            <button className="btn btn-success ms-3" onClick={openModal}>+ Add Record</button>
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
                <th>Tokens</th>
                <th>Total Earned</th>
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
                      {(!isAdmin && isPastDate) ? (
                        <span className="fw-semibold">{b.token}</span>
                      ) : (
                        <input
                          type="number"
                          className="form-control form-control-sm mx-auto"
                          style={{ maxWidth: "150px", textAlign: "center" }}
                          value={b.token}
                          onChange={(e) => handleChange(b.id, "token", e.target.value)}
                        />
                      )}
                    </td>
                    <td className="align-middle fw-bold">{formatNumber(b.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD RECORD MODAL ===== */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">Add Billiard Record</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted">Number of tokens</label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    value={newToken} 
                    onChange={(e) => setNewToken(e.target.value)} 
                    placeholder="Enter total tokens"
                    autoFocus
                  />
                  <div className="mt-2 text-success small">
                    Estimated Total: RWF {formatNumber((Number(newToken) || 0) * tokenPrice)}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4 pe-4">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success px-4 fw-bold" onClick={submitAddRecord}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Billiard;