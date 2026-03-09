import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

function ActivityLogs() {

const [logs,setLogs] = useState([]);

useEffect(()=>{

fetchLogs();

},[]);

const fetchLogs = async()=>{

const res = await axios.get(`${API_BASE_URL}/logs`,
{
headers:{
Authorization:`Bearer ${localStorage.getItem("token")}`
}
}
);

setLogs(res.data);

};

return(

<div className="container mt-4">

<h3>System Activity Logs</h3>

<table className="table table-striped">

<thead>
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

</tbody>

</table>

</div>

);

}

export default ActivityLogs;