"use client";

import React, { useState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { Mail } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { postResponse } from "@/lib/response";
import { useRouter, useSearchParams } from "next/navigation";

// Yup validation schema
const validationSchema = Yup.object({
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
});

const ForgotPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'admin';

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setSubmitting(true);
            await postResponse({
                apiEndPoint: "/auth/forgot-password",
                payload: {
                    email: values.email,
                    role: role,
                },
            });

        } catch (error) {
            console.error("Forgot password error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-contain bg-center backdrop-blur-[50px]"
            style={{ backgroundImage: "url('../assets/bg.png')" }}
        >
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Page Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            Forgot Password
                        </h1>
                    </div>

                    {/* Header */}
                    <div className="text-start mb-8 min-h-[80px]">
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                            Reset Your Password
                        </h1>
                        <p className="text-[var(--color-text-muted)]">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {/* Formik Form */}
                    <Formik
                        initialValues={{ email: "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, values, handleChange }) => (
                            <Form className="space-y-6">
                                <Field name="email">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="Enter your email"
                                            {...field}
                                            value={values.email}
                                            onChange={handleChange}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                            startIcon={<Mail size={18} />}
                                            name="email"
                                        />
                                    )}
                                </Field>

                                <Button
                                    type="submit"
                                    label="Send Reset Link"
                                    loading={isSubmitting}
                                    loadingText="Sending..."
                                    fullWidth
                                    variant="primary"
                                />
                            </Form>
                        )}
                    </Formik>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link href={`/login${role ? `?role=${role}` : ''}`}>
                            <Button
                                type="button"
                                label="Back to Login"
                                variant="outline"
                                fullWidth
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;