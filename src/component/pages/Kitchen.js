import React, { useEffect, useState } from "react";
import axios from "axios";

function Kitchen(){

const today = new Date().toISOString().split("T")[0];

const [foods,setFoods]=useState([]);
const [selectedDate,setSelectedDate]=useState(today);
const [loading,setLoading]=useState(false);

const [totalSales,setTotalSales]=useState(0);
const [totalProfit,setTotalProfit]=useState(0);

const API_URL="https://backend-vitq.onrender.com/api/kitchen";

const fetchFoods=async(date)=>{

try{

setLoading(true);

const res=await axios.get(API_URL,{params:{date}});

const list=res.data.foods||[];

setFoods(list);

let sales=0;
let profit=0;

list.forEach((f)=>{

const sold=Number(f.sold||0);
const price=Number(f.price||0);
const cost=Number(f.initial_price||0);

sales+=sold*price;
profit+=sold*(price-cost);

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

fetchFoods(selectedDate);

},[selectedDate]);

const handleSoldChange=async(id,value)=>{

await axios.put(`${API_URL}/sold/${id}`,{
sold:Number(value),
date:selectedDate
});

fetchFoods(selectedDate);

};

const handleAdd=async()=>{

const name=prompt("Food name");
const cost=Number(prompt("Cost"));
const price=Number(prompt("Selling price"));

await axios.post(API_URL,{
name,
initial_price:cost,
price,
date:selectedDate
});

fetchFoods(selectedDate);

};

const formatNumber=(v)=>Number(v||0).toLocaleString();

return(

<div className="container mt-4">

{/* HEADER */}

<div className="card shadow-lg mb-4 border-0" style={{borderRadius:"15px"}}>

<div className="card-body d-flex justify-content-between align-items-center">

<h4 className="fw-bold">Kitchen</h4>

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
+ Add Food
</button>

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

<div className="card shadow-lg border-0 rounded-4">

<div className="table-responsive">

<table
className="table table-hover text-center mb-0"
style={{borderCollapse:"separate",borderSpacing:"0 8px"}}
>

<thead style={{background:"#1C1C1C",color:"#fff"}}>

<tr>

<th>#</th>

<th>Food</th>

<th>Price</th>

<th>Sold</th>

<th>Sales</th>

</tr>

</thead>

<tbody>

{loading?(
<tr><td colSpan="5">Loading...</td></tr>
):foods.length===0?(
<tr><td colSpan="5">No food</td></tr>
):(foods.map((f,i)=>{

const sold=Number(f.sold||0);
const sales=sold*Number(f.price||0);

return(

<tr
key={f.id}
style={{background:"#F9F9F9"}}
className="shadow-sm"
>

<td>{i+1}</td>

<td>{f.name}</td>

<td>RWF {formatNumber(f.price)}</td>

<td>

<input
type="number"
className="form-control form-control-sm"
value={sold}
onChange={(e)=>handleSoldChange(f.id,e.target.value)}
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

export default Kitchen;