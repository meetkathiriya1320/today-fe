"use client";

import SectionHeader from "@/components/sectionHeader";
import BannerImageUploader from "@/components/bannerImageUploader";
import Input from "@/components/input";
import { postRequest } from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { postResponse } from "@/lib/response";
import useSocket from "@/hooks/useSocket";

const AdminSendNotificationPage = () => {
  const router = useRouter();
  const socket = useSocket();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    roles: [],
    message: "",
  });
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "business_owner", label: "Business Owner" },
    { value: "user", label: "User" },
  ];

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, image: file }));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const handleImageDelete = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleInputChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => {
      const isSelected = prev.roles.includes(roleValue);
      const newRoles = isSelected
        ? prev.roles.filter(role => role !== roleValue)
        : [...prev.roles, roleValue];

      return { ...prev, roles: newRoles };
    });

    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = "Please select at least one target audience";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      // Send roles as JSON string or individual entries
      formData.roles.forEach(role => {
        submitData.append("roles[]", role);
      });
      submitData.append("message", formData.message.trim());

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await postResponse({
        apiEndPoint: "/notification/create-by-admin",
        payload: submitData,
        navigate: router,
        type: "form-data"
      }
      );

      if (response?.successType) {
        // Reset form
        setFormData({
          image: null,
          roles: [],
          message: "",
        });

        setErrors({});


        // socket emit
        const notificationData = { data: response.response.data, role: formData.roles }
        socket.emit("send-notification-to-business-owner", {
          ...notificationData
        });

      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <SectionHeader
        title="Send Notification"
        mainHeader
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Image Uploader */}
        <BannerImageUploader
          label="Notification Image (Optional)"
          value={formData.image}
          onChange={handleImageChange}
          onDelete={handleImageDelete}
          aspectRatio="16/9"
        />

        {/* Target Audience Checkboxes */}
        <div className="space-y-2">
          <label className={`block text-[14px] font-bold mb-2 ${errors.roles
            ? "text-[var(--color-error)]"
            : "text-[var(--color-text-primary)]"
            }`}>
            Target Audience *
          </label>

          <div className="space-y-3">
            {roleOptions.map((role) => (
              <label key={role.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role.value)}
                  onChange={() => handleRoleChange(role.value)}
                  className="w-4 h-4 text-[var(--color-secondary)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--color-secondary)] focus:ring-2"
                />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {role.label}
                </span>
              </label>
            ))}
          </div>

          {errors.roles && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{errors.roles}</p>
          )}
        </div>

        {/* Message Textarea */}
        <Input
          label="Message"
          isTextarea
          value={formData.message}
          onChange={(e) => handleInputChange("message")(e.target.value)}
          placeholder="Enter notification message..."
          error={errors.message}
          required
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-secondary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSendNotificationPage;
