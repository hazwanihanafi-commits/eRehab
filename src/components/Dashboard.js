import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);
import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  let robotik=0, physio=0, ot=0;

  data.forEach(row=>{
    try {
      JSON.parse(row.sessions||"[]").forEach(s=>{
        if(s.type==="Robotik") robotik++;
        if(s.type==="Physio") physio++;
        if(s.type==="OT") ot++;
      });
    } catch {}
  });

  const chartData = {
    labels:["Robotik","Physio","OT"],
    datasets:[{
      data:[robotik,physio,ot]
    }]
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">

      <div className="card">
        Total Patients
        <h2>{data.length}</h2>
      </div>

      <div className="card">
        Total Sessions
        <h2>{robotik+physio+ot}</h2>
      </div>

      <div className="card">
        <Pie data={chartData}/>
      </div>

    </div>
  );
}
