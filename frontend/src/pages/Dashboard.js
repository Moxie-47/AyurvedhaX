import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const clientId = "966806067791-1pgbot50qsv5e5ha402uuu3kutcb1vfm.apps.googleusercontent.com";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [steps, setSteps] = useState(null);
  const [heartRate, setHeartRate] = useState(null);
  const [moveMinutes, setMoveMinutes] = useState(null);
  const [heartPoints, setHeartPoints] = useState(null);
  const [diagnosis, setDiagnosis] = useState("Loading AI diagnosis..."); // ✅ Store AI-powered diagnosis
  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => console.log("✅ Google Identity Services Loaded");
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { "x-auth-token": token },
        });
        setUser(res.data);
      } catch (error) {
        alert("Session expired, please log in again");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const fetchGoogleFitData = async () => {
    try {
      if (!window.google || !window.google.accounts) {
        console.error("❌ Google API not loaded yet. Please try again.");
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read",
        callback: async (response) => {
          if (response.access_token) {
            console.log("✅ Google Fit Access Token:", response.access_token);

            // 🔹 Fetch AI-Powered Health Data from Google Fit
            const fitRes = await fetch(
              "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${response.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  aggregateBy: [
                    { dataTypeName: "com.google.step_count.delta" },
                    { dataTypeName: "com.google.heart_rate.bpm" },
                    { dataTypeName: "com.google.active_minutes" },
                    { dataTypeName: "com.google.heart_minutes" }
                  ],
                  bucketByTime: { durationMillis: 86400000 }, // Last 24 hours
                  startTimeMillis: Date.now() - 86400000,
                  endTimeMillis: Date.now(),
                }),
              }
            );

            const fitData = await fitRes.json();
            console.log("🔹 Full Google Fit Response:", JSON.stringify(fitData, null, 2));

            const extractMetric = (dataType) => {
              return fitData?.bucket?.find(b =>
                b.dataset?.some(d => d.dataSourceId.includes(dataType))
              )?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || "N/A";
            };

            const aiSteps = extractMetric("step_count.delta");
            const aiHeartRate = extractMetric("heart_rate.bpm");
            const aiMoveMinutes = extractMetric("active_minutes");
            const aiHeartPoints = extractMetric("heart_minutes");

            setSteps(aiSteps);
            setHeartRate(aiHeartRate);
            setMoveMinutes(aiMoveMinutes);
            setHeartPoints(aiHeartPoints);

            // 🔹 Send Data to AI Diagnosis API
            const aiRes = await axios.post("http://localhost:5000/api/ai/diagnose", {
              steps: aiSteps,
              heartRate: aiHeartRate,
              moveMinutes: aiMoveMinutes,
              heartPoints: aiHeartPoints,
            });

            setDiagnosis(aiRes.data.diagnosis || "No AI diagnosis available.");
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("❌ Google Fit Fetch Error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? <h3>Welcome, {user.name}!</h3> : <p>Loading...</p>}

      <h3>Steps Today: {steps !== null ? steps : "Click 'Fetch Data'"}</h3>
      <h3>Heart Rate: {heartRate !== null ? `${heartRate} BPM` : "Click 'Fetch Data'"}</h3>
      <h3>Move Minutes: {moveMinutes !== null ? moveMinutes : "Click 'Fetch Data'"}</h3>
      <h3>Heart Points: {heartPoints !== null ? heartPoints : "Click 'Fetch Data'"}</h3>

      <h3>AI-Powered Health Diagnosis:</h3>
      <p>{diagnosis}</p>

      <button onClick={fetchGoogleFitData}>Fetch Data</button>
      
      <Link to="/products">
        <button>View Ayurvedic Products</button>
      </Link>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;