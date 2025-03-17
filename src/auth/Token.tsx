import { useAuth } from "../context/AuthContext.tsx";
import { useEffect } from "react";

export default function Token() {
  const { auth, login } = useAuth();

  if (auth.isAuthenticated) {
    window.location.href = "/";
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  useEffect(() => {
    async function fetchToken(code: string) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
          credentials: "include",
        });
        const data = await response.json();
        // Simulate email verification check
        if (!data.verified) {
          // Redirect to email verification page
          window.location.href = "/verify-email";
          return;
        }
        // Log user activity for successful login
        console.log("User authenticated via token", new Date().toISOString());
        login();
        sessionStorage.setItem("jwt_token", data.token);
        // For MFA, you could trigger an additional challenge here.
        window.location.href = "/";
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    }
    if (code) {
      fetchToken(code);
    }
  }, [code, login]);

  return null;
}
