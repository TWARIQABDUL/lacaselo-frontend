import React, { useEffect, useState } from "react";
import axios from "axios";

function Bar() {

const today = new Date().toISOString().split("T")[0];

const [products,setProducts] = useState([]);
const [selectedDate,setSelectedDate] = useState(today);
const [loading,setLoading] = useState(false);

const [totalSales,setTotalSales] = useState(0);
const [totalProfit,setTotalProfit] = useState(0);

const API_URL="https://backend-vitq.onrender.com/api/bar";

const fetchProducts = async(date)=>{

try{

setLoading(true);

const res = await axios.get(API_URL,{params:{date}});

const list = res.data.products || [];

setProducts(list);

let sales=0;
let profit=0;

list.forEach((p)=>{

const sold = Number(p.sold||0);
const price = Number(p.price||0);
const cost = Number(p.initial_price||0);

sales += sold*price;
profit += sold*(price-cost);

});

setTotalSales(sales);
setTotalProfit(profit);

}catch(err){

console.error(err);

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

const handleAdd = async()=>{

const name = prompt("Drink name:");
const cost = Number(prompt("Cost price:"));
const price = Number(prompt("Selling price:"));
const opening_stock = Number(prompt("Opening stock:"));

await axios.post(API_URL,{
name,
initial_price:cost,
price,
opening_stock,
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

<div className="container mt-4">

{/* HEADER */}

<div className="card shadow-lg mb-4 border-0" style={{borderRadius:"15px"}}>

<div className="card-body d-flex justify-content-between align-items-center">

<h4 className="fw-bold mb-0">Bar</h4>

<div className="d-flex gap-2">

<button className="btn btn-outline-dark btn-sm" onClick={()=>changeDate(-1)}>◀</button>

<strong>{selectedDate}</strong>

<button className="btn btn-outline-dark btn-sm" disabled={selectedDate===today} onClick={()=>changeDate(1)}>▶</button>

<button
className="btn shadow-sm"
onClick={handleAdd}
style={{
background:"linear-gradient(90deg,#0F2027,#203A43,#2C5364)",
color:"#fff",
fontWeight:"600",
borderRadius:"10px"
}}
>
+ Add Drink
</button>

</div>

</div>

</div>

{/* SUMMARY */}

<div className="row g-4 mb-4">

<div className="col-md-6">

<div className="card shadow border-0 rounded-3" style={{background:"#D4AF37"}}>

<div className="card-body text-center">

<h6>Total Sales</h6>

<h4>RWF {formatNumber(totalSales)}</h4>

</div>

</div>

</div>

<div className="col-md-6">

<div className="card shadow border-0 rounded-3" style={{background:"#0E6251",color:"#fff"}}>

<div className="card-body text-center">

<h6>Total Profit</h6>

<h4>RWF {formatNumber(totalProfit)}</h4>

</div>

</div>

</div>

</div>

{/* TABLE */}

<div className="card shadow-lg border-0 rounded-4" style={{overflow:"hidden"}}>

<div className="table-responsive">

<table
className="table table-hover text-center mb-0"
style={{borderCollapse:"separate",borderSpacing:"0 8px"}}
>

<thead style={{background:"#1C1C1C",color:"#fff"}}>

<tr>

<th>#</th>

<th>Drink</th>

<th>Price</th>

<th>Sold</th>

<th>Sales</th>

</tr>

</thead>

<tbody>

{loading?(
<tr><td colSpan="5">Loading...</td></tr>
):products.length===0?(
<tr><td colSpan="5">No drinks</td></tr>
):(products.map((p,i)=>{

const sold=Number(p.sold||0);
const sales=sold*Number(p.price||0);

return(

<tr
key={p.id}
style={{background:"#F9F9F9"}}
className="shadow-sm"
>

<td>{i+1}</td>

<td>{p.name}</td>

<td>RWF {formatNumber(p.price)}</td>

<td>

<input
type="number"
className="form-control form-control-sm"
value={sold}
onChange={(e)=>handleSoldChange(p.id,e.target.value)}
/>

</td>

<td className="fw-bold text-success">
RWF {formatNumber(sales)}
</td>

</tr>

)

}))}

</tbody>

</table>

</div>

</div>

</div>

)

}

export default Bar;