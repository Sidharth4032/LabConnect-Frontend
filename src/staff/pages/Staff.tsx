import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../shared/components/SEO";
import ProfileComponents from "../../shared/components/Profile/ProfileComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export default function StaffPage() {
  const { auth } = useAuth();
  const { staffId } = useParams();

  const [profile, setProfile] = useState<null | boolean | Record<string, any>>(null);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (!staffId) {
      setProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/staff/${staffId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          setProfile(false);
        } else {
          const data = await response.json();
          if (checkProfile(data)) {
            setProfile(data);
          } else {
            console.warn("Incomplete profile data:", data);
            setProfile(false);
          }
        }
      } catch (err) {
        console.error("Error fetching staff profile:", err);
        setProfile(false);
      }
    };

    fetchProfile();
  }, [auth, staffId]);

  const checkProfile = (data: { name: string; image: string; department: string; description: string }) => {
    return data.name && data.image && data.department && data.description;
  };

  const renderContent = () => {
    if (profile === null) return <p className="text-muted text-center">Loading profile...</p>;
    if (profile === false) return <p className="text-destructive text-center">Profile not found.</p>;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProfileComponents profile={profile} id={staffId as string} staff={true} />
      </motion.div>
    );
  };

  return (
    <TooltipProvider>
      <section className="max-w-4xl mx-auto px-4 py-8">
        <SEO title={`Staff - ${staffId}`} description="Staff profile page" />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Staff Profile</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-sm text-muted-foreground hover:underline">
                ❓ Info
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Staff info is pulled directly from the backend. Updates require admin access.
            </TooltipContent>
          </Tooltip>
        </div>

        <Card className="bg-background border-muted shadow-sm">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </section>
    </TooltipProvider>
  );
}
