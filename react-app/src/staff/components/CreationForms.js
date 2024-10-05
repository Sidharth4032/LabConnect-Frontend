import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CheckBox from "./Checkbox";
import Input from "./Input";
import { useParams } from "react-router";
import useGlobalContext from "../../context/global/useGlobalContext";

const DUMMY_DATA = {
  "d1": {
    id: "d1",
    title: "Software Intern",
    department: "Computer Science",
    location: "Remote",
    date: "2024-02-08",
    upfrontPay: 0,
    salary: 0,
    credits: 0,
    description: "This is a software internship",
    years: ["Freshman", "Junior", "Senior"],
  },
};

const CreationForms = () => {
  const { postID } = useParams();
  const [loading, setLoading] = useState(false);
  const state = useGlobalContext();
  const { loggedIn } = state;
  const { id: authorId } = state;

  async function fetchDetails(key) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(DUMMY_DATA[key]);
      }, 5000);
    });
  }

  async function fetchData(key) {
    const response = await fetchDetails(key);
    response && reset(response);
    response ? setLoading(false) : setLoading("no response");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      id: "",
      title: "",
      department: "",
      location: "",
      date: "",
      upfrontPay: 0,
      salary: 0,
      credits: 0,
      description: "",
      years: [""],
    },
  });

  useEffect(() => {
    postID && setLoading(true);
    postID && fetchData(postID);
  }, []);

  const submitHandler = (data) => {
    if (authorId) {
      console.log({ ...data, authorId });
    }
  };

  return !loading ? (
    <form
      onSubmit={handleSubmit((data) => {
        submitHandler(data);
      })}
      className="form-container" // Form container for vertical layout
    >
      {/* Group 1: Horizontal layout for Title, Department, Location, Due Date */}
      <div className="horizontal-form">
        <Input
          label="Title"
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
        />

        <Input
          errors={errors}
          label="Department"
          name={"department"}
          type="select"
          options={["Computer Science", "Biology", "Physics"]}
          errorMessage={"Department must be at least 3 characters"}
          formHook={{
            ...register("department", {
              required: true,
              minLength: 3,
              maxLength: 40,
            }),
          }}
        />

        <Input
          errors={errors}
          label="Location"
          name={"location"}
          errorMessage={"Location must be at least 5 characters"}
          formHook={{
            ...register("location", {
              required: true,
              minLength: 5,
              maxLength: 100,
            }),
          }}
        />

        <Input
          errors={errors}
          label="Due Date"
          name={"date"}
          errorMessage={"Due Date is required"}
          formHook={{ ...register("date", { required: true }) }}
          type="date"
        />
      </div>

      {/* Group 2: Horizontal layout for Upfront Pay, Salary, Credits */}
      <div className="horizontal-form">
        <Input
          errors={errors}
          label="Upfront Pay"
          name={"upfrontPay"}
          errorMessage={"Upfront Pay must be at least 0"}
          formHook={{
            ...register("upfrontPay", {
              required: true,
              min: 0,
            }),
          }}
          type="number"
        />

        <Input
          errors={errors}
          label="Salary"
          name={"salary"}
          errorMessage={"Salary must be at least 0"}
          formHook={{
            ...register("salary", {
              required: true,
              min: 0,
            }),
          }}
          type="number"
        />

        <Input
          errors={errors}
          label="Credits"
          name={"credits"}
          errorMessage={"Credits must be between 0 and 4"}
          formHook={{
            ...register("credits", {
              required: true,
              min: 0,
              max: 4,
            }),
          }}
          type="number"
        />
      </div>

      {/* Description input field */}
      <Input
        errors={errors}
        label="Description"
        name={"description"}
        errorMessage="Description must be at least 10 characters"
        formHook={{
          ...register("description", {
            required: true,
            minLength: 10,
            message: "Description must be at least 10 characters",
          }),
        }}
        type="textarea"
      />

      {/* Checkboxes for Eligible Class Years */}
      <CheckBox
        label="Eligible Class Years"
        options={["Freshman", "Sophomore", "Junior", "Senior"]}
        errors={errors}
        errorMessage={"At least one year must be selected"}
        name={"years"}
        formHook={{ ...register("years", { required: true }) }}
      />

      {/* Submit button */}
      <section className="pt-3 pb-5">
        <input type="submit" className="btn btn-primary bg-blue-700 w-full" />
      </section>
    </form>
  ) : loading === "no response" ? (
    <h1>There was no response</h1>
  ) : (
    <span className="lc-loading" />
  );
};

export default CreationForms;
