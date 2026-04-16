import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import jsPDF from "jspdf";
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

  const sigPad = useRef(null);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  const addSession = () => {
    setSessions([
      ...sessions,
      { type: "Robotik", start: "", end: "", device: "Cyberdyne" }
    ]);
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

  // 🔥 PREMIUM PDF FUNCTION
  const generatePDF = async () => {
    const element = document.getElementById("report");

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${patient}_Clinical_Report.pdf`);
  };

  const submit = async () => {
    if (!patient || !therapist || sessions.length === 0) {
      alert("Please complete all required fields");
      return;
    }

    if (!consent) {
      alert("Patient consent is required");
      return;
    }

    if (!verified) {
      alert("Therapist verification required");
      return;
    }

    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert("Patient signature required");
      return;
    }

    try {
      const signature = sigPad.current.toDataURL();

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
        signature,
        consent: "YES",
        verified: "YES",
        status: "Completed",
        date: new Date().toLocaleString()
      });

      alert("✅ Saved successfully!");

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
      alert("❌ Error saving data");
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
    <div className="bg-gray-100 min-h-screen p-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-5 rounded mb-6 shadow">
        <h1 className="text-2xl font-bold">
          e-Rehab Clinical Documentation System
        </h1>
        <p className="text-sm">Developed by Hazwani Ahmad Yusof</p>
      </div>

      {/* DASHBOARD */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Patients</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Sessions</p>
          <h2 className="text-2xl font-bold">{robotik + physio + ot}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <Pie data={chartData} />
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white p-6 rounded shadow max-w-2xl">

        <h2 className="text-xl font-semibold mb-4">Treatment Entry</h2>

        <input value={patient} placeholder="Patient Name"
          className="border p-2 w-full mb-2"
          onChange={e => setPatient(e.target.value)} />

        <input value={patientID} placeholder="Patient ID / IC"
          className="border p-2 w-full mb-4"
          onChange={e => setPatientID(e.target.value)} />

        <input value={therapist} placeholder="Therapist Name"
          className="border p-2 w-full mb-2"
          onChange={e => setTherapist(e.target.value)} />

        <select className="border p-2 w-full mb-4"
          value={role} onChange={e => setRole(e.target.value)}>
          <option>Physio</option>
          <option>OT</option>
          <option>Rehab</option>
        </select>

        {sessions.map((s, i) => (
          <div key={i} className="border p-3 mb-3 rounded">
            <select className="border p-2 w-full mb-2"
              onChange={e => updateSession(i, "type", e.target.value)}>
              <option>Robotik</option>
              <option>Physio</option>
              <option>OT</option>
            </select>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="time" className="border p-2"
                onChange={e => updateSession(i, "start", e.target.value)} />
              <input type="time" className="border p-2"
                onChange={e => updateSession(i, "end", e.target.value)} />
            </div>

            <select className="border p-2 w-full"
              onChange={e => updateSession(i, "device", e.target.value)}>
              <option>Cyberdyne</option>
              <option>Manual</option>
            </select>

            <p className="text-sm mt-2 text-gray-500">
              Duration: {calculateDuration(s.start, s.end)}
            </p>
          </div>
        ))}

        <button onClick={addSession}
          className="bg-blue-600 text-white px-4 py-2 mb-4">
          + Add Session
        </button>

        <textarea placeholder="Session Notes"
          className="border p-2 w-full mb-4"
          onChange={e => setNotes(e.target.value)} />

        <label className="flex items-center mb-2">
          <input type="checkbox" checked={consent}
            onChange={() => setConsent(!consent)} className="mr-2" />
          Patient confirms treatment received
        </label>

        <label className="flex items-center mb-4">
          <input type="checkbox" checked={verified}
            onChange={() => setVerified(!verified)} className="mr-2" />
          Therapist verifies session
        </label>

        <p className="font-semibold mb-2">Patient Signature</p>
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{ className: "border w-full h-40 bg-white mb-4" }}
        />

        <button onClick={submit}
          className="bg-green-600 text-white px-4 py-2 w-full">
          Submit Treatment
        </button>

        <button onClick={generatePDF}
          className="bg-black text-white px-4 py-2 w-full mt-3">
          Generate Premium PDF
        </button>

      </div>

      {/* PDF TEMPLATE (HIDDEN) */}
      <div id="report" className="bg-white p-8 mt-6 text-black">
        <h1 className="text-xl font-bold text-center mb-2">
          e-Rehab Clinical Treatment Report
        </h1>
        <p className="text-center text-sm mb-4">
          PKTAAB, Universiti Sains Malaysia
        </p>

        <p><b>Patient:</b> {patient}</p>
        <p><b>ID:</b> {patientID}</p>
        <p><b>Therapist:</b> {therapist}</p>

        <hr className="my-3"/>

        {sessions.map((s, i) => (
          <p key={i}>
            {s.type} | {s.start}-{s.end} | {calculateDuration(s.start, s.end)}
          </p>
        ))}

        <p className="mt-3"><b>Notes:</b> {notes}</p>

        <p className="mt-3">Consent: {consent ? "YES" : "NO"}</p>
        <p>Verified: {verified ? "YES" : "NO"}</p>

        <img src={sigPad.current?.toDataURL()} className="w-40 mt-4"/>
      </div>

    </div>
  );
}
