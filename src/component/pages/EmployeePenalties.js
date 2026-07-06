import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../component/utils/api";
import { useAuth } from "../../context/Authcontext";
import { formatCurrency, formatDate } from "../../component/utils/formatters";

function EmployeePenalties() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [penalties, setPenalties] = useState([]);
  const [employee, setEmployee] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalPenalty, setTotalPenalty] = useState(0);

  // Modal State
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [newPenalty, setNewPenalty] = useState({ amount: "", reason: "", penalty_date: new Date().toISOString().split("T")[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RBAC: Check if user can add/delete penalties
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const [employeeRes, penaltiesRes] = await Promise.all([
        api.get("/credits"),
        api.get(`/credits/${id}/penalties`),
      ]);

      const emp = employeeRes.data.find((e) => e.id === Number(id)) || {};
      setEmployee(emp);
      setPenalties(penaltiesRes.data);
      recalcTotals(penaltiesRes.data);
    } catch (err) {
      console.error(err);
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, [id]);

  const recalcTotals = (data) => {
    let penaltySum = 0;
    data.forEach((p) => {
      penaltySum += Number(p.amount || 0);
    });
    setTotalPenalty(penaltySum);
  };

  const handleAddPenalty = async (e) => {
    e.preventDefault();
    if (!newPenalty.amount || !newPenalty.penalty_date) return alert("Amount and Date are required");

    try {
      setIsSubmitting(true);
      const res = await api.post(`/credits/${id}/penalties`, {
        amount: Number(newPenalty.amount),
        reason: newPenalty.reason,
        penalty_date: newPenalty.penalty_date,
        given_by: user?.username || "unknown"
      });
      const updatedPenalties = [res.data, ...penalties];
      setPenalties(updatedPenalties);
      recalcTotals(updatedPenalties);
      setShowPenaltyModal(false);
      setNewPenalty({ amount: "", reason: "", penalty_date: new Date().toISOString().split("T")[0] });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error adding penalty");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePenalty = async (penaltyId) => {
    if (!window.confirm("Are you sure you want to delete this penalty?")) return;
    try {
      await api.delete(`/credits/${id}/penalties/${penaltyId}`);
      const newPenalties = penalties.filter((p) => p.id !== penaltyId);
      setPenalties(newPenalties);
      recalcTotals(newPenalties);
    } catch (err) {
      console.error(err);
      alert("Error deleting penalty");
    }
  };

  return (
    <div className="container mt-4 pb-5">
      {/* ===== HEADER ===== */}
      <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "15px" }}>
        <div className="card-body d-flex justify-content-between align-items-center p-4">
          <div>
            <h3 className="fw-bold mb-0 text-warning">
              <span className="text-muted fw-normal">Penalties for</span> {employee.name || "Employee"}
            </h3>
            <p className="text-muted mb-0">Detailed penalty history and deductions</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light shadow-sm" onClick={() => navigate("/credits")}>
              ← Back
            </button>
            {isAdmin && (
              <button 
                className="btn shadow-sm px-4 btn-warning" 
                onClick={() => setShowPenaltyModal(true)}
                style={{ fontWeight: "600", borderRadius: "10px", border: "none" }}
              >
                + Add Penalty
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: "15px", borderLeft: "5px solid #ffc107" }}>
            <div className="card-body py-4">
              <h6 className="text-uppercase text-muted fw-bold small">Total Penalties Issued</h6>
              <h3 className="fw-bold mb-0 text-warning">{formatCurrency(totalPenalty)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PENALTIES TABLE ===== */}
      <div className="card shadow-sm border-0 rounded-4" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-dark">
              <tr>
                <th className="ps-4 py-3 text-uppercase small fw-bold">Date</th>
                <th className="py-3 text-uppercase small fw-bold">Reason</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Amount</th>
                <th className="py-3 text-uppercase small fw-bold text-center">Given By</th>
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
              ) : penalties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No penalties recorded for this employee.</td>
                </tr>
              ) : (
                penalties.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4 fw-medium">{formatDate(p.penalty_date)}</td>
                    <td>{p.reason || <span className="text-muted small italic">No reason provided</span>}</td>
                    <td className="text-center fw-semibold text-warning">{formatCurrency(p.amount)}</td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border px-3 py-2" style={{ borderRadius: "8px" }}>
                        <i className="bi bi-person-fill me-1 text-muted"></i>
                        {p.given_by || "System"}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      {isAdmin && (
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-3" 
                          onClick={() => handleDeletePenalty(p.id)}
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

      {/* ===== ADD PENALTY MODAL ===== */}
      {showPenaltyModal && isAdmin && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                <div className="modal-header border-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold">Issue New Penalty</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPenaltyModal(false)}></button>
                </div>
                <form onSubmit={handleAddPenalty}>
                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Penalty Amount (RWF)</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3 py-2" 
                        placeholder="Enter amount"
                        value={newPenalty.amount}
                        onChange={(e) => setNewPenalty({ ...newPenalty, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Reason / Mistake</label>
                      <textarea 
                        className="form-control rounded-3 py-2" 
                        rows="2"
                        placeholder="Describe the mistake..."
                        value={newPenalty.reason}
                        onChange={(e) => setNewPenalty({ ...newPenalty, reason: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Date</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3 py-2" 
                        value={newPenalty.penalty_date}
                        onChange={(e) => setNewPenalty({ ...newPenalty, penalty_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pb-4 px-4">
                    <button type="button" className="btn btn-light rounded-3 px-4" onClick={() => setShowPenaltyModal(false)}>Cancel</button>
                    <button 
                      type="submit" 
                      className="btn btn-warning rounded-3 px-4 fw-bold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Penalty"}
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

export default EmployeePenalties;
