import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

export default function LogoutRedirection() {
  const { auth, logout } = useAuth();

  if (!auth.isAuthenticated) {
    window.location.href = "/";
  }
  
  useEffect(() => {
    async function logoutUser() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/logout`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          // Log user activity for logout
          console.log("User logged out successfully", new Date().toISOString());
          // Clear secure storage tokens
          sessionStorage.removeItem("jwt_token");
          logout();
        } else {
          console.error("Failed to logout");
        }
      } catch (error) {
        console.error("Error logging out:", error);
        window.location.href = "/";
      }
    }
    logoutUser();
  }, [logout]);

  return null;
}
