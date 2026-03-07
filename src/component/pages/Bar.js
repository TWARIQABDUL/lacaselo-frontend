import React, { useEffect, useState } from "react";
import axios from "axios";

function Bar(){

const today = new Date().toISOString().split("T")[0];

const [products,setProducts] = useState([]);
const [selectedDate,setSelectedDate] = useState(today);
const [loading,setLoading] = useState(false);

const [search,setSearch] = useState("");

const [totalSales,setTotalSales] = useState(0);
const [totalProfit,setTotalProfit] = useState(0);
const [totalStockValue,setTotalStockValue] = useState(0);

const [lowStockProducts,setLowStockProducts] = useState([]);
const [showLowStock,setShowLowStock] = useState(false);

const [showModal,setShowModal] = useState(false);

const [newProduct,setNewProduct] = useState({
name:"",
initial_price:"",
price:"",
opening_stock:""
});

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

try{

await axios.post(API_URL,{
...newProduct,
date:selectedDate
});

setShowModal(false);

setNewProduct({
name:"",
initial_price:"",
price:"",
opening_stock:""
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

const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(search.toLowerCase())
);

return(

<div className="container-fluid py-4">

{/* DASHBOARD */}

<div className="row g-4 mb-4">

<div className="col-md-3">
<div className="card shadow border-0 h-100">
<div className="card-body text-center">
<h6 className="text-muted">Total Sales</h6>
<h3 className="text-success fw-bold">RWF {formatNumber(totalSales)}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow border-0 h-100">
<div className="card-body text-center">
<h6 className="text-muted">Total Profit</h6>
<h3 className="text-warning fw-bold">RWF {formatNumber(totalProfit)}</h3>
</div>
</div>
</div>

<div className="col-md-3">
<div className="card shadow border-0 h-100">
<div className="card-body text-center">
<h6 className="text-muted">Stock Value</h6>
<h3 className="text-primary fw-bold">RWF {formatNumber(totalStockValue)}</h3>
</div>
</div>
</div>

<div className="col-md-3" style={{cursor:"pointer"}} onClick={()=>setShowLowStock(!showLowStock)}>
<div className="card shadow border-0 bg-danger text-white h-100">
<div className="card-body text-center">
<h6>Low Stock</h6>
<h3>{lowStockProducts.length}</h3>
</div>
</div>
</div>

</div>

{/* LOW STOCK */}

{showLowStock &&(

<div className="card shadow mb-4">

<div className="card-header bg-danger text-white">
Low Stock Drinks
</div>

<table className="table text-center mb-0">

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

<div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">

<h4 className="fw-bold">🍷 Bar Inventory</h4>

<div className="d-flex gap-3 align-items-center">

<input
type="text"
placeholder="Search drink..."
className="form-control"
style={{width:"200px"}}
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<button className="btn btn-light" onClick={()=>changeDate(-1)}>◀</button>

<strong>{selectedDate}</strong>

<button className="btn btn-light" disabled={selectedDate===today} onClick={()=>changeDate(1)}>▶</button>

<button
className="btn text-white"
style={{background:"#0B3D2E"}}
onClick={()=>setShowModal(true)}
>
➕ Add Drink
</button>

</div>

</div>

</div>

{/* TABLE */}

<div className="card shadow">

<div className="table-responsive" style={{maxHeight:"600px"}}>

<table className="table table-hover text-center">

<thead className="table-dark" style={{position:"sticky",top:0}}>

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
):filteredProducts.length===0?(
<tr><td colSpan="10">No drinks</td></tr>
):(filteredProducts.map((p,i)=>{

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

<tr key={p.id} style={{background:isLow?"#ffe5e5":""}}>

<td>{i+1}</td>
<td className="fw-bold">{p.name}</td>
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

}))}

</tbody>

</table>

</div>

</div>

{/* ADD MODAL */}

{showModal &&(

<div className="modal d-block" style={{background:"rgba(0,0,0,0.5)"}}>

<div className="modal-dialog">

<div className="modal-content">

<div className="modal-header">

<h5>Add Drink</h5>

<button className="btn-close" onClick={()=>setShowModal(false)}></button>

</div>

<div className="modal-body">

<input
className="form-control mb-3"
placeholder="Drink name"
value={newProduct.name}
onChange={(e)=>setNewProduct({...newProduct,name:e.target.value})}
/>

<input
className="form-control mb-3"
placeholder="Cost price"
type="number"
value={newProduct.initial_price}
onChange={(e)=>setNewProduct({...newProduct,initial_price:e.target.value})}
/>

<input
className="form-control mb-3"
placeholder="Selling price"
type="number"
value={newProduct.price}
onChange={(e)=>setNewProduct({...newProduct,price:e.target.value})}
/>

<input
className="form-control"
placeholder="Opening stock"
type="number"
value={newProduct.opening_stock}
onChange={(e)=>setNewProduct({...newProduct,opening_stock:e.target.value})}
/>

</div>

<div className="modal-footer">

<button className="btn btn-secondary" onClick={()=>setShowModal(false)}>
Cancel
</button>

<button className="btn btn-success" onClick={handleAdd}>
Add Drink
</button>

</div>

</div>

</div>

</div>

)}

</div>

);

}

export default Bar;