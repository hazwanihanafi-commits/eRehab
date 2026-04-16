import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement);

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function PatientDetail({ patient }) {
  const [data, setData] = useState([]);

  useEffect(()=>{
    axios.get(API).then(res=>{
      setData(res.data.filter(d=>d.patient===patient));
    });
  },[patient]);

  // TREND GRAPH
  const trend={};
  data.forEach(d=>{
    const date=d.date?.split(",")[0];
    if(!trend[date]) trend[date]=0;
    trend[date]++;
  });

  const trendData={
    labels:Object.keys(trend),
    datasets:[{
      label:"Sessions",
      data:Object.values(trend),
      borderColor:"#2563eb",
      backgroundColor:"rgba(37,99,235,0.2)",
      fill:true
    }]
  };

  // PDF
  const generatePDF = async () => {
    const el=document.getElementById("pdf");

    const canvas=await html2canvas(el);
    const img=canvas.toDataURL("image/png");

    const pdf=new jsPDF();
    pdf.addImage(img,"PNG",0,0,210,297);
    pdf.save(`${patient}.pdf`);
  };

  return(
    <div>

      <button className="btn-dark" onClick={generatePDF}>
        Export PDF
      </button>

      <div className="card">
        <Line data={trendData}/>
      </div>

      <div id="pdf" className="card">

        <h2>Clinical Report</h2>

        {data.map((d,i)=>(
          <div key={i}>
            <p><b>Date:</b> {d.date}</p>
            <p><b>Patient:</b> {d.patient}</p>
            <p><b>ID:</b> {d.patient_id}</p>
            <p><b>Therapist:</b> {d.therapist}</p>
            <p><b>Role:</b> {d.role}</p>
            <p><b>Notes:</b> {d.notes}</p>
            <p><b>Consent:</b> {d.consent}</p>
            <p><b>Verified:</b> {d.verified}</p>

            <img src={d.signature} style={{width:120}}/>

            <hr/>
          </div>
        ))}

      </div>

    </div>
  );
}
