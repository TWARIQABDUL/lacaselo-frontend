import React, { useEffect, useState } from "react";
import axios from "axios";

function Gym() {
  // ====== Local date for correct timezone ======
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(today);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDaily, setTotalDaily] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  const API_URL = "https://backend-vitq.onrender.com/api/gym";

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
  }, [selectedDate]);

  // ===== RECALCULATE TOTALS =====
  const recalcTotals = (data) => {
    let incomeSum = 0;
    let dailySum = 0;
    let monthlySum = 0;

    data.forEach((e) => {
      const daily = Number(e.daily_people || 0);
      const monthly = Number(e.monthly_people || 0);
      const cash = Number(e.cash || 0);
      const cash_momo = Number(e.cash_momo || 0);

      incomeSum += cash + cash_momo;
      dailySum += daily;
      monthlySum += monthly;
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

  // ===== ADD NEW ENTRY =====
  const handleAdd = async () => {
    const date = prompt("Date (YYYY-MM-DD):") || selectedDate;
    const daily_people = Number(prompt("Daily People:")) || 0;
    const monthly_people = Number(prompt("Monthly People:")) || 0;
    const cash = Number(prompt("Cash:")) || 0;
    const cash_momo = Number(prompt("Cash Momo:")) || 0;
    const total_people = daily_people + monthly_people;

    try {
      await axios.post(API_URL, {
        date,
        daily_people,
        monthly_people,
        total_people,
        cash,
        cash_momo,
      });
      fetchEntries(selectedDate);
    } catch (err) {
      console.error("Error adding entry:", err);
    }
  };

  // ===== HANDLE EDIT =====
  const handleChange = (id, field, value) => {
    const numValue = Number(value || 0);

    const updatedEntries = entries.map((e) => {
      if (e.id === id) {
        const updated = { ...e, [field]: numValue };
        if (field === "daily_people" || field === "monthly_people") {
          updated.total_people =
            field === "daily_people"
              ? numValue + e.monthly_people
              : e.daily_people + numValue;
        }
        return updated;
      }
      return e;
    });

    setEntries(updatedEntries);
    recalcTotals(updatedEntries);

    axios
      .put(`${API_URL}/${id}`, updatedEntries.find((e) => e.id === id))
      .catch((err) => console.error(`Error updating ${field}:`, err));
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

      {/* ===== HEADER ===== */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Gym</h4>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>
              ◀
            </button>
            <strong>{selectedDate}</strong>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => changeDate(1)}
              disabled={selectedDate === today}
            >
              ▶
            </button>
            <button className="btn btn-success ms-3" onClick={handleAdd}>
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
                <th>Date</th>
                <th>Daily People</th>
                <th>Monthly People</th>
                <th>Total People</th>
                <th>Cash</th>
                <th>Cash Momo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="7">No gym entries for this date</td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{e.date}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={e.daily_people}
                        onChange={(ev) => handleChange(e.id, "daily_people", ev.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={e.monthly_people}
                        onChange={(ev) => handleChange(e.id, "monthly_people", ev.target.value)}
                      />
                    </td>
                    <td>{e.total_people}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={e.cash}
                        onChange={(ev) => handleChange(e.id, "cash", ev.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={e.cash_momo}
                        onChange={(ev) => handleChange(e.id, "cash_momo", ev.target.value)}
                      />
                    </td>
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

export default Gym;