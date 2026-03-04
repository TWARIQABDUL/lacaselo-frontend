import React, { useEffect, useState } from "react";
import axios from "axios";

function Bar() {
  const today = new Date().toISOString().split("T")[0];

  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://backend-vitq.onrender.com/api/drinks";

  const fetchProducts = async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { params: { date } });
      const prods = res.data.products || [];
      setProducts(prods);
      setTotalEarned(res.data.totalEarned || 0);

      const profitSum = prods.reduce((sum, p) => sum + Number(p.profit || 0), 0);
      const stockValue = prods.reduce(
        (sum, p) =>
          sum + Number(p.closing_stock || 0) * Number(p.initial_price || 0),
        0
      );
      const lowStock = prods.filter((p) => Number(p.closing_stock) < 5).length;

      setTotalProfit(profitSum);
      setTotalStockValue(stockValue);
      setLowStockCount(lowStock);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedDate);
  }, [selectedDate]);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    const formatted = newDate.toISOString().split("T")[0];
    if (formatted > today) return;
    setSelectedDate(formatted);
  };

  const handleAdd = async () => {
    const name = prompt("Product name:");
    if (!name) return alert("Name is required");

    const initial_price = Number(prompt("Cost price:")) || 0;
    const price = Number(prompt("Selling price:")) || 0;
    const opening_stock = Number(prompt("Opening stock:")) || 0;

    await axios.post(API_URL, {
      name,
      initial_price,
      price,
      opening_stock,
      date: selectedDate,
    });

    fetchProducts(selectedDate);
  };

  const handleEdit = async (product) => {
    const newName = prompt("Edit product name:", product.name);
    if (!newName) return alert("Name is required");

    const newCost = Number(prompt("Edit cost price:", product.initial_price));
    const newSelling = Number(prompt("Edit selling price:", product.price));
    const newOpening = Number(prompt("Edit opening stock:", product.opening_stock));

    await axios.put(`${API_URL}/edit/${product.id}`, {
      name: newName,
      initial_price: newCost || 0,
      price: newSelling || 0,
      opening_stock: newOpening || 0,
      date: selectedDate,
    });

    fetchProducts(selectedDate);
  };

  const handleLocalChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const saveStock = async (product) => {
    await axios.put(`${API_URL}/stock/${product.id}`, {
      entree: Number(product.entree) || 0,
      sold: Number(product.sold) || 0,
      date: selectedDate,
    });

    fetchProducts(selectedDate);
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  return (
    <div className="container-fluid mt-4">
      {/* DASHBOARD CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 rounded-4 text-white"
            style={{ backgroundColor: "#0B3D2E" }}
          >
            <div className="card-body text-center">
              <h6 className="fw-bold">Total Sales</h6>
              <h4 className="fw-bold">RWF {formatNumber(totalEarned)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 rounded-4"
            style={{ backgroundColor: "#D4AF37", color: "#000" }}
          >
            <div className="card-body text-center">
              <h6 className="fw-bold">Total Profit</h6>
              <h4 className="fw-bold">RWF {formatNumber(totalProfit)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 rounded-4 text-white"
            style={{ backgroundColor: "#0E6251" }}
          >
            <div className="card-body text-center">
              <h6 className="fw-bold">Total Stock Value</h6>
              <h4 className="fw-bold">RWF {formatNumber(totalStockValue)}</h4>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-lg border-0 rounded-4 text-white"
            style={{ backgroundColor: "#C0392B" }}
          >
            <div className="card-body text-center">
              <h6 className="fw-bold">Low Stock</h6>
              <h4 className="fw-bold">{lowStockCount}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="card shadow-lg border-0 rounded-4 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="fw-bold mb-0">Bar</h4>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-dark btn-sm" onClick={() => changeDate(-1)}>
              ◀
            </button>
            <strong>{selectedDate}</strong>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => changeDate(1)}
              disabled={selectedDate === today}
            >
              ▶
            </button>
            <button className="btn btn-success ms-3 shadow-sm" onClick={handleAdd}>
              + Add Product
            </button>
          </div>
        </div>
      </div>

      {/* PREMIUM TABLE */}
      <div className="card shadow-lg border-0 rounded-4">
        <div className="table-responsive">
          <table className="table table-hover table-borderless text-center align-middle mb-0">
            <thead
              className="text-white"
              style={{ backgroundColor: "#1C2833", letterSpacing: "1px" }}
            >
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Cost</th>
                <th>Selling</th>
                <th>Opening</th>
                <th>Stock In</th>
                <th>Total</th>
                <th>Sold</th>
                <th>Closing</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="11">No report for this date</td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr
                    key={p.id}
                    className="align-middle"
                    style={{ transition: "all 0.3s", cursor: "pointer" }}
                  >
                    <td>{i + 1}</td>
                    <td className="fw-bold text-start ps-3">{p.name}</td>
                    <td>RWF {formatNumber(p.initial_price)}</td>
                    <td>RWF {formatNumber(p.price)}</td>
                    <td>{p.opening_stock}</td>

                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm shadow-sm text-center"
                        value={p.entree || ""}
                        onChange={(e) =>
                          handleLocalChange(p.id, "entree", e.target.value)
                        }
                        onBlur={() => saveStock(p)}
                        style={{ borderRadius: "8px" }}
                      />
                    </td>

                    <td>{p.total_stock}</td>

                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm shadow-sm text-center"
                        value={p.sold || ""}
                        onChange={(e) =>
                          handleLocalChange(p.id, "sold", e.target.value)
                        }
                        onBlur={() => saveStock(p)}
                        style={{ borderRadius: "8px" }}
                      />
                    </td>

                    <td>{p.closing_stock}</td>
                    <td className="text-success fw-bold">
                      RWF {formatNumber(p.total_sold)}
                    </td>

                    <td>
                      <button
                        className="btn btn-warning btn-sm shadow-sm"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Bar;