import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

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
  const [consent, setConsent] = useState(false);
  const [verified, setVerified] = useState(false);

  const sigPad = useRef();

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

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
  const getSessionStats = () => {
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

    return { robotik, physio, ot };
  };

  const stats = getSessionStats();

  const chartData = {
    labels: ["Robotik", "Physio", "OT"],
    datasets: [{
      data: [stats.robotik, stats.physio, stats.ot],
      backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"]
    }]
  };

  // ================= SUBMIT =================
  const submit = async () => {

    if (!patient || !therapist || sessions.length === 0) {
      alert("Complete required fields");
      return;
    }

    const signature = sigPad.current?.toDataURL() || "SIGNED";

    await axios.post(API, {
      patient,
      patient_id: patientID,
      therapist,
      role: "Physio",
      sessions: JSON.stringify(sessions),
      notes: "",
      signature,
      consent: consent ? "YES" : "NO",
      verified: verified ? "YES" : "NO",
      status: "Completed",
      date: new Date().toLocaleString()
    });

    alert("✅ Saved");

    setPatient("");
    setPatientID("");
    setTherapist("");
    setSessions([]);
    setConsent(false);
    setVerified(false);
    sigPad.current.clear();

    axios.get(API).then(res => setData(res.data));
    setPage("patients");
  };

  // ================= UI =================
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">e-Rehab</h2>

        <ul className="space-y-4">
          <li className="cursor-pointer" onClick={() => setPage("dashboard")}>Dashboard</li>
          <li className="cursor-pointer" onClick={() => setPage("patients")}>Patients</li>
          <li className="cursor-pointer" onClick={() => setPage("entry")}>Entry</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="bg-blue-600 text-white p-4 rounded mb-6">
          <h1 className="text-xl font-bold">
            e-Rehab Clinical System
          </h1>
          <p className="text-sm">
            Developed by Hazwani Ahmad Yusof
          </p>
        </div>

        {/* ================= DASHBOARD ================= */}
        {page === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="card">
              <p>Total Patients</p>
              <h2 className="text-2xl font-bold">{data.length}</h2>
            </div>

            <div className="card">
              <p>Total Sessions</p>
              <h2 className="text-2xl font-bold">
                {stats.robotik + stats.physio + stats.ot}
              </h2>
            </div>

            <div className="card h-48 flex items-center justify-center">
              <Pie data={chartData} />
            </div>

          </div>
        )}

        {/* ================= PATIENT LIST ================= */}
        {page === "patients" && (
          <div>

            <h2 className="text-lg font-bold mb-4">Patients</h2>

            <input
              placeholder="Search patient..."
              className="input mb-4"
              onChange={e => setSearch(e.target.value)}
            />

            {data
              .filter(p => p.patient?.toLowerCase().includes(search.toLowerCase()))
              .map((p, i) => (
                <div key={i} className="card mb-2 flex justify-between">

                  <div>
                    <p><b>{p.patient}</b></p>
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
        )}

        {/* ================= PATIENT DETAIL ================= */}
        {page === "detail" && (
          <div>

            <button onClick={() => setPage("patients")} className="mb-4 text-blue-600">
              ← Back
            </button>

            <h2 className="text-lg font-bold mb-4">{selectedPatient}</h2>

            {data
              .filter(r => r.patient === selectedPatient)
              .map((r, i) => {

                let sessions = [];
                try {
                  sessions = JSON.parse(r.sessions);
                } catch {}

                return (
                  <div key={i} className="card mb-3">

                    <p><b>Date:</b> {r.date}</p>
                    <p><b>Therapist:</b> {r.therapist}</p>

                    {sessions.map((s, j) => (
                      <p key={j} className="text-sm text-gray-600">
                        {s.type} | {s.start} - {s.end}
                      </p>
                    ))}

                  </div>
                );
              })}

          </div>
        )}

        {/* ================= ENTRY ================= */}
        {page === "entry" && (
          <div className="card">

            <h2 className="text-lg font-bold mb-4">Treatment Entry</h2>

            <input
              placeholder="Patient Name"
              className="input"
              onChange={e => setPatient(e.target.value)}
            />

            <input
              placeholder="Patient ID"
              className="input"
              onChange={e => setPatientID(e.target.value)}
            />

            <input
              placeholder="Therapist"
              className="input"
              onChange={e => setTherapist(e.target.value)}
            />

            {/* SESSION */}
            {sessions.map((s, i) => (
              <div key={i} className="border p-3 mb-2 rounded">

                <select
                  className="input"
                  onChange={e => updateSession(i, "type", e.target.value)}
                >
                  <option>Robotik</option>
                  <option>Physio</option>
                  <option>OT</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input type="time" className="input"
                    onChange={e => updateSession(i, "start", e.target.value)} />
                  <input type="time" className="input"
                    onChange={e => updateSession(i, "end", e.target.value)} />
                </div>

              </div>
            ))}

            <button onClick={addSession} className="btn-blue">
              + Add Session
            </button>

            <label className="flex items-center mt-2">
              <input type="checkbox" onChange={() => setConsent(!consent)} />
              <span className="ml-2">Consent</span>
            </label>

            <label className="flex items-center">
              <input type="checkbox" onChange={() => setVerified(!verified)} />
              <span className="ml-2">Verified</span>
            </label>

            <SignatureCanvas
              ref={sigPad}
              canvasProps={{ className: "border w-full h-32 mt-3" }}
            />

            <button onClick={submit} className="btn-green mt-4">
              Submit
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
