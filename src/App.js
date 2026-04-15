import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const API = "https://api.sheetbest.com/sheets/d7579616-c0b9-402d-8d3a-1cc5d47f12f2";

export default function App() {
  const [patient, setPatient] = useState("");
  const [sessions, setSessions] = useState([]);
  const [data, setData] = useState([]);

  const sigPad = useRef(null);

  useEffect(() => {
    axios.get(API).then(res => setData(res.data));
  }, []);

  const addSession = () => {
    setSessions([...sessions, { type: "Robotik", time: "", duration: "" }]);
  };

  const updateSession = (i, field, value) => {
    const newS = [...sessions];
    newS[i][field] = value;
    setSessions(newS);
  };

  const submit = async () => {
    if (!patient || sessions.length === 0) {
      alert("Please complete form");
      return;
    }

    const signature = sigPad.current.toDataURL();

    await axios.post(API, {
      patient,
      sessions: JSON.stringify(sessions),
      signature,
      status: "Completed",
      date: new Date().toLocaleString()
    });

    alert("Saved!");
    window.location.reload();
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
        backgroundColor: ["#2F6FED", "#27AE60", "#F39C12"]
      }
    ]
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        e-Rehab Digital System
      </h1>

      {/* Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 rounded shadow">
          <p>Total Patients</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Sessions</p>
          <h2 className="text-2xl font-bold">
            {robotik + physio + ot}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <Pie data={chartData} />
        </div>

      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded shadow max-w-xl">

        <h2 className="text-xl font-semibold mb-4">
          Treatment Entry
        </h2>

        <input
          placeholder="Patient Name"
          className="border p-2 w-full mb-3"
          onChange={e => setPatient(e.target.value)}
        />

        {sessions.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">

            <select
              className="border p-2"
              onChange={e => updateSession(i, "type", e.target.value)}
            >
              <option>Robotik</option>
              <option>Physio</option>
              <option>OT</option>
            </select>

            <input
              type="time"
              className="border p-2"
              onChange={e => updateSession(i, "time", e.target.value)}
            />

            <input
              placeholder="Duration"
              className="border p-2"
              onChange={e => updateSession(i, "duration", e.target.value)}
            />

          </div>
        ))}

        <button
          onClick={addSession}
          className="bg-blue-600 text-white px-4 py-2 mb-4"
        >
          + Add Session
        </button>

        <p className="font-semibold mb-2">Patient Signature</p>

        <SignatureCanvas
          ref={sigPad}
          canvasProps={{ className: "border w-full h-40 bg-white" }}
        />

        <button
          onClick={submit}
          className="bg-green-600 text-white px-4 py-2 w-full"
        >
          Submit Treatment
        </button>

      </div>

    </div>
  );
}
