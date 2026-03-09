import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Login from "../login/Login";
import { useAuth } from "../../context/Authcontext";
import logo from "../assets/logo.svg";

function Navbar() {

  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

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
      <nav className="world-navbar">

        <div className="world-container">

          {/* LOGO */}
          <Link className="world-logo" to="/">
            <img src={logo} alt="La Cielo"/>
            <span></span>
          </Link>

          {/* MOBILE BUTTON */}
          <div
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* MENU */}
          <ul className={`world-menu ${menuOpen ? "show" : ""}`}>

            {navLinks.map((item,index)=>(
              <li key={index}>
                <Link
                  to={item.path}
                  className={`world-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={()=>setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {/* LOGIN/LOGOUT BUTTON */}
            <li>
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #145C43, #1ABC9C)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    textAlign: "center",
                    padding: "5px",
                    boxSizing: "border-box",
                  }}>
                    <div style={{ marginBottom: "2px", fontSize: "11px" }}>{user.username.substring(0, 8)}</div>
                    <div style={{ fontSize: "10px", opacity: "0.9" }}>{user.role.substring(0, 5)}</div>
                  </div>
                  <button
                    className="world-login-btn"
                    onClick={logout}
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", padding: "8px 16px" }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className="world-login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              )}
            </li>

          </ul>

        </div>

      </nav>

      <Login show={showLogin} handleClose={() => setShowLogin(false)} />

<style>{`

/* NAVBAR */

.world-navbar{
position:sticky;
top:0;
width:100%;
z-index:1000;

background:linear-gradient(120deg,#0F172A,#111827);
backdrop-filter:blur(12px);

border-bottom:1px solid rgba(255,255,255,0.08);
box-shadow:0 10px 30px rgba(0,0,0,0.6);
}

/* CONTAINER */

.world-container{
max-width:1400px;
margin:auto;

display:flex;
align-items:center;
justify-content:space-between;

padding:16px 40px;
}

/* LOGO */

.world-logo{
display:flex;
align-items:center;
text-decoration:none;
}

.world-logo img{
height:70px;
width:auto;
margin-right:15px;

filter:drop-shadow(0 2px 8px rgba(26, 188, 156, 0.3));
transition:.3s ease;
}

.world-logo:hover img{
transform:scale(1.1) rotate(2deg);
filter:drop-shadow(0 4px 12px rgba(26, 188, 156, 0.6));
}

.world-logo span{
color:#F8FAFC;

font-weight:700;
letter-spacing:2px;
font-size:18px;
}

/* MENU */

.world-menu{
display:flex;
align-items:center;
gap:18px;

list-style:none;
margin:0;
padding:0;
}

/* LINKS */

.world-link{
color:#CBD5F5;

text-decoration:none;

padding:9px 18px;

border-radius:30px;

font-weight:500;

transition:.35s;
}

/* HOVER */

.world-link:hover{
color:#22D3EE;

background:rgba(34,211,238,0.08);

transform:translateY(-2px);
}

/* ACTIVE */

.world-link.active{
background:rgba(37,99,235,0.2);
color:#60A5FA;
}

/* LOGIN BUTTON */

.world-login-btn{

background:linear-gradient(135deg,#2563EB,#22D3EE);

border:none;

padding:9px 24px;

border-radius:30px;

font-weight:600;

color:white;

cursor:pointer;

box-shadow:0 8px 18px rgba(37,99,235,0.45);

transition:.35s;
}

.world-login-btn:hover{

transform:translateY(-2px) scale(1.05);

box-shadow:0 12px 28px rgba(34,211,238,0.6);
}

/* MOBILE MENU BUTTON */

.menu-toggle{
display:none;
flex-direction:column;
cursor:pointer;
}

.menu-toggle span{
width:28px;
height:3px;

background:#F8FAFC;

margin:4px 0;

transition:.3s;
}

/* MOBILE */

@media(max-width:991px){

.menu-toggle{
display:flex;
}

.world-menu{

position:absolute;

top:75px;
right:20px;

flex-direction:column;

background:#0F172A;

padding:25px;

border-radius:12px;

box-shadow:0 10px 25px rgba(0,0,0,0.6);

display:none;
}

.world-menu.show{
display:flex;
}

.world-link{
padding:12px 20px;
}

}

`}</style>

    </>
  );
}

export default Navbar;