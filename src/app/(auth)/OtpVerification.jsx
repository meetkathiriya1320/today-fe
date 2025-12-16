"use client";
import React, { useState, useRef, useEffect } from "react";
import Modal from "@/components/modal";
import Button from "@/components/button";
import { toast } from "react-hot-toast";
import { postResponse } from "@/lib/response";
import useSocket from "@/hooks/useSocket";

const OtpVerification = ({ open, closeModal, email, onVerify, activeTab }) => {
    const OTP_LENGTH = 6;
    const TIMER_SECONDS = 30;
    const socket = useSocket()

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [activeInput, setActiveInput] = useState(0);
    const [timer, setTimer] = useState(TIMER_SECONDS);
    const [resendActive, setResendActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    // Timer logic
    useEffect(() => {
        if (!open) return;
        if (timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setResendActive(true);
        }
    }, [timer, open]);

    // Autofocus on active input
    useEffect(() => {
        if (open && inputRefs.current[activeInput]) {
            inputRefs.current[activeInput].focus();
        }
    }, [activeInput, open]);

    // Reset when modal opens
    useEffect(() => {
        if (open) {
            setOtp(Array(OTP_LENGTH).fill(""));
            setTimer(TIMER_SECONDS);
            setResendActive(false);
            setActiveInput(0);
        }
    }, [open]);

    // Handle OTP input change
    const handleChange = (e, idx) => {
        const val = e.target.value.replace(/[^0-9]/g, "");
        if (!val) return;

        const newOtp = [...otp];
        newOtp[idx] = val[0];
        setOtp(newOtp);

        // Move to next input if not last
        if (idx < OTP_LENGTH - 1) {
            setActiveInput(idx + 1);
        }
    };

    // Handle keyboard navigation & backspace
    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const newOtp = [...otp];
            if (newOtp[idx]) {
                newOtp[idx] = "";
                setOtp(newOtp);
            } else if (idx > 0) {
                newOtp[idx - 1] = "";
                setOtp(newOtp);
                setActiveInput(idx - 1);
            }
        } else if (e.key === "ArrowLeft" && idx > 0) {
            e.preventDefault();
            setActiveInput(idx - 1);
        } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
            e.preventDefault();
            setActiveInput(idx + 1);
        }
    };

    // Handle paste
    const handlePaste = (e, idx) => {
        const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
        if (!paste) return;
        e.preventDefault();
        const newOtp = [...otp];
        let i = idx;
        for (let char of paste) {
            if (i < OTP_LENGTH) {
                newOtp[i] = char;
                i++;
            }
        }
        setOtp(newOtp);
        setActiveInput(Math.min(idx + paste.length, OTP_LENGTH - 1));
    };

    // Handle verify
    const handleVerify = async () => {
        try {
            const otpString = otp.join("");
            if (otpString.length < OTP_LENGTH) {
                toast.error("Please enter complete OTP");
                return;
            }

            const role = activeTab === "user" ? "user" : "business_owner";

            setIsLoading(true);
            const res = await postResponse({
                apiEndPoint: "/auth/verify-otp",
                payload: { email, otp: otpString, role },
            });
            if (res.successType) {
                const userId = res.response?.data?.user?.id
                const notificationData = { ...res.response?.data?.notifications }
                if (notificationData.length > 0) {
                    socket.emit("send-notification-to-business-owner", {
                        ...notificationData
                    });
                }

                closeModal();
                if (onVerify) onVerify(userId);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    };

    // Handle resend
    const handleResend = async () => {
        const res = await postResponse({
            apiEndPoint: "/auth/resend-otp",
            payload: { email },
        });
        if (res.successType) {
            setOtp(Array(OTP_LENGTH).fill(""));
            setTimer(TIMER_SECONDS);
            setResendActive(false);
            setActiveInput(0);
        }
    };

    return (
        <Modal
            open={open}
            closeModal={closeModal}
            title="Verify OTP"
            icon={false}
            disableOutsideClick={true}
        >
            <div className="flex flex-col items-center gap-4 mt-3">
                <p className="text-gray-600 text-center">
                    Enter the 4-digit code we sent to your email or phone.
                </p>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mt-2">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            onFocus={() => setActiveInput(idx)}
                            onPaste={(e) => handlePaste(e, idx)}
                            className="w-12 h-12 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary,#013E94)] bg-white"
                        />
                    ))}
                </div>

                {/* Timer / Resend */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    {timer > 0 ? (
                        <span>Resend available in {timer}s</span>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={!resendActive}
                            className="text-[var(--color-secondary,#013E94)] font-medium hover:underline"
                        >
                            Resend OTP
                        </button>
                    )}
                </div>

                {/* Verify Button */}
                <Button
                    onClick={handleVerify}
                    disabled={isLoading}
                    className="w-full mt-2"
                    label={isLoading ? "Verifying..." : "Verify"}
                />
            </div>
        </Modal>
    );
};

export default OtpVerification;
