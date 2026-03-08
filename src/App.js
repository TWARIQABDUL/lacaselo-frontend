import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ===== Navigation =====
import Navbar from "./component/include/Navbar";

// ===== Layout =====
import Layout from "./component/layout/Layout";

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
import ProtectedRoute from "./component/auth/ProtectedRoutes";
import { checkToken } from "./component/utils/CheckTokens";

function App() {

  // 🔐 Auto logout if token expired
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Router>

      {/* ===== Navbar ===== */}
      <Navbar />

      <Routes>

        {/* ===== PUBLIC PAGE ===== */}
        <Route path="/" element={<Home />} />

        {/* ===== PROTECTED SYSTEM PAGES ===== */}

        <Route
          path="/Bar"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "BAR_MAN"]}>
              <Layout>
                <Bar />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Kitchen"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "CHIEF_KITCHEN"]}>
              <Layout>
                <Kitchen />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/GuestHouse"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "LAND_LORD"]}>
              <Layout>
                <GuestHouse />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/GYM"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "GYM"]}>
              <Layout>
                <GYM />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Billiard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <Layout>
                <Billiard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Expenses"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN"]}>
              <Layout>
                <Expenses />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/credits"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "MANAGER"]}>
              <Layout>
                <Credits />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/:id/loans"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "ADMIN", "MANAGER"]}>
              <Layout>
                <EmployeeLoans />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </Router>
  );
}

export default App;