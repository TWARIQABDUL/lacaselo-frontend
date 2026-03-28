import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Bar() {

/* =============================
   BUSINESS DATE (3PM RWANDA)
============================= */
function getBusinessDate() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const rwandaTime = new Date(utc + (2 * 60 * 60 * 1000));

  if (rwandaTime.getHours() < 15) {
    rwandaTime.setDate(rwandaTime.getDate() - 1);
  }

  return rwandaTime.toISOString().split("T")[0];
}

const today = getBusinessDate();

/* ============================= */

const [products, setProducts] = useState([]);
const [selectedDate, setSelectedDate] = useState(today);
const [loading, setLoading] = useState(false);

const [totalSales, setTotalSales] = useState(0);
const [totalProfit, setTotalProfit] = useState(0);
const [totalStockValue, setTotalStockValue] = useState(0);

const [lowStockProducts, setLowStockProducts] = useState([]);
const [showLowStock, setShowLowStock] = useState(false);

const [stats, setStats] = useState({
  day: 0,
  week: 0,
  month: 0,
  year: 0,
});

/* ============================= */

const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

const API_URL = `${API_BASE_URL}/bar`;

const token = localStorage.getItem("token");

const authHeader = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

/* =============================
   FETCH PRODUCTS
============================= */

const fetchProducts = async (date) => {
  try {
    setLoading(true);

    const res = await axios.get(API_URL, {
      params: { date },
      ...authHeader,
    });

    const list = res.data.products || [];
    setProducts(list);

    let sales = 0;
    let profit = 0;
    let stockValue = 0;
    const lowProducts = [];

    list.forEach((p) => {
      const opening = Number(p.opening_stock || 0);
      const entree = Number(p.entree || 0);
      const sold = Number(p.sold || 0);

      const price = Number(p.price || 0);
      const cost = Number(p.initial_price || 0);

      const closing = opening + entree - sold;

      sales += sold * price;
      profit += sold * (price - cost);
      stockValue += closing * cost;

      if (closing < 5) {
        lowProducts.push({ ...p, closing_stock: closing });
      }
    });

    setTotalSales(sales);
    setTotalProfit(profit);
    setTotalStockValue(stockValue);
    setLowStockProducts(lowProducts);

  } catch (err) {
    console.error(err);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};

/* =============================
   FETCH STATS
============================= */

const fetchStats = async () => {
  try {
    const res = await axios.get(`${API_URL}/stats/timePeriods`, authHeader);
    setStats(res.data);
  } catch (err) {
    console.error(err);
  }
};

/* ============================= */

useEffect(() => {
  fetchProducts(selectedDate);
  fetchStats();
}, [selectedDate]);

/* ============================= */

const changeDate = (days) => {
  const newDate = new Date(selectedDate);
  newDate.setDate(newDate.getDate() + days);

  const formatted = newDate.toISOString().split("T")[0];

  if (formatted > today) return;

  setSelectedDate(formatted);
};

/* ============================= */

const handleAdd = async () => {
  const name = prompt("Product name");
  if (!name) return;

  const initial_price = Number(prompt("Cost price"));
  const price = Number(prompt("Selling price"));
  const opening_stock = Number(prompt("Opening stock"));

  try {
    await axios.post(API_URL, {
      name,
      initial_price,
      price,
      opening_stock,
      date: selectedDate,
    }, authHeader);

    fetchProducts(selectedDate);
  } catch (err) {
    console.error(err);
  }
};

/* =============================
   FIXED INPUT HANDLING
============================= */

const handleEntreeChange = async (p, value) => {
  if (p.is_locked && !isAdmin) {
    alert("This record is locked and cannot be edited by staff.");
    return;
  }

  try {
    await axios.put(`${API_URL}/entree/${p.id}`, {
      entree: Number(value),
      date: selectedDate,
    }, authHeader);

    fetchProducts(selectedDate);
  } catch (err) {
    console.error(err);
  }
};

const handleSoldChange = async (p, value) => {
  if (p.is_locked && !isAdmin) {
    alert("This record is locked and cannot be edited by staff.");
    return;
  }

  try {
    await axios.put(`${API_URL}/sold/${p.id}`, {
      sold: Number(value),
      date: selectedDate,
    }, authHeader);

    fetchProducts(selectedDate);
  } catch (err) {
    console.error(err);
  }
};

/* ============================= */

const formatNumber = (v) => Number(v || 0).toLocaleString();

/* ============================= */

return (
<div>

{/* TABLE ONLY CHANGED PART */}

<input
  type="number"
  defaultValue={entree}
  onBlur={(e) => handleEntreeChange(p, e.target.value)}
/>

<input
  type="number"
  defaultValue={sold}
  onBlur={(e) => handleSoldChange(p, e.target.value)}
/>

</div>
);

}

export default Bar;