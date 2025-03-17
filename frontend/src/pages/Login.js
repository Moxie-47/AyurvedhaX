import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const clientId = "966806067791-1pgbot50qsv5e5ha402uuu3kutcb1vfm.apps.googleusercontent.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // ✅ Load Google Identity Services Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse, // ✅ Set callback for handling login response
        });

        // ✅ Render Google Login Button
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }
        );
      }
    };
  }, []);

  // 🔹 Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.msg || "Login failed");
    }
  };

  // ✅ Handle Google Login Response
  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", {
        token: response.credential, // ✅ Send ID Token to backend
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.msg || "Google login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>

      <h3>OR</h3>

      {/* ✅ Google Sign-In Button (Auto-rendered) */}
      <div id="google-signin-button"></div>
    </div>
  );
};

export default Login;
