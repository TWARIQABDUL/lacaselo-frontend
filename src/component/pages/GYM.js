import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Gym() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalDaily, setTotalDaily] = useState(0);
  const [totalMonthly, setTotalMonthly] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  const [formData, setFormData] = useState({
    daily_people: 0,
    monthly_people: 0,
    cash: 0,
    cash_momo: 0,
  });

  const [stats, setStats] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });

  // AUTH (only once)
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const token = localStorage.getItem("token");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const API_URL = `${API_BASE_URL}/gym`;

  const fetchEntries = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        params: { date },
        ...authHeader,
      });
      const data = res.data.records || [];
      setEntries(data);
      recalcTotals(data);
    } catch (err) {
      console.error(err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/stats/timePeriods`,
        authHeader
      );
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
    fetchStats();
  }, [selectedDate]);

  const recalcTotals = (data) => {
    let income = 0,
      daily = 0,
      monthly = 0;

    data.forEach((e) => {
      income += (Number(e.cash) || 0) + (Number(e.cash_momo) || 0);
      daily += Number(e.daily_people) || 0;
      monthly += Number(e.monthly_people) || 0;
    });

    setTotalIncome(income);
    setTotalDaily(daily);
    setTotalMonthly(monthly);
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const formatted = d.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
  };

  const handleSubmit = async () => {
    const { daily_people, monthly_people, cash, cash_momo } = formData;
    const total_people = Number(daily_people) + Number(monthly_people);

    try {
      if (isEditing) {
        await axios.put(
          `${API_URL}/${currentEntry.id}`,
          {
            ...currentEntry,
            daily_people: Number(daily_people),
            monthly_people: Number(monthly_people),
            total_people,
            cash: Number(cash),
            cash_momo: Number(cash_momo),
          },
          authHeader
        );
      } else {
        await axios.post(
          API_URL,
          {
            date: selectedDate,
            daily_people: Number(daily_people),
            monthly_people: Number(monthly_people),
            total_people,
            cash: Number(cash),
            cash_momo: Number(cash_momo),
          },
          authHeader
        );
      }

      fetchEntries(selectedDate);
      fetchStats();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
      fetchEntries(selectedDate);
    } catch (err) {
      console.error(err);
    }
  };

  const formatNumber = (v) => Number(v || 0).toLocaleString();

  return (
    <div className="container-fluid mt-4">
      <h4>Gym</h4>
      {/* UI SAME (unchanged) */}
    </div>
  );
}

export default Gym;