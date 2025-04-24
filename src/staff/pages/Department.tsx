import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../../shared/components/UIElements/Breadcrumb.tsx";
import DepartmentHeading from "../components/DepartmentHeading.tsx";
import DepartmentStaff from "../components/DepartmentStaff.tsx";
import SEO from "../../shared/components/SEO.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Department() {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    window.location.href = "/login";
  }

  const { department } = useParams();
  const [departmentstate, setDepartmentstate] = useState<false | "not found" | { name: string; description: string; image: string; website?: string; staff: { id: string; name: string; role: string; image: string }[] }>(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_SERVER}/departments/${department}`, {
        credentials: "include",
      });

      if (!response.ok) {
        setDepartmentstate("not found");
      } else {
        const data = await response.json();
        const updatedData = {
          ...data,
          staff: data.staff.map((member: { id: string; name: string; role: string; image?: string }) => ({
            ...member,
            image: member.image || "default-image-url"
          }))
        };
        setDepartmentstate(updatedData);
      }
    };
    fetchDepartment();
  }, [department]);

  const departmentComponents = (
    <>
      {typeof departmentstate === "object" && (
        <Card className="my-4 shadow border border-gray-200">
          <CardContent className="p-6">
            <DepartmentHeading
              name={departmentstate.name}
              description={departmentstate.description}
              image={departmentstate.image}
              website={departmentstate.website}
            />
            <DepartmentStaff staff={departmentstate.staff} />
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <section className="container mx-auto px-4">
      <SEO title={`${department} - Labconnect`} description={`${department} page on labconnect`} />
      <motion.div
        className="my-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Breadcrumb
          tree={[
            {
              link: "/staff",
              title: "Staff",
            },
            {
              link: `/staff/department/${department}`,
              title: department || "Unknown Department",
            },
          ]}
        />
      </motion.div>
      {!departmentstate && "Loading..."}
      {typeof departmentstate === "object" && departmentComponents}
      {departmentstate === "not found" && <p className="text-red-600 font-semibold">Department not found</p>}
    </section>
  );
};
