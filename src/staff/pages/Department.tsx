import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Breadcrumb from "../../shared/components/UIElements/Breadcrumb";
import DepartmentHeading from "../components/DepartmentHeading";
import DepartmentStaff from "../components/DepartmentStaff";
import SEO from "../../shared/components/SEO";

export default function Department() {
  const { department } = useParams();
  const { auth } = useAuth();
  const [departmentState, setDepartmentState] = useState<
    false | "not found" | {
      name: string;
      description: string;
      image: string;
      website?: string;
      staff: { id: string; name: string; role: string; image: string }[];
    }
  >(false);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      window.location.href = "/login";
    }

    const fetchDepartment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_SERVER}/departments/${department}`, {
          credentials: "include",
        });

        if (!response.ok) {
          setDepartmentState("not found");
        } else {
          const data = await response.json();
          const updatedData = {
            ...data,
            staff: data.staff.map((member: any) => ({
              ...member,
              image: member.image || "/images/default-profile.png"
            }))
          };
          setDepartmentState(updatedData);
        }
      } catch (error) {
        setDepartmentState("not found");
        console.error("Failed to fetch department:", error);
      }
    };

    fetchDepartment();
  }, [auth, department]);

  const renderDepartment = () => {
    if (!departmentState) {
      return <p className="text-muted text-center">Loading...</p>;
    }

    if (departmentState === "not found") {
      return <p className="text-center text-destructive font-medium">Department not found</p>;
    }

    return (
      <>
        <DepartmentHeading
          name={departmentState.name}
          description={departmentState.description}
          image={departmentState.image}
          website={departmentState.website}
        />
        <motion.div
          className="my-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <DepartmentStaff staff={departmentState.staff} />
        </motion.div>
      </>
    );
  };

  return (
    <TooltipProvider>
      <section className="container mx-auto p-6">
        <SEO
          title={`${department} - LabConnect`}
          description={`${department} page on LabConnect`}
        />
        <div className="flex justify-between items-center mb-6">
          <Breadcrumb
            tree={[
              { link: "/staff", title: "Staff" },
              { link: `/staff/department/${department}`, title: department || "Unknown" }
            ]}
          />
          <Tooltip>
            <TooltipTrigger>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-muted-foreground"
              >
                🧠 Explore
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Click to see how the department evolves!
            </TooltipContent>
          </Tooltip>
        </div>

        <Card className="shadow-md transition-all hover:shadow-xl bg-card border border-muted rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">
              {departmentState && typeof departmentState === "object"
                ? departmentState.name
                : "Department"}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderDepartment()}</CardContent>
        </Card>
      </section>
    </TooltipProvider>
  );
}
