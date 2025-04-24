import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DepartmentItems from "../components/DepartmentItems";
import ErrorComponent from "../../shared/components/UIElements/Error";
import SEO from "../../shared/components/SEO";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Departments() {
  const { auth } = useAuth();
  const [departments, setDepartments] = useState<
    { department_id: string; title: string; image: string }[] | string | null
  >(null);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER}/departments`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Departments not found");
        const data = await response.json();
        setDepartments(data);
      } catch (error: any) {
        setDepartments("Error fetching departments");
        console.error("Error fetching departments:", error.message);
      }
    };

    fetchDepartments();
  }, [auth]);

  return (
    <TooltipProvider>
      <section className="container mx-auto py-8 px-4">
        <SEO title="Departments - LabConnect" description="LabConnect departments page" />
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Departments</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-pointer hover:underline">
                ℹ️ Info
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              All departments listed below are fetched in real-time.
            </TooltipContent>
          </Tooltip>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Explore Available Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {!departments && <p className="text-center">Loading...</p>}
            {typeof departments === "object" && Array.isArray(departments) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <DepartmentItems items={departments} />
              </motion.div>
            )}
            {departments === "Error fetching departments" && (
              <ErrorComponent message="Unable to load departments. Please try again later." />
            )}
          </CardContent>
        </Card>
      </section>
    </TooltipProvider>
  );
}
