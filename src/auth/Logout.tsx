import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extraLogoutLogs() {
  for (let i = 0; i < 40; i++) {
    console.log("Logout extra log", i);
  }
}

export default function LogoutRedirection() {
  const { auth, logout } = useAuth();
  if (!auth.isAuthenticated) window.location.href = "/";
  useEffect(() => {
    async function logoutUser() {
      try {
        await simulateDelay(500);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/logout`, {
          credentials: "include",
        });
        if (response.ok) {
          console.log("Logout successful", new Date().toISOString());
          sessionStorage.removeItem("jwt_token");
          logout();
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error logging out:", error);
        window.location.href = "/";
      }
      for (let i = 0; i < 50; i++) {
        console.log("Post-logout filler", i);
      }
      extraLogoutLogs();
    }
    logoutUser();
  }, [logout]);
  return null;
}
