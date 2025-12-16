"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import BannerImageUploader from "../bannerImageUploader";
import Input from "../input";
import Button from "../button";
import Modal from "../modal";

const BannerModal = ({
  open,
  closeModal,
  banner,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!banner;

  // Validation schema
  const validationSchema = Yup.object().shape({
    redirect_url: Yup.string()
      .required("Redirect URL is required")
      .url("Please enter a valid URL"),
    image: Yup.mixed().required("Image is required"),
  });

  const initialValues = {
    image: banner?.image || null,
    redirect_url: banner?.redirect_url || "",
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    if (values.image) {
      formData.append("image", values.image);
    }
    formData.append("redirect_url", values.redirect_url);

    onSubmit(formData, {
      setSubmitting,
      resetForm: () => {
        // This will be handled by Formik reset
      },
    });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title={isEdit ? "Edit Banner" : "Add Banner"}
      width="w-[600px]"
      icon={true}
      closeButtonOutside={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Image Upload */}
            <div>
              <BannerImageUploader
                label="Banner Image"
                required={!isEdit}
                value={values.image}
                onChange={(file) => setFieldValue("image", file)}
                onDelete={() => setFieldValue("image", null)}
                error={errors.image && touched.image ? errors.image : ""}
                aspectRatio="16/9"
                variant="medium"
              />
            </div>

            {/* Redirect URL */}
            <Field name="redirect_url">
              {({ field, meta }) => (
                <Input
                  label="Redirect URL"
                  type="url"
                  {...field}
                  placeholder="https://example.com"
                  error={meta.touched && meta.error ? meta.error : ""}
                  required
                  disabled={loading || isSubmitting}
                />
              )}
            </Field>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                label="Cancel"
                variant="outline"
                onClick={closeModal}
                disabled={loading || isSubmitting}
                type="button"
              />
              <Button
                label={isEdit ? "Update Banner" : "Create Banner"}
                variant="primary"
                loading={loading || isSubmitting}
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default BannerModal;
