import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BAR_MAN");
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("active");

  const API_URL = `${API_BASE_URL}/users`;
  const token = localStorage.getItem("token");
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const roles = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "BAR_MAN",
    "CHIEF_KITCHEN",
    "TOKEN_MAN",
    "LAND_LORD",
    "GYM",
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, authHeader);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("BAR_MAN");
    setBranchId("");
    setStatus("active");
    setEditUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = { username, role, branch_id: branchId || null, status };
      if (password) userData.password = password;

      if (editUser) {
        await axios.put(`${API_URL}/${editUser.userId}`, userData, authHeader);
        alert("User updated successfully");
      } else {
        if (!password) return alert("Password is required for new users");
        userData.password = password;
        await axios.post(API_URL, userData, authHeader);
        alert("User created successfully");
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.response?.data?.message || "Error saving user");
    }
  };

  const handleEdit = (u) => {
    setEditUser(u);
    setUsername(u.username);
    setRole(u.role);
    setBranchId(u.branch_id || "");
    setStatus(u.status);
    setPassword(""); // Don't show old password
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
      alert("User deleted");
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting user");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="container-fluid py-4" style={{ background: "#0F172A", minHeight: "100vh", color: "#fff" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">User Management</h2>
        <button 
          className="btn btn-primary px-4 rounded-pill shadow"
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ background: "linear-gradient(135deg, #2563EB, #1E40AF)" }}
        >
          + Add New User
        </button>
      </div>

      <div className="card border-0 shadow-lg" style={{ background: "#1E293B", borderRadius: "16px" }}>
        <div className="table-responsive">
          <table className="table table-hover table-dark mb-0 align-middle">
            <thead style={{ background: "#0F172A" }}>
              <tr>
                <th className="ps-4">Username</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId}>
                    <td className="ps-4 fw-semibold">{u.username}</td>
                    <td><span className="badge bg-secondary">{u.role}</span></td>
                    <td>{u.branch_id || "Global"}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.userId)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (Simple implementation) */}
      {showModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "#1E293B", color: "#fff", border: "1px solid #334155" }}>
              <div className="modal-header border-secondary">
                <h5 className="modal-title">{editUser ? "Edit User" : "Add New User"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password {editUser && "(Leave blank to keep current)"}</label>
                    <input 
                      type="password" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required={!editUser} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-select bg-dark border-secondary text-white" 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Branch ID (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border-secondary text-white" 
                      value={branchId} 
                      onChange={(e) => setBranchId(e.target.value)} 
                    />
                  </div>
                  {editUser && (
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select 
                        className="form-select bg-dark border-secondary text-white" 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editUser ? "Update User" : "Create User"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
