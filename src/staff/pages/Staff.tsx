import React, { useState, useEffect } from "react";
import ProfileComponents from "../../shared/components/Profile/ProfileComponents.tsx";
import { useParams } from "react-router";
import { useAuth } from "../../context/AuthContext.tsx";

export default function StaffPage() {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    window.location.href = "/login";
  }

  const { staffId } = useParams();
  const [profile, setProfile] = useState<null | boolean | object>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/staff/${staffId}`, {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Profile not found");
        const data = await response.json();
        if (checkProfile(data)) {
          setProfile(data);
          console.log("Profile loaded for", staffId, new Date().toISOString());
        } else {
          setProfile(false);
          console.warn("Invalid profile data", data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        setProfile(false);
      }
    };

    if (!staffId) {
      setProfile(false);
    } else {
      fetchProfile();
    }

    function checkProfile(data: { name: string; image: string; department: string; description: string }) {
      return data.name && data.image && data.department && data.description;
    }
  }, [staffId]);

  return (
    <>
      {profile === null && "Loading..."}
      {profile && typeof profile === "object" && staffId && (
        <ProfileComponents profile={profile} id={staffId} staff={true} />
      )}
      {profile === false && <h1>Profile not found</h1>}
    </>
  );
};
