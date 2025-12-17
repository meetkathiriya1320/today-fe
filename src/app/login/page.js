"use client";
import React, { useState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import Modal from "@/components/modal";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { postResponse } from "@/lib/response";
import { useRouter, useSearchParams } from "next/navigation";
import { setCurrentUserCookie } from "@/utils/cookieUtils";
import useSocket from "@/hooks/useSocket";

const LoginPage = () => {
    const router = useRouter();
    const socket = useSocket()
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [showPassword, setShowPassword] = useState(false);
    const [unblockModalOpen, setUnblockModalOpen] = useState(false);
    const [unblockNote, setUnblockNote] = useState("");
    const [blockedUserId, setBlockedUserId] = useState(null);
    const [blockReason, setBlockReason] = useState("");
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });

    // Yup validation schema
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const login = async (payload, setSubmitting) => {
        try {
            const res = await postResponse({
                apiEndPoint: "/auth/login",
                payload,
                navigate: router.push,
            });

            // Check if user is blocked (code 2003)
            if (res.response?.code === 2003) {
                setRoleModalOpen(false)
                setBlockedUserId(res.response?.data?.blocked_user.user_id || null);
                setBlockReason(
                    res.response?.message || "Your account has been blocked"
                );

                setUnblockModalOpen(true);
                setSubmitting && setSubmitting(false);
                return;
            }

            if (res.successType && !res.response.data.is_business_added && !res.response.data.business && res.response?.data?.user?.role === "business_owner") {
                router.push(`/business-details?user_id=${res.response.data.user.id}`);
            } else if (res.successType) {
                if (res.response.data.roles && res.response.data.roles.length > 1) {

                    setRoles(res.response.data.roles);
                    setRoleModalOpen(true);
                    setSubmitting && setSubmitting(false);
                    return;
                }

                const { branches = null, business_images = null, ...rest } = res.response.data.business || {}

                setCurrentUserCookie({
                    ...rest,
                    ...res.response.data.user,
                    business_id: res.response.data.business?.id,
                    token: res.response.data.token,
                });
                if (res.response.data.user.role === "admin") {
                    router.push("/admin/dashboard");
                } else if (res.response.data.user.role === "business_owner") {
                    console.log("secound")
                    router.push("/dashboard");
                } else {
                    router.push("/");
                }
                // console.log(res.successType, res.response.data.is_business_added)
            }
            setRoleModalOpen(false);
        } catch (error) {
            console.log(error, "login-error");
        } finally {
            setSubmitting && setSubmitting(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoginCredentials(values);
        const payload = {
            email: values.email,
            password: values.password,
        };
        if (role) {
            payload.role = role;
        } else {
            payload.role = "admin";
        }
        await login(payload, setSubmitting);
    };

    // Handle unblock request submission
    const handleUnblockRequest = async () => {
        if (!unblockNote.trim()) {
            return;
        }

        try {
            const res = await postResponse({
                apiEndPoint: "/admin/send-unblock-request",
                payload: {
                    user_id: blockedUserId,
                    note: unblockNote.trim(),
                },
            });

            if (res.successType) {
                if (res.response.data.notifications?.data?.length > 0) {
                    socket.emit("send-notification-to-business-owner", {
                        ...res.response.data.notifications
                    });
                }
                setUnblockModalOpen(false);
                setUnblockNote("");
                setBlockedUserId(null);
                setBlockReason("");
            }
        } catch (error) {
            console.error("Error sending unblock request:", error);
        }
    };

    // Close unblock modal
    const closeUnblockModal = () => {
        setUnblockModalOpen(false);
        setUnblockNote("");
        setBlockedUserId(null);
        setBlockReason("");
    };

    // Handle role selection submit
    const handleRoleSubmit = async () => {
        if (!selectedRole) return;
        await login({
            ...loginCredentials,
            role_id: selectedRole,
        }, null);
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
                            Login
                        </h1>
                    </div>

                    {/* Header */}
                    <div className="text-start mb-8 min-h-[80px]">
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                            Welcome Back 👋
                        </h1>
                        <p className="text-[var(--color-text-muted)]">
                            Please login to continue to your account.
                        </p>
                    </div>

                    {/* Formik Form */}
                    <Formik
                        initialValues={{ email: "", password: "" }}
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

                                <Field name="password">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
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

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-[var(--color-text-primary)] text-bold"
                                        />
                                        <span className="ml-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
                                            Remember me
                                        </span>
                                    </label>
                                    <Link
                                        href={`/forgot-password${role ? `?role=${role}` : ''}`}
                                        className="text-sm text-[var(--color-secondary)] font-semibold cursor-pointer"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    label="Sign In"
                                    loading={isSubmitting}
                                    loadingText="Signing in..."
                                    fullWidth
                                    variant="primary"
                                />
                            </Form>
                        )}
                    </Formik>

                    {/* Back to Home Button */}
                    <div className="mt-6 text-center">
                        <Link href="/">
                            <Button
                                type="button"
                                label="Back to Home Page"
                                variant="outline"
                                fullWidth
                            />
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center">
                        <p className="text-[var(--color-text-muted)]">
                            Don’t have an account?{" "}
                            <button
                                type="button"
                                className="text-[var(--color-secondary)] font-semibold cursor-pointer underline"
                            >
                                <Link href="/sign-up"> Sign up </Link>
                            </button>
                        </p>

                        {/* Unblock Request Modal */}
                        <Modal
                            title="Account Blocked"
                            open={unblockModalOpen}
                            closeModal={closeUnblockModal}
                            width="w-[500px]"
                        >
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">
                                        <strong>Reason:</strong> {blockReason}
                                    </p>
                                </div>

                                <div className="text-start">
                                    <Input
                                        label="Please provide a reason for your unblock request"
                                        isTextarea={true}
                                        value={unblockNote}
                                        onChange={(e) => setUnblockNote(e.target.value)}
                                        placeholder="Enter your reason for unblock request..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        label="Cancel"
                                        variant="outline"
                                        onClick={closeUnblockModal}
                                    />
                                    <Button
                                        label="Send Request"
                                        onClick={handleUnblockRequest}
                                        disabled={!unblockNote.trim()}
                                    />
                                </div>
                            </div>
                        </Modal>

                        {/* Role Selection Modal */}
                        <Modal
                            title="Login as"
                            open={roleModalOpen}
                            closeModal={() => setRoleModalOpen(false)}
                            width="w-[400px]"
                            borderColor="var(--color-secondary)"
                        >
                            <div className="space-y-3">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.id}
                                            checked={selectedRole === role.id}
                                            onChange={() => setSelectedRole(role.id)}
                                            className="mr-3 accent-[var(--color-secondary)]"
                                        />
                                        <span className="text-sm font-medium text-[var(--color-text-primary)]">{role.name
                                            .split("_")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")
                                        }</span>
                                    </label>
                                ))}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        label="Cancel"
                                        variant="outline"
                                        onClick={() => setRoleModalOpen(false)}
                                    />
                                    <Button
                                        label="Select"
                                        onClick={handleRoleSubmit}
                                        disabled={!selectedRole}
                                    />
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;