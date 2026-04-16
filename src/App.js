import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [data, setData] = useState([]);

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

  const submit = async () => {
    if (!patient || !therapist) return alert("Fill required");

    await axios.post(API, {
      patient,
      patient_id: patientID,
      therapist,
      sessions: JSON.stringify(sessions),
      signature: "SIGNED",
      consent: "YES",
      verified: "YES",
      status: "Completed",
      date: new Date().toLocaleString()
    });

    alert("Saved");
    setPage("patients");
    axios.get(API).then(res => setData(res.data));
  };

  // ================= UI =================

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-blue-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">e-Rehab</h2>

        <ul className="space-y-4">
          <li onClick={() => setPage("dashboard")} className="cursor-pointer">Dashboard</li>
          <li onClick={() => setPage("patients")} className="cursor-pointer">Patients</li>
          <li onClick={() => setPage("entry")} className="cursor-pointer">Entry</li>
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
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Overview</h2>
            <p>Total Records: {data.length}</p>
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

            <h2 className="text-lg font-bold mb-4">
              {selectedPatient}
            </h2>

            {data
              .filter(r => r.patient === selectedPatient)
              .map((r, i) => (
                <div key={i} className="card mb-2">
                  <p>Date: {r.date}</p>
                  <p>Therapist: {r.therapist}</p>
                </div>
              ))}

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
