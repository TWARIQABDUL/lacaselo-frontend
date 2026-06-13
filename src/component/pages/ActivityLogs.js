import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function ActivityLogs() {

const [logs, setLogs] = useState([]);
const today = new Date().toISOString().split("T")[0];
const [date, setDate] = useState(today);
const [search, setSearch] = useState("");

useEffect(() => {
  fetchLogs();
}, [date, search]);

const changeDate = (days) => {
  const baseDate = date ? new Date(date) : new Date(today);
  baseDate.setDate(baseDate.getDate() + days);
  const formatted = baseDate.toISOString().split("T")[0];
  if (formatted > today) return;
  setDate(formatted);
};

const fetchLogs = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/logs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      params: {
        date,
        search
      }
    });

    const rawLogs = Array.isArray(res.data) ? res.data : [];
    
    // Calculate how many times each product was changed
    const productCounts = {};
    rawLogs.forEach(l => {
       if (l.product_name && l.product_name !== "-") {
          productCounts[l.product_name] = (productCounts[l.product_name] || 0) + 1;
       }
    });
    
    // Attach counts
    const finalLogs = rawLogs.map(l => ({
       ...l,
       changeCount: (l.product_name && l.product_name !== "-") ? productCounts[l.product_name] : 0
    }));

    setLogs(finalLogs);
  } catch (error) {
    console.error("Error fetching logs", error);
  }
};

return(

<div className="container mt-4">

<h3 className="mb-4">System Activity Logs</h3>

<div className="row mb-3 g-2">
  <div className="col-md-4">
    <label className="form-label d-block">Filter by Date</label>
    <div className="d-flex align-items-center gap-2 mt-2">
      <button
        className="btn btn-dark btn-sm"
        onClick={() => changeDate(-1)}
      >
        ◀
      </button>

      <strong>{date}</strong>

      <button
        className="btn btn-dark btn-sm"
        disabled={date === today}
        onClick={() => changeDate(1)}
      >
        ▶
      </button>
      
      <button 
        className="btn btn-outline-secondary btn-sm ms-2"
        onClick={() => setDate("")}
        style={{display: date ? 'block' : 'none'}}
      >
        Clear
      </button>
    </div>
  </div>
  <div className="col-md-5">
    <label className="form-label">Search Action / Product</label>
    <input 
      type="text" 
      className="form-control" 
      placeholder="e.g. Akaboga, Updated..." 
      value={search} 
      onChange={(e) => setSearch(e.target.value)} 
    />
  </div>
</div>

{search && (
  <div className="alert alert-info py-2">
    <strong>Statistics:</strong> Found <strong>{logs.length}</strong> actions matching "{search}" {date ? `on ${date}` : 'across all dates'}.
  </div>
)}

<div className="table-responsive">
<table className="table table-striped table-hover table-bordered">

<thead className="table-dark">
<tr>
<th>User</th>
<th>Product</th>
<th>Action</th>
<th>Before</th>
<th>After</th>
<th>Changes</th>
<th>Time</th>
</tr>
</thead>

<tbody>

{logs.map(log=>(
<tr key={log.log_id}>
<td><strong>{log.username}</strong></td>
<td><span className="badge bg-primary text-wrap" style={{maxWidth: "150px"}}>{log.product_name}</span></td>
<td>{log.action_type || log.action}</td>
<td className="text-danger"><strong>{log.before_val || "-"}</strong></td>
<td className="text-success"><strong>{log.after_val || "-"}</strong></td>
<td>
  {log.changeCount > 0 ? (
    <span className="badge bg-warning text-dark">{log.changeCount} times</span>
  ) : "-"}
</td>
<td>{new Date(log.created_at).toLocaleString()}</td>
</tr>
))}

{logs.length === 0 && (
  <tr>
    <td colSpan="7" className="text-center py-4">No activity logs found for the given filters.</td>
  </tr>
)}

</tbody>

</table>
</div>

</div>

);

}

export default ActivityLogs;