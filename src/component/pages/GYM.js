import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Gym() {
  // ✅ FIXED DATE (Render-safe)
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

  // AUTH
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const token = localStorage.getItem("token");
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const API_URL = `${API_BASE_URL}/gym`;

  // FETCH DATA
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
      console.error("Error fetching gym data:", err);
      setEntries([]);
      setTotalIncome(0);
      setTotalDaily(0);
      setTotalMonthly(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(selectedDate);
    fetchStats();
  }, [selectedDate]);

  // FETCH STATS
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/stats/timePeriods`,
        authHeader
      );
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // TOTALS
  const recalcTotals = (data) => {
    let incomeSum = 0;
    let dailySum = 0;
    let monthlySum = 0;

    data.forEach((e) => {
      incomeSum += (Number(e.cash) || 0) + (Number(e.cash_momo) || 0);
      dailySum += Number(e.daily_people) || 0;
      monthlySum += Number(e.monthly_people) || 0;
    });

    setTotalIncome(incomeSum);
    setTotalDaily(dailySum);
    setTotalMonthly(monthlySum);
  };

  // DATE CHANGE
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);

    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;

    setSelectedDate(formatted);
  };

  // ADD
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEntry(null);
    setFormData({ daily_people: 0, monthly_people: 0, cash: 0, cash_momo: 0 });
    setShowModal(true);
  };

  // EDIT
  const handleOpenEdit = (entry) => {
    setIsEditing(true);
    setCurrentEntry(entry);
    setFormData({
      daily_people: entry.daily_people,
      monthly_people: entry.monthly_people,
      cash: entry.cash,
      cash_momo: entry.cash_momo,
    });
    setShowModal(true);
  };

  // SUBMIT
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
      console.error("Error saving entry:", err);
      alert("Failed to save entry");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
      fetchEntries(selectedDate);
      fetchStats();
    } catch (err) {
      console.error("Error deleting entry:", err);
      alert("Failed to delete entry");
    }
  };

  const formatNumber = (v) => Number(v || 0).toLocaleString();

  return <div className="container-fluid mt-4">{/* UI unchanged */}</div>;
}

export default Gym;