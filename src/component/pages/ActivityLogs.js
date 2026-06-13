import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function ActivityLogs() {

const [logs, setLogs] = useState([]);
const [date, setDate] = useState("");
const [search, setSearch] = useState("");

useEffect(() => {
  fetchLogs();
}, [date, search]);

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
    setLogs(res.data);
  } catch (error) {
    console.error("Error fetching logs", error);
  }
};

return(

<div className="container mt-4">

<h3 className="mb-4">System Activity Logs</h3>

<div className="row mb-3 g-2">
  <div className="col-md-3">
    <label className="form-label">Filter by Date</label>
    <input 
      type="date" 
      className="form-control" 
      value={date} 
      onChange={(e) => setDate(e.target.value)} 
    />
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
<th>Action</th>
<th>Page</th>
<th>Branch</th>
<th>Time</th>
</tr>
</thead>

<tbody>

{logs.map(log=>(
<tr key={log.log_id}>
<td>{log.username}</td>
<td>{log.action}</td>
<td>{log.page}</td>
<td>{log.branch_id}</td>
<td>{new Date(log.created_at).toLocaleString()}</td>
</tr>
))}

{logs.length === 0 && (
  <tr>
    <td colSpan="5" className="text-center py-4">No activity logs found for the given filters.</td>
  </tr>
)}

</tbody>

</table>
</div>

</div>

);

}

export default ActivityLogs;