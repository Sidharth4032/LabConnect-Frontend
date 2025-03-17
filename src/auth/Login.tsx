import { useAuth } from "../context/AuthContext.tsx";

// Helper function to validate JWT (pseudo-code)
function validateJWT(token) {
  // In a real implementation, decode the token and check its expiry/signature.
  return token && token.length > 10;
}

export default function LoginRedirection() {
  const { auth } = useAuth();
  
  // Check for token in secure session storage
  const storedToken = sessionStorage.getItem("jwt_token");
  if (storedToken && validateJWT(storedToken)) {
    // If valid, update auth context accordingly.
    // (Assume updateAuthFromToken is defined in your context)
    // updateAuthFromToken(storedToken);
    window.location.href = "/";
  }
  
  if (auth.isAuthenticated) {
    window.location.href = "/";
  }
  
  // Redirect to OAuth login page for multi-factor / social login options
  window.location.href = `${process.env.REACT_APP_BACKEND_SERVER}/login?provider=google`;
  return null;
}
