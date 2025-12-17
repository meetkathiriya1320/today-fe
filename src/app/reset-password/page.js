"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { postResponse } from "@/lib/response";
import { Field, Form, Formik } from "formik";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import * as Yup from "yup";

// Yup validation schema
const validationSchema = Yup.object({
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const ResetPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const role = searchParams.get('role') || 'admin';
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setSubmitting(true);
            const res = await postResponse({
                apiEndPoint: "/auth/reset-password",
                payload: {
                    token: token,
                    password: values.password,
                },
            });

            if (res.successType) {
                // Set user cookie if provided
                const role = res.response.data?.role?.name
                // if (role === "user") {
                //     router.push("/login?role=user")
                // } else if (role === "business_owner") {
                //     router.push("/login?role=business_owner")
                // } else {
                router.push("/login")
                // }

            }
        } catch (error) {
            console.error("Reset password error:", error);
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
                            Reset Password
                        </h1>
                    </div>

                    {/* Header */}
                    <div className="text-start mb-8 min-h-[80px]">
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                            Enter New Password
                        </h1>
                        <p className="text-[var(--color-text-muted)]">
                            Please enter your new password below.
                        </p>
                    </div>

                    {/* Formik Form */}
                    <Formik
                        initialValues={{ password: "", confirmPassword: "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, values, handleChange }) => (
                            <Form className="space-y-6">
                                <Field name="password">
                                    {({ field, meta }) => (
                                        <Input
                                            label="New Password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            {...field}
                                            value={values.password}
                                            onChange={handleChange}
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
                                            name="password"
                                        />
                                    )}
                                </Field>

                                <Field name="confirmPassword">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Confirm New Password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            {...field}
                                            value={values.confirmPassword}
                                            onChange={handleChange}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                            startIcon={<Lock size={18} />}
                                            endIcon={
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="hover:text-gray-700 transition-colors cursor-pointer"
                                                >
                                                    {!showConfirmPassword ? (
                                                        <EyeOff size={18} />
                                                    ) : (
                                                        <Eye size={18} />
                                                    )}
                                                </button>
                                            }
                                            name="confirmPassword"
                                        />
                                    )}
                                </Field>

                                <Button
                                    type="submit"
                                    label="Reset Password"
                                    loading={isSubmitting}
                                    loadingText="Resetting..."
                                    fullWidth
                                    variant="primary"
                                />
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;