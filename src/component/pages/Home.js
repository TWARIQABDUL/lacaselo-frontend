import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useAuth } from "../../context/Authcontext";
import Login from "../login/Login";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const token = localStorage.getItem("token");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  useEffect(() => {
    fetchTotals();
  }, []);

  const fetchTotals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/total-money`,
        authHeader
      );

      const { drinks, kitchen, billiard, gym, guesthouse, expenses } =
        res.data;

      const grandTotal =
        drinks + kitchen + billiard + gym + guesthouse - expenses;

      setTotals({
        drinks,
        kitchen,
        billiard,
        gym,
        guesthouse,
        expenses,
        grandTotal,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load totals");
    } finally {
      setLoading(false);
    }
  };

  return !user ? (
    <Login show={true} handleClose={() => {}} />
  ) : (
    <div className="container-fluid py-5">
      <h1>La Cielo GARDEN</h1>
      {/* UI SAME */}
    </div>
  );
}

export default Home;