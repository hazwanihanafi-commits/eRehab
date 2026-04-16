import React, { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const API = "https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Entry() {
  const [patient, setPatient] = useState("");
  const [therapist, setTherapist] = useState("");
  const [sessions, setSessions] = useState([]);
  const sigPad = useRef();

  const submit = async () => {
    const signature = sigPad.current.toDataURL("image/png");

    await axios.post(API, {
      patient,
      therapist,
      sessions: JSON.stringify(sessions),
      signature,
      consent: "YES",
      verified: "YES",
      date: new Date().toLocaleString()
    });

    alert("Saved!");
  };

  return (
    <div className="card">
      <input className="input" placeholder="Patient"
        onChange={e => setPatient(e.target.value)} />

      <input className="input" placeholder="Therapist"
        onChange={e => setTherapist(e.target.value)} />

      <SignatureCanvas
        ref={sigPad}
        canvasProps={{ className: "sig" }}
      />

      <button className="btn-green" onClick={submit}>
        Submit
      </button>
    </div>
  );
}
