import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function Employees() {
  const navigate = useNavigate();
  const location = useLocation(); // detect route changes
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalPayment, setTotalPayment] = useState(0); 
  const [totalLoan, setTotalLoan] = useState(0);       
  const [totalRemaining, setTotalRemaining] = useState(0); 

  const API_URL = "https://backend-vitq.onrender.com/api/employees";

  // ===== FETCH EMPLOYEES =====
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setEmployees(res.data);
      recalcTotals(res.data);
    } catch (err) {
      console.error(err);
      setEmployees([]);
      setTotalPayment(0);
      setTotalLoan(0);
      setTotalRemaining(0);
    } finally {
      setLoading(false);
    }
  };

  // ===== RECALCULATE TOTALS =====
  const recalcTotals = (data) => {
    let paymentSum = 0;
    let loanSum = 0;
    let remainingSum = 0;

    data.forEach((e) => {
      paymentSum += Number(e.monthly_salary || 0);
      loanSum += Number(e.total_loan || 0);
      remainingSum += Number(e.total_remaining || 0);
    });

    setTotalPayment(paymentSum);
    setTotalLoan(loanSum);
    setTotalRemaining(remainingSum);
  };

  // ===== ADD NEW EMPLOYEE =====
  const handleAddEmployee = async () => {
    const name = prompt("Employee Name:");
    const salary = Number(prompt("Monthly Payment:")) || 0;
    if (!name || !name.trim()) return alert("Name is required");

    try {
      const res = await axios.post(API_URL, { name, salary });
      const newEmployees = [res.data, ...employees];
      setEmployees(newEmployees);
      recalcTotals(newEmployees);
    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    }
  };

  // ===== NAVIGATE TO LOAN PAGE =====
  const handleViewLoans = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  // ===== AUTO REFRESH ON RETURN =====
  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // refresh every time route changes

  return (
    <div className="container mt-4">

      {/* ===== HEADER ===== */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Employees</h4>
          <button className="btn btn-success" onClick={handleAddEmployee}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow border-0" style={{ backgroundColor: "#D4AF37", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Total Payment</h6>
              <h4>RWF {formatNumber(totalPayment)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0" style={{ backgroundColor: "#F28B82", color: "#000" }}>
            <div className="card-body text-center">
              <h6>Total Loan</h6>
              <h4>RWF {formatNumber(totalLoan)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow border-0" style={{ backgroundColor: "#0E6251", color: "#fff" }}>
            <div className="card-body text-center">
              <h6>Total Remaining</h6>
              <h4>RWF {formatNumber(totalRemaining)}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EMPLOYEES TABLE ===== */}
      <div className="card shadow">
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center mb-0">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Monthly Payment</th>
                <th>Total Loan</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5">No employees found</td>
                </tr>
              ) : (
                employees.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>
                      <span
                        style={{ color: "#0d6efd", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => handleViewLoans(e.id)}
                      >
                        {e.name}
                      </span>
                    </td>
                    <td>RWF {formatNumber(e.monthly_salary)}</td>
                    <td>RWF {formatNumber(e.total_loan)}</td>
                    <td className={e.total_remaining >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                      RWF {formatNumber(e.total_remaining)}
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

export default Employees;