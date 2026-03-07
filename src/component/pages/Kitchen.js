import React, { useEffect, useState } from "react";
import axios from "axios";

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

const API_URL="https://backend-vitq.onrender.com/api/kitchen";

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

useEffect(()=>{
fetchFoods(selectedDate);
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

const handleEntreeChange=async(id,value)=>{

await axios.put(`${API_URL}/entree/${id}`,{
entree:Number(value),
date:selectedDate
});

fetchFoods(selectedDate);

};

const handleSoldChange=async(id,value)=>{

await axios.put(`${API_URL}/sold/${id}`,{
sold:Number(value),
date:selectedDate
});

fetchFoods(selectedDate);

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
onChange={(e)=>handleEntreeChange(f.id,e.target.value)}
style={{borderRadius:"10px"}}
/>

</td>

<td>{total}</td>

<td>

<input
type="number"
className="form-control form-control-sm text-center"
value={sold}
onChange={(e)=>handleSoldChange(f.id,e.target.value)}
style={{borderRadius:"10px"}}
/>

</td>

<td className={isLow?"text-danger fw-bold":""}>{closing}</td>

<td className="text-success fw-bold">{formatNumber(sales)}</td>

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