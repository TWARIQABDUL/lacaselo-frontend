import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/Authcontext';

function Login({ show, handleClose }) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: "linear-gradient(135deg, rgba(10,25,47,0.85), rgba(36,59,85,0.85))",
        backdropFilter: "blur(8px)",
        zIndex: 1050,
      }}
    >
      <div
        className="p-5 position-relative shadow-lg"
        style={{
          width: "420px",
          borderRadius: "25px",
          background: "#ffffffee",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          animation: "scaleIn 0.4s ease",
        }}
      >
        {/* 🔥 Close Icon */}
        <span
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#DAA520", // gold
            transition: "0.3s",
          }}
          className="login-close"
        >
          &times;
        </span>

        <h3 className="text-center fw-bold mb-2" style={{ color: "#102A43", fontFamily: "'Poppins', sans-serif" }}>
          Welcome Back
        </h3>

        <p className="text-center text-muted small mb-4">
          Login to access <span style={{ color: "#DAA520", fontWeight: "600" }}>La Cielo Management</span>
        </p>

        <input
          type="email"
          className="form-control rounded-pill mb-3 py-2 px-3"
          placeholder="Username"
          style={{
            border: "1px solid #145C43",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
        />

        <input
          type="password"
          className="form-control rounded-pill mb-3 py-2 px-3"
          placeholder="Password"
          style={{
            border: "1px solid #145C43",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
            transition: "0.3s",
          }}
        />

        <button
          className="btn w-100 rounded-pill mb-3"
          style={{
            background: "linear-gradient(90deg, #145C43, #1ABC9C)",
            color: "#fff",
            fontWeight: "600",
            padding: "10px 0",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
        >
          Login
        </button>

        <div className="text-center small text-muted">
          Forgot password?
        </div>

        <style>
          {`
            .login-close:hover {
              color: #FFB800;
              transform: scale(1.2);
            }

            input:focus {
              border-color: #1ABC9C;
              box-shadow: 0 0 8px rgba(26,188,156,0.4);
              outline: none;
            }

            button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 24px rgba(0,0,0,0.3);
            }

            @keyframes scaleIn {
              from { transform: scale(0.8); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Login;