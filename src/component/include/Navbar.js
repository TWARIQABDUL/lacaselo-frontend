import React, { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../login/Login";
import logo from "../assets/logo.png";

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Bar", path: "/bar" },
    { name: "Kitchen", path: "/kitchen" },
    { name: "Guest House", path: "/guesthouse" },
    { name: "Gym", path: "/gym" },
    { name: "Billiard", path: "/billiard" },
    { name: "Expenses", path: "/expenses" },
    { name: "Staff", path: "/credits" },
  ];

  return (
    <>
      <nav className="elite-navbar navbar navbar-expand-lg">
        <div className="container-fluid">

          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center elite-logo" to="/">
            <img src={logo} alt="La Cielo" />
            <span className="brand-name">LA CIELO</span>
          </Link>

          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav ms-auto align-items-center">

              {navLinks.map((item, index) => (
                <li className="nav-item mx-2" key={index}>
                  <Link className="elite-link" to={item.path}>
                    {item.name}
                  </Link>
                </li>
              ))}

              {/* Login Button */}
              <li className="nav-item mx-2">
                <button
                  className="elite-login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Login show={showLogin} handleClose={() => setShowLogin(false)} />

      <style>
        {`

/* NAVBAR */
.elite-navbar{
  background: linear-gradient(90deg,#071B17,#0B2E26,#124C3A);
  padding:14px 30px;
  box-shadow:0 10px 25px rgba(0,0,0,0.5);
  border-bottom:1px solid rgba(255,215,0,0.3);
  backdrop-filter: blur(6px);
}

/* LOGO */
.elite-logo img{
  height:60px;
  margin-right:10px;
  filter: drop-shadow(0 0 6px rgba(255,215,0,0.5));
}

.brand-name{
  color:#FFD700;
  font-weight:700;
  letter-spacing:2px;
  font-size:18px;
}

/* LINKS */
.elite-link{
  color:#F5F5F5 !important;
  padding:8px 18px;
  border-radius:25px;
  text-decoration:none;
  font-weight:500;
  transition:all 0.35s ease;
  position:relative;
}

/* GOLD UNDERLINE ANIMATION */
.elite-link::after{
  content:"";
  position:absolute;
  width:0%;
  height:2px;
  bottom:-3px;
  left:50%;
  background:#FFD700;
  transition:all 0.3s ease;
}

.elite-link:hover::after{
  width:100%;
  left:0;
}

/* LINK HOVER */
.elite-link:hover{
  color:#FFD700 !important;
  transform:translateY(-2px);
  text-shadow:0 0 8px rgba(255,215,0,0.6);
}

/* LOGIN BUTTON */
.elite-login-btn{
  background:linear-gradient(45deg,#FFD700,#C8A96A);
  border:none;
  padding:8px 22px;
  border-radius:25px;
  font-weight:600;
  color:#0B2E26;
  transition:all 0.35s ease;
  box-shadow:0 0 10px rgba(255,215,0,0.5);
}

.elite-login-btn:hover{
  transform:scale(1.08);
  box-shadow:0 0 18px rgba(255,215,0,0.8);
}

        `}
      </style>
    </>
  );
}

export default Navbar;