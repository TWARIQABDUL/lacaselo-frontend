import React from "react";

function Login({ show, handleClose }) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 1050,
      }}
    >
      <div
        className="p-5 position-relative shadow-lg"
        style={{
          width: "420px",
          borderRadius: "25px",
          background: "linear-gradient(135deg, #1F2937, #111827)",
          color: "#F8FAFC",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          animation: "fadeInScale 0.4s ease",
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
            color: "#FBBF24",
            transition: "0.3s",
          }}
          className="login-close"
        >
          &times;
        </span>

        <h3 className="text-center fw-bold mb-2" style={{ letterSpacing: "1px" }}>
          Welcome Back
        </h3>

        <p className="text-center text-light small mb-4">
          Login to access <span style={{ color: "#FBBF24" }}>La Cielo Management</span>
        </p>

        <input
          type="email"
          className="form-control mb-3 px-4 py-2"
          placeholder="Username"
          style={{
            borderRadius: "50px",
            border: "1px solid #374151",
            background: "rgba(255,255,255,0.05)",
            color: "#F8FAFC",
            fontWeight: "500",
          }}
        />

        <input
          type="password"
          className="form-control mb-4 px-4 py-2"
          placeholder="Password"
          style={{
            borderRadius: "50px",
            border: "1px solid #374151",
            background: "rgba(255,255,255,0.05)",
            color: "#F8FAFC",
            fontWeight: "500",
          }}
        />

        <button
          className="btn w-100 mb-3"
          style={{
            borderRadius: "50px",
            background: "linear-gradient(90deg, #FBBF24, #F59E0B)",
            color: "#111827",
            fontWeight: "600",
            padding: "10px 0",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Login
        </button>

        <div className="text-center small text-gray-400 hover:text-white" style={{ cursor: "pointer" }}>
          Forgot password?
        </div>

        <style>
          {`
          .login-close:hover {
            color: #FBBF24;
            transform: rotate(180deg) scale(1.2);
          }

          @keyframes fadeInScale {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          `}
        </style>
      </div>
    </div>
  );
}

export default Login;