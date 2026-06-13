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

const parseLogAction = (actionStr) => {
  let product = "-";
  let actionType = actionStr;
  let before = "-";
  let after = "-";

  try {
    if (actionStr.includes(" -> ")) {
      const arrowParts = actionStr.split(" -> ");
      if (arrowParts.length > 2) {
        const colonSplit = actionStr.indexOf(":");
        if (colonSplit !== -1) {
          const prefix = actionStr.substring(0, colonSplit).trim();
          product = prefix.replace(/^Edited /i, "").replace(/^Updated /i, "").trim();
          actionType = "Updated Multiple Fields";
          after = actionStr.substring(colonSplit + 1).trim();
        }
      } else {
        after = arrowParts[1].trim();
        const beforePart = arrowParts[0];
        const lastColon = beforePart.lastIndexOf(":");
        
        if (lastColon !== -1) {
          before = beforePart.substring(lastColon + 1).trim();
          let prefix = beforePart.substring(0, lastColon).trim();
          
          let fieldName = "";
          const secondLastColon = prefix.lastIndexOf(":");
          if (secondLastColon !== -1) {
             fieldName = prefix.substring(secondLastColon + 1).trim();
             prefix = prefix.substring(0, secondLastColon).trim();
          }
          
          if (prefix.includes(" for ")) {
            const forSplit = prefix.split(" for ");
            actionType = forSplit[0].trim();
            product = forSplit[1].trim();
          } else {
            actionType = prefix;
            product = prefix.split(" ").pop();
            actionType = actionType.replace(" " + product, "").trim();
          }
          
          if (fieldName) {
             actionType += ` [${fieldName}]`;
          }
        }
      }
    } else {
       if (actionStr.includes(" for date: ")) {
          const parts = actionStr.split(" for date: ");
          actionType = parts[0].trim();
          product = parts[1].trim();
       } else if (actionStr.includes(": ")) {
          const parts = actionStr.split(": ");
          actionType = parts[0].trim();
          product = parts[1].trim();
          if (product.includes(" with ")) {
             const subParts = product.split(" with ");
             product = subParts[0].trim();
             after = subParts[1].trim();
          } else if (product.includes(" (")) {
             const subParts = product.split(" (");
             product = subParts[0].trim();
             after = "(" + subParts[1].trim();
          }
       } else if (actionStr.includes("Paid ")) {
          const parts = actionStr.split("for Employee:");
          actionType = parts[0].trim();
          if (parts.length > 1) {
              const subParts = parts[1].split(".");
              product = subParts[0].trim();
              after = subParts[1] ? subParts[1].trim() : "-";
          }
       }
    }
  } catch(e) {
    actionType = actionStr;
  }
  
  product = product.replace(/^bar product /i, "")
                   .replace(/^kitchen product /i, "")
                   .replace(/^Expense /i, "")
                   .replace(/^User /i, "");
                   
  return { product, actionType, before, after };
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
    
    // Parse actions
    const parsedLogs = rawLogs.map(log => {
       const parsed = parseLogAction(log.action);
       return { ...log, ...parsed };
    });
    
    // Calculate how many times each product was changed
    const productCounts = {};
    parsedLogs.forEach(l => {
       if (l.product && l.product !== "-") {
          productCounts[l.product] = (productCounts[l.product] || 0) + 1;
       }
    });
    
    // Attach counts
    const finalLogs = parsedLogs.map(l => ({
       ...l,
       changeCount: (l.product && l.product !== "-") ? productCounts[l.product] : 0
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
<td><span className="badge bg-primary text-wrap" style={{maxWidth: "150px"}}>{log.product}</span></td>
<td>{log.actionType}</td>
<td className="text-danger"><strong>{log.before}</strong></td>
<td className="text-success"><strong>{log.after}</strong></td>
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