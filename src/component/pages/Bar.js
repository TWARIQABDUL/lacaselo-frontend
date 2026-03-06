import React, { useEffect, useState } from "react";
import axios from "axios";

function Bar() {

  const today = new Date().toISOString().split("T")[0];

  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);

  const [totalEarned, setTotalEarned] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);

  const [loading, setLoading] = useState(false);

  const API_URL = "https://backend-vitq.onrender.com/api/drinks";



  // FETCH PRODUCTS
  const fetchProducts = async (date) => {
    try {

      setLoading(true);

      const res = await axios.get(API_URL, { params: { date } });

      const prods = res.data.products || [];

      setProducts(prods);

      let sales = 0;
      let profit = 0;

      prods.forEach((p) => {

        const soldMoney = Number(p.total_sold || 0);
        const soldQty = Number(p.sold || 0);

        sales += soldMoney;

        profit += (Number(p.price) - Number(p.initial_price)) * soldQty;

      });

      setTotalEarned(sales);
      setTotalProfit(profit);

      const stockValue = prods.reduce(
        (sum, p) =>
          sum + Number(p.closing_stock || 0) * Number(p.initial_price || 0),
        0
      );

      setTotalStockValue(stockValue);

      const low = prods.filter((p) => Number(p.closing_stock) < 5);

      setLowStockProducts(low);

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
    if (!name) return alert("Name required");

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

    const newName = prompt("Edit name:", product.name);
    if (!newName) return;

    const newCost = Number(prompt("Edit cost:", product.initial_price));
    const newSell = Number(prompt("Edit selling:", product.price));
    const newOpen = Number(prompt("Edit opening:", product.opening_stock));

    await axios.put(`${API_URL}/edit/${product.id}`, {
      name: newName,
      initial_price: newCost,
      price: newSell,
      opening_stock: newOpen,
      date: selectedDate,
    });

    fetchProducts(selectedDate);
  };



  const handleLocalChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
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



  const formatNumber = (value) =>
    Number(value || 0).toLocaleString();



  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="card shadow-lg mb-4 border-0" style={{borderRadius:"15px"}}>

        <div className="card-body d-flex justify-content-between align-items-center">

          <h4 className="fw-bold mb-0">Bar</h4>

          <div>

            <button
              className="btn btn-outline-dark btn-sm me-2"
              onClick={() => changeDate(-1)}
            >
              ◀
            </button>

            <strong>{selectedDate}</strong>

            <button
              className="btn btn-outline-dark btn-sm ms-2"
              disabled={selectedDate === today}
              onClick={() => changeDate(1)}
            >
              ▶
            </button>

            <button
              className="btn btn-success ms-3"
              onClick={handleAdd}
            >
              + Add Product
            </button>

          </div>

        </div>

      </div>



      {/* SUMMARY CARDS */}

      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="card shadow border-0 rounded-3" style={{background:"#0B3D2E",color:"#fff"}}>
            <div className="card-body text-center">
              <h6>Total Sales</h6>
              <h3>RWF {formatNumber(totalEarned)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0 rounded-3" style={{background:"#D4AF37"}}>
            <div className="card-body text-center">
              <h6>Total Profit</h6>
              <h3>RWF {formatNumber(totalProfit)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow border-0 rounded-3" style={{background:"#0E6251",color:"#fff"}}>
            <div className="card-body text-center">
              <h6>Stock Value</h6>
              <h3>RWF {formatNumber(totalStockValue)}</h3>
            </div>
          </div>
        </div>

        <div
          className="col-md-3"
          style={{cursor:"pointer"}}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          <div className="card shadow border-0 rounded-3" style={{background:"#C0392B",color:"#fff"}}>
            <div className="card-body text-center">
              <h6>Low Stock</h6>
              <h3>{lowStockProducts.length}</h3>
            </div>
          </div>
        </div>

      </div>



      {/* LOW STOCK TABLE */}

      {showLowStock && (

        <div className="card shadow mb-4">

          <div className="card-body">

            <h5 className="fw-bold mb-3">Low Stock Products</h5>

            <table className="table table-hover text-center">

              <thead style={{background:"#1C1C1C",color:"#fff"}}>

                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Closing Stock</th>
                </tr>

              </thead>

              <tbody>

                {lowStockProducts.map((p,i)=>(
                  <tr key={p.id}>
                    <td>{i+1}</td>
                    <td>{p.name}</td>
                    <td>{p.closing_stock}</td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}



      {/* MAIN TABLE */}

      <div className="card shadow-lg border-0 rounded-4">

        <div className="table-responsive">

          <table className="table table-hover text-center mb-0">

            <thead style={{background:"#1C1C1C",color:"#fff"}}>

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
                  <td colSpan="11">No products</td>
                </tr>
              ) : (

                products.map((p,i)=>{

                  const low = Number(p.closing_stock) < 5;

                  return (

                    <tr
                      key={p.id}
                      style={{
                        background: low ? "#ffcccc" : "#F9F9F9"
                      }}
                      className="shadow-sm"
                    >

                      <td>{i+1}</td>

                      <td className="fw-bold text-start ps-3">
                        {p.name}
                      </td>

                      <td>RWF {formatNumber(p.initial_price)}</td>

                      <td>RWF {formatNumber(p.price)}</td>

                      <td>{p.opening_stock}</td>

                      <td>

                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          value={p.entree || ""}
                          onChange={(e)=>
                            handleLocalChange(p.id,"entree",e.target.value)
                          }
                          onBlur={()=>saveStock(p)}
                        />

                      </td>

                      <td>{p.total_stock}</td>

                      <td>

                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          value={p.sold || ""}
                          onChange={(e)=>
                            handleLocalChange(p.id,"sold",e.target.value)
                          }
                          onBlur={()=>saveStock(p)}
                        />

                      </td>

                      <td className="fw-bold">
                        {p.closing_stock}
                      </td>

                      <td className="text-success fw-bold">
                        RWF {formatNumber(p.total_sold)}
                      </td>

                      <td>

                        <button
                          className="btn btn-warning btn-sm"
                          onClick={()=>handleEdit(p)}
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Bar;