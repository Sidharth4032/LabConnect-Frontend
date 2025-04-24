import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router";
import CheckBox from "./Checkbox.tsx";
import Input from "./Input";
import { Locations } from "../../shared/data/locations.ts";
import { DepartmentContacts } from "../../shared/data/departmentContacts.ts";
import { OpportunityTypes } from "../../shared/data/opportunityTypes.ts";
import { Skills } from "../../shared/data/skills.ts";
import TagSelector from "./TagSelector";
import ImageUploader from "./ImageUploader";
import MarkdownEditor from "./MarkdownEditor";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import SuccessMessage from "../common/SuccessMessage";
import Modal from "../common/Modal";
import RichTextEditor from "./RichTextEditor";
import DatePicker from "./DatePicker";
import useNotification from "../../hooks/useNotification";
import useDebounce from "../../hooks/useDebounce";
import { validateURL, formatCurrency, isValidFileType, truncateText } from "../../utils/formatters";
import { saveFormData, loadFormData } from "../../utils/localStorage";
import { trackFormEvent } from "../../utils/analytics";
import { validatePayRate, validateCredits } from "../../utils/validators";
import { getCampusLocations } from "../../services/locationService";
import { logError } from "../../utils/errorLogger";
import ContactCard from "./ContactCard";

interface CreationFormsProps {
  edit: boolean;
  redirectAfterSubmit?: boolean;
  showAdvancedOptions?: boolean;
  allowDraftSaving?: boolean;
  opportunityTemplate?: string;
  onCancel?: () => void;
  onSuccess?: (id: string) => void;
}

interface FormData {
  id: string;
  title: string;
  application_due: string;
  type: string;
  hourlyPay: number;
  credits: string[];
  description: string;
  recommended_experience: string;
  location: string;
  years: string[];
  department?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_name?: string;
  application_url?: string;
  is_remote?: boolean;
  hours_per_week?: number;
  start_date?: string;
  end_date?: string;
  skills_required?: string[];
  skills_preferred?: string[];
  application_instructions?: string;
  opportunity_image?: string;
  opportunity_documents?: string[];
  is_featured?: boolean;
  status?: string;
  notes?: string;
  related_courses?: string[];
  related_majors?: string[];
  allow_team_applications?: boolean;
  team_size_limit?: number;
  interview_required?: boolean;
  interview_rounds?: number;
  interview_details?: string;
  position_count?: number;
  compensation_details?: string;
  additional_requirements?: string;
  faculty_sponsor?: string;
  research_area?: string;
  lab_name?: string;
  project_timeline?: string;
  grant_funded?: boolean;
  grant_name?: string;
  publication_possibility?: boolean;
  travel_required?: boolean;
  travel_details?: string;
  equipment_required?: boolean;
  equipment_details?: string;
  virtual_meeting_link?: string;
  visibility?: string;
  draft?: boolean;
  last_updated?: string;
}

const DEFAULT_VALUES: FormData = {
  id: "",
  title: "",
  application_due: "",
  type: "Any",
  hourlyPay: 0,
  credits: [],
  description: "",
  recommended_experience: "",
  location: "Select a Department",
  years: [""],
  department: "",
  contact_email: "",
  contact_phone: "",
  contact_name: "",
  application_url: "",
  is_remote: false,
  hours_per_week: 10,
  start_date: "",
  end_date: "",
  skills_required: [],
  skills_preferred: [],
  application_instructions: "",
  opportunity_image: "",
  opportunity_documents: [],
  is_featured: false,
  status: "Open",
  notes: "",
  related_courses: [],
  related_majors: [],
  allow_team_applications: false,
  team_size_limit: 1,
  interview_required: false,
  interview_rounds: 1,
  interview_details: "",
  position_count: 1,
  compensation_details: "",
  additional_requirements: "",
  faculty_sponsor: "",
  research_area: "",
  lab_name: "",
  project_timeline: "",
  grant_funded: false,
  grant_name: "",
  publication_possibility: false,
  travel_required: false,
  travel_details: "",
  equipment_required: false,
  equipment_details: "",
  virtual_meeting_link: "",
  visibility: "Public",
  draft: false,
  last_updated: new Date().toISOString(),
};

