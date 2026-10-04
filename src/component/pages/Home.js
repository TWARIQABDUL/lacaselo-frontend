import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useAuth } from "../../context/Authcontext";
import Login from "../login/Login";
import ClosingsAdmin from "./ClosingsAdmin";
import {
  FaGlassMartiniAlt,
  FaUtensils,
  FaTableTennis,
  FaDumbbell,
  FaBed,
  FaMoneyBillWave,
} from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(!user);
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user?.role);

  const [totals, setTotals] = useState({
    drinks: 0,
    kitchen: 0,
    billiard: 0,
    gym: 0,
    guesthouse: 0,
    expenses: 0,
    grandTotal: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [comments, setComments] = useState([]);

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    fetchTotals();
    fetchComments(selectedDate);
  }, [selectedDate]);

  const fetchComments = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/comments`, {
        params: { date },
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const fetchTotals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/total-money`);
      const { drinks, kitchen, billiard, gym, guesthouse, expenses } =
        res.data;
      const grandTotal = drinks + kitchen + billiard + gym + guesthouse - expenses;

      setTotals({
        drinks,
        kitchen,
        billiard,
        gym,
        guesthouse,
        expenses,
        grandTotal,
      });
    } catch (error) {
      console.error("Failed to load totals:", error);
      setError("Failed to load totals. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const pages = [
    { name: "Drinks", key: "drinks", route: "/bar", icon: <FaGlassMartiniAlt size={40} /> },
    { name: "Kitchen", key: "kitchen", route: "/kitchen", icon: <FaUtensils size={40} /> },
    { name: "Billiard", key: "billiard", route: "/billiard", icon: <FaTableTennis size={40} /> },
    { name: "Gym", key: "gym", route: "/gym", icon: <FaDumbbell size={40} /> },
    { name: "Guest House", key: "guesthouse", route: "/guesthouse", icon: <FaBed size={40} /> },
    { name: "Expenses", key: "expenses", route: "/expenses", icon: <FaMoneyBillWave size={40} /> },
  ];

  return (
    <>
      {!user ? (
        <Login show={true} handleClose={() => {}} />
      ) : (
        <div
          className="container-fluid min-vh-100 py-5"
          style={{
            background: "#f2f2f2",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-5">
            <h1 className="fw-bold text-dark">La Cielo GARDEN</h1>
            <p className="text-muted fs-5">
              Overview of all sections and profits
            </p>
            <button 
              className="btn btn-sm btn-primary mt-2"
              onClick={fetchTotals}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mx-auto" style={{ maxWidth: "500px" }} role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* SECTION CARDS */}
          <div className="container">
            

            {/* GRAND TOTAL */}
            <div className="mt-5">
              <div
                className="card p-5 text-center border-0"
                style={{
                  borderRadius: "22px",
                  background: "#ffffff",
                  boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
                }}
              >
                <h3 className="fw-bold text-dark">
                  Net Profit (After Expenses)
                </h3>
                <h1 className="display-4 fw-bold mt-3 text-dark">
                  {loading ? "..." : (isAdmin ? totals.grandTotal.toLocaleString() : "XXXXXX")} RWF
                </h1>
              </div>
            </div>

            {/* CLOSING COMMENTS */}
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0"><i className="bi bi-chat-square-text-fill text-primary me-2"></i> Closing Comments</h4>
                <div className="d-flex align-items-center">
                  <label className="fw-bold me-2 text-muted">Date:</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={today}
                  />
                </div>
              </div>

              {comments.length === 0 ? (
                <div className="text-center p-4 bg-white rounded shadow-sm">
                  <p className="text-muted mb-0 fst-italic">No closing comments recorded for this date.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {comments.map(c => (
                    <div key={c.id} className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "15px" }}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-primary text-uppercase">{c.department}</span>
                            <small className="text-muted">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                          </div>
                          <p className="card-text text-dark mb-3">"{c.comment}"</p>
                          <div className="d-flex align-items-center mt-auto">
                            <i className="bi bi-person-circle text-secondary fs-4 me-2"></i>
                            <div>
                              <p className="mb-0 fw-bold small text-secondary">{c.username || 'Staff'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CLOSING MONEY (ADMIN) */}
            {isAdmin && <ClosingsAdmin selectedDate={selectedDate} />}

          </div>
        </div>
      )}
    </>
  );
}

export default Home;