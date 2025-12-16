"use client";

import AddressAutocomplete from "@/components/addressAutocomplete";
import BannerImageUploader from "@/components/bannerImageUploader";
import Button from "@/components/button";
import Input from "@/components/input";
import LoadingSpinner from "@/components/loadingSpinner";
import Modal from "@/components/modal";
import { getResponse, postResponse } from "@/lib/response";
import { Field, Form, Formik } from "formik";
import { Calendar, CreditCard, ExternalLink, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import useSocket from "@/hooks/useSocket";

// Validation schema - business_id is required only for admin
const createValidationSchema = (isAdmin) =>
  Yup.object({
    business_id: isAdmin
      ? Yup.string().required("Business name is required")
      : Yup.string(),
    branch_id: isAdmin
      ? Yup.string().required("Branch is required")
      : Yup.string(),
    start_date: Yup.date()
      .required("Start date is required"),
    end_date: Yup.date()
      .required("End date is required")
      .min(Yup.ref("start_date"), "End date must be after start date"),
    amount: Yup.number()
      .required("Amount is required")
      .min(0, "Amount must be greater than 0"),
    payment_method: Yup.string().required("Payment method is required"),
    check_number: Yup.string().when("payment_method", {
      is: "check",
      then: (schema) =>
        schema.required("Check number is required for check payment"),
      otherwise: (schema) => schema.notRequired(),
    }),
    transaction_id: Yup.string().when("payment_method", {
      is: (val) => ["credit_card", "debit_card", "bank_transfer"].includes(val),
      then: (schema) =>
        schema.required("Transaction ID is required for this payment method"),
      otherwise: (schema) => schema.notRequired(),
    }),
    image: Yup.mixed()
      .required("Image is required")
      .test(
        "fileType",
        "Only image files are allowed",
        (value) => value && value.type.startsWith("image/")
      )
      .test(
        "fileSize",
        "File size must be less than 5MB",
        (value) => value && value.size <= 5 * 1024 * 1024
      ),
  });

const AddPromotionModal = ({ open, closeModal, onSuccess, isAdmin }) => {
  const socket = useSocket();

  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // Get business_id from cookies for non-admin users
  const currentUser = getCurrentUserCookie();
  const userBusinessId = currentUser?.business_id?.toString();

  // Fetch businesses on component mount (only for admin)
  const fetchBusinesses = async () => {
    if (!isAdmin) return; // Skip fetching for non-admin users

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
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setBusinessesLoading(false);
    }
  };

  // Fetch branches for selected business
  const fetchBranches = async (businessId) => {
    // if (!businessId) return;

    const business_id = businessId || userBusinessId;

    try {
      setBranchesLoading(true);
      const response = await getResponse({
        apiEndPoint: `business/get-branches?business_id=${business_id}&page=1&limit=1000`,
      });

      if (response.successType && response.response.data) {
        const branchData = response.response.data.branches;
        const formattedBranches = branchData.map((branch) => ({
          value: branch.id?.toString(),
          label: branch.branch_name,
        }));
        setBranches(formattedBranches);
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setBranchesLoading(false);
    }
  };

  // Fetch businesses when modal opens (only for admin)
  useEffect(() => {
    if (open && isAdmin) {
      fetchBusinesses();
    }
    if (open && !isAdmin) {
      fetchBranches();
    }
  }, [open, isAdmin]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);

      // Create FormData object
      const formData = new FormData();

      // Append all form fields
      Object.keys(values).forEach((key) => {
        if (key === "image" && values[key]) {
          formData.append("image", values[key]);
        } else {
          formData.append(key, values[key]);
        }
      });

      const response = await postResponse({
        apiEndPoint: isAdmin
          ? "advertise-requests/create"
          : "advertise-requests",
        payload: formData,
        type: "form-data",
      });

      if (response.successType) {
        const notificationData = response.response.data.notifications
        socket.emit("send-notification-to-business-owner", {
          ...notificationData
        });
        resetForm();
        closeModal();
        onSuccess && onSuccess();
      }
    } catch (err) {
      console.error("Error creating promotion:", err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Add New Promotion"
      width="w-[800px]"
      closeButtonOutside={true}
    >
      {loading && <LoadingSpinner />}

      <Formik
        initialValues={{
          business_id: isAdmin ? "" : userBusinessId || "",
          branch_id: "",
          start_date: "",
          end_date: "",
          offer_url: "",
          external_url: "",
          amount: "",
          payment_method: "cash",
          check_number: "",
          transaction_id: "",
          image: null,
        }}
        enableReinitialize={true}
        validationSchema={createValidationSchema(isAdmin)}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form className="space-y-2">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin size={20} />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {isAdmin && (
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
                            if (option?.value !== field.value) {
                              form.setFieldValue("branch_id", "");
                              setBranches([]);
                              fetchBranches(option?.value);
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
                        error={meta.touched && meta.error ? meta.error : ""}
                        isRequired
                      />
                    )}
                  </Field>
                )}

                {/* Branch */}
                <Field name="branch_id">
                  {({ field, meta }) => (
                    <Input
                      label="Branch"
                      placeholder="Select Branch"
                      isSelect
                      selectProps={{
                        options: branches,
                        placeholder: branchesLoading
                          ? "Loading branches..."
                          : "Select Branch",
                        value: field.value
                          ? branches.find((o) => o.value === field.value)
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
                      error={meta.touched && meta.error ? meta.error : ""}
                      isRequired
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar size={20} />
                Campaign Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Field name="start_date">
                    {({ field, meta }) => (
                      <Input
                        label="Start Date"
                        {...field}
                        value={field.value || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        type="date"
                        isRequired
                      />
                    )}
                  </Field>
                </div>
                <div>
                  <Field name="end_date">
                    {({ field, meta }) => (
                      <Input
                        label="End Date"
                        {...field}
                        min={new Date().toISOString().split("T")[0]}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        type="date"
                        isRequired
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            {/* URLs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ExternalLink size={20} />
                URLs
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <Field name="offer_url">
                    {({ field, meta }) => (
                      <Input
                        label="Offer URL"
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        type="url"
                        placeholder="https://example.com/offer"
                        isRequired
                      />
                    )}
                  </Field>
                </div> */}
                <div>
                  <Field name="external_url">
                    {({ field, meta }) => (
                      <Input
                        label="Redirect URL"
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        type="url"
                        placeholder="https://external-site.com"
                        isRequired
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Information
              </h3>

              {/* Payment Method */}
              <div className="mb-4">
                <Field name="payment_method">
                  {({ field, meta }) => (
                    <Input
                      isSelect
                      label="Payment Method"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear payment-related fields when payment method changes
                        formik.setFieldValue("check_number", "");
                        formik.setFieldValue("transaction_id", "");
                      }}
                      onBlur={field.onBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      selectProps={{
                        value: field.value
                          ? {
                            value: field.value,
                            label: field.value
                              .replace("_", " ")
                              .toUpperCase(),
                          }
                          : null,
                        onChange: (option) =>
                          formik.setFieldValue(
                            "payment_method",
                            option?.value || ""
                          ),
                        options: [
                          // { value: "credit_card", label: "Credit Card" },
                          // { value: "debit_card", label: "Debit Card" },
                          { value: "bank_transfer", label: "Bank Transfer" },
                          { value: "cash", label: "Cash" },
                          { value: "check", label: "Check" },
                        ],
                        placeholder: "Select payment method",
                      }}
                      isRequired
                    />
                  )}
                </Field>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <Field name="amount">
                  {({ field, meta }) => (
                    <Input
                      label="Amount"
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      placeholder="Enter amount"
                      isRequired
                    />
                  )}
                </Field>
              </div>

              {/* Conditional Fields Based on Payment Method */}
              {formik.values.payment_method === "check" && (
                <div className="mb-4">
                  <Field name="check_number">
                    {({ field, meta }) => (
                      <Input
                        label="Check Number"
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={meta.touched && meta.error ? meta.error : ""}
                        placeholder="Enter check number"
                        isRequired
                      />
                    )}
                  </Field>
                </div>
              )}

              {(formik.values.payment_method === "credit_card" ||
                formik.values.payment_method === "debit_card" ||
                formik.values.payment_method === "bank_transfer") && (
                  <div className="mb-4">
                    <Field name="transaction_id">
                      {({ field, meta }) => (
                        <Input
                          label="Transaction ID"
                          {...field}
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={meta.touched && meta.error ? meta.error : ""}
                          placeholder="Enter transaction ID"
                          isRequired
                        />
                      )}
                    </Field>
                  </div>
                )}
            </div>

            {/* Image Upload */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Field name="image">
                {({ meta, form }) => (
                  <BannerImageUploader
                    label="Banner Image"
                    value={form.values.image}
                    onChange={(file) => form.setFieldValue("image", file)}
                    onDelete={() => {
                      form.setFieldValue("image", null);
                    }}
                    error={meta.touched && meta.error ? meta.error : ""}
                    required
                  />
                )}
              </Field>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                label="Cancel"
                variant="outline"
                onClick={closeModal}
                disabled={formik.isSubmitting}
              />
              <Button
                type="submit"
                label={formik.isSubmitting ? "Creating..." : "Create Promotion"}
                disabled={formik.isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddPromotionModal;
