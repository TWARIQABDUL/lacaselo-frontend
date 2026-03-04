import React, { useEffect, useState } from "react";
import axios from "axios";

function Credits() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [paymentInput, setPaymentInput] = useState("");

  const API_URL = "https://backend-vitq.onrender.com/api/credits";

  // ===== Fetch all employees =====
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== Add new employee =====
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!nameInput.trim()) return alert("Name is required");
    if (paymentInput === "" || isNaN(Number(paymentInput))) return alert("Payment must be a number");

    try {
      const res = await axios.post(API_URL, {
        name: nameInput.trim(),
        payment: Number(paymentInput),
      });

      // Add the new employee to state
      setEmployees([res.data, ...employees]);
      setNameInput("");
      setPaymentInput("");
    } catch (err) {
      console.error("Error adding employee:", err);
      alert("Error adding employee");
    }
  };

  // ===== Format numbers =====
  const formatNumber = (value) => Number(value || 0).toLocaleString();

  // ===== Load employees on page load =====
  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="container mt-4">
      {/* ===== Header ===== */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Employees</h4>
          <form className="d-flex" onSubmit={handleAddEmployee}>
            <input
              type="text"
              placeholder="Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="form-control me-2"
            />
            <input
              type="number"
              placeholder="Payment"
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              className="form-control me-2"
            />
            <button type="submit" className="btn btn-success">
              + Add
            </button>
          </form>
        </div>
      </div>

      {/* ===== Employees Table ===== */}
      <div className="card shadow">
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Payment (RWF)</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="4">No employees found</td>
                </tr>
              ) : (
                employees.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{e.name}</td>
                    <td>{formatNumber(e.payment)}</td>
                    <td>{new Date(e.created_at).toLocaleString()}</td>
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

export default Credits;