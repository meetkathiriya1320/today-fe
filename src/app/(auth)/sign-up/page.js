"use client";
import React, { useState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { postResponse } from "@/lib/response";
import { useRouter } from "next/navigation";
import OtpVerification from "../OtpVerification";

const SignUpPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState("business"); // "user" or "business"

  // ✅ Yup validation schema
  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    terms: Yup.boolean().oneOf(
      [true],
      "You must agree to the terms and conditions"
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitting(true);
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        role: activeTab === "user" ? "user" : "business_owner",
      };

      const res = await postResponse({
        apiEndPoint: "/auth/register",
        payload: payload,
        navigate: router.push,
      });
      if (res.successType) {
        const isVerify = res.response.data.user.is_verify;
        setUserEmail(values.email);

        if (!isVerify) {
          setIsOtpModalOpen(true);
        } else {
          // For business owners, go to business details; for users, go to home
          if (activeTab === "business") {
            router.push("/business-details");
          } else {
            router.push("/");
          }
        }
        resetForm();
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-contain bg-center"
      style={{ backgroundImage: "url('../assets/bg.png')" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-start mb-8 min-h-[80px]">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              {activeTab === "user" ? "Create Your Account 👋" : "Start Your Business Journey 👋"}
            </h1>
            <p className="text-[var(--color-text-muted)]">
              {activeTab === "user"
                ? "Welcome to scheme today and get started journey."
                : "Join scheme today and grow your business with amazing offers."
              }
            </p>
          </div>

          {/* Formik Form */}
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-gray-200">

            <button
              type="button"
              onClick={() => setActiveTab("business")}
              className={`flex-1 py-3 px-4 text-base font-medium transition-all duration-200 relative ${activeTab === "business"
                ? "text-[var(--color-secondary)] font-bold border-b-2 border-[var(--color-secondary)]"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              Business Sign up
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("user")}
              className={`flex-1 py-3 px-4 text-base font-medium transition-all duration-200 relative ${activeTab === "user"
                ? "text-[var(--color-secondary)] font-bold border-b-2 border-[var(--color-secondary)]"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              User Sign up
            </button>
          </div>

          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              email: "",
              password: "",
              confirmPassword: "",
              terms: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, handleChange, touched, errors }) => (
              <Form className="space-y-5">
                {/* First Name */}
                <div className="gap-2 flex justify-between">
                  <Field name="first_name">
                    {({ field, meta }) => (
                      <Input
                        label="First Name"
                        type="text"
                        placeholder="Enter first name"
                        name={field.name}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        required
                        startIcon={<User size={18} />}
                      />
                    )}
                  </Field>

                  {/* Last Name */}
                  <Field name="last_name">
                    {({ field, meta }) => (
                      <Input
                        label="Last Name"
                        type="text"
                        placeholder="Enter last name"
                        name={field.name}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        required
                        startIcon={<User size={18} />}
                      />
                    )}
                  </Field>
                </div>
                {/* Email */}
                <Field name="email">
                  {({ field, meta }) => (
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter email"
                      name={field.name}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<Mail size={18} />}
                    />
                  )}
                </Field>

                {/* Password */}
                <Field name="password">
                  {({ field, meta }) => (
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      name={field.name}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<Lock size={18} />}
                      endIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          {!showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      }
                    />
                  )}
                </Field>

                {/* Confirm Password */}
                <Field name="confirmPassword">
                  {({ field, meta }) => (
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      name={field.name}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<Lock size={18} />}
                      endIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="hover:text-gray-700 transition-colors cursor-pointer"
                        >
                          {!showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      }
                    />
                  )}
                </Field>

                {/* Terms and Conditions */}
                <Field name="terms">
                  {({ field, meta }) => (
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          className="w-4 h-4 text-[var(--color-text-primary)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                          I agree{" "}
                          <Link
                            href="/terms-and-conditions"
                            className="text-[var(--color-secondary)] font-semibold underline"
                          >
                            Terms and conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy-policy"
                            className="text-[var(--color-secondary)] font-semibold underline"
                          >
                            Privacy policy.
                          </Link>
                        </span>
                      </label>
                      {meta.touched && meta.error && (
                        <div className="text-red-500 text-xs mt-1">
                          {meta.error}
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                {/* Submit Button */}
                <Button
                  type="submit"
                  label="Sign Up"
                  loading={isSubmitting}
                  loadingText="Creating account..."
                  fullWidth
                  variant="primary"
                />
              </Form>
            )}
          </Formik>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-[var(--color-text-muted)]">
              Already have an account?{" "}
              <Link
                href={`/login`}
                className="text-[var(--color-secondary)] font-semibold underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerification
        activeTab={activeTab}
        open={isOtpModalOpen}
        closeModal={() => setIsOtpModalOpen(false)}
        email={userEmail}
        onVerify={(userId) => {
          // For business owners, go to business details; for users, go to home
          if (activeTab === "business") {
            router.push(`/business-details?user_id=${userId}`);
          } else {
            router.push("/");
          }
        }}
      />
    </div>
  );
};

export default SignUpPage;
