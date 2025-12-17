"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

import Button from "@/components/button";
import Input from "@/components/input";
import Modal from "@/components/modal";
import BannerImageUploader from "@/components/bannerImageUploader";
import { getResponse, postResponse, putResponse } from "@/lib/response";
import { Calendar, FileText, Tag } from "lucide-react";
import useSocket from "@/hooks/useSocket";

const validationSchema = Yup.object({
  offer_title: Yup.string().required("Offer title is required"),
  business_id: Yup.string().required("Business is required"),
  short_description: Yup.string().required("Short description is required"),
  category_id: Yup.string().required("Category is required"),
  branch_id: Yup.string().required("Branch is required"),
  start_date: Yup.date().required("Start date is required"),
  end_date: Yup.date()
    .min(Yup.ref("start_date"), "End date must be after start date"),
  keywords: Yup.array()
    .of(Yup.string())
    .min(1, "At least one keyword is required"),
});

const AddOfferModal = ({
  open,
  closeModal,
  onSuccess,
  editMode = false,
  offerToEdit = null,
}) => {
  const socket = useSocket()
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const router = useRouter();

  const initialValues = {
    image: editMode ? offerToEdit?.OfferImage?.image || null : null,
    business_id: editMode
      ? offerToEdit?.Branch?.Business?.id?.toString() || ""
      : "",
    offer_title: editMode ? offerToEdit?.offer_title || "" : "",
    short_description: editMode ? offerToEdit?.short_description || "" : "",
    full_description: editMode ? offerToEdit?.full_description || "" : "",
    category_id: editMode ? offerToEdit?.Category?.id?.toString() || "" : "",
    branch_id: editMode ? offerToEdit?.Branch?.id?.toString() || "" : "",
    start_date: editMode ? offerToEdit?.start_date?.split("T")[0] || "" : "",
    end_date: editMode ? offerToEdit?.end_date?.split("T")[0] || "" : "",
    keywords: editMode
      ? Array.isArray(offerToEdit?.keywords)
        ? offerToEdit.keywords
        : typeof offerToEdit?.keywords === "string"
          ? JSON.parse(offerToEdit.keywords)
          : []
      : [],
    is_active: editMode ? offerToEdit?.is_active || false : true,
  };

  // Categories fetched from API

  // Get available branches for selected business
  const getAvailableBranches = (businessId) => {
    if (!businessId) return [];
    const selectedBusiness = businesses.find((b) => b.value === businessId);
    return selectedBusiness?.branches || [];
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getResponse({
        apiEndPoint: "categories",
      });

      if (response.successType && response.response.data) {
        const categoryData = response.response.data;
        const formattedCategories = categoryData.map((category) => ({
          value: category.id?.toString(),
          label: category.name || category.category_name,
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch businesses
  const fetchBusinesses = async () => {
    try {
      setBusinessesLoading(true);
      const response = await getResponse({
        apiEndPoint: "business/get-business",
      });

      if (response.successType && response.response.data) {
        const businessData = response.response.data;
        const formattedBusinesses = businessData.map((business) => ({
          value: business.id?.toString(),
          label: business.business_name,
          branches:
            business.branches?.map((branch) => ({
              value: branch.id?.toString(),
              label: branch.branch_name,
              business_id: branch.business_id?.toString(),
            })) || [],
        }));
        setBusinesses(formattedBusinesses);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setBusinessesLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchBusinesses();
    }
  }, [open]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);

      // Convert keywords array to JSON string
      const formData = new FormData();
      if (values.image) {
        formData.append("image", values.image);
      }
      formData.append("business_id", values.business_id);
      formData.append("category_id", values.category_id);
      formData.append("branch_id", values.branch_id);
      formData.append("offer_title", values.offer_title);
      formData.append("short_description", values.short_description);
      formData.append("full_description", values.full_description);
      formData.append("start_date", new Date(values.start_date).toISOString());
      if (values.end_date) {
        formData.append("end_date", new Date(values.end_date).toISOString());
      }
      formData.append("keywords", JSON.stringify(values.keywords));
      formData.append("is_active", values.is_active);

      let response;
      if (editMode) {
        // Update existing offer
        response = await putResponse({
          apiEndPoint: `offers/${offerToEdit.id}`,
          payload: formData,
          type: "form-data",
        });
      } else {
        // Create new offer
        response = await postResponse({
          apiEndPoint: "offers/create",
          payload: formData,
          type: "form-data",
        });

        if (response.response.data.notifications?.data?.length > 0) {
          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications
          });
        }

      }

      if (response.successType) {
        resetForm();
        closeModal();
        onSuccess?.();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title={editMode ? "Edit Offer" : "Add New Offer"}
      width="w-[800px]"
      disableOutsideClick={loading}
      closeButtonOutside={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className="space-y-6">
            {/* Image Upload */}
            <Field name="image">
              {({ field, meta, form }) => (
                <div className="flex flex-col items-center">
                  <BannerImageUploader
                    label="Offer Image"
                    required
                    error={meta.touched && meta.error ? meta.error : ""}
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value
                          : URL.createObjectURL(field.value)
                        : editMode?.OfferImage?.image &&
                          typeof editMode.OfferImage.image === "string"
                          ? editMode.OfferImage.image
                          : null
                    }
                    onChange={(file) => form.setFieldValue("image", file)}
                    onDelete={() => form.setFieldValue("image", null)}
                  />
                </div>
              )}
            </Field>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Offer Title */}
              <Field name="offer_title">
                {({ field, meta }) => (
                  <Input
                    label="Offer Title"
                    placeholder="Enter offer title"
                    {...field}
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<Tag size={18} />}
                  />
                )}
              </Field>

              {/* Category - Using Enhanced Input Component */}
              <Field name="category_id">
                {({ field, meta }) => (
                  <Input
                    label="Category"
                    placeholder="Select Category"
                    isSelect
                    selectProps={{
                      options: categories,
                      placeholder: categoriesLoading
                        ? "Loading categories..."
                        : "Select Category",
                      value: field.value
                        ? categories.find((o) => o.value === field.value)
                        : null,
                      onChange: (option) => {
                        field.onChange({
                          target: {
                            name: field.name,
                            value: option?.value ?? "",
                          },
                        });
                      },
                      onBlur: field.onBlur,
                    }}
                    error={
                      meta.touched && categories.length > 0 && meta.error
                        ? meta.error
                        : ""
                    }
                  />
                )}
              </Field>

              {/* Business - Using Enhanced Input Component */}
              <Field name="business_id">
                {({ field, meta, form }) => (
                  <Input
                    label="Business"
                    placeholder="Select Business"
                    isSelect
                    selectProps={{
                      options: businesses,
                      placeholder: businessesLoading
                        ? "Loading businesses..."
                        : "Select Business",
                      value: field.value
                        ? businesses.find((o) => o.value === field.value)
                        : null,
                      onChange: (option) => {
                        // Reset branch when business changes
                        if (option?.value !== field.value) {
                          form.setFieldValue("branch_id", "");
                        }
                        field.onChange({
                          target: {
                            name: field.name,
                            value: option?.value ?? "",
                          },
                        });
                      },
                      onBlur: field.onBlur,
                    }}
                    error={
                      meta.touched && businesses.length > 0 && meta.error
                        ? meta.error
                        : ""
                    }
                  />
                )}
              </Field>

              {/* Branch - Using Enhanced Input Component */}
              <Field name="branch_id">
                {({ field, meta, form }) => {
                  const availableBranches = getAvailableBranches(
                    formik.values.business_id
                  );
                  return (
                    <Input
                      label="Branch"
                      placeholder={
                        !formik.values.business_id
                          ? "Select Business first"
                          : "Select Branch"
                      }
                      isSelect
                      selectProps={{
                        options: availableBranches,
                        placeholder: !formik.values.business_id
                          ? "Select Business first"
                          : "Select Branch",
                        value: field.value
                          ? availableBranches.find(
                            (o) => o.value === field.value
                          )
                          : null,
                        onChange: (option) => {
                          field.onChange({
                            target: {
                              name: field.name,
                              value: option?.value ?? "",
                            },
                          });
                        },
                        onBlur: field.onBlur,
                        isDisabled: !formik.values.business_id,
                      }}
                      error={meta.touched && meta.error ? meta.error : ""}
                    />
                  );
                }}
              </Field>
            </div>

            {/* Short Description */}
            <Field name="short_description">
              {({ field, meta }) => (
                <Input
                  label="Short Description"
                  placeholder="Enter short description"
                  {...field}
                  error={meta.touched && meta.error ? meta.error : ""}
                  startIcon={<FileText size={18} />}
                />
              )}
            </Field>

            {/* Full Description - Using Enhanced Input Component */}
            <Field name="full_description">
              {({ field, meta }) => (
                <Input
                  label="Full Description"
                  placeholder="Enter full description"
                  {...field}
                  isTextarea
                />
              )}
            </Field>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="start_date">
                {({ field, meta }) => (
                  <Input
                    label="Start Date"
                    min={!editMode ? new Date().toISOString().split("T")[0] : undefined}

                    type="date"
                    {...field}
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<Calendar size={18} />}
                  />
                )}
              </Field>

              <Field name="end_date">
                {({ field, meta }) => (
                  <Input
                    label="End Date"
                    type="date"
                    min={!editMode ? new Date().toISOString().split("T")[0] : undefined}

                    {...field}
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<Calendar size={18} />}
                  />
                )}
              </Field>
            </div>

            {/* Keywords - Using Enhanced Input Component */}
            <Field name="keywords">
              {({ meta }) => (
                <Input
                  label="Keywords"
                  placeholder="Add keywords for your offer..."
                  isKeywords
                  keywordValue={formik.values.keywords}
                  onKeywordsChange={(keywords) =>
                    formik.setFieldValue("keywords", keywords)
                  }
                  error={meta.touched && meta.error ? meta.error : ""}
                  startIcon={<Tag size={18} />}
                />
              )}
            </Field>

            {/* Active Status - Moved above buttons for better visibility */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-center space-x-3">
                <Field name="is_active">
                  {({ field }) => (
                    <input
                      type="checkbox"
                      id="is_active"
                      {...field}
                      checked={field.value}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  )}
                </Field>
                <div>
                  <label
                    htmlFor="is_active"
                    className="text-sm font-semibold text-gray-800 cursor-pointer"
                  >
                    Mark offer as active
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Active offers will be visible to users on the platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button label="Cancel" onClick={closeModal} variant="outline" />
              <Button
                label={editMode ? "Update Offer" : "Create Offer"}
                type="submit"
                loading={formik.isSubmitting}
                variant="primary"
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddOfferModal;
