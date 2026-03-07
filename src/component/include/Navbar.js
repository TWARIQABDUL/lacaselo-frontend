import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Login from "../login/Login";
import logo from "../assets/logo.png";

function Navbar() {

  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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
      <nav className="elite-navbar">

        <div className="elite-container">

          {/* LOGO */}
          <Link className="elite-logo" to="/">
            <img src={logo} alt="La Cielo"/>
            <span>LA CIELO</span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <div
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* LINKS */}
          <ul className={`elite-menu ${menuOpen ? "show" : ""}`}>

            {navLinks.map((item,index)=>(
              <li key={index}>
                <Link
                  to={item.path}
                  className={`elite-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  onClick={()=>setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {/* LOGIN BUTTON */}
            <li>
              <button
                className="elite-login-btn"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
            </li>

          </ul>

        </div>

      </nav>

      {/* LOGIN MODAL */}
      <Login show={showLogin} handleClose={() => setShowLogin(false)} />

      <style>{`

/* NAVBAR */

.elite-navbar{
position:sticky;
top:0;
width:100%;
z-index:1000;

background:linear-gradient(120deg,#041C18,#0A3B31,#0E5A47);
backdrop-filter:blur(12px);

border-bottom:1px solid rgba(255,215,0,0.25);
box-shadow:0 10px 35px rgba(0,0,0,0.6);
}

/* CONTAINER */

.elite-container{
max-width:1400px;
margin:auto;

display:flex;
align-items:center;
justify-content:space-between;

padding:16px 40px;
}

/* LOGO */

.elite-logo{
display:flex;
align-items:center;

text-decoration:none;
}

.elite-logo img{
height:65px;
margin-right:12px;

filter:drop-shadow(0 0 10px gold);
transition:.4s;
}

.elite-logo:hover img{
transform:scale(1.08);
}

.elite-logo span{
color:#FFD700;

font-weight:700;
letter-spacing:3px;
font-size:19px;

text-shadow:0 0 10px gold;
}

/* MENU */

.elite-menu{
display:flex;
align-items:center;

gap:20px;

list-style:none;
margin:0;
padding:0;
}

/* LINKS */

.elite-link{
color:#f5f5f5;

text-decoration:none;

padding:9px 20px;
border-radius:30px;

font-weight:500;

position:relative;

transition:.35s;
}

/* HOVER BUBBLE */

.elite-link:hover{
color:#FFD700;

transform:translateY(-3px);

text-shadow:0 0 10px gold;
}

/* ACTIVE PAGE */

.elite-link.active{
background:rgba(255,215,0,0.15);
color:#FFD700;

box-shadow:0 0 10px rgba(255,215,0,0.5);
}

/* LOGIN BUTTON */

.elite-login-btn{

background:linear-gradient(45deg,#FFD700,#E5C15C,#FFD700);

border:none;

padding:9px 26px;

border-radius:30px;

font-weight:600;
letter-spacing:.5px;

color:#06221A;

cursor:pointer;

position:relative;
overflow:hidden;

box-shadow:0 0 15px rgba(255,215,0,0.6);

transition:.35s;
}

/* SHINE EFFECT */

.elite-login-btn::before{

content:"";

position:absolute;
top:0;
left:-80%;

width:50%;
height:100%;

background:rgba(255,255,255,0.6);

transform:skewX(-25deg);

transition:.6s;
}

.elite-login-btn:hover::before{
left:130%;
}

.elite-login-btn:hover{

transform:scale(1.08);

box-shadow:0 0 25px rgba(255,215,0,0.9);
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

background:white;

margin:4px 0;

transition:.4s;
}

/* MOBILE */

@media(max-width:991px){

.menu-toggle{
display:flex;
}

.elite-menu{

position:absolute;
top:75px;
right:20px;

flex-direction:column;

background:#06221A;

padding:25px;

border-radius:15px;

box-shadow:0 10px 25px rgba(0,0,0,0.6);

display:none;
}

.elite-menu.show{
display:flex;
}

.elite-link{
padding:12px 20px;
}

}

      `}</style>
    </>
  );
}

export default Navbar;