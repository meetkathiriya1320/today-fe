"use client";

import { getResponse } from "@/lib/response";
import { Field, Form, Formik } from "formik";
import {
  Calendar,
  CreditCard,
  ExternalLink,
  FileText,
  Link,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import BannerImageUploader from "../bannerImageUploader";
import Button from "../button";
import Input from "../input";
import Modal from "../modal";

const validationSchema = Yup.object({
  image: Yup.mixed().required("Image is required"),
  business_id: Yup.string().required("Business is required"),
  start_date: Yup.date().required("Start date is required"),
  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("start_date"), "End date must be after start date"),
  offer_url: Yup.string()
    .required("Offer URL is required")
    .url("Please enter a valid URL"),
  external_url: Yup.string()
    .required("External URL is required")
    .url("Please enter a valid URL"),
  transaction_id: Yup.string().when("payment_method", {
    is: (val) =>
      val === "credit_card" ||
      val === "debit_card" ||
      val === "upi" ||
      val === "bank_transfer",
    then: (schema) =>
      schema.required(
        "Transaction ID is required for card/UPI/bank transfer payments"
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  check_number: Yup.string().when("payment_method", {
    is: (val) => val === "check",
    then: (schema) =>
      schema.required("Check number is required for check payments"),
    otherwise: (schema) => schema.notRequired(),
  }),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  payment_method: Yup.string().required("Payment method is required"),
  branch_id: Yup.string().required("Branch is required"),
});

const AdvertiseRequestModal = ({
  open,
  closeModal,
  advertiseRequest,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!advertiseRequest;
  const router = useRouter();

  const [loadingState, setLoadingState] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const initialValues = {
    image: isEdit ? advertiseRequest?.image || null : null,
    business_id: isEdit
      ? advertiseRequest?.User?.Business?.id?.toString() || ""
      : "",
    start_date: isEdit ? advertiseRequest?.start_date?.split("T")[0] || "" : "",
    end_date: isEdit ? advertiseRequest?.end_date?.split("T")[0] || "" : "",
    offer_url: isEdit ? advertiseRequest?.offer_url || "" : "",
    external_url: isEdit ? advertiseRequest?.external_url || "" : "",
    transaction_id: isEdit
      ? advertiseRequest?.AdvertiseBanner?.Payments?.[0]?.transaction_id || ""
      : "",
    amount: isEdit
      ? advertiseRequest?.AdvertiseBanner?.Payments?.[0]?.amount || ""
      : "",
    check_number: isEdit
      ? advertiseRequest?.AdvertiseBanner?.Payments?.[0]?.check_number || ""
      : "",
    payment_method: isEdit
      ? advertiseRequest?.AdvertiseBanner?.Payments?.[0]?.payment_method ||
      "cash"
      : "cash",
    branch_id: "",
  };

  // Payment method options
  const paymentMethodOptions = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
  ];

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
        }));
        setBusinesses(formattedBusinesses);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setBusinessesLoading(false);
    }
  };

  // Fetch branches for selected business
  const fetchBranches = async (businessId) => {
    if (!businessId) return;

    try {
      setBranchesLoading(true);
      const response = await getResponse({
        apiEndPoint: `business/get-branches?business_id=${businessId}&page=1&limit=1000`,
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

  useEffect(() => {
    if (open) {
      fetchBusinesses();
    }
  }, [open]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoadingState(true);

      const formData = new FormData();

      // Add image if present
      if (values.image) {
        formData.append("image", values.image);
      }

      // Add form fields
      formData.append("business_id", values.business_id);
      formData.append("branch_id", values.branch_id);
      formData.append("start_date", values.start_date);
      formData.append("end_date", values.end_date);
      formData.append("offer_url", values.offer_url);
      formData.append("external_url", values.external_url);

      // Add payment info if provided
      if (values.payment_method) {
        formData.append("payment_method", values.payment_method);
      }
      if (values.transaction_id) {
        formData.append("transaction_id", values.transaction_id);
      }
      if (values.check_number) {
        formData.append("check_number", values.check_number);
      }
      if (values.amount) {
        formData.append("amount", values.amount);
      }

      onSubmit(formData, {
        setSubmitting,
        resetForm,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitting(false);
    } finally {
      setLoadingState(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title={isEdit ? "Edit Advertise Request" : "Create Advertise Request"}
      width="w-[800px]"
      icon={true}
      disableOutsideClick={true}
      closeButtonOutside={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formik, isSubmitting) => (
          <Form className="space-y-6">
            {/* Image Upload */}
            <Field name="image">
              {({ field, meta, form }) => (
                <div className="flex flex-col items-center">
                  <BannerImageUploader
                    label="Advertise Image"
                    required
                    error={meta.touched && meta.error ? meta.error : ""}
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value
                          : URL.createObjectURL(field.value)
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
              {/* Business - Using Enhanced Input Component */}
              <Field name="business_id">
                {({ field, meta }) => (
                  <Input
                    label="Business"
                    placeholder="Select Business"
                    isSelect
                    required
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
                          formik.setFieldValue("branch_id", "");
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
                    error={
                      meta.touched && businesses.length > 0 && meta.error
                        ? meta.error
                        : ""
                    }
                    startIcon={<MapPin size={18} />}
                  />
                )}
              </Field>

              {/* Branch */}
              <Field name="branch_id">
                {({ field, meta }) => (
                  <Input
                    label="Branch"
                    placeholder="Select Branch"
                    isSelect
                    required
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
                    startIcon={<MapPin size={18} />}
                  />
                )}
              </Field>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="payment_method">
                {({ field, meta }) => (
                  <Input
                    label="Payment Method"
                    required
                    placeholder="Select Payment Method"
                    isSelect
                    selectProps={{
                      options: paymentMethodOptions,
                      placeholder: "Select Payment Method",
                      value: field.value
                        ? paymentMethodOptions.find(
                          (o) => o.value === field.value
                        )
                        : null,
                      onChange: (option) => {
                        // Clear transaction ID and check number when payment method changes
                        if (option?.value !== field.value) {
                          formik.setFieldValue("transaction_id", "");
                          formik.setFieldValue("check_number", "");
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
                    startIcon={<CreditCard size={18} />}
                  />
                )}
              </Field>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field name="start_date">
                {({ field, meta }) => (
                  <Input
                    label="Start Date"
                    min={!isEdit ? new Date().toISOString().split("T")[0] : undefined}
                    required
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
                    min={!isEdit ? new Date().toISOString().split("T")[0] : undefined}
                    type="date"
                    required
                    {...field}
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<Calendar size={18} />}
                  />
                )}
              </Field>
            </div>

            {/* URLs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <Field name="offer_url">
                {({ field, meta }) => (
                  <Input
                    label="Offer URL"
                    required
                    type="url"
                    {...field}
                    placeholder="https://example.com/offer"
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<Link size={18} />}
                  />
                )}
              </Field> */}

              <Field name="external_url">
                {({ field, meta }) => (
                  <Input
                    label="Redirect URL"
                    required
                    type="url"
                    {...field}
                    placeholder="https://external-site.com"
                    error={meta.touched && meta.error ? meta.error : ""}
                    startIcon={<ExternalLink size={18} />}
                  />
                )}
              </Field>
            </div>

            {/* Conditional Payment Information */}
            {formik.values.payment_method && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "credit_card",
                    "debit_card",
                    "upi",
                    "bank_transfer",
                  ].includes(formik.values.payment_method) && (
                      <Field name="transaction_id">
                        {({ field, meta }) => (
                          <Input
                            label="Transaction ID"
                            required
                            type="text"
                            {...field}
                            placeholder="Enter transaction ID"
                            error={meta.touched && meta.error ? meta.error : ""}
                          />
                        )}
                      </Field>
                    )}
                  {formik.values.payment_method === "check" && (
                    <Field name="check_number">
                      {({ field, meta }) => (
                        <Input
                          label="Check Number"
                          required
                          type="text"
                          {...field}
                          placeholder="Enter check number"
                          error={meta.touched && meta.error ? meta.error : ""}
                          startIcon={<FileText size={18} />}
                        />
                      )}
                    </Field>
                  )}
                  <Field name="amount">
                    {({ field, meta }) => (
                      <Input
                        label="Amount"
                        required
                        type="number"
                        {...field}
                        placeholder="Enter amount"
                        error={meta.touched && meta.error ? meta.error : ""}
                      />
                    )}
                  </Field>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                label="Cancel"
                onClick={closeModal}
                variant="outline"
                disabled={loading || loadingState || isSubmitting}
              />
              <Button
                label={isEdit ? "Update Request" : "Create Request"}
                type="submit"
                loading={loading || loadingState || isSubmitting}
                variant="primary"
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AdvertiseRequestModal;
