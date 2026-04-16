import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  let robotik = 0, physio = 0, ot = 0;

  data.forEach(row => {
    try {
      const s = JSON.parse(row.sessions || "[]");
      s.forEach(x => {
        if (x.type === "Robotik") robotik++;
        if (x.type === "Physio") physio++;
        if (x.type === "OT") ot++;
      });
    } catch {}
  });

  const chartData = {
    labels: ["Robotik", "Physio", "OT"],
    datasets: [{
      data: [robotik, physio, ot],
      backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"]
    }]
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Total Patients</h3>
        <h2>{data.length}</h2>
      </div>

      <div className="card">
        <h3>Total Sessions</h3>
        <h2>{robotik + physio + ot}</h2>
      </div>

      <div className="card">
        <Pie data={chartData} />
      </div>
    </div>
  );
}
