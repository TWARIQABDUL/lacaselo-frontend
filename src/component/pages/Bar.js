import React, { useEffect, useState } from "react";
import axios from "axios";

function Bar() {

const today = new Date().toISOString().split("T")[0];

const [products,setProducts] = useState([]);
const [selectedDate,setSelectedDate] = useState(today);
const [loading,setLoading] = useState(false);

const [totalSales,setTotalSales] = useState(0);
const [totalProfit,setTotalProfit] = useState(0);
const [totalStockValue,setTotalStockValue] = useState(0);

const [lowStockProducts,setLowStockProducts] = useState([]);
const [showLowStock,setShowLowStock] = useState(false);

const API_URL="https://backend-vitq.onrender.com/api/bar";

const fetchProducts = async(date)=>{

try{

setLoading(true);

const res = await axios.get(API_URL,{params:{date}});

const list = res.data.products || [];

setProducts(list);

let sales=0;
let profit=0;
let stockValue=0;

const lowProducts=[];

list.forEach((p)=>{

const opening = Number(p.opening_stock||0);
const entree = Number(p.entree||0);
const sold = Number(p.sold||0);
const price = Number(p.price||0);
const cost = Number(p.initial_price||0);

const closing = opening + entree - sold;

sales += sold*price;
profit += sold*(price-cost);
stockValue += closing*cost;

if(closing < 5){

lowProducts.push({...p,closing_stock:closing});

}

});

setTotalSales(sales);
setTotalProfit(profit);
setTotalStockValue(stockValue);
setLowStockProducts(lowProducts);

}catch(err){

console.error(err);
setProducts([]);

}finally{

setLoading(false);

}

};

useEffect(()=>{

fetchProducts(selectedDate);

},[selectedDate]);

const changeDate=(days)=>{

const newDate=new Date(selectedDate);

newDate.setDate(newDate.getDate()+days);

const formatted=newDate.toISOString().split("T")[0];

if(formatted>today)return;

setSelectedDate(formatted);

};

const handleAdd=async()=>{

const name=prompt("Product name");
if(!name)return;

const initial_price=Number(prompt("Cost price"));
const price=Number(prompt("Selling price"));
const opening_stock=Number(prompt("Opening stock"));

try{

await axios.post(API_URL,{
name,
initial_price,
price,
opening_stock,
date:selectedDate
});

fetchProducts(selectedDate);

}catch(err){

console.error(err);

}

};

const handleEntreeChange=async(id,value)=>{

await axios.put(`${API_URL}/entree/${id}`,{
entree:Number(value),
date:selectedDate
});

fetchProducts(selectedDate);

};

const handleSoldChange=async(id,value)=>{

await axios.put(`${API_URL}/sold/${id}`,{
sold:Number(value),
date:selectedDate
});

fetchProducts(selectedDate);

};

const formatNumber=(v)=>Number(v||0).toLocaleString();

return(

<div className="container-fluid mt-4">

{/* DASHBOARD */}

<div className="row g-4 mb-4">

<div className="col-md-3">
<div className="card shadow border-0 text-white" style={{background:"#0B3D2E"}}>
<div className="card-body text-center">
<h6>Total Sales</h6>
<h3>RWF {formatNumber(totalSales)}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow border-0" style={{background:"#D4AF37"}}>
<div className="card-body text-center">
<h6>Total Profit</h6>
<h3>RWF {formatNumber(totalProfit)}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow border-0 text-white" style={{background:"#0E6251"}}>
<div className="card-body text-center">
<h6>Stock Value</h6>
<h3>RWF {formatNumber(totalStockValue)}</h3>
</div>
</div>
</div>

<div className="col-md-3" style={{cursor:"pointer"}} onClick={()=>setShowLowStock(!showLowStock)}>
<div className="card shadow border-0 text-white" style={{background:"#C0392B"}}>
<div className="card-body text-center">
<h6>Low Stock</h6>
<h3>{lowStockProducts.length}</h3>
</div>
</div>
</div>

</div>

{/* LOW STOCK TABLE */}

{showLowStock &&(

<div className="card shadow mb-4">

<div className="card-header bg-danger text-white">
Low Stock Drinks
</div>

<table className="table table-bordered text-center mb-0">

<thead className="table-dark">
<tr>
<th>#</th>
<th>Drink</th>
<th>Remaining</th>
</tr>
</thead>

<tbody>

{lowStockProducts.map((p,i)=>(
<tr key={p.id}>
<td>{i+1}</td>
<td>{p.name}</td>
<td className="text-danger fw-bold">{p.closing_stock}</td>
</tr>
))}

</tbody>

</table>

</div>

)}

{/* HEADER */}

<div className="card shadow mb-4">

<div className="card-body d-flex justify-content-between align-items-center">

<h4 className="fw-bold">Bar</h4>

<div className="d-flex align-items-center gap-2">

<button className="btn btn-outline-dark btn-sm" onClick={()=>changeDate(-1)}>◀</button>

<strong>{selectedDate}</strong>

<button className="btn btn-outline-dark btn-sm" disabled={selectedDate===today} onClick={()=>changeDate(1)}>▶</button>

<button
className="btn ms-3 d-flex align-items-center gap-2 px-4 py-2 shadow"
onClick={handleAdd}
style={{
background:"#0B3D2E",
color:"white",
borderRadius:"50px",
fontWeight:"600"
}}
>
➕ Add Drink
</button>

</div>

</div>

</div>

{/* TABLE */}

<div className="card shadow">

<div className="table-responsive">

<table className="table table-bordered table-hover text-center">

<thead className="table-dark">

<tr>
<th>#</th>
<th>Drink</th>
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
):products.length===0?(
<tr><td colSpan="10">No drinks</td></tr>
):(

products.map((p,i)=>{

const opening=Number(p.opening_stock||0);
const entree=Number(p.entree||0);
const sold=Number(p.sold||0);
const price=Number(p.price||0);
const cost=Number(p.initial_price||0);

const total=opening+entree;
const closing=total-sold;
const sales=sold*price;

const isLow=closing<5;

return(

<tr key={p.id} style={{background:isLow?"#ffcccc":"white"}}>

<td>{i+1}</td>

<td>{p.name}</td>

<td>{formatNumber(cost)}</td>

<td>{formatNumber(price)}</td>

<td>{opening}</td>

<td>

<input
type="number"
className="form-control form-control-sm"
value={entree}
onChange={(e)=>handleEntreeChange(p.id,e.target.value)}
/>

</td>

<td>{total}</td>

<td>

<input
type="number"
className="form-control form-control-sm"
value={sold}
onChange={(e)=>handleSoldChange(p.id,e.target.value)}
/>

</td>

<td className={isLow?"text-danger fw-bold":""}>{closing}</td>

<td className="text-success fw-bold">{formatNumber(sales)}</td>

</tr>

)

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