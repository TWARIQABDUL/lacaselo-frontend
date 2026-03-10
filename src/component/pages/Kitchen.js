import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function Kitchen(){

const today = new Date().toISOString().split("T")[0];

const [foods,setFoods]=useState([]);
const [selectedDate,setSelectedDate]=useState(today);
const [loading,setLoading]=useState(false);

const [totalSales,setTotalSales]=useState(0);
const [totalProfit,setTotalProfit]=useState(0);
const [totalStockValue,setTotalStockValue]=useState(0);

const [lowStockFoods,setLowStockFoods]=useState([]);
const [showLowStock,setShowLowStock]=useState(false);
const [stats, setStats] = useState({
  day: 0,
  week: 0,
  month: 0,
  year: 0,
});

// Get user role from localStorage
const userStr = localStorage.getItem("user");
const user = userStr ? JSON.parse(userStr) : null;
const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
const token = localStorage.getItem("token");
const authHeader = { headers: { Authorization: `Bearer ${token}` } };

const API_URL=`${API_BASE_URL}/kitchen`;

const fetchFoods=async(date)=>{

try{

setLoading(true);

const res=await axios.get(API_URL,{params:{date}});

const list=res.data.foods||[];

setFoods(list);

let sales=0;
let profit=0;
let stock=0;

const low=[];

list.forEach((f)=>{

const opening=Number(f.opening_stock||0);
const entree=Number(f.entree||0);
const sold=Number(f.sold||0);
const price=Number(f.price||0);
const cost=Number(f.initial_price||0);

const closing=opening+entree-sold;

sales+=sold*price;
profit+=sold*(price-cost);
stock+=closing*cost;

if(closing<5){
low.push({...f,closing_stock:closing});
}

});

setTotalSales(sales);
setTotalProfit(profit);
setTotalStockValue(stock);
setLowStockFoods(low);

}catch(err){

console.error(err);
setFoods([]);

}finally{

setLoading(false);

}

};

const fetchStats = async () => {
  try {
    const res = await axios.get(`${API_URL}/stats/timePeriods`);
    setStats(res.data);
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  }
};

useEffect(()=>{
fetchFoods(selectedDate);
fetchStats();
},[selectedDate]);

const changeDate=(days)=>{

const newDate=new Date(selectedDate);
newDate.setDate(newDate.getDate()+days);

const formatted=newDate.toISOString().split("T")[0];

if(formatted>today)return;

setSelectedDate(formatted);

};

const handleAdd=async()=>{

const name=prompt("Food name");
if(!name)return;

const initial_price=Number(prompt("Cost"));
const price=Number(prompt("Selling price"));
const opening_stock=Number(prompt("Opening stock"));

await axios.post(API_URL,{
name,
initial_price,
price,
opening_stock,
date:selectedDate
});

fetchFoods(selectedDate);

};

const handleEntreeChange=async(f,value)=>{
  if(f.is_locked && !isAdmin){
    alert("This record is locked and cannot be edited by staff.");
    return;
  }

  await axios.put(`${API_URL}/entree/${f.id}`,{
    entree:Number(value),
    date:selectedDate
  }, authHeader);

  fetchFoods(selectedDate);
};

const handleSoldChange=async(f,value)=>{
  if(f.is_locked && !isAdmin){
    alert("This record is locked and cannot be edited by staff.");
    return;
  }

  await axios.put(`${API_URL}/sold/${f.id}`,{
    sold:Number(value),
    date:selectedDate
  }, authHeader);

  fetchFoods(selectedDate);
};

const handleEdit = async (f) => {
  const name = prompt("Edit Food Name:", f.name) || f.name;
  const initial_price = prompt("Edit Cost Price:", f.initial_price) || f.initial_price;
  const price = prompt("Edit Selling Price:", f.price) || f.price;
  const opening_stock = prompt("Edit Opening Stock:", f.opening_stock) || f.opening_stock;

  try {
    await axios.put(`${API_URL}/edit/${f.id}`, {
      name,
      initial_price: Number(initial_price),
      price: Number(price),
      opening_stock: Number(opening_stock),
      date: selectedDate
    });
    fetchFoods(selectedDate);
  } catch(err) {
    console.error(err);
    alert("Error editing food");
  }
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this food entirely?")) return;
  try {
    await axios.delete(`${API_URL}/${id}`);
    fetchFoods(selectedDate);
  } catch (err) {
    console.error(err);
    alert("Error deleting food");
  }
};

const formatNumber=(v)=>Number(v||0).toLocaleString();

return(

<div className="container-fluid py-4" style={{background:"#0F172A",minHeight:"100vh"}}>

{/* DASHBOARD */}

<div className="row g-4 mb-4">

<div className="col-md-3">
<div className="card border-0 shadow-lg dashboard-card text-white" style={{background:"linear-gradient(135deg,#10B981,#065F46)"}}>
<div className="card-body text-center">
<h6>Total Sales</h6>
<h2>RWF {formatNumber(totalSales)}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card border-0 shadow-lg dashboard-card text-dark" style={{background:"linear-gradient(135deg,#F59E0B,#B45309)"}}>
<div className="card-body text-center">
<h6>Total Profit</h6>
<h2>RWF {formatNumber(totalProfit)}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card border-0 shadow-lg dashboard-card text-white" style={{background:"linear-gradient(135deg,#2563EB,#1E3A8A)"}}>
<div className="card-body text-center">
<h6>Stock Value</h6>
<h2>RWF {formatNumber(totalStockValue)}</h2>
</div>
</div>
</div>

<div className="col-md-3" style={{cursor:"pointer"}} onClick={()=>setShowLowStock(!showLowStock)}>
<div className="card border-0 shadow-lg dashboard-card text-white" style={{background:"linear-gradient(135deg,#EF4444,#7F1D1D)"}}>
<div className="card-body text-center">
<h6>Low Stock</h6>
<h2>{lowStockFoods.length}</h2>
</div>
</div>
</div>

</div>

{/* ===== TIME PERIOD STATS ===== */}

<div className="row g-4 mb-4">

{[
  { label: "Today", value: stats.day },
  { label: "This Week", value: stats.week },
  { label: "This Month", value: stats.month },
  { label: "This Year", value: stats.year }
].map((stat, i) => (

<div key={i} className="col-md-3">

<div className="card border-0 shadow-sm" style={{ borderRadius: "12px", background: "#FFFFFF" }}>

<div className="card-body text-center">

<p style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{stat.label}</p>

<h3 style={{ color: "#1F2937", fontWeight: "700" }}>

RWF {formatNumber(stat.value)}

</h3>

</div>

</div>

</div>

))}

</div>

{/* LOW STOCK */}

{showLowStock &&(

<div className="card border-0 shadow-lg mb-4">

<div className="card-header text-white fw-bold" style={{background:"#EF4444"}}>
Low Stock Foods
</div>

<table className="table table-hover text-center mb-0">

<thead style={{background:"#1E293B",color:"white"}}>
<tr>
<th>#</th>
<th>Food</th>
<th>Remaining</th>
</tr>
</thead>

<tbody>

{lowStockFoods.map((f,i)=>(
<tr key={f.id}>
<td>{i+1}</td>
<td>{f.name}</td>
<td className="text-danger fw-bold">{f.closing_stock}</td>
</tr>
))}

</tbody>

</table>

</div>

)}

{/* HEADER */}

<div className="card border-0 shadow-lg mb-4">

<div className="card-body d-flex justify-content-between align-items-center">

<h3 className="fw-bold text-dark">Kitchen Management</h3>

<div className="d-flex align-items-center gap-3">

<button className="btn btn-outline-dark btn-sm" onClick={()=>changeDate(-1)}>◀</button>

<strong>{selectedDate}</strong>

<button className="btn btn-outline-dark btn-sm" disabled={selectedDate===today} onClick={()=>changeDate(1)}>▶</button>

<button
className="btn shadow"
onClick={handleAdd}
style={{
background:"linear-gradient(135deg,#10B981,#065F46)",
color:"white",
borderRadius:"30px",
padding:"8px 22px",
fontWeight:"600"
}}
>
➕ Add Food
</button>

</div>

</div>

</div>

{/* TABLE */}

<div className="card border-0 shadow-lg">

<div className="table-responsive">

<table className="table table-hover text-center align-middle">

<thead style={{background:"#1E293B",color:"white"}}>

<tr>
<th>#</th>
<th>Food</th>
<th>Cost</th>
<th>Price</th>
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

{loading?(
<tr><td colSpan="10">Loading...</td></tr>
):foods.length===0?(
<tr><td colSpan="10">No foods</td></tr>
):(foods.map((f,i)=>{

const opening=Number(f.opening_stock||0);
const entree=Number(f.entree||0);
const sold=Number(f.sold||0);
const price=Number(f.price||0);
const cost=Number(f.initial_price||0);

const total=opening+entree;
const closing=total-sold;
const sales=sold*price;

const isLow=closing<5;

return(

<tr key={f.id} style={{background:isLow?"#FEE2E2":"white"}}>

<td>{i+1}</td>
<td className="fw-semibold">{f.name}</td>
<td>{formatNumber(cost)}</td>
<td>{formatNumber(price)}</td>
<td>{opening}</td>

<td>

<input
type="number"
className="form-control form-control-sm text-center"
value={entree}
disabled={f.is_locked && !isAdmin}
onChange={(e)=>handleEntreeChange(f,e.target.value)}
style={{borderRadius:"10px"}}
/>

</td>

<td>{total}</td>

<td>

<input
type="number"
className="form-control form-control-sm text-center"
value={sold}
disabled={f.is_locked && !isAdmin}
onChange={(e)=>handleSoldChange(f,e.target.value)}
style={{borderRadius:"10px"}}
/>

</td>

<td className={isLow?"text-danger fw-bold":""}>{closing}</td>

<td className="text-success fw-bold">{formatNumber(sales)}</td>

<td>
  {(!f.is_locked || isAdmin) && (
    <button className="btn btn-sm btn-outline-primary me-2 mb-1" onClick={() => handleEdit(f)}>Edit</button>
  )}
  {f.is_locked && !isAdmin && (
    <span className="badge bg-secondary me-2"><i className="bi bi-lock-fill"></i> Locked</span>
  )}
  {isAdmin && (
    <button className="btn btn-sm btn-outline-danger mb-1" onClick={() => handleDelete(f.id)}>Delete</button>
  )}
</td>

</tr>

)

}))}

</tbody>

</table>

</div>

</div>

</div>

);

}

export default Kitchen;