export default function CreationForms({ 
  edit, 
  redirectAfterSubmit = true, 
  showAdvancedOptions = false,
  allowDraftSaving = false,
  opportunityTemplate = "",
  onCancel,
  onSuccess
}: CreationFormsProps) {
  const navigate = useNavigate();
  const { postID } = useParams();
  const [loading, setLoading] = useState<string | boolean>(false);
  const [compensationType, setCompensationType] = useState("Any");
  const [years, setYears] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [campusLocations, setCampusLocations] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvancedOptions);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const descriptionEditorRef = useRef(null);
  const { showNotification } = useNotification();
  const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid, touchedFields },
    reset,
    setValue,
    watch,
    getValues,
    trigger,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const watchedFields = watch();
  const debouncedFormData = useDebounce(watchedFields, 2000);
  
  const isRemote = watch("is_remote");
  const selectedDepartment = watch("department");
  const allowTeamApplications = watch("allow_team_applications");
  const interviewRequired = watch("interview_required");
  const travelRequired = watch("travel_required");
  const equipmentRequired = watch("equipment_required");
  const grantFunded = watch("grant_funded");

  const totalSteps = useMemo(() => showAdvancedOptions ? 4 : 3, [showAdvancedOptions]);
  
  const departmentContact = useMemo(() => {
    if (!selectedDepartment || !DepartmentContacts) return null;
    return DepartmentContacts.find(contact => contact.department === selectedDepartment);
  }, [selectedDepartment]);

  const canMoveToNextStep = useCallback(() => {
    if (activeStep === 1) {
      return Boolean(
        watchedFields.title?.length >= 5 &&
        watchedFields.location !== "Select a Department" &&
        watchedFields.application_due
      );
    } else if (activeStep === 2) {
      const typeValid = watchedFields.type !== "";
      const payValid = watchedFields.type !== "For Pay" || (watchedFields.hourlyPay !== undefined && watchedFields.hourlyPay >= 0);
      const creditsValid = watchedFields.type !== "For Credit" || (watchedFields.credits && watchedFields.credits.length > 0);
      const yearsValid = watchedFields.years && watchedFields.years.length > 0;
      return typeValid && payValid && creditsValid && yearsValid;
    } else if (activeStep === 3) {
      return Boolean(
        watchedFields.description?.length >= 10
      );
    }
    return true;
  }, [activeStep, watchedFields]);

  const validateStep = useCallback((step: number) => {
    if (step === 1) {
      return trigger(["title", "location", "application_due"]);
    } else if (step === 2) {
      return trigger(["type", "hourlyPay", "credits", "years"]);
    } else if (step === 3) {
      return trigger(["description", "recommended_experience"]);
    } else if (step === 4) {
      return trigger(["contact_email", "contact_name"]);
    }
    return Promise.resolve(true);
  }, [trigger]);

  const handleNextStep = useCallback(async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setActiveStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
      trackFormEvent("next_step", { step: activeStep, formType: edit ? "edit" : "create" });
    }
  }, [activeStep, totalSteps, validateStep, edit]);

  const handlePrevStep = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const handleCompensationTypeChange = useCallback((type: string) => {
    setCompensationType(type);
    if (type === "For Pay") {
      setValue("credits", []);
    } else if (type === "For Credit") {
      setValue("hourlyPay", 0);
    }
  }, [setValue]);

  const togglePreviewMode = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  const toggleAdvancedOptions = useCallback(() => {
    setIsAdvancedOpen(prev => !prev);
    if (!isAdvancedOpen && activeStep < totalSteps) {
      setActiveStep(totalSteps);
    }
  }, [isAdvancedOpen, activeStep, totalSteps]);

  const saveDraft = useCallback(async () => {
    if (!allowDraftSaving) return;
    
    setIsDraftSaving(true);
    const formData = getValues();
    formData.draft = true;
    formData.last_updated = new Date().toISOString();
    
    try {
      saveFormData(`opportunity_draft_${edit ? postID : 'new'}`, formData);
      setLastSaved(new Date());
      showNotification("Draft saved successfully", "success");
    } catch (error) {
      console.error("Error saving draft:", error);
      showNotification("Failed to save draft", "error");
    } finally {
      setIsDraftSaving(false);
    }
  }, [allowDraftSaving, edit, postID, getValues, showNotification]);

  const loadDraft = useCallback(() => {
    if (!allowDraftSaving) return;
    
    try {
      const savedData = loadFormData(`opportunity_draft_${edit ? postID : 'new'}`);
      if (savedData) {
        reset(savedData);
        setCompensationType(savedData.type || "Any");
        showNotification("Draft loaded successfully", "success");
        return true;
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      showNotification("Failed to load draft", "error");
    }
    return false;
  }, [allowDraftSaving, edit, postID, reset, showNotification]);

  const clearDraft = useCallback(() => {
    if (!allowDraftSaving) return;
    
    try {
      localStorage.removeItem(`opportunity_draft_${edit ? postID : 'new'}`);
      showNotification("Draft cleared", "success");
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [allowDraftSaving, edit, postID, showNotification]);

  const loadTemplate = useCallback((templateName: string) => {
    try {
      fetch(`${process.env.REACT_APP_BACKEND_SERVER}/opportunityTemplates/${templateName}`, {
        credentials: "include",
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Failed to load template");
        })
        .then(templateData => {
          reset(templateData);
          setCompensationType(templateData.type || "Any");
          showNotification(`Template '${templateName}' loaded successfully`, "success");
        })
        .catch(error => {
          console.error("Error loading template:", error);
          showNotification("Failed to load template", "error");
        });
    } catch (error) {
      console.error("Error in template load process:", error);
      showNotification("An error occurred while loading the template", "error");
    }
  }, [reset, showNotification]);

  async function fetchYears() {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/years`);
      if (response.ok) {
        const data = await response.json();
        setYears(data);
        return data;
      } else {
        console.log("No response for years");
        setLoading("no response");
        throw new Error("Failed to fetch years");
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      logError("fetchYears", error);
      return [];
    }
  }

  async function fetchDepartments() {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
        return data;
      } else {
        console.log("No response for departments");
        throw new Error("Failed to fetch departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      logError("fetchDepartments", error);
      return [];
    }
  }

  async function fetchCampusLocations() {
    try {
      const locations = await getCampusLocations();
      setCampusLocations(locations);
      return locations;
    } catch (error) {
      console.error("Error fetching campus locations:", error);
      logError("fetchCampusLocations", error);
      return [];
    }
  }

  const validateForm = useCallback((data: FormData): string[] => {
    const errors: string[] = [];
    
    if (!data.title || data.title.length < 5) {
      errors.push("Title must be at least 5 characters");
    }
    
    if (!data.location || data.location === "Select a Department") {
      errors.push("Location is required");
    }
    
    if (!data.application_due) {
      errors.push("Application deadline is required");
    }
    
    if (data.type === "For Pay" && (data.hourlyPay === undefined || data.hourlyPay < 0)) {
      errors.push("Hourly pay must be at least 0");
    }
    
    if (data.type === "For Credit" && (!data.credits || data.credits.length === 0)) {
      errors.push("At least one credit option is required");
    }
    
    if (!data.years || data.years.length === 0) {
      errors.push("At least one class year must be selected");
    }
    
    if (!data.description || data.description.length < 10) {
      errors.push("Description must be at least 10 characters");
    }
    
    if (data.application_url && !validateURL(data.application_url)) {
      errors.push("Application URL is invalid");
    }
    
    if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
      errors.push("Contact email is invalid");
    }
    
    if (data.hours_per_week !== undefined && (data.hours_per_week < 1 || data.hours_per_week > 40)) {
      errors.push("Hours per week must be between 1 and 40");
    }
    
    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      errors.push("End date cannot be before start date");
    }
    
    return errors;
  }, []);

  async function submitHandler(data: FormData) {
    const formErrors = validateForm(data);
    setFormErrors(formErrors);
    
    if (formErrors.length > 0) {
      window.scrollTo(0, 0);
      showNotification("Please correct the errors before submitting", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (edit) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/editOpportunity/${postID}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, last_updated: new Date().toISOString() }),
        });
        
        if (response.ok) {
          showNotification("Opportunity updated successfully", "success");
          clearDraft();
          if (redirectAfterSubmit) {
            window.location.href = `/opportunity/${postID}`;
          } else if (onSuccess) {
            onSuccess(postID as string);
          }
        } else {
          const errorData = await response.json().catch(() => null);
          showNotification(`Failed to update: ${errorData?.message || 'Unknown error'}`, "error");
          console.error("Update error:", errorData);
        }
      } else {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVER}/createOpportunity`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, draft: false, last_updated: new Date().toISOString() }),
        });
        
        if (response.ok) {
          const data_response = await response.json();
          showNotification("Opportunity created successfully", "success");
          clearDraft();
          if (redirectAfterSubmit) {
            window.location.href = `/opportunity/${data_response["id"]}`;
          } else if (onSuccess) {
            onSuccess(data_response["id"]);
          }
        } else {
          const errorData = await response.json().catch(() => null);
          showNotification(`Failed to create: ${errorData?.message || 'Unknown error'}`, "error");
          console.error("Create error:", errorData);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      logError("opportunitySubmit", error);
      showNotification("An error occurred during submission", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    async function fetchEditData() {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_SERVER}/editOpportunity/${postID}`, 
          {
            credentials: "include",
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          // Fetch all required data in parallel
          await Promise.all([
            fetchYears(),
            fetchDepartments(),
            fetchCampusLocations()
          ]);
          
          reset(data);
          setCompensationType(data.type || "Any");
          setLoading(false);
        } else {
          console.log("No response");
          setLoading("no response");
          showNotification("Failed to load opportunity data", "error");
        }
      } catch (error) {
        console.error("Error in fetchEditData:", error);
        logError("fetchEditData", error);
        setLoading("no response");
        showNotification("An error occurred while loading data", "error");
      }
    }

    async function initialize() {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        await Promise.all([
          fetchYears(),
          fetchDepartments(),
          fetchCampusLocations()
        ]);
        
        // Check for saved draft
        const hasDraft = loadDraft();
        
        // If no draft and template is specified, load the template
        if (!hasDraft && opportunityTemplate) {
          loadTemplate(opportunityTemplate);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in initialize:", error);
        logError("initialize", error);
        setLoading("no response");
        showNotification("An error occurred during initialization", "error");
      }
    }

    if (edit) {
      fetchEditData();
    } else {
      initialize();
    }
    
    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [edit, postID, reset, loadDraft, opportunityTemplate, loadTemplate, showNotification]);

  // Auto-save draft
  useEffect(() => {
    if (allowDraftSaving && isDirty && !isSubmitting) {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
      
      draftSaveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 10000); // 10 seconds
      
      return () => {
        if (draftSaveTimeoutRef.current) {
          clearTimeout(draftSaveTimeoutRef.current);
        }
      };
    }
  }, [debouncedFormData, allowDraftSaving, isDirty, isSubmitting, saveDraft]);

  // Set department based on location if not already set
  useEffect(() => {
    const currentLocation = watchedFields.location;
    const currentDepartment = watchedFields.department;
    
    if (currentLocation && currentLocation !== "Select a Department" && !currentDepartment && departments.length > 0) {
      // Try to find a matching department
      const matchingDept = departments.find(dept => 
        dept.toLowerCase().includes(currentLocation.toLowerCase()) || 
        currentLocation.toLowerCase().includes(dept.toLowerCase())
      );
      
      if (matchingDept) {
        setValue("department", matchingDept);
      }
    }
  }, [watchedFields.location, watchedFields.department, departments, setValue]);

  if (loading === true) {
    return <LoadingSpinner message="Loading form data..." />;
  }

  if (loading === "no response") {
    return <ErrorMessage message="There was an error loading the form. Please try again later." />;
  }

  return (
    <div className="opportunity-form-container">
      {formErrors.length > 0 && (
        <div className="error-container bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Please correct the following errors:</h3>
          <ul className="list-disc pl-5">
            {formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {previewMode ? (
        <div className="preview-container border rounded p-5 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Preview Mode</h2>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={togglePreviewMode}
            >
              Back to Edit
            </button>
          </div>
          
          <div className="preview-content">
            <h1 className="text-2xl font-bold mb-2">{watchedFields.title || "Untitled Opportunity"}</h1>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold">Location:</h3>
                <p>{watchedFields.location}</p>
                {watchedFields.is_remote && <p className="text-blue-600">(Remote available)</p>}
              </div>
              
              <div>
                <h3 className="font-semibold">Application Deadline:</h3>
                <p>{watchedFields.application_due ? new Date(watchedFields.application_due).toLocaleDateString() : "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Compensation:</h3>
                <p>
                  {watchedFields.type === "For Pay" ? `Paid - $${watchedFields.hourlyPay}/hour` : 
                   watchedFields.type === "For Credit" ? `For Credit (${watchedFields.credits?.join(", ") || "Not specified"})` : 
                   "Any (Pay or Credit)"}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Eligible Class Years:</h3>
                <p>{watchedFields.years?.join(", ") || "Not specified"}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold">Description:</h3>
              <div className="p-3 bg-gray-50 rounded">
                {watchedFields.description || "No description provided."}
              </div>
            </div>
            
            {watchedFields.recommended_experience && (
              <div className="mb-4">
                <h3 className="font-semibold">Recommended Experience:</h3>
                <div className="p-3 bg-gray-50 rounded">
                  {watchedFields.recommended_experience}
                </div>
              </div>
            )}
            
            {watchedFields.contact_name && (
              <div className="mb-4">
                <h3 className="font-semibold">Contact:</h3>
                <p>{watchedFields.contact_name} {watchedFields.contact_email ? `(${watchedFields.contact_email})` : ""}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit(submitHandler)}
          className="form-container"
        >
          {/* Step indicator */}
          <div className="steps-container flex justify-between mb-8 border-b pb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`step-item flex flex-col items-center ${activeStep === i + 1 ? 'active text-blue-600 font-bold' : activeStep > i + 1 ? 'completed text-green-600' : 'text-gray-400'}`}
                onClick={() => validateStep(activeStep).then(isValid => {
                  if (isValid) setActiveStep(i + 1);
                })}
              >
                <div className={`step-number w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  activeStep === i + 1 ? 'bg-blue-100 border-2 border-blue-600' : 
                  activeStep > i + 1 ? 'bg-green-100 border-2 border-green-600' : 
                  'bg-gray-100 border border-gray-300'
                }`}>
                  {activeStep > i + 1 ? '✓' : i + 1}
                </div>
                <span className="step-title text-sm">
                  {i === 0 ? 'Basic Info' : 
                   i === 1 ? 'Compensation' : 
                   i === 2 ? 'Description' : 
                   'Additional Info'}
                </span>
              </div>
            ))}
          </div>
          
          {/* Step 1: Basic Info */}
          {activeStep === 1 && (
            <section className="step-content">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              
              <div className="flex flex-row mb-4">
                <div className="w-1/3 pl-3">
                  <Input
                    label="Title (min. 5 characters)"
                    name={"title"}
                    errors={errors}
                    errorMessage={"Title must be at least 5 characters"}
                    formHook={{
                      ...register("title", {
                        required: true,
                        minLength: 5,
                        maxLength: 100,
                      }),
                    }}
                    type="text"
                    options={[]}
                    placeHolder="Enter title"
                  />
                </div>

                <div className="w-1/3 pr-3 pl-3">
                  <Input
                    errors={errors}
                    label="Location"
                    name={"location"}
                    type="select"
                    options={Locations}
                    errorMessage={"Location is required"}
                    formHook={{
                      ...register("location", {
                        required: true,
                      }),
                    }}
                    placeHolder="Select Location"
                  />
                </div>

                <div className="w-1/3 pr-3">
                  <Input
                    errors={errors}
                    label="Deadline"
                    name={"application_due"}
                    errorMessage={"Deadline is required"}
                    formHook={{ 
                      ...register("application_due", { 
                        required: true,
                        validate: (value) => {
                          if (!value) return true;
                          const inputDate = new Date(value);
                          const today = new Date();
                          return inputDate >= today || "Deadline cannot be in the past";
                        }
                      }) 
                    }}
                    type="date"
                    placeHolder={"Select Deadline"}
                    options={[]}
                  />
                </div>
              </div>
              
              <div className="flex flex-row mb-4">
                <div className="w-1/2 pl-3">
                  <div className="flex items-center gap-3">
                    <Input
                      errors={errors}
                      label="Department"
                      name={"department"}
                      type="select"
                      options={departments}
                      errorMessage={"Department is required"}
                      formHook={{
                        ...register("department", {
                          required: false,
                        }),
                      }}
                      placeHolder="Select Department"
                    />
                    {departmentContact && (
                      <div className="mt-6">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                          onClick={() => {
                            setValue("contact_name", departmentContact.name);
                            setValue("contact_email", departmentContact.email);
                            setValue("contact_phone", departmentContact.phone || "");
                            showNotification("Contact information filled", "success");
                          }}
                        >
                          Use department contact
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_remote"
                      className="mr-2 h-4 w-4"
                      {...register("is_remote")}
                    />
                    <label htmlFor="is_remote" className="label-text font-medium">
                      Remote work available
                    </label>
                  </div>
                  
                  {isRemote && (
                    <div className="mt-2">
                      <Input
                        errors={errors}
                        label="Virtual Meeting Link (optional)"
                        name={"virtual_meeting_link"}
                        type="text"
                        options={[]}
                        errorMessage={"Please enter a valid URL"}
                        formHook={{
                          ...register("virtual_meeting_link", {
                            validate: (value) => {
                              if (!value) return true;
                              return validateURL(value) || "Please enter a valid URL";
                            }
                          }),
                        }}
                        placeHolder="Enter virtual meeting link"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row mb-4">
                <div className="w-1/2 pl-3">
                  <Input
                    errors={errors}
                    label="Start Date (optional)"
                    name={"start_date"}
                    type="date"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("start_date"),
                    }}
                    placeHolder="Select Start Date"
                  />
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <Input
                    errors={errors}
                    label="End Date (optional)"
                    name={"end_date"}
                    type="date"
                    options={[]}
                    errorMessage={"End date must be after start date"}
                    formHook={{
                      ...register("end_date", {
                        validate: (value) => {
                          if (!value) return true;
                          const startDate = getValues("start_date");
                          if (!startDate) return true;
                          return new Date(value) >= new Date(startDate) || "End date must be after start date";
                        }
                      }),
                    }}
                    placeHolder="Select End Date"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  className="btn btn-primary bg-blue-700"
                  onClick={handleNextStep}
                  disabled={!canMoveToNextStep()}
                >
                  Next Step
                </button>
              </div>
            </section>
          )}
          
          {/* Step 2: Compensation */}
          {activeStep === 2 && (
            <section className="step-content">
              <h2 className="text-xl font-bold mb-4">Compensation & Eligibility</h2>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/3 pl-3">
                  <label className="label-text font-medium">Compensation Type</label>
                  <div className="flex items-center pt-5 pb-1">
                    <input
                      type="radio"
                      value="For Pay"
                      id="comp-type-pay"
                      {...register("type", { required: true })}
                      checked={compensationType === "For Pay"}
                      onChange={() => handleCompensationTypeChange("For Pay")}
                      className="h-4 w-4"
                    />
                    <label className="pl-2 label-text" htmlFor="comp-type-pay">For Pay</label>
                  </div>
                  <div className="flex items-center pb-1">
                    <input
                      type="radio"
                      value="For Credit"
                      id="comp-type-credit"
                      {...register("type", { required: true })}
                      checked={compensationType === "For Credit"}
                      onChange={() => handleCompensationTypeChange("For Credit")}
                      className="h-4 w-4"
                    />
                    <label className="pl-2 label-text" htmlFor="comp-type-credit">For Credit</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value="Any"
                      id="comp-type-any"
                      {...register("type", { required: true })}
                      checked={compensationType === "Any"}
                      onChange={() => handleCompensationTypeChange("Any")}
                      className="h-4 w-4"
                    />
                    <label className="pl-2 label-text" htmlFor="comp-type-any">Any</label>
                  </div>
                </div>

                {/* Conditionally Render Pay Input or Credit Checkboxes */}
                {compensationType === "For Pay" || compensationType === "Any" ? (
                  <div className="w-1/3 pr-3 pl-3">
                    <div className="w-4/5">
                      <Input
                        errors={errors}
                        label="Hourly Pay (min. 0)"
                        name={"hourlyPay"}
                        errorMessage={"Hourly pay must be at least 0"}
                        formHook={{
                          ...register("hourlyPay", {
                            required: compensationType === "For Pay",
                            min: 0,
                            validate: (value) => validatePayRate(value, compensationType === "For Pay")
                          }),
                        }}
                        type="number"
                        options={[]}
                        placeHolder="Enter hourly pay"
                      />
                    </div>
                    
                    <div className="mt-3">
                      <Input
                        errors={errors}
                        label="Compensation Details (optional)"
                        name={"compensation_details"}
                        errorMessage={""}
                        formHook={{
                          ...register("compensation_details"),
                        }}
                        type="textarea"
                        options={[]}
                        placeHolder="Additional details about compensation (e.g., bonuses, stipends)"
                      />
                    </div>
                  </div>
                ) : null}

                {compensationType === "For Credit" || compensationType === "Any" ? (
                  <div className="w-1/3 pl-3">
                    <CheckBox
                      label="Credits"
                      options={["1", "2", "3", "4", "5", "6"]}
                      errors={errors}
                      errorMessage={"You must select at least one credit option"}
                      name={"credits"}
                      type="checkbox"
                      formHook={{
                        ...register("credits", {
                          required: compensationType === "For Credit",
                          validate: (value) => validateCredits(value, compensationType === "For Credit")
                        }),
                      }}
                    />
                    
                    <div className="mt-3">
                      <Input
                        errors={errors}
                        label="Related Courses (optional)"
                        name={"related_courses"}
                        errorMessage={""}
                        formHook={{
                          ...register("related_courses"),
                        }}
                        type="tags"
                        options={[]}
                        placeHolder="Enter course codes and press Enter"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <div className="flex flex-row mb-4">
                  <div className="w-1/2 pl-3">
                    <CheckBox
                      label="Eligible Class Years"
                      options={years.map(String)}
                      errors={errors}
                      errorMessage={"At least one year must be selected"}
                      name={"years"}
                      formHook={{ 
                        ...register("years", { 
                          required: true,
                          validate: (value) => {
                            if (!value || value.length === 0) return "At least one year must be selected";
                            return true;
                          }
                        }) 
                      }}
                      type="checkbox"
                    />
                  </div>
                  
                  <div className="w-1/2 pr-3 pl-3">
                    <Input
                      errors={errors}
                      label="Hours Per Week"
                      name={"hours_per_week"}
                      type="number"
                      options={[]}
                      errorMessage={"Hours must be between 1 and 40"}
                      formHook={{
                        ...register("hours_per_week", {
                          min: 1,
                          max: 40,
                          valueAsNumber: true,
                        }),
                      }}
                      placeHolder="Expected hours per week"
                    />
                    
                    <div className="mt-4">
                      <Input
                        errors={errors}
                        label="Number of Positions Available"
                        name={"position_count"}
                        type="number"
                        options={[]}
                        errorMessage={"Must be at least 1"}
                        formHook={{
                          ...register("position_count", {
                            min: 1,
                            valueAsNumber: true,
                          }),
                        }}
                        placeHolder="Number of openings"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row mb-4">
                  <div className="w-1/2 pl-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allow_team_applications"
                        className="mr-2 h-4 w-4"
                        {...register("allow_team_applications")}
                      />
                      <label htmlFor="allow_team_applications" className="label-text font-medium">
                        Allow team applications
                      </label>
                    </div>
                    
                    {allowTeamApplications && (
                      <div className="mt-3 pl-6">
                        <Input
                          errors={errors}
                          label="Maximum Team Size"
                          name={"team_size_limit"}
                          type="number"
                          options={[]}
                          errorMessage={"Team size must be at least 2"}
                          formHook={{
                            ...register("team_size_limit", {
                              min: 2,
                              valueAsNumber: true,
                              required: allowTeamApplications,
                            }),
                          }}
                          placeHolder="Maximum team members"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="w-1/2 pr-3 pl-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="interview_required"
                        className="mr-2 h-4 w-4"
                        {...register("interview_required")}
                      />
                      <label htmlFor="interview_required" className="label-text font-medium">
                        Interview required
                      </label>
                    </div>
                    
                    {interviewRequired && (
                      <div className="mt-3 pl-6">
                        <Input
                          errors={errors}
                          label="Number of Interview Rounds"
                          name={"interview_rounds"}
                          type="number"
                          options={[]}
                          errorMessage={"Must be at least 1"}
                          formHook={{
                            ...register("interview_rounds", {
                              min: 1,
                              valueAsNumber: true,
                              required: interviewRequired,
                            }),
                          }}
                          placeHolder="Number of interview rounds"
                        />
                        
                        <div className="mt-3">
                          <Input
                            errors={errors}
                            label="Interview Details"
                            name={"interview_details"}
                            type="textarea"
                            options={[]}
                            errorMessage={""}
                            formHook={{
                              ...register("interview_details"),
                            }}
                            placeHolder="Additional details about the interview process"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                >
                  Previous Step
                </button>
                
                <button
                  type="button"
                  className="btn btn-primary bg-blue-700"
                  onClick={handleNextStep}
                  disabled={!canMoveToNextStep()}
                >
                  Next Step
                </button>
              </div>
            </section>
          )}
          
          {/* Step 3: Description */}
          {activeStep === 3 && (
            <section className="step-content">
              <h2 className="text-xl font-bold mb-4">Description & Requirements</h2>
              
              <div className="mb-6">
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <label className="label-text font-medium block mb-2">
                        Description (min. 10 characters)
                      </label>
                      <MarkdownEditor
                        ref={descriptionEditorRef}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter a detailed description of the opportunity"
                        height="200px"
                      />
                      {error && (
                        <span className="text-red-500 text-sm mt-1 block">
                          {error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
              
              <div className="mb-6">
                <Controller
                  name="recommended_experience"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="label-text font-medium block mb-2">
                        Recommended Experience
                      </label>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Describe the preferred qualifications, skills, and background"
                        height="150px"
                      />
                    </div>
                  )}
                />
              </div>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/2 pl-3">
                  <Controller
                    name="skills_required"
                    control={control}
                    render={({ field }) => (
                      <TagSelector
                        label="Required Skills"
                        value={field.value || []}
                        onChange={field.onChange}
                        suggestions={Skills}
                        placeholder="Enter required skills"
                      />
                    )}
                  />
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <Controller
                    name="skills_preferred"
                    control={control}
                    render={({ field }) => (
                      <TagSelector
                        label="Preferred Skills (optional)"
                        value={field.value || []}
                        onChange={field.onChange}
                        suggestions={Skills}
                        placeholder="Enter preferred skills"
                      />
                    )}
                  />
                </div>
              </div>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/2 pl-3">
                  <Input
                    errors={errors}
                    label="Application URL (optional)"
                    name={"application_url"}
                    type="text"
                    options={[]}
                    errorMessage={"Please enter a valid URL"}
                    formHook={{
                      ...register("application_url", {
                        validate: (value) => {
                          if (!value) return true;
                          return validateURL(value) || "Please enter a valid URL";
                        }
                      }),
                    }}
                    placeHolder="External application link (if applicable)"
                  />
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <Input
                    errors={errors}
                    label="Application Instructions (optional)"
                    name={"application_instructions"}
                    type="textarea"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("application_instructions"),
                    }}
                    placeHolder="Additional information about how to apply"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <div className="flex flex-row mb-4">
                  <div className="w-1/2 pl-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="travel_required"
                        className="mr-2 h-4 w-4"
                        {...register("travel_required")}
                      />
                      <label htmlFor="travel_required" className="label-text font-medium">
                        Travel required
                      </label>
                    </div>
                    
                    {travelRequired && (
                      <div className="mt-3 pl-6">
                        <Input
                          errors={errors}
                          label="Travel Details"
                          name={"travel_details"}
                          type="textarea"
                          options={[]}
                          errorMessage={"Travel details are required"}
                          formHook={{
                            ...register("travel_details", {
                              required: travelRequired,
                            }),
                          }}
                          placeHolder="Describe travel requirements"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="w-1/2 pr-3 pl-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="equipment_required"
                        className="mr-2 h-4 w-4"
                        {...register("equipment_required")}
                      />
                      <label htmlFor="equipment_required" className="label-text font-medium">
                        Special equipment required
                      </label>
                    </div>
                    
                    {equipmentRequired && (
                      <div className="mt-3 pl-6">
                        <Input
                          errors={errors}
                          label="Equipment Details"
                          name={"equipment_details"}
                          type="textarea"
                          options={[]}
                          errorMessage={"Equipment details are required"}
                          formHook={{
                            ...register("equipment_details", {
                              required: equipmentRequired,
                            }),
                          }}
                          placeHolder="Describe required equipment"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Show this section only if it's the last step or if advanced options are open */}
              {(activeStep === totalSteps || isAdvancedOpen) && (
                <div className="border-t border-gray-200 my-6 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  
                  <div className="flex flex-row mb-4">
                    <div className="w-1/3 pl-3">
                      <Input
                        errors={errors}
                        label="Contact Name"
                        name={"contact_name"}
                        type="text"
                        options={[]}
                        errorMessage={"Contact name is required"}
                        formHook={{
                          ...register("contact_name", {
                            required: activeStep === totalSteps,
                          }),
                        }}
                        placeHolder="Contact person's name"
                      />
                    </div>
                    
                    <div className="w-1/3 pr-3 pl-3">
                      <Input
                        errors={errors}
                        label="Contact Email"
                        name={"contact_email"}
                        type="email"
                        options={[]}
                        errorMessage={"Valid email is required"}
                        formHook={{
                          ...register("contact_email", {
                            required: activeStep === totalSteps,
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Invalid email format",
                            },
                          }),
                        }}
                        placeHolder="Contact email address"
                      />
                    </div>
                    
                    <div className="w-1/3 pr-3">
                      <Input
                        errors={errors}
                        label="Contact Phone (optional)"
                        name={"contact_phone"}
                        type="tel"
                        options={[]}
                        errorMessage={""}
                        formHook={{
                          ...register("contact_phone"),
                        }}
                        placeHolder="Contact phone number"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {totalSteps > 3 && !isAdvancedOpen && (
                <div className="mt-4 mb-6">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                    onClick={toggleAdvancedOptions}
                  >
                    Show Advanced Options
                  </button>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                >
                  Previous Step
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={togglePreviewMode}
                  >
                    Preview
                  </button>
                  
                  {activeStep === totalSteps ? (
                    <button
                      type="submit"
                      className="btn btn-primary bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                          {edit ? "Updating..." : "Submitting..."}
                        </span>
                      ) : (
                        edit ? "Update Opportunity" : "Create Opportunity"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary bg-blue-700"
                      onClick={handleNextStep}
                      disabled={!canMoveToNextStep()}
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
          
          {/* Step 4: Additional Info (Research related) */}
          {activeStep === 4 && (
            <section className="step-content">
              <h2 className="text-xl font-bold mb-4">Research Information</h2>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/2 pl-3">
                  <Input
                    errors={errors}
                    label="Faculty Sponsor"
                    name={"faculty_sponsor"}
                    type="text"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("faculty_sponsor"),
                    }}
                    placeHolder="Name of faculty sponsor"
                  />
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <Input
                    errors={errors}
                    label="Lab/Research Group Name"
                    name={"lab_name"}
                    type="text"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("lab_name"),
                    }}
                    placeHolder="Name of lab or research group"
                  />
                </div>
              </div>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/2 pl-3">
                  <Input
                    errors={errors}
                    label="Research Area"
                    name={"research_area"}
                    type="text"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("research_area"),
                    }}
                    placeHolder="Field of research"
                  />
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <Input
                    errors={errors}
                    label="Project Timeline"
                    name={"project_timeline"}
                    type="textarea"
                    options={[]}
                    errorMessage={""}
                    formHook={{
                      ...register("project_timeline"),
                    }}
                    placeHolder="Timeline details for the research project"
                  />
                </div>
              </div>
              
              <div className="flex flex-row mb-6">
                <div className="w-1/2 pl-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="grant_funded"
                      className="mr-2 h-4 w-4"
                      {...register("grant_funded")}
                    />
                    <label htmlFor="grant_funded" className="label-text font-medium">
                      Grant funded
                    </label>
                  </div>
                  
                  {grantFunded && (
                    <div className="mt-3 pl-6">
                      <Input
                        errors={errors}
                        label="Grant Name/Source"
                        name={"grant_name"}
                        type="text"
                        options={[]}
                        errorMessage={"Grant information is required"}
                        formHook={{
                          ...register("grant_name", {
                            required: grantFunded,
                          }),
                        }}
                        placeHolder="Name or source of grant"
                      />
                    </div>
                  )}
                </div>
                
                <div className="w-1/2 pr-3 pl-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="publication_possibility"
                      className="mr-2 h-4 w-4"
                      {...register("publication_possibility")}
                    />
                    <label htmlFor="publication_possibility" className="label-text font-medium">
                      Possibility of publication
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
                
                <div className="flex flex-row mb-4">
                  <div className="w-1/2 pl-3">
                    <Input
                      errors={errors}
                      label="Additional Requirements"
                      name={"additional_requirements"}
                      type="textarea"
                      options={[]}
                      errorMessage={""}
                      formHook={{
                        ...register("additional_requirements"),
                      }}
                      placeHolder="Any other requirements or qualifications"
                    />
                  </div>
                  
                  <div className="w-1/2 pr-3 pl-3">
                    <Input
                      errors={errors}
                      label="Notes"
                      name={"notes"}
                      type="textarea"
                      options={[]}
                      errorMessage={""}
                      formHook={{
                        ...register("notes"),
                      }}
                      placeHolder="Additional notes for administrators (not shown to applicants)"
                    />
                  </div>
                </div>
                
                <div className="flex flex-row mb-4">
                  <div className="w-1/2 pl-3">
                    <Input
                      errors={errors}
                      label="Visibility"
                      name={"visibility"}
                      type="select"
                      options={["Public", "Department Only", "Invite Only", "Draft"]}
                      errorMessage={"Visibility is required"}
                      formHook={{
                        ...register("visibility", {
                          required: true,
                        }),
                      }}
                      placeHolder="Select visibility"
                    />
                  </div>
                  
                  <div className="w-1/2 pr-3 pl-3">
                    <div className="flex items-center mt-8">
                      <input
                        type="checkbox"
                        id="is_featured"
                        className="mr-2 h-4 w-4"
                        {...register("is_featured")}
                      />
                      <label htmlFor="is_featured" className="label-text font-medium">
                        Feature this opportunity on the homepage
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <h3 className="text-lg font-semibold mb-4">Opportunity Files</h3>
                
                <div className="mb-6">
                  <Controller
                    name="opportunity_image"
                    control={control}
                    render={({ field }) => (
                      <ImageUploader
                        label="Opportunity Image (optional)"
                        value={field.value}
                        onChange={field.onChange}
                        maxSize={5}
                        acceptedTypes={["image/jpeg", "image/png", "image/gif"]}
                        description="Upload an image to represent this opportunity (max 5MB)"
                      />
                    )}
                  />
                </div>
                
                <div className="mb-6">
                  <Controller
                    name="opportunity_documents"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="label-text font-medium block mb-2">
                          Additional Documents (optional)
                        </label>
                        <div className="border-dashed border-2 border-gray-300 p-4 rounded">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              const fileNames = files.map(file => file.name);
                              field.onChange([...(field.value || []), ...fileNames]);
                            }}
                            className="hidden"
                            id="opportunity-documents"
                            accept=".pdf,.doc,.docx,.txt"
                          />
                          <label htmlFor="opportunity-documents" className="btn btn-outline-secondary block w-full text-center cursor-pointer">
                            Upload Documents
                          </label>
                          <p className="text-sm text-gray-500 mt-2">
                            Accepted formats: PDF, DOC, DOCX, TXT (max 10MB each)
                          </p>
                        </div>
                        
                        {field.value && field.value.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium">Uploaded Documents:</h4>
                            <ul className="list-disc pl-5">
                              {field.value.map((fileName, index) => (
                                <li key={index} className="text-sm">
                                  {fileName}
                                  <button
                                    type="button"
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      const newFiles = [...field.value];
                                      newFiles.splice(index, 1);
                                      field.onChange(newFiles);
                                    }}
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-6 pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                
                <div className="flex flex-row mb-4">
                  <div className="w-1/3 pl-3">
                    <Input
                      errors={errors}
                      label="Contact Name"
                      name={"contact_name"}
                      type="text"
                      options={[]}
                      errorMessage={"Contact name is required"}
                      formHook={{
                        ...register("contact_name", {
                          required: true,
                        }),
                      }}
                      placeHolder="Contact person's name"
                    />
                  </div>
                  
                  <div className="w-1/3 pr-3 pl-3">
                    <Input
                      errors={errors}
                      label="Contact Email"
                      name={"contact_email"}
                      type="email"
                      options={[]}
                      errorMessage={"Valid email is required"}
                      formHook={{
                        ...register("contact_email", {
                          required: true,
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email format",
                          },
                        }),
                      }}
                      placeHolder="Contact email address"
                    />
                  </div>
                  
                  <div className="w-1/3 pr-3">
                    <Input
                      errors={errors}
                      label="Contact Phone (optional)"
                      name={"contact_phone"}
                      type="tel"
                      options={[]}
                      errorMessage={""}
                      formHook={{
                        ...register("contact_phone"),
                      }}
                      placeHolder="Contact phone number"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevStep}
                >
                  Previous Step
                </button>
                
                <div className="flex gap-3">
                  {allowDraftSaving && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={saveDraft}
                      disabled={isDraftSaving}
                    >
                      {isDraftSaving ? "Saving..." : "Save as Draft"}
                    </button>
                  )}
                  
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={togglePreviewMode}
                  >
                    Preview
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        {edit ? "Updating..." : "Submitting..."}
                      </span>
                    ) : (
                      edit ? "Update Opportunity" : "Create Opportunity"
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}
          
          {/* Draft auto-save indicator */}
          {allowDraftSaving && lastSaved && (
            <div className="text-xs text-gray-500 mt-4 text-right">
              Last auto-saved: {lastSaved.toLocaleTimeString()}
              <button
                type="button"
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                onClick={clearDraft}
              >
                Clear Draft
              </button>
            </div>
          )}
        </form>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal
          title="Confirm Submission"
          onClose={() => setShowConfirmation(false)}
          footerButtons={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary bg-blue-700"
                onClick={() => {
                  setShowConfirmation(false);
                  formRef.current?.requestSubmit();
                }}
              >
                Confirm
              </button>
            </>
          }
        >
          <p>Are you sure you want to {edit ? "update" : "submit"} this opportunity?</p>
          <p className="mt-2">
            Once {edit ? "updated" : "submitted"}, it will be visible to students according to your visibility settings.
          </p>
        </Modal>
      )}
    </div>
  );
}

// Utility Components and Hooks (normally these would be in separate files)

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (state === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    function handleScroll() {
      setScrollPosition(window.scrollY);
    }
    
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return scrollPosition;
}

function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

function useFormErrors(formState) {
  const { errors } = formState;
  const [errorList, setErrorList] = useState([]);
  
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const newErrorList = Object.entries(errors).map(([field, error]) => ({
        field,
        message: error.message || `${field} is invalid`,
      }));
      
      setErrorList(newErrorList);
    } else {
      setErrorList([]);
    }
  }, [errors]);
  
  return errorList;
}

function useFormAnalytics(formId) {
  useEffect(() => {
    function trackFormInteraction(event) {
      if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT" || event.target.tagName === "TEXTAREA") {
        const fieldName = event.target.name || "unknown";
        const fieldType = event.target.type || "unknown";
        
        trackFormEvent("field_interaction", {
          formId,
          fieldName,
          fieldType,
        });
      }
    }
    
    document.addEventListener("focus", trackFormInteraction, true);
    
    return () => {
      document.removeEventListener("focus", trackFormInteraction, true);
    };
  }, [formId]);
}

function useStickyFormHeader() {
  const scrollPosition = useScrollPosition();
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  
  useEffect(() => {
    if (headerRef.current) {
      const headerOffset = headerRef.current.offsetTop;
      
      if (scrollPosition > headerOffset) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    }
  }, [scrollPosition]);
  
  return { isSticky, headerRef };
}

function generateOpportunityId() {
  return `opp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end >= start;
}

function calculateDurationInWeeks(startDate, endDate) {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const differenceInTime = end.getTime() - start.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  
  return Math.ceil(differenceInDays / 7);
}

function sanitizeFormData(data) {
  const sanitized = { ...data };
  
  // Convert empty strings to null
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === "") {
      sanitized[key] = null;
    }
  });
  
  // Ensure arrays are not empty
  if (Array.isArray(sanitized.years) && sanitized.years.length === 0) {
    sanitized.years = null;
  }
  
  if (Array.isArray(sanitized.credits) && sanitized.credits.length === 0) {
    sanitized.credits = null;
  }
  
  return sanitized;
}

function getFormMode(edit, isDraft) {
  if (edit) {
    return "edit";
  } else if (isDraft) {
    return "draft";
  } else {
    return "create";
  }
}

function getOpportunityTypeLabel(type) {
  switch (type) {
    case "For Pay":
      return "Paid";
    case "For Credit":
      return "For Credit";
    case "Any":
      return "Paid or Credit";
    default:
      return type;
  }
}

function getRequiredFieldsForStep(step) {
  switch (step) {
    case 1:
      return ["title", "location", "application_due"];
    case 2:
      return ["type", "years"];
    case 3:
      return ["description"];
    case 4:
      return ["contact_name", "contact_email"];
    default:
      return [];
  }
}

// Analytics tracking function
function trackFormEvent(eventName, eventData) {
  if (typeof window !== "undefined" && window.analytics) {
    window.analytics.track(eventName, eventData);
  }
}

// Error logging function
function logFormError(error, context) {
  console.error(`Form Error (${context}):`, error);
  
  if (typeof window !== "undefined" && window.errorLogger) {
    window.errorLogger.captureError(error, {
      tags: {
        component: "CreationForms",
        context,
      },
    });
  }
}