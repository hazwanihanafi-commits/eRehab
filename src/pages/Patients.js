import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Patients({ setPage, setSelectedPatient }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  const filtered = data.filter(d =>
    d.patient?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        placeholder="Search patient..."
        className="input"
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.map((p, i) => (
        <div key={i} className="card row">
          <div>
            <b>{p.patient}</b>
            <p>{p.patient_id}</p>
          </div>

          <button
            className="btn-blue"
            onClick={() => {
              setSelectedPatient(p.patient);
              setPage("detail");
            }}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}
