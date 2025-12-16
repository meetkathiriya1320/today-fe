"use client";

import Button from "@/components/button";
import CredentialsDisplay from "@/components/credentialsDisplay";
import Input from "@/components/input";
import { Field, Form, Formik } from "formik";
import { Eye, EyeOff, Lock } from "lucide-react";
import * as Yup from "yup";

const resetPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const ResetPasswordForm = ({
  shopOwnerEmail,
  onSubmit,
  onCancel,
  generatedCredentials,
}) => {
  return (
    <Formik
      initialValues={{
        newPassword: "",
        confirmNewPassword: "",
      }}
      validationSchema={resetPasswordValidationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Enter a new password for{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {shopOwnerEmail}
            </span>
          </p>

          <Field name="newPassword">
            {({ field, meta }) => (
              <Input
                label="New Password"
                type={formik.values.showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                name={field.name}
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={meta.touched && meta.error ? meta.error : ""}
                required
                startIcon={<Lock size={18} />}
                endIcon={
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        "showNewPassword",
                        !formik.values.showNewPassword
                      )
                    }
                    className="hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    {!formik.values.showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />
            )}
          </Field>

          <Field name="confirmNewPassword">
            {({ field, meta }) => (
              <Input
                label="Confirm New Password"
                type={
                  formik.values.showConfirmNewPassword ? "text" : "password"
                }
                placeholder="Re-enter new password"
                name={field.name}
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={meta.touched && meta.error ? meta.error : ""}
                required
                startIcon={<Lock size={18} />}
                endIcon={
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        "showConfirmNewPassword",
                        !formik.values.showConfirmNewPassword
                      )
                    }
                    className="hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    {!formik.values.showConfirmNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />
            )}
          </Field>

          {generatedCredentials && (
            <CredentialsDisplay
              email={generatedCredentials.email}
              password={generatedCredentials.password}
              onCopy={onCancel}
            />
          )}

          <div className="flex gap-2 mt-6 justify-end">
            <Button
              type="button"
              label="Cancel"
              variant="outline"
              onClick={onCancel}
            />
            {!generatedCredentials && (
              <Button
                type="submit"
                label="Reset Password"
                variant="primary"
                loading={formik.isSubmitting}
              />
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
