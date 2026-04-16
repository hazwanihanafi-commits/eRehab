import { useState, useRef } from "react";
import axios from "axios";
import SignatureCanvas from "react-signature-canvas";

const API="https://api.sheetbest.com/sheets/28a47003-a918-4925-92d6-a6976f4acf6b";

export default function Entry(){
  const [patient,setPatient]=useState("");
  const [patientID,setPatientID]=useState("");
  const [therapist,setTherapist]=useState("");
  const [sessions,setSessions]=useState([]);
  const sigPad=useRef();

  const addSession=()=>{
    setSessions([...sessions,{type:"Robotik"}]);
  };

  const submit=async()=>{
    const signature=sigPad.current.toDataURL();

    await axios.post(API,{
      patient,
      patient_id:patientID,
      therapist,
      sessions:JSON.stringify(sessions),
      signature,
      date:new Date().toLocaleString()
    });

    alert("Saved");
  };

  return (
    <div className="card">

      <input placeholder="Patient" className="input" onChange={e=>setPatient(e.target.value)}/>
      <input placeholder="ID" className="input" onChange={e=>setPatientID(e.target.value)}/>
      <input placeholder="Therapist" className="input" onChange={e=>setTherapist(e.target.value)}/>

      <button onClick={addSession} className="btn-blue mb-3">
        Add Session
      </button>

      <SignatureCanvas ref={sigPad} canvasProps={{className:"border w-full h-40"}}/>

      <button onClick={submit} className="btn-green mt-3">
        Submit
      </button>

    </div>
  );
}
