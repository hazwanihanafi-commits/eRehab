import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function App() {
  const [patient, setPatient] = useState("");
  const [patientID, setPatientID] = useState("");
  const [therapist, setTherapist] = useState("");
  const [role, setRole] = useState("Physio");
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState("");
  const [verified, setVerified] = useState(false);
  const [consent, setConsent] = useState(false);
  const [data, setData] = useState([]);
  const [signatureURL, setSignatureURL] = useState("");

  const sigPad = useRef(null);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  const addSession = () => {
    setSessions([...sessions, { type: "Robotik", start: "", end: "" }]);
  };

  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    return (e - s) / (1000 * 60) + " min";
  };

  const generatePDF = async () => {
    const element = document.getElementById("report");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${patient || "report"}.pdf`);
  };

  const submit = async () => {
    if (!patient || !therapist || sessions.length === 0) {
      alert("Complete required fields");
      return;
    }

    if (!consent || !verified) {
      alert("Consent & verification required");
      return;
    }

    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert("Signature required");
      return;
    }

    try {
      const signatureImage = sigPad.current.toDataURL();
      setSignatureURL(signatureImage);

      const enrichedSessions = sessions.map(s => ({
        ...s,
        duration: calculateDuration(s.start, s.end)
      }));

      await axios.post(API, {
        patient,
        patient_id: patientID,
        therapist,
        role,
        sessions: JSON.stringify(enrichedSessions),
        notes,
        signature: "SIGNED",
        consent: "YES",
        verified: "YES",
        status: "Completed",
        date: new Date().toLocaleString()
      });

      alert("✅ Saved");

      setPatient("");
      setPatientID("");
      setTherapist("");
      setSessions([]);
      setNotes("");
      setVerified(false);
      setConsent(false);
      sigPad.current.clear();

      axios.get(API).then(res => setData(res.data));

    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  let robotik = 0, physio = 0, ot = 0;

  data.forEach(row => {
    if (!row.sessions) return;
    try {
      const s = JSON.parse(row.sessions);
      s.forEach(x => {
        if (x.type === "Robotik") robotik++;
        if (x.type === "Physio") physio++;
        if (x.type === "OT") ot++;
      });
    } catch {}
  });

  const chartData = {
    labels: ["Robotik", "Physio", "OT"],
    datasets: [
      {
        data: [robotik, physio, ot],
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"]
      }
    ]
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">e-Rehab</h2>
        <ul className="space-y-4 text-sm">
          <li className="font-semibold">Dashboard</li>
          <li>Patients</li>
          <li>Treatment Entry</li>
          <li>Reports</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold">
            e-Rehab Clinical Documentation System
          </h1>
          <p className="text-sm">Developed by Hazwani Ahmad Yusof</p>
          <p className="text-xs">
            Pusat Kanser Tun Abdullah Ahmad Badawi (PKTAAB), USM
          </p>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p>Total Patients</p>
            <h2 className="text-2xl font-bold">{data.length}</h2>
          </div>

          <div className="card">
            <p>Total Sessions</p>
            <h2 className="text-2xl font-bold">
              {robotik + physio + ot}
            </h2>
          </div>

          <div className="card h-48 flex items-center justify-center">
            <Pie data={chartData} />
          </div>
        </div>

        {/* FORM */}
        <div className="card max-w-3xl">

          <h2 className="text-xl font-semibold mb-4">Treatment Entry</h2>

          <input placeholder="Patient Name" className="input"
            value={patient} onChange={e => setPatient(e.target.value)} />

          <input placeholder="Patient ID" className="input"
            value={patientID} onChange={e => setPatientID(e.target.value)} />

          <input placeholder="Therapist Name" className="input"
            value={therapist} onChange={e => setTherapist(e.target.value)} />

          <select className="input"
            value={role} onChange={e => setRole(e.target.value)}>
            <option>Physio</option>
            <option>OT</option>
            <option>Rehab</option>
          </select>

          {sessions.map((s, i) => (
            <div key={i} className="border p-3 rounded mb-3">
              <select className="input"
                onChange={e => updateSession(i, "type", e.target.value)}>
                <option>Robotik</option>
                <option>Physio</option>
                <option>OT</option>
              </select>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <input type="time" className="input"
                  onChange={e => updateSession(i, "start", e.target.value)} />
                <input type="time" className="input"
                  onChange={e => updateSession(i, "end", e.target.value)} />
              </div>

              <p className="text-sm mt-2 text-gray-500">
                {calculateDuration(s.start, s.end)}
              </p>
            </div>
          ))}

          <button onClick={addSession} className="btn-blue">
            + Add Session
          </button>

          <textarea placeholder="Notes" className="input mt-3"
            onChange={e => setNotes(e.target.value)} />

          <label className="flex items-center mt-3">
            <input type="checkbox" onChange={() => setConsent(!consent)} className="mr-2"/>
            Patient Consent
          </label>

          <label className="flex items-center">
            <input type="checkbox" onChange={() => setVerified(!verified)} className="mr-2"/>
            Therapist Verified
          </label>

          <SignatureCanvas
            ref={sigPad}
            canvasProps={{ className: "border w-full h-32 mt-3" }}
          />

          <button onClick={submit} className="btn-green mt-3">Submit</button>
          <button onClick={generatePDF} className="btn-dark mt-2">Generate PDF</button>

        </div>

        {/* PDF */}
        <div id="report" className="absolute left-[-9999px] bg-white p-10 w-[800px]">
          <h1 className="text-xl font-bold text-center mb-4">Clinical Report</h1>
          <p>Patient: {patient}</p>
          <p>ID: {patientID}</p>
          <p>Therapist: {therapist}</p>

          {sessions.map((s, i) => (
            <p key={i}>
              {s.type} | {s.start}-{s.end} | {calculateDuration(s.start, s.end)}
            </p>
          ))}

          {signatureURL && (
            <img src={signatureURL} className="w-40 mt-4" />
          )}
        </div>

      </div>
    </div>
  );
}
