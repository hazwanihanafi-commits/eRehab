import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function PatientDetail({ patient, setPage }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(API).then(res => {
      const filtered = res.data.filter(d => d.patient === patient);
      setData(filtered);
    });
  }, [patient]);

  const generatePDF = async () => {
    const el = document.getElementById("pdf");

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(img, "PNG", 0, 0, 210, 297);
    pdf.save(`${patient}.pdf`);
  };

  return (
    <div>
      <p onClick={() => setPage("patients")}>← Back</p>

      <button className="btn-dark" onClick={generatePDF}>
        Export PDF
      </button>

      <div id="pdf" className="card">
        {data.map((d, i) => (
          <div key={i}>
            <p>Date: {d.date}</p>
            <p>Therapist: {d.therapist}</p>

            <img src={d.signature} style={{ width: 120 }} />

            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
