import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function App() {

  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState("");

  const [patient, setPatient] = useState("");
  const [patientID, setPatientID] = useState("");
  const [therapist, setTherapist] = useState("");
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [verified, setVerified] = useState(false);

  const sigPad = useRef();

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  // ================= DURATION =================
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    const diff = (e - s) / (1000 * 60);

    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return `${h}h ${m}min`;
  };

  // ================= SESSION =================
  const addSession = () => {
    setSessions([...sessions, { type: "Robotik", start: "", end: "" }]);
  };

  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  // ================= STATS =================
  const getStats = () => {
    let r = 0, p = 0, o = 0;

    data.forEach(row => {
      try {
        const s = JSON.parse(row.sessions || "[]");
        s.forEach(x => {
          if (x.type === "Robotik") r++;
          if (x.type === "Physio") p++;
          if (x.type === "OT") o++;
        });
      } catch {}
    });

    return { r, p, o };
  };

  const stats = getStats();

  const chartData = {
    labels: ["Robotik", "Physio", "OT"],
    datasets: [{
      data: [stats.r, stats.p, stats.o],
      backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"]
    }]
  };

  // ================= SUBMIT =================
  const submit = async () => {

    if (!patient || !therapist || sessions.length === 0)
      return alert("Fill required fields");

    if (!consent || !verified)
      return alert("Consent & verification required");

    const signature = sigPad.current?.toDataURL("image/png") || "";

    const enriched = sessions.map(s => ({
      ...s,
      duration: calculateDuration(s.start, s.end)
    }));

    await axios.post(API, {
      patient,
      patient_id: patientID,
      therapist,
      sessions: JSON.stringify(enriched),
      notes,
      signature,
      consent: "YES",
      verified: "YES",
      status: "Completed",
      date: new Date().toLocaleString()
    });

    alert("Saved ✅");

    setPatient("");
    setPatientID("");
    setTherapist("");
    setSessions([]);
    setNotes("");
    setConsent(false);
    setVerified(false);
    sigPad.current.clear();

    axios.get(API).then(res => setData(res.data));
    setPage("patients");
  };

  // ================= PDF =================
  const generatePDF = async () => {

    const element = document.getElementById("report");

    const canvas = await html2canvas(element, { scale: 2 });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);

    pdf.save(`${selectedPatient}_report.pdf`);
  };

  // ================= UI =================
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="hidden md:block w-60 bg-blue-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">e-Rehab</h2>
        <ul className="space-y-3">
          <li onClick={() => setPage("dashboard")} className="cursor-pointer">Dashboard</li>
          <li onClick={() => setPage("patients")} className="cursor-pointer">Patients</li>
          <li onClick={() => setPage("entry")} className="cursor-pointer">Entry</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-6">

        {/* HEADER */}
        <div className="bg-blue-600 text-white p-4 rounded mb-6">
          <h1 className="text-lg md:text-xl font-bold">
            e-Rehab Clinical System
          </h1>
          <p className="text-xs md:text-sm">
            Developed by Hazwani Ahmad Yusof
          </p>
        </div>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <div className="grid md:grid-cols-3 gap-4">

            <div className="card">
              <p>Total Patients</p>
              <h2 className="text-2xl font-bold">{data.length}</h2>
            </div>

            <div className="card">
              <p>Total Sessions</p>
              <h2 className="text-2xl font-bold">
                {stats.r + stats.p + stats.o}
              </h2>
            </div>

            <div className="card flex justify-center">
              <Pie data={chartData} />
            </div>

          </div>
        )}

        {/* PATIENT LIST */}
        {page === "patients" && (
          <div>

            <input
              placeholder="Search patient..."
              className="input mb-4"
              onChange={e => setSearch(e.target.value)}
            />

            {data
              .filter(x => x.patient?.toLowerCase().includes(search.toLowerCase()))
              .map((x, i) => (
                <div key={i} className="card flex justify-between items-center">

                  <div>
                    <p className="font-bold">{x.patient}</p>
                    <p className="text-sm text-gray-500">{x.patient_id}</p>
                  </div>

                  <button
                    className="btn-blue"
                    onClick={() => {
                      setSelectedPatient(x.patient);
                      setPage("detail");
                    }}
                  >
                    View
                  </button>

                </div>
              ))}

          </div>
        )}

        {/* DETAIL */}
        {page === "detail" && (
          <div>

            <button onClick={() => setPage("patients")} className="mb-3 text-blue-600">
              ← Back
            </button>

            <h2 className="text-lg font-bold mb-4">{selectedPatient}</h2>

            <button onClick={generatePDF} className="btn-dark mb-4">
              Export PDF
            </button>

            {data
              .filter(r => r.patient === selectedPatient)
              .map((r, i) => {

                let s = [];
                try { s = JSON.parse(r.sessions); } catch {}

                return (
                  <div key={i} className="card">

                    <p><b>Date:</b> {r.date}</p>
                    <p><b>Therapist:</b> {r.therapist}</p>

                    {s.map((x, j) => (
                      <p key={j}>
                        {x.type} | {x.start}-{x.end} | {x.duration}
                      </p>
                    ))}

                    {r.signature && r.signature.startsWith("data:image") && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">
                          Digitally signed by patient
                        </p>
                        <img src={r.signature} style={{ width: 150 }} />
                      </div>
                    )}

                  </div>
                );
              })}

          </div>
        )}

        {/* ENTRY */}
        {page === "entry" && (
          <div className="card max-w-xl mx-auto">

            <input placeholder="Patient Name" className="input"
              onChange={e => setPatient(e.target.value)} />

            <input placeholder="Patient ID" className="input"
              onChange={e => setPatientID(e.target.value)} />

            <input placeholder="Therapist" className="input"
              onChange={e => setTherapist(e.target.value)} />

            {sessions.map((s, i) => (
              <div key={i} className="border p-3 rounded mb-2">

                <select className="input"
                  onChange={e => updateSession(i, "type", e.target.value)}>
                  <option>Robotik</option>
                  <option>Physio</option>
                  <option>OT</option>
                </select>

                <input type="time" className="input"
                  onChange={e => updateSession(i, "start", e.target.value)} />

                <input type="time" className="input"
                  onChange={e => updateSession(i, "end", e.target.value)} />

                <p className="text-sm text-gray-500">
                  {calculateDuration(s.start, s.end)}
                </p>

              </div>
            ))}

            <button onClick={addSession} className="btn-blue mb-3">
              + Add Session
            </button>

            <textarea placeholder="Notes" className="input"
              onChange={e => setNotes(e.target.value)} />

            <label className="block text-sm">
              <input type="checkbox" onChange={() => setConsent(!consent)} /> Consent
            </label>

            <label className="block text-sm mb-2">
              <input type="checkbox" onChange={() => setVerified(!verified)} /> Verified
            </label>

            <SignatureCanvas ref={sigPad}
              canvasProps={{ className: "border w-full h-32 bg-white" }} />

            <button onClick={submit} className="btn-green mt-3">
              Submit
            </button>

          </div>
        )}

      </div>

      {/* PDF TEMPLATE */}
      <div id="report" style={{ position: "absolute", left: "-9999px" }} className="bg-white p-8 w-[800px]">

        <h1 className="text-xl font-bold text-center mb-4">
          e-Rehab Clinical Report
        </h1>

        <p><b>Patient:</b> {selectedPatient}</p>

        {data
          .filter(r => r.patient === selectedPatient)
          .map((r, i) => (
            <div key={i} className="mb-4">

              <p>Date: {r.date}</p>
              <p>Therapist: {r.therapist}</p>

              {JSON.parse(r.sessions || "[]").map((s, j) => (
                <p key={j}>
                  {s.type} | {s.start}-{s.end} | {s.duration}
                </p>
              ))}

              {r.signature && (
                <img src={r.signature} style={{ width: 150 }} />
              )}

            </div>
          ))}

      </div>

    </div>
  );
}
