"use client";

import ActionButton from "@/components/actionButton";
import AddressAutocomplete from "@/components/addressAutocomplete";
import Button from "@/components/button";
import Input from "@/components/input";
import MultiImageUploader from "@/components/multiImageUploader";
import { Field, FieldArray, Form, Formik } from "formik";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  Building2,
  Eye,
  EyeOff,
  GitBranch,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { deleteResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import React from "react";
import * as Yup from "yup";

/**
 * Validation
 */
const branchSchema = Yup.object({
  branch_name: Yup.string().required("Branch name is required"),
  contact_name: Yup.string().required("Contact name is required"),
  phone_number: Yup.string().required("Phone number is required"),
  country_code: Yup.string().required("Country code is required"),
  iso_code: Yup.string().required("ISO code is required"),
  location: Yup.string().required("Location is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
});

const validationSchema = Yup.object({
  // Personal
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),

  // Business
  business_name: Yup.string().required("Business name is required"),

  // Branches
  branches: Yup.array()
    .of(branchSchema)
    .min(1, "At least one branch is required"),
});

const ShopOwnerForm = ({
  onSubmit,
  isEditMode = false,
  close,
  initialData = null,
}) => {
  // Handle business image deletion
  const handleDeleteBusinessImage = async (imageId) => {
    console.log(imageId, "imageIdimageId")
    try {
      const businessId = initialData?.Business?.id;
      if (!businessId) {
        throw new Error("Business ID not found");
      }

      const queryString = constructQueryParams({ business_id: businessId });
      const response = await deleteResponse({
        apiEndPoint: `business/delete-business-image/${imageId}`,
        queryString,
      });

      if (!response.successType) {
        throw new Error("Failed to delete image");
      }

      return response;
    } catch (error) {
      console.error("Error deleting business image:", error);
      throw error;
    }
  };
  // Create dynamic initial values based on edit data
  const getInitialValues = React.useMemo(() => {
    if (isEditMode && initialData) {
      return {
        // Personal
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,

        // Business
        business_name: initialData.Business?.business_name || "",
        images:
          initialData.Business?.business_images ||
          [],

        // Branches
        branches: initialData.Business?.branches?.map((branch) => ({
          branch_name: branch.branch_name || "",
          contact_name: branch.contact_name || "",
          phone_number: branch.phone_number || "",
          country_code: branch.country_code || "",
          iso_code: branch.iso_code || "",
          location: branch.location || "",
          latitude: branch.latitude || "",
          longitude: branch.longitude || "",
          city: branch.city || "",
          id: branch?.id || "",
        })) || [
            {
              branch_name: "",
              contact_name: "",
              phone_number: "",
              location: "",
              latitude: "",
              longitude: "",
              city: ""
            },
          ],
      };
    }

    // Default initial values for create mode
    return {
      // Personal
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,

      // Business
      business_name: "",
      images: [],

      // Branches: start with one branch
      branches: [
        {
          branch_name: "",
          contact_name: "",
          phone_number: "",
          country_code: "",
          iso_code: "",
          location: "",
          latitude: "",
          longitude: "",
          city: ""
        },
      ],
    };
  }, [isEditMode, initialData]);

  // Create dynamic validation schema based on mode
  const getValidationSchema = React.useMemo(() => {
    const baseSchema = {
      // Personal
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),

      // Business
      business_name: Yup.string().required("Business name is required"),

      // Branches
      branches: Yup.array()
        .of(branchSchema)
        .min(1, "At least one branch is required"),
    };

    // Only add password validation in create mode
    if (!isEditMode) {
      baseSchema.password = Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Password is required");
      baseSchema.confirmPassword = Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required");
    }

    return Yup.object().shape(baseSchema);
  }, [isEditMode]);

  return (
    <Formik
      initialValues={getInitialValues}
      validationSchema={getValidationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form className="space-y-6">
          {/* === Personal Information === */}
          <div>
            <label className="text-lg font-bold underline text-[var(--color-secondary)]">
              Personal Information
            </label>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="first_name">
                {({ field, meta }) => (
                  <div>
                    <Input
                      label="First Name"
                      type="text"
                      placeholder="Enter first name"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<User size={18} />}
                    />
                  </div>
                )}
              </Field>

              <Field name="last_name">
                {({ field, meta }) => (
                  <div>
                    <Input
                      label="Last Name"
                      type="text"
                      placeholder="Enter last name"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<User size={18} />}
                    />
                  </div>
                )}
              </Field>
            </div>

            <div className="mt-4">
              <Field name="email">
                {({ field, meta }) => (
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      disabled={isEditMode}
                      placeholder="Enter email"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<Mail size={18} />}
                    />
                  </div>
                )}
              </Field>
            </div>

            {/* Only show password fields in create mode */}
            {!isEditMode && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="password">
                  {({ field, meta }) => (
                    <div>
                      <Input
                        label="Password"
                        type={formik.values.showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...field}
                        error={meta.touched && meta.error ? meta.error : ""}
                        required
                        startIcon={<Lock size={18} />}
                        endIcon={
                          <button
                            type="button"
                            onClick={() =>
                              formik.setFieldValue(
                                "showPassword",
                                !formik.values.showPassword
                              )
                            }
                            className="hover:text-gray-700 transition-colors cursor-pointer"
                          >
                            {!formik.values.showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        }
                      />
                    </div>
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field, meta }) => (
                    <div>
                      <Input
                        label="Confirm Password"
                        type={
                          formik.values.showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Re-enter password"
                        {...field}
                        error={meta.touched && meta.error ? meta.error : ""}
                        required
                        startIcon={<Lock size={18} />}
                        endIcon={
                          <button
                            type="button"
                            onClick={() =>
                              formik.setFieldValue(
                                "showConfirmPassword",
                                !formik.values.showConfirmPassword
                              )
                            }
                            className="hover:text-gray-700 transition-colors cursor-pointer"
                          >
                            {!formik.values.showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        }
                      />
                    </div>
                  )}
                </Field>
              </div>
            )}
          </div>

          {/* === Business Details === */}
          <div>
            <label className="text-lg font-bold underline text-[var(--color-secondary)]">
              Business Details
            </label>

            <div className="mt-4">
              <Field name="images">
                {({ field, form, meta }) => (
                  <div>
                    <MultiImageUploader
                      label="Upload business images"
                      value={field.value}
                      onChange={(files) => form.setFieldValue("images", files)}
                      onDeleteImage={isEditMode ? handleDeleteBusinessImage : null}
                    />
                  </div>
                )}
              </Field>
            </div>

            <div className="mt-4">
              <Field name="business_name">
                {({ field, meta }) => (
                  <div>
                    <Input
                      label="Business Name"
                      placeholder="Enter your business name"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      startIcon={<Building2 size={18} />}
                    />
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* === Branch Details (FieldArray) === */}
          <div>
            <FieldArray name="branches">
              {({ remove, push }) => (
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <label className="text-lg font-bold underline text-[var(--color-secondary)]">
                      Branch Details
                    </label>

                    <div>
                      <Button
                        label="Add Branch"
                        startIcon={<Plus size={18} />}
                        size="small"
                        type="button"
                        onClick={() =>
                          push({
                            branch_name: "",
                            contact_name: "",
                            phone_number: "",
                            country_code: "",
                            iso_code: "",
                            location: "",
                            latitude: "",
                            longitude: "",
                            city: ""
                          })
                        }
                      />
                    </div>
                  </div>
                  {formik.values.branches.map((branch, index) => {
                    const baseName = `branches[${index}]`;
                    return (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm relative"
                      >
                        {/* Header with remove btn */}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Branch {index + 1}</h4>
                          <div>
                            {formik.values.branches.length > 1 && (
                              <ActionButton
                                variant="danger"
                                icon={<Trash2 size={18} />}
                                onClick={async () => {
                                  // If branch has an ID (exists in database), call delete API first
                                  if (branch.id) {
                                    try {
                                      await deleteResponse({
                                        apiEndPoint: `business/delete-branch/${branch.id}`,
                                      });
                                      // Only remove from form if API call succeeds
                                      remove(index);
                                    } catch (error) {
                                      console.error("Error deleting branch:", error);
                                      // Don't remove from form if API call fails
                                    }
                                  } else {
                                    // If no ID (new branch not saved yet), just remove from form
                                    remove(index);
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <Field name={`${baseName}.branch_name`}>
                            {({ field, meta }) => (
                              <div>
                                <Input
                                  required
                                  label="Branch Name"
                                  placeholder="Enter branch name"
                                  {...field}
                                  error={
                                    meta.touched && meta.error ? meta.error : ""
                                  }
                                  startIcon={<GitBranch size={18} />}
                                />
                              </div>
                            )}
                          </Field>

                          <Field name={`${baseName}.contact_name`}>
                            {({ field, meta }) => (
                              <div>
                                <Input
                                  required
                                  label="Contact Name"
                                  placeholder="Enter contact name"
                                  {...field}
                                  error={
                                    meta.touched && meta.error ? meta.error : ""
                                  }
                                  startIcon={<User size={18} />}
                                />
                              </div>
                            )}
                          </Field>
                        </div>
                        {console.log(formik.errors, "eee")}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          <Field name={`${baseName}.phone_number`}>
                            {({ field, meta }) => (
                              <div>
                                <Input
                                  required
                                  label="Phone Number"
                                  placeholder="Enter phone number"
                                  {...field}
                                  error={
                                    meta.touched && meta.error ? meta.error : ""
                                  }
                                  isPhone={true}
                                  phoneProps={{
                                    country: branch.iso_code || "in",
                                    enableSearch: true,
                                    autoFormat: true,
                                    preferredCountries: ["in", "us", "gb", "ca", "au"],
                                  }}
                                  onChange={(phoneData) => {
                                    // Extract phone number without country code, country code, and ISO code separately
                                    const fullPhone = phoneData.target.value;
                                    const countryCode = phoneData.country?.dialCode || '';
                                    const isoCode = phoneData.country?.countryCode || '';

                                    formik.setFieldValue(`${baseName}.phone_number`, fullPhone);
                                    formik.setFieldValue(`${baseName}.country_code`, countryCode);
                                    formik.setFieldValue(`${baseName}.iso_code`, isoCode);
                                  }}
                                />
                              </div>
                            )}
                          </Field>

                          <div className="">
                            <Field name={`${baseName}.location`}>
                              {({ field, meta }) => (
                                <div>
                                  <AddressAutocomplete
                                    label="Location"
                                    required
                                    value={field.value}
                                    isPrefilled={isEditMode}
                                    onChange={(e) =>
                                      formik.setFieldValue(
                                        `${baseName}.location`,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() =>
                                      formik.setFieldTouched(
                                        `${baseName}.location`,
                                        true
                                      )
                                    }
                                    startIcon={<MapPin size={18} />}
                                    error={
                                      meta.touched && meta.error
                                        ? meta.error
                                        : ""
                                    }
                                    onSelect={(item) => {
                                      // item should contain formatted, lat, lon
                                      formik.setFieldValue(
                                        `${baseName}.location`,
                                        item.formatted
                                      );
                                      formik.setFieldValue(
                                        `${baseName}.latitude`,
                                        item.lat
                                      );
                                      formik.setFieldValue(
                                        `${baseName}.longitude`,
                                        item.lon
                                      );
                                      formik.setFieldValue(
                                        `${baseName}.city`,
                                        item.item.properties.city || "Surat"
                                      );
                                    }}
                                  />
                                </div>
                              )}
                            </Field>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Branch button */}
                </div>
              )}
            </FieldArray>
          </div>

          {/* Submit */}
          <div className="mt-4 gap-2 flex justify-end">
            <Button
              label="Cancel"
              variant="outline"
              disabled={formik.isSubmitting}
              onClick={close}
            />
            <Button
              type="submit"
              label={isEditMode ? "Update" : "Save"}
              loading={formik.isSubmitting}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ShopOwnerForm;
