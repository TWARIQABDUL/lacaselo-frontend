import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../component/utils/api";
import { useAuth } from "../../context/Authcontext";
import { formatCurrency, formatDate } from "../../component/utils/formatters";

function EmployeeLoans() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loans, setLoans] = useState([]);
  const [employee, setEmployee] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalLoan, setTotalLoan] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  // Modal State
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [newLoan, setNewLoan] = useState({ amount: "", reason: "", loan_date: new Date().toISOString().split("T")[0] });
  const [payment, setPayment] = useState({ amount: "", loanId: null, currentRemaining: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RBAC: Check if user can add loans
  const canAddLoan = ["BAR_MAN", "CHIEF_KITCHEN", "SUPER_ADMIN"].includes(user?.role);
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [employeeRes, loansRes] = await Promise.all([
        api.get("/credits"),
        api.get(`/credits/${id}/loans`),
      ]);

      const emp = employeeRes.data.find((e) => e.id === Number(id)) || {};
      setEmployee(emp);
      setLoans(loansRes.data);
      recalcTotals(loansRes.data);
    } catch (err) {
      console.error(err);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [id]);

  const recalcTotals = (data) => {
    let loanSum = 0;
    let remainingSum = 0;
    data.forEach((l) => {
      loanSum += Number(l.amount || 0);
      remainingSum += Number(l.remaining || 0);
    });
    setTotalLoan(loanSum);
    setTotalRemaining(remainingSum);
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    if (!newLoan.amount || !newLoan.loan_date) return alert("Amount and Date are required");

    try {
      setIsSubmitting(true);
      const res = await api.post(`/credits/${id}/loans`, {
        amount: Number(newLoan.amount),
        reason: newLoan.reason,
        loan_date: newLoan.loan_date,
        given_by: user?.username || "unknown"
      });
      const updatedLoans = [res.data, ...loans];
      setLoans(updatedLoans);
      recalcTotals(updatedLoans);
      setShowLoanModal(false);
      setNewLoan({ amount: "", reason: "", loan_date: new Date().toISOString().split("T")[0] });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error adding loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm("Are you sure you want to delete this loan?")) return;
    try {
      await api.delete(`/credits/${id}/loans/${loanId}`);
      const newLoans = loans.filter((l) => l.id !== loanId);
      setLoans(newLoans);
      recalcTotals(newLoans);
    } catch (err) {
      console.error(err);
      alert("Error deleting loan");
    }
  };

  const handlePayLoan = async (e) => {
    e.preventDefault();
    const amount = Number(payment.amount);
    if (!amount || amount <= 0) return alert("Invalid amount.");
    if (amount > payment.currentRemaining) return alert("Payment exceeds the remaining balance.");

    try {
      setIsSubmitting(true);
      const res = await api.put(`/credits/${id}/loans/${payment.loanId}/pay`, {
        paymentAmount: amount
      });
      const updatedLoans = loans.map((l) => l.id === payment.loanId ? res.data : l);
      setLoans(updatedLoans);
      recalcTotals(updatedLoans);
      setShowPayModal(false);
      setPayment({ amount: "", loanId: null, currentRemaining: 0 });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error processing payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* ===== HEADER ===== */}
      <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "15px" }}>
        <div className="card-body d-flex justify-content-between align-items-center p-4">
          <div>
            <h3 className="fw-bold mb-0">
              <span className="text-muted fw-normal">Loans for</span> {employee.name || "Employee"}
            </h3>
            <p className="text-muted mb-0">Detailed loan history and repayment status</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light shadow-sm" onClick={() => navigate("/credits")}>
              ← Back
            </button>
            {canAddLoan && (
              <button 
                className="btn shadow-sm px-4" 
                onClick={() => setShowLoanModal(true)}
                style={{ background: "#198754", color: "#fff", fontWeight: "600", borderRadius: "10px", border: "none" }}
              >
                + Add Loan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0" style={{ borderRadius: "15px", borderLeft: "5px solid #dc3545" }}>
            <div className="card-body py-4">
              <h6 className="text-uppercase text-muted fw-bold small">Total Amount Borrowed</h6>
              <h3 className="fw-bold mb-0 text-danger">{formatCurrency(totalLoan)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0" style={{ borderRadius: "15px", borderLeft: "5px solid #198754" }}>
            <div className="card-body py-4">
              <h6 className="text-uppercase text-muted fw-bold small">Current Remaining Balance</h6>
              <h3 className="fw-bold mb-0 text-success">{formatCurrency(totalRemaining)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ===== LOANS TABLE ===== */}
      <div className="card shadow-sm border-0 rounded-4" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-dark">
              <tr>
                <th className="ps-4 py-3 text-uppercase small fw-bold">Date</th>
                <th className="py-3 text-uppercase small fw-bold">Reason</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Amount</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Remaining</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Given By</th>
                <th className="pe-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No loans recorded for this employee.</td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id}>
                    <td className="ps-4 fw-medium">{formatDate(l.loan_date)}</td>
                    <td>{l.reason || <span className="text-muted small italic">No reason provided</span>}</td>
                    <td className="text-center fw-semibold">{formatCurrency(l.amount)}</td>
                    <td className="text-center">
                      <span className={`fw-bold ${l.remaining > 0 ? "text-danger" : "text-success"}`}>
                        {formatCurrency(l.remaining)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: "8px" }}>
                        <i className="bi bi-person-fill me-1 text-muted"></i>
                        {l.given_by || "System"}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button 
                        className="btn btn-sm btn-outline-success me-2 rounded-3" 
                        onClick={() => {
                          setPayment({ amount: "", loanId: l.id, currentRemaining: l.remaining });
                          setShowPayModal(true);
                        }}
                        disabled={l.remaining <= 0}
                      >
                        Repay
                      </button>
                      {isAdmin && (
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-3" 
                          onClick={() => handleDeleteLoan(l.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ADD LOAN MODAL ===== */}
      {showLoanModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                <div className="modal-header border-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold">Issue New Loan</h5>
                  <button type="button" className="btn-close" onClick={() => setShowLoanModal(false)}></button>
                </div>
                <form onSubmit={handleAddLoan}>
                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Loan Amount (RWF)</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3 py-2" 
                        placeholder="Enter amount"
                        value={newLoan.amount}
                        onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Reason</label>
                      <textarea 
                        className="form-control rounded-3 py-2" 
                        rows="2"
                        placeholder="Purpose of loan"
                        value={newLoan.reason}
                        onChange={(e) => setNewLoan({ ...newLoan, reason: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Loan Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3 py-2" 
                        value={newLoan.loan_date}
                        onChange={(e) => setNewLoan({ ...newLoan, loan_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pb-4 px-4">
                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowLoanModal(false)}>Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-success rounded-3 px-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Loan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* ===== PAY LOAN MODAL ===== */}
      {showPayModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                <div className="modal-header border-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold">Register Repayment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPayModal(false)}></button>
                </div>
                <form onSubmit={handlePayLoan}>
                  <div className="modal-body px-4 text-center">
                    <p className="text-muted mb-4">
                      Recording a payment for this loan. <br/>
                      <span className="fw-bold text-dark">Remaining Balance: {formatCurrency(payment.currentRemaining)}</span>
                    </p>
                    <div className="mb-3 text-start">
                      <label className="form-label small fw-bold text-muted">Payment Amount (RWF)</label>
                      <input 
                        type="number" 
                        className="form-control form-control-lg rounded-3 text-center fw-bold" 
                        placeholder="0"
                        value={payment.amount}
                        onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                        max={payment.currentRemaining}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pb-4 px-4">
                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowPayModal(false)}>Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-3 px-4"
                      disabled={isSubmitting}
                      style={{ background: "#2a5298", border: "none" }}
                    >
                      {isSubmitting ? "Processing..." : "Submit Payment"}
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

export default EmployeeLoans;