"use client";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Input from "@/components/input";
import { postResponse } from "@/lib/response";
import Button from "@/components/button";

const ContactUs = () => {

    // Validation schema
    const validationSchema = Yup.object({
        first_name: Yup.string()
            .min(2, "First name must be at least 2 characters")
            .required("First name is required"),
        last_name: Yup.string()
            .min(2, "Last name must be at least 2 characters")
            .required("Last name is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        phone_number: Yup.string()
            .required("Phone number is required"),
        country_code: Yup.string()
            .required("Country code is required"),
        iso_code: Yup.string()
            .required("ISO code is required"),
        note: Yup.string()
            .min(10, "Note must be at least 10 characters")
            .required("Note is required"),
    });

    const initialValues = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        country_code: '',
        iso_code: '',
        note: ''
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await postResponse({
                apiEndPoint: "/settings/contact",
                payload: values,
            });

            if (response?.successType) {
                resetForm();
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary)]/80 py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg md:text-xl text-white/90">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex items-center justify-center px-4 py-12 -mt-8">
                <div className="w-full max-w-2xl">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, values, setFieldValue, errors }) => (
                            <Form
                                className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-secondary)] via-pink-500 to-[var(--color-secondary)]"></div>

                                <div className="space-y-6">
                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field name="first_name">
                                            {({ field, meta }) => (
                                                <Input
                                                    label="First Name"
                                                    name="first_name"
                                                    type="text"
                                                    placeholder="Enter your first name"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    error={meta.touched && meta.error ? meta.error : null}
                                                    required
                                                />
                                            )}
                                        </Field>
                                        <Field name="last_name">
                                            {({ field, meta }) => (
                                                <Input
                                                    label="Last Name"
                                                    name="last_name"
                                                    type="text"
                                                    placeholder="Enter your last name"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    error={meta.touched && meta.error ? meta.error : null}
                                                    required
                                                />
                                            )}
                                        </Field>
                                    </div>

                                    {/* Email Field */}
                                    <Field name="email">
                                        {({ field, meta }) => (
                                            <Input
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                error={meta.touched && meta.error ? meta.error : null}
                                                required
                                            />
                                        )}
                                    </Field>

                                    {/* Phone Field */}
                                    <Field name="phone_number">
                                        {({ field, meta }) => (
                                            <Input
                                                label="Phone Number"
                                                name="phone_number"
                                                isPhone={true}
                                                phoneProps={{
                                                    country: "in",
                                                    enableSearch: true,
                                                    autoFormat: true,
                                                    preferredCountries: ["in", "us", "gb", "ca", "au"],
                                                }}
                                                value={field.value}
                                                onChange={(phoneData) => {
                                                    const fullPhone = phoneData.target.value;
                                                    const countryCode = phoneData.country?.dialCode || '';
                                                    const isoCode = phoneData.country?.countryCode;

                                                    field.onChange({
                                                        target: { name: field.name, value: fullPhone }
                                                    });

                                                    setFieldValue('country_code', countryCode);
                                                    setFieldValue('iso_code', isoCode);
                                                }}
                                                onBlur={field.onBlur}
                                                error={meta.touched && meta.error ? meta.error : null}
                                                required
                                            />
                                        )}
                                    </Field>

                                    {/* Message Field */}
                                    <Field name="note">
                                        {({ field, meta }) => (
                                            <Input
                                                label="Message"
                                                name="note"
                                                isTextarea={true}
                                                placeholder="Tell us what's on your mind..."
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                error={meta.touched && meta.error ? meta.error : null}
                                                required
                                            />
                                        )}
                                    </Field>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                                        label={isSubmitting ? 'Sending...' : 'Send Message'}
                                    />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;