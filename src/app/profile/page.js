"use client";
import Button from "@/components/button";
import Input from "@/components/input";
import MultiImageUploader from "@/components/multiImageUploader";
import { deleteResponse, getResponse, patchResponse, postResponse, putResponse } from "@/lib/response";
import { setCurrentUserCookie } from "@/utils/cookieUtils";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import { Field, Form, Formik } from "formik";
import { Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";

const ProfilePage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const user = getCurrentUserCookie();

  // Get user data from cookies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {

        const params = { id: user.business_id };
        const queryString = constructQueryParams(params);

        if (user) {
          const res = await getResponse({
            apiEndPoint: "/business/get-business", queryString
          });

          const userFinalData = {
            ...user,
            business_images: res.response.data?.business_images
          }

          setUserData(userFinalData);
        }
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };

    fetchData();
  }, []);


  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle delete business image
  const handleDeleteBusinessImage = async (imageId) => {
    try {
      const queryString = constructQueryParams({
        business_id: user?.business_id,
      });
      const apiEndPoint = `/business/delete-business-image/${imageId}`;
      const response = await deleteResponse({
        apiEndPoint,
        queryString,
        navigate: router.push,
      });

      if (response.successType) {
        const businessData = response.response.data;

        // Update userData with the new business information
        const updatedUserData = {
          ...userData,
          business_name: businessData.business_name,
          business_id: businessData.id,
          business_images: businessData.business_images,
        };
        // Update cookies with new business data
        setCurrentUserCookie(updatedUserData);

        // Update userData to remove deleted image
        setUserData((prev) => ({
          ...prev,
          business_images: prev.business_images.filter(
            (img) => img.id !== imageId
          ),
        }));

        return true;
      }
    } catch (error) {
      toast.error("Failed to delete image");
      throw error;
    }
  };

  // Profile Validation Schema
  const profileValidationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  // Business Details Validation Schema
  const businessValidationSchema = Yup.object({
    business_name: Yup.string().required("Business name is required"),
  });

  // Change Password Validation Schema
  const passwordValidationSchema = Yup.object({
    current_password: Yup.string().required("Current password is required"),
    new_password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("new_password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // Handle Profile Submit
  const handleProfileSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    try {
      // Prepare the payload with first_name and last_name
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
      };

      // API call using putResponse
      const response = await putResponse({
        apiEndPoint: "/user/edit-profile",
        payload,
        navigate: router.push,
      });

      if (response.successType) {
        // Extract updated user data from response
        const updatedUserData = response.response.data;

        // Update userData state with new information
        setUserData((prev) => ({
          ...prev,
          first_name: updatedUserData.first_name,
          last_name: updatedUserData.last_name,
        }));

        const updatedCookieData = {
          ...userData,
          first_name: updatedUserData.first_name,
          last_name: updatedUserData.last_name,
        };
        setCurrentUserCookie(updatedCookieData);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      // Error handling is done by putResponse internally
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Business Details Submit
  const handleBusinessSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    try {
      // Create FormData object for file upload
      const formData = new FormData();

      // Add business name
      formData.append("business_name", values.business_name);

      // Filter and add only new image files (not existing ones with IDs)
      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          // Only add new File objects, not existing images with URLs/IDs
          if (image instanceof File) {
            formData.append("image", image);
          }
        });
      }

      // API call using putResponse
      const response = await patchResponse({
        apiEndPoint: `/business/edit-business/${userData?.business_id}`,
        payload: formData,
        navigate: router.push,
        type: "form-data",
      });
      if (response.successType) {
        // Extract business data from response
        const businessData = response.response.data;

        // Update userData with the new business information
        const updatedUserData = {
          ...userData,
          business_name: businessData.business_name,
          business_id: businessData.id,
          business_images: businessData.business_images,
        };
        setUserData(updatedUserData);
        // Update cookies with new business data
        setCurrentUserCookie(updatedUserData);
      }
    } catch (error) {
      console.error("Business update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    const payload = {
      old_password: values.current_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    const res = await postResponse({
      apiEndPoint: "/auth/change-password",
      payload,
      navigate: router.push,
    });

    if (res.successType) {
      resetForm();
      setPasswordVisibility({ current: false, new: false, confirm: false });
    }
    setSubmitting(false);
  };
  const sections = [
    { id: "profile", label: "Profile" },
    ...(user?.role === "business_owner"
      ? [{ id: "business", label: "Business Details" }]
      : []),
    { id: "password", label: "Change Password" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">
          Profile Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="border border-[var(--color-secondary)] rounded-xl shadow-md p-4 sticky top-6">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full cursor-pointer text-left px-4 py-3 rounded-lg font-semibold transition-all ${activeSection === section.id
                      ? "bg-[var(--color-secondary)] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 border border-[var(--color-secondary)] rounded-2xl ">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
                  Personal Information
                </h2>

                <Formik
                  enableReinitialize
                  initialValues={{
                    first_name: userData?.first_name || "",
                    last_name: userData?.last_name || "",
                    email: userData?.email || "",
                  }}
                  validationSchema={profileValidationSchema}
                  onSubmit={handleProfileSubmit}
                >
                  {(formik) => (
                    <Form className="space-y-6">
                      {/* First Name & Last Name Fields */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Field name="first_name">
                          {({ field, meta }) => (
                            <Input
                              label="First Name"
                              placeholder="Enter your first name"
                              {...field}
                              error={
                                meta.touched && meta.error ? meta.error : ""
                              }
                              required
                              startIcon={<User size={18} />}
                            />
                          )}
                        </Field>

                        <Field name="last_name">
                          {({ field, meta }) => (
                            <Input
                              label="Last Name"
                              placeholder="Enter your last name"
                              {...field}
                              error={
                                meta.touched && meta.error ? meta.error : ""
                              }
                              required
                              startIcon={<User size={18} />}
                            />
                          )}
                        </Field>
                      </div>

                      {/* Email Field */}
                      <Field name="email">
                        {({ field, meta }) => (
                          <Input
                            label="Email Address"
                            type="email"
                            disabled
                            placeholder="Enter your email"
                            {...field}
                            error={meta.touched && meta.error ? meta.error : ""}
                            required
                            startIcon={<Mail size={18} />}
                          />
                        )}
                      </Field>

                      {/* Submit */}
                      <Button
                        type="submit"
                        label="Update Profile"
                        fullWidth
                        loading={formik.isSubmitting}
                        className="mt-6"
                      />
                    </Form>
                  )}
                </Formik>
              </div>
            )}

            {/* Business Details Section */}
            {activeSection === "business" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
                  Business Details
                </h2>

                <Formik
                  enableReinitialize
                  initialValues={{
                    business_name: userData?.business_name || "",
                    images: userData?.business_images || [],
                  }}
                  validationSchema={businessValidationSchema}
                  onSubmit={handleBusinessSubmit}
                >
                  {(formik) => (
                    <Form className="space-y-4">
                      {/* Multi Image Uploader */}
                      <Field name="images">
                        {({ field, form, meta }) => (
                          <MultiImageUploader
                            value={field.value}
                            label="Upload business images"
                            onChange={(files) =>
                              form.setFieldValue("images", files)
                            }
                            onDeleteImage={handleDeleteBusinessImage}
                            error={meta.touched && meta.error ? meta.error : ""}
                          />
                        )}
                      </Field>

                      {/* Business & Branch Name */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Field name="business_name">
                          {({ field, meta }) => (
                            <Input
                              label="Business Name"
                              placeholder="Enter your business name"
                              {...field}
                              error={
                                meta.touched && meta.error ? meta.error : ""
                              }
                              required
                              startIcon={<Building2 size={18} />}
                            />
                          )}
                        </Field>
                      </div>
                      {/* Submit */}
                      <Button
                        type="submit"
                        label="Update Business Details"
                        fullWidth
                        loading={formik.isSubmitting}
                        className="mt-4"
                      />
                    </Form>
                  )}
                </Formik>
              </div>
            )}

            {/* Change Password Section */}
            {activeSection === "password" && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
                  Change Password
                </h2>

                <Formik
                  initialValues={{
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                  }}
                  validationSchema={passwordValidationSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {(formik) => (
                    <Form className="space-y-4">
                      <Field name="current_password">
                        {({ field, meta }) => (
                          <Input
                            label="Current Password"
                            type={
                              passwordVisibility.current ? "text" : "password"
                            }
                            placeholder="Enter current password"
                            {...field}
                            error={meta.touched && meta.error ? meta.error : ""}
                            required
                            startIcon={<Lock size={18} />}
                            endIcon={
                              !passwordVisibility.current ? (
                                <EyeOff
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("current")
                                  }
                                />
                              ) : (
                                <Eye
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("current")
                                  }
                                />
                              )
                            }
                          />
                        )}
                      </Field>

                      <Field name="new_password">
                        {({ field, meta }) => (
                          <Input
                            label="New Password"
                            type={passwordVisibility.new ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                            error={meta.touched && meta.error ? meta.error : ""}
                            required
                            startIcon={<Lock size={18} />}
                            endIcon={
                              !passwordVisibility.new ? (
                                <EyeOff
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("new")
                                  }
                                />
                              ) : (
                                <Eye
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("new")
                                  }
                                />
                              )
                            }
                          />
                        )}
                      </Field>

                      <Field name="confirm_password">
                        {({ field, meta }) => (
                          <Input
                            label="Confirm New Password"
                            type={
                              passwordVisibility.confirm ? "text" : "password"
                            }
                            placeholder="Confirm new password"
                            {...field}
                            error={meta.touched && meta.error ? meta.error : ""}
                            required
                            startIcon={<Lock size={18} />}
                            endIcon={
                              !passwordVisibility.confirm ? (
                                <EyeOff
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("confirm")
                                  }
                                />
                              ) : (
                                <Eye
                                  size={18}
                                  onClick={() =>
                                    togglePasswordVisibility("confirm")
                                  }
                                />
                              )
                            }
                          />
                        )}
                      </Field>

                      <Button
                        type="submit"
                        label="Change Password"
                        fullWidth
                        loading={formik.isSubmitting}
                        className="mt-4"
                      />
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
