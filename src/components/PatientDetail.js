import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function PatientDetail({ name, setPage }) {
  const [data,setData]=useState([]);

  useEffect(()=>{
    axios.get(API).then(res=>setData(res.data));
  },[]);

  const patientData=data.filter(d=>d.patient===name);

  const trend={};

  patientData.forEach(row=>{
    const date=row.date?.split(",")[0];
    if(!trend[date]) trend[date]=0;

    try{
      trend[date]+=JSON.parse(row.sessions||"[]").length;
    }catch{}
  });

  const chartData={
    labels:Object.keys(trend),
    datasets:[{
      label:"Sessions",
      data:Object.values(trend)
    }]
  };

  const exportPDF=async()=>{
    const el=document.getElementById("report");
    const canvas=await html2canvas(el);
    const img=canvas.toDataURL("image/png");

    const pdf=new jsPDF();
    pdf.addImage(img,"PNG",0,0,210,0);
    pdf.save(name+"_report.pdf");
  };

  return (
    <div>

      <button onClick={()=>setPage("patients")}>← Back</button>

      <div className="card">
        <h2 className="font-bold">{name}</h2>

        <Line data={chartData}/>

        <button onClick={exportPDF} className="btn-dark mt-3">
          Export PDF
        </button>
      </div>

      <div id="report" className="bg-white p-6">

        <h2>Clinical Report</h2>

        {patientData.map((r,i)=>(
          <div key={i}>
            <p>{r.date}</p>
            <p>{r.therapist}</p>

            {r.signature?.startsWith("data:image") && (
              <img src={r.signature} width={120}/>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}
