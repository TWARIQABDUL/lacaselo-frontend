import React from "react";

function Login({ show, handleClose }) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
        zIndex: 1050,
      }}
    >
      <div
        className="p-5 position-relative shadow-xl"
        style={{
          width: "440px",
          borderRadius: "28px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          color: "#FFFFFF",
          boxShadow: "0 15px 50px rgba(0, 0, 0, 0.5)",
          animation: "fadeInScale 0.4s ease",
        }}
      >
        {/* Close Icon */}
        <span
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#FFDC73",
            transition: "color 0.3s",
          }}
          className="login-close"
        >
          &times;
        </span>

        <h2
          className="text-center fw-bold mb-2"
          style={{ letterSpacing: "1px", fontSize: "1.8rem" }}
        >
          Welcome Back
        </h2>

        <p
          className="text-center small mb-4"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Login to access <span style={{ color: "#FFDC73" }}>La Cielo Management</span>
        </p>

        <input
          type="email"
          className="form-control mb-3 px-4 py-3"
          placeholder="Username"
          style={{
            borderRadius: "50px",
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "#FFFFFF",
            fontWeight: "500",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
        />

        <input
          type="password"
          className="form-control mb-4 px-4 py-3"
          placeholder="Password"
          style={{
            borderRadius: "50px",
            border: "none",
            background: "rgba(255,255,255,0.08)",
            color: "#FFFFFF",
            fontWeight: "500",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
        />

        <button
          className="btn w-100 mb-3"
          style={{
            borderRadius: "50px",
            background: "linear-gradient(90deg, #FFD166, #F4A261)",
            color: "#111827",
            fontWeight: "600",
            padding: "12px 0",
            fontSize: "1rem",
            boxShadow: "0 8px 20px rgba(255, 209, 102, 0.4)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Login
        </button>

        <div
          className="text-center small"
          style={{ color: "rgba(255,255,255,0.6)", cursor: "pointer" }}
        >
          Forgot password?
        </div>

        <style>
          {`
            .login-close:hover {
              color: #FFD166;
            }

            input:focus {
              outline: none;
              box-shadow: 0 0 10px rgba(255, 209, 102, 0.6);
              background: rgba(255,255,255,0.12);
            }

            @keyframes fadeInScale {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Login;