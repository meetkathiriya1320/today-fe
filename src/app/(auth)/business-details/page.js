"use client";
import AddressAutocomplete from "@/components/addressAutocomplete";
import Button from "@/components/button";
import Input from "@/components/input";
import MultiImageUploader from "@/components/multiImageUploader";
import { postResponse } from "@/lib/response";
import { clearCurrentUserCookie, getCurrentUserCookie, setCurrentUserCookie } from "@/utils/cookieUtils";
import { Field, Form, Formik } from "formik";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Building2, GitBranch, MapPin, Phone, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Yup from "yup";

export default function BusinessDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validationSchema = Yup.object({
    business_name: Yup.string().required("Business name is required"),
    location: Yup.string().required("Location is required"),
    branch_name: Yup.string().required("Branch Name is required"),
    contact_name: Yup.string().nullable(),
    phone_number: Yup.string()
      .test(
        "is-valid-phone",
        "Please enter a valid phone number",
        function (value) {
          if (!value || value.length <= 2) return true;
          try {
            const normalized = value.startsWith("+") ? value : `+${value}`;
            return isValidPhoneNumber(normalized);
          } catch {
            return false;
          }
        }
      )
      .required("Phone is required"),
    latitude: Yup.number().nullable(),
    longitude: Yup.number().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    const userId = searchParams.get("user_id");
    if (!userId) {
      alert("User ID not found. Please verify OTP first.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("business_name", values.business_name);
    formData.append("branch_name", values.branch_name || "");
    formData.append("contact_name", values.contact_name || "");
    formData.append("location", values.location);
    formData.append("latitude", values.latitude);
    formData.append("longitude", values.longitude);
    formData.append("city", values.city);
    formData.append("phone_number", values.phone_number);
    formData.append("iso_code", values.iso_code);
    formData.append("country_code", values.country_code);
    formData.append("user_id", userId);

    values.images.forEach((file) => {
      formData.append("images[]", file);
    });

    const res = await postResponse({
      apiEndPoint: "/business/create-business",
      payload: formData,
      navigate: router.push,
      type: "form-data",
    });

    if (res.successType) {

      // for logout current user ====
      const current_user = getCurrentUserCookie()
      if (current_user) {
        await postResponse({
          apiEndPoint: "auth/logout",
          payload: {},
          hideSuccessToast: true
        });
        // Remove user cookie
        clearCurrentUserCookie();
      }


      setCurrentUserCookie({
        ...res.response.data.user,
        ...res.response.data.business,
        business_id: res.response.data.business.id,
        token: res.response.data.token,
      });
      router.push("/dashboard");
      resetForm();
    }
    setSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-2 bg-contain bg-center"
      style={{ backgroundImage: "url('../assets/bg.png')" }}
    >
      <div className="w-full overflow-y-auto max-w-lg sm:max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Scrollable area */}
        <div className="max-h-[80vh] pr-1 overflow-y-auto">
          <div className="text-start mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
              Business Details 👋
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
              Enter your business details and upload your profile photo.
            </p>
          </div>

          <Formik
            initialValues={{
              business_name: "",
              branch_name: "",
              images: [],
              image: "",
              phone_number: "",
              latitude: "",
              longitude: "",
              city: "",
              contact_name: "",
              country_code: null,
              iso_code: "",
              location: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <Form className="space-y-4">
                {/* Multi Image Uploader */}
                <Field name="images">
                  {({ field, form, meta }) => (
                    <MultiImageUploader
                      value={field.value}
                      label="Upload business images"
                      onChange={(files) => form.setFieldValue("images", files)}
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
                        error={meta.touched && meta.error ? meta.error : ""}
                        required
                        startIcon={<Building2 size={18} />}
                      />
                    )}
                  </Field>

                  <Field name="branch_name">
                    {({ field, meta }) => (
                      <Input
                        label="Branch Name"
                        placeholder="Enter branch name"
                        {...field}
                        error={meta.touched && meta.error ? meta.error : ""}
                        startIcon={<GitBranch size={18} />}
                      />
                    )}
                  </Field>
                </div>

                {/* Contact & Phone */}
                <Field name="contact_name">
                  {({ field, meta }) => (
                    <Input
                      label="Contact Name"
                      placeholder="Enter contact name"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      startIcon={<User size={18} />}
                    />
                  )}
                </Field>

                <Field name="phone_number">
                  {({ field, meta }) => (
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter phone number"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      isPhone
                      startIcon={<Phone size={18} />}
                      onChange={(phoneData) => {
                        // Extract phone number without country code, country code, and ISO code separately
                        const fullPhone = phoneData.target.value;
                        const countryCode = phoneData.country?.dialCode || '';
                        const isoCode = phoneData.country?.countryCode;

                        field.onChange({
                          target: { name: field.name, value: fullPhone }
                        });

                        // Set country code and ISO code separately
                        formik.setFieldValue('country_code', countryCode);
                        formik.setFieldValue('iso_code', isoCode);
                      }}
                    />
                  )}
                </Field>

                {/* Location */}
                <Field name="location">
                  {({ field, meta }) => (
                    <AddressAutocomplete
                      label="Location"
                      value={formik.values.location}
                      onChange={(e) =>
                        formik.setFieldValue("location", e.target.value)
                      }
                      startIcon={<MapPin size={18} />}
                      onBlur={formik.handleBlur}
                      error={meta.touched && meta.error ? meta.error : ""}
                      required
                      onSelect={(item) => {
                        formik.setFieldValue("location", item.formatted);
                        formik.setFieldValue("latitude", item.lat);
                        formik.setFieldValue("longitude", item.lon);
                        // @todo remove static city
                        formik.setFieldValue("city", item.item.properties.city || "Surat");
                      }}
                    />
                  )}
                </Field>

                {/* Submit */}
                <Button
                  type="submit"
                  label="Save"
                  fullWidth
                  loading={formik.isSubmitting}
                  className="mt-4"
                />
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
