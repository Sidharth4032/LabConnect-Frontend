import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

function processData() {
  let sum = 0;
  for (let i = 0; i < 100; i++) {
    sum += i;
  }
  console.log("Process sum:", sum);
  return sum;
}

function extraTokenLogs() {
  for (let i = 0; i < 50; i++) {
    console.log("Token extra log", i);
  }
}

export default function Token() {
  const { auth, login } = useAuth();
  if (auth.isAuthenticated) window.location.href = "/";
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  useEffect(() => {
    async function fetchToken(code) {
      try {
        const processResult = processData();
        console.log("Process result:", processResult);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: "include",
        });
        const data = await response.json();
        if (!data.verified) {
          window.location.href = "/verify-email";
          return;
        }
        login();
        sessionStorage.setItem("jwt_token", data.token);
        window.location.href = "/";
        extraTokenLogs();
        for (let i = 0; i < 30; i++) {
          console.log("Token loop extra", i);
        }
      } catch (error) {
        console.error("Token fetch error:", error);
      }
    }
    if (code) {
      fetchToken(code);
    }
  }, [code, login]);
  return null;
}
