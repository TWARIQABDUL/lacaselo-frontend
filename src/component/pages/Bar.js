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

<div style={{background:"#F7F9FC",minHeight:"100vh",padding:"25px"}}>

{/* DASHBOARD */}

<div className="row g-4 mb-4">

<div className="col-md-3">
<div className="card border-0 shadow-lg" style={{borderRadius:"16px"}}>
<div className="card-body text-center">
<p style={{color:"#6B7280"}}>Total Sales</p>
<h2 style={{color:"#2563EB",fontWeight:"700"}}>RWF {formatNumber(totalSales)}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card border-0 shadow-lg" style={{borderRadius:"16px"}}>
<div className="card-body text-center">
<p style={{color:"#6B7280"}}>Total Profit</p>
<h2 style={{color:"#16A34A",fontWeight:"700"}}>RWF {formatNumber(totalProfit)}</h2>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card border-0 shadow-lg" style={{borderRadius:"16px"}}>
<div className="card-body text-center">
<p style={{color:"#6B7280"}}>Stock Value</p>
<h2 style={{color:"#0EA5A4",fontWeight:"700"}}>RWF {formatNumber(totalStockValue)}</h2>
</div>
</div>
</div>

<div className="col-md-3" style={{cursor:"pointer"}} onClick={()=>setShowLowStock(!showLowStock)}>
<div className="card border-0 shadow-lg" style={{borderRadius:"16px"}}>
<div className="card-body text-center">
<p style={{color:"#6B7280"}}>Low Stock</p>
<h2 style={{color:"#DC2626",fontWeight:"700"}}>{lowStockProducts.length}</h2>
</div>
</div>
</div>

</div>

{/* LOW STOCK TABLE */}

{showLowStock &&(

<div className="card shadow-lg mb-4 border-0" style={{borderRadius:"16px"}}>

<div style={{background:"#DC2626",color:"white",padding:"12px",borderRadius:"16px 16px 0 0"}}>
Low Stock Drinks
</div>

<table className="table text-center mb-0">

<thead style={{background:"#1A2238",color:"white"}}>
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
<td style={{color:"#DC2626",fontWeight:"600"}}>{p.closing_stock}</td>
</tr>
))}

</tbody>

</table>

</div>

)}

{/* HEADER */}

<div className="card shadow-lg mb-4 border-0" style={{borderRadius:"16px"}}>

<div className="card-body d-flex justify-content-between align-items-center">

<h4 style={{fontWeight:"700",color:"#1A2238"}}>Bar Management</h4>

<div className="d-flex align-items-center gap-2">

<button className="btn btn-dark btn-sm" onClick={()=>changeDate(-1)}>◀</button>

<strong>{selectedDate}</strong>

<button className="btn btn-dark btn-sm" disabled={selectedDate===today} onClick={()=>changeDate(1)}>▶</button>

<button
onClick={handleAdd}
style={{
marginLeft:"10px",
background:"#2563EB",
color:"white",
border:"none",
padding:"8px 20px",
borderRadius:"25px",
fontWeight:"600",
boxShadow:"0 6px 15px rgba(0,0,0,0.2)"
}}
>
➕ Add Drink
</button>

</div>

</div>

</div>

{/* TABLE */}

<div className="card shadow-lg border-0" style={{borderRadius:"16px"}}>

<div className="table-responsive">

<table className="table table-hover text-center align-middle">

<thead style={{background:"#1A2238",color:"white"}}>

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
):(products.map((p,i)=>{

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

<tr key={p.id} style={{background:isLow?"#FEE2E2":"white"}}>

<td>{i+1}</td>

<td style={{fontWeight:"600"}}>{p.name}</td>

<td>{formatNumber(cost)}</td>

<td>{formatNumber(price)}</td>

<td>{opening}</td>

<td>
<input
type="number"
className="form-control form-control-sm text-center"
value={entree}
onChange={(e)=>handleEntreeChange(p.id,e.target.value)}
/>
</td>

<td style={{fontWeight:"600"}}>{total}</td>

<td>
<input
type="number"
className="form-control form-control-sm text-center"
value={sold}
onChange={(e)=>handleSoldChange(p.id,e.target.value)}
/>
</td>

<td className={isLow?"text-danger fw-bold":""}>{closing}</td>

<td style={{color:"#16A34A",fontWeight:"700"}}>{formatNumber(sales)}</td>

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

export default Bar;