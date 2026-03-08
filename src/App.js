import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ===== Layout & Navigation =====
import Navbar from "./component/include/Navbar";
import Layout from "./component/layout/Layout";
import Sidebar from "./component/layout/Sidebar";

// ===== Pages =====
import Home from "./component/pages/Home";
import Bar from "./component/pages/Bar";
import Kitchen from "./component/pages/Kitchen";
import GuestHouse from "./component/pages/GuestHouse";
import GYM from "./component/pages/GYM";
import Billiard from "./component/pages/Billiard";
import Expenses from "./component/pages/Expenses";
import Credits from "./component/pages/Credits";
import EmployeeLoans from "./component/pages/EmployeeLoans";

// ===== Security =====
import ProtectedRoute from "./component/auth/ProtectedRoute";
import { checkToken } from "./utils/checkToken";

function App() {

  // 🔐 Check if token expired
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Router>

      {/* ===== Navbar ===== */}
      <Navbar />

      {/* ===== Routes ===== */}
      <Routes>

        {/* ===== Public Page ===== */}
        <Route path="/" element={<Home />} />

        {/* ===== BAR PAGE ===== */}
        <Route
          path="/Bar"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "BAR_MAN"]}>
              <Bar />
            </ProtectedRoute>
          }
        />

        {/* ===== KITCHEN PAGE ===== */}
        <Route
          path="/Kitchen"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "CHIEF_KITCHEN"]}>
              <Kitchen />
            </ProtectedRoute>
          }
        />

        {/* ===== GUESTHOUSE ===== */}
        <Route
          path="/GuestHouse"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "LAND_LORD"]}>
              <GuestHouse />
            </ProtectedRoute>
          }
        />

        {/* ===== GYM ===== */}
        <Route
          path="/GYM"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "GYM"]}>
              <GYM />
            </ProtectedRoute>
          }
        />

        {/* ===== BILLIARD ===== */}
        <Route
          path="/Billiard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <Billiard />
            </ProtectedRoute>
          }
        />

        {/* ===== EXPENSES ===== */}
        <Route
          path="/Expenses"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <Expenses />
            </ProtectedRoute>
          }
        />

        {/* ===== EMPLOYEES / CREDITS ===== */}
        <Route
          path="/credits"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "MANAGER"]}>
              <Credits />
            </ProtectedRoute>
          }
        />

        {/* ===== EMPLOYEE LOANS ===== */}
        <Route
          path="/employees/:id/loans"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "MANAGER"]}>
              <EmployeeLoans />
            </ProtectedRoute>
          }
        />

      </Routes>

    </Router>
  );
}

export default App;