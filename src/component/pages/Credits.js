import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../component/utils/api";
import { formatCurrency } from "../../component/utils/formatters";

function Employees() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Totals
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalLoanApp, setTotalLoanApp] = useState(0);
  const [totalRemainingApp, setTotalRemainingApp] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", payment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/credits");
      setEmployees(res.data);
      recalcTotals(res.data);
    } catch (err) {
      console.error(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const recalcTotals = (data) => {
    let paymentSum = 0;
    let loanSum = 0;
    let remainingSum = 0;
    data.forEach((e) => {
      paymentSum += Number(e.payment || 0);
      loanSum += Number(e.total_loan || 0);
      remainingSum += Number(e.total_remaining || 0);
    });
    setTotalPayment(paymentSum);
    setTotalLoanApp(loanSum);
    setTotalRemainingApp(remainingSum);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) return alert("Name is required");

    try {
      setIsSubmitting(true);
      const res = await api.post("/credits", {
        name: newEmployee.name,
        payment: Number(newEmployee.payment) || 0,
      });
      const updatedList = [res.data, ...employees];
      setEmployees(updatedList);
      recalcTotals(updatedList);
      setShowModal(false);
      setNewEmployee({ name: "", payment: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}/loans`);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/credits/${id}`);
      const newEmployees = employees.filter((e) => e.id !== id);
      setEmployees(newEmployees);
      recalcTotals(newEmployees);
    } catch (err) {
      console.error(err);
      alert("Error deleting employee");
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="container mt-4 pb-5">
      {/* ===== HEADER ===== */}
      <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "15px", background: "#fff" }}>
        <div className="card-body d-flex justify-content-between align-items-center p-4">
          <div>
            <h3 className="fw-bold mb-0 text-dark">Employee Management</h3>
            <p className="text-muted mb-0">Manage employee payroll and loan tracking</p>
          </div>
          <button 
            className="btn shadow-sm px-4 py-2"
            onClick={() => setShowModal(true)}
            style={{
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              color: "#fff",
              fontWeight: "600",
              borderRadius: "10px",
              border: "none"
            }}
          >
            <i className="bi bi-person-plus-fill me-2"></i>
            + Add Employee
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "15px", borderLeft: "5px solid #D4AF37" }}>
            <div className="card-body">
              <h6 className="text-uppercase text-muted fw-bold small">Total Monthly Payroll</h6>
              <h3 className="fw-bold mb-0" style={{ color: "#D4AF37" }}>{formatCurrency(totalPayment)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "15px", borderLeft: "5px solid #dc3545" }}>
            <div className="card-body">
              <h6 className="text-uppercase text-muted fw-bold small">Total Outstanding Loans</h6>
              <h3 className="fw-bold mb-0 text-danger">{formatCurrency(totalLoanApp)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100" style={{ borderRadius: "15px", borderLeft: "5px solid #198754" }}>
            <div className="card-body">
              <h6 className="text-uppercase text-muted fw-bold small">Total Net Payable</h6>
              <h3 className="fw-bold mb-0 text-success">{formatCurrency(totalPayment - totalLoanApp)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ===== EMPLOYEES TABLE ===== */}
      <div className="card shadow-sm border-0 rounded-4" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-dark">
              <tr>
                <th className="ps-4 py-3 text-uppercase small fw-bold">Employee</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Monthly Salary</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Active Loan</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Net Balance</th>
                <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No employees found. Click "+ Add Employee" to start.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e.id} style={{ transition: "all 0.2s ease" }}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                          style={{ width: "40px", height: "40px", background: "#e9ecef", color: "#495057", fontWeight: "bold" }}
                        >
                          {e.name.charAt(0).toUpperCase()}
                        </div>
                        <span 
                          className="fw-bold text-primary" 
                          style={{ cursor: "pointer", fontSize: "1.05rem" }}
                          onClick={() => handleViewEmployee(e.id)}
                        >
                          {e.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-center fw-semibold text-dark">{formatCurrency(e.payment)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${e.total_loan > 0 ? "bg-danger-subtle text-danger" : "bg-light text-muted"}`} style={{ fontSize: "0.9rem", padding: "8px 12px" }}>
                        {formatCurrency(e.total_loan)}
                      </span>
                    </td>
                    <td className="text-center fw-bold">
                      <span className={(e.payment - e.total_loan) < 0 ? "text-danger" : "text-success"}>
                        {formatCurrency(e.payment - e.total_loan)}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2 rounded-3 px-3"
                        onClick={() => handleViewEmployee(e.id)}
                      >
                        Details
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger rounded-3" 
                        onClick={() => handleDeleteEmployee(e.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD EMPLOYEE MODAL ===== */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                <div className="modal-header border-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold">Add New Employee</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleAddEmployee}>
                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control rounded-3 py-2" 
                        placeholder="Enter employee name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Monthly Salary (RWF)</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3 py-2" 
                        placeholder="e.g. 50000"
                        value={newEmployee.payment}
                        onChange={(e) => setNewEmployee({ ...newEmployee, payment: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pb-4 px-4">
                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-3 px-4"
                      disabled={isSubmitting}
                      style={{ background: "#2a5298", border: "none" }}
                    >
                      {isSubmitting ? "Saving..." : "Save Employee"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default Employees;