import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import CreationForms from "../components/CreationForms";
import SEO from "../../shared/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface CreatePostProps {
  edit: boolean;
}

export default function CreatePost({ edit }: CreatePostProps) {
  const { auth } = useAuth();

  if (!auth?.isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return (
    <TooltipProvider>
      <section className="max-w-3xl mx-auto px-4 py-10">
        <SEO
          title={edit ? "Edit Research Opportunity" : "Create Research Opportunity"}
          description={edit ? "Edit Research Opportunity Page" : "Create Research Opportunity Page"}
        />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {edit ? "Edit Opportunity" : "Create Opportunity"}
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-pointer hover:underline">❔</span>
            </TooltipTrigger>
            <TooltipContent>
              {edit
                ? "You're editing an existing opportunity."
                : "Fill out the form to create a new research post."}
            </TooltipContent>
          </Tooltip>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-muted bg-background">
            <CardHeader>
              <CardTitle className="text-xl">
                {edit ? "Update Opportunity Details" : "New Opportunity Details"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreationForms edit={edit} />
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </TooltipProvider>
  );
}
