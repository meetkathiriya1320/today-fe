"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    Mail,
    User,
    Calendar,
    Eye,
    EyeOff,
} from "lucide-react";
import ActionButton from "@/components/actionButton";
import Button from "@/components/button";
import Input from "@/components/input";
import Modal from "@/components/modal";
import SectionHeader from "@/components/sectionHeader";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import { getResponse, postResponse, putResponse, deleteResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import LoadingSpinner from "@/components/loadingSpinner";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { getCurrentUserCookie } from "@/utils/cookieUtils";

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [showPasswordAdd, setShowPasswordAdd] = useState(false);
    const [showPasswordEdit, setShowPasswordEdit] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Filter state
    const [filters, setFilters] = useState({
        search: "",
    });

    const currentUser = getCurrentUserCookie();

    // Debounced search value
    const debouncedSearch = useDebounce(filters.search, 500);

    // Validation schema for admin form
    const adminValidationSchema = Yup.object({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        email: Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required"),
        password: Yup.string().when("$isEditing", {
            is: false,
            then: (schema) => schema.min(6, "Password must be at least 6 characters").required("Password is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        is_super_admin: Yup.boolean(),
    });

    // Define table columns
    const columns = [
        {
            key: "first_name",
            header: "Name",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span>{row?.Roles?.[0]?.UserRole.first_name} {row?.Roles?.[0]?.UserRole.last_name}</span>
                </div>
            ),
        },
        {
            key: "email",
            header: "Email",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span>{row?.email}</span>
                </div>
            ),
        },
        {
            key: "is_super_admin",
            header: "Role",
            render: (row) => (
                <span className="text-sm font-medium">{row?.is_super_admin ? "Super Admin" : "Admin"}</span>
            ),
        },
        {
            key: "created_at",
            header: "Created At",
            render: (row) =>
                row?.created_at
                    ? new Date(row.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "-",
        },
        {
            header: "Action",
            key: "action",
            render: (row) => {
                // Hide actions for super admin rows
                if (row?.is_super_admin) {
                    return null;
                }
                return (
                    <div className="flex items-center gap-2">
                        <ActionButton
                            title="Edit Admin"
                            variant="primary"
                            icon={<Edit size={16} />}
                            onClick={() => openEditModal(row)}
                        />
                        <ActionButton
                            title="Delete Admin"
                            variant="danger"
                            icon={<Trash2 size={16} />}
                            onClick={() => openDeleteModal(row)}
                        />
                    </div>
                );
            },
        },
    ];

    // Fetch admins
    const fetchAdmins = async (
        page = pagination.page,
        limit = pagination.limit
    ) => {
        try {
            setLoading(true);

            // Build query params with filters
            const params = { page, limit };

            // Add search if present
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            const queryString = constructQueryParams(params);

            const response = await getResponse({
                apiEndPoint: `admin/admins`,
                queryString,
            });

            if (response.successType) {
                const { admins: data, pagination: paginationData } = response.response.data;

                setAdmins(data || []);

                if (paginationData) {
                    setPagination({
                        page: paginationData.currentPage || 1,
                        limit: paginationData.itemsPerPage || 10,
                        total: paginationData.totalItems || 0,
                        totalPages: paginationData.totalPages || 0,
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching admins:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        fetchPromotions(newPage, pagination.limit);
    };

    // Open add admin modal
    const openAddModal = () => {
        setSelectedAdmin(null);
        setAddAdminModalOpen(true);
    };

    // Open edit admin modal
    const openEditModal = (admin) => {
        setSelectedAdmin(admin);
        setEditAdminModalOpen(true);
    };

    // Open delete confirmation modal
    const openDeleteModal = (admin) => {
        setSelectedAdmin(admin);
        setDeleteModalOpen(true);
    };

    // Close modals
    const closeAddModal = () => {
        setAddAdminModalOpen(false);
        setSelectedAdmin(null);
        setShowPasswordAdd(false);
    };

    const closeEditModal = () => {
        setEditAdminModalOpen(false);
        setSelectedAdmin(null);
        setShowPasswordEdit(false);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedAdmin(null);
    };

    // Handle add admin
    const handleAddAdmin = async (values, { setSubmitting, resetForm }) => {
        try {
            setSubmitting(true);

            const payload = {
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                password: values.password,
                role: "admin",
                is_super_admin: values.is_super_admin || false,
            };

            const response = await postResponse({
                apiEndPoint: "admin/add-admin",
                payload,
            });

            if (response.successType) {
                resetForm();
                closeAddModal();
                fetchAdmins(pagination.page, pagination.limit);
            }
        } catch (err) {
            console.error("Error creating admin:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit admin
    const handleEditAdmin = async (values, { setSubmitting }) => {
        try {
            setSubmitting(true);

            const payload = {
                first_name: values.first_name,
                last_name: values.last_name,
                user_id: selectedAdmin.id,
                is_super_admin: values.is_super_admin || false,
            };

            // Only include password if it's provided
            if (values.password) {
                payload.password = values.password;
            }

            const response = await putResponse({
                apiEndPoint: `admin/edit-admin`,
                payload,
            });

            if (response.successType) {
                closeEditModal();
                fetchAdmins(pagination.page, pagination.limit);
            }
        } catch (err) {
            console.error("Error updating admin:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete admin
    const handleDeleteAdmin = async () => {
        try {

            const payload = {
                user_id: selectedAdmin.id,
                role_name: "admin"
            }
            const queryString = constructQueryParams(payload);


            const response = await deleteResponse({
                apiEndPoint: `/admin/delete-admin`,
                queryString
            });

            if (response.successType) {
                closeDeleteModal();
                fetchAdmins(pagination.page, pagination.limit);
            }
        } catch (err) {
            console.error("Error deleting admin:", err);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [debouncedSearch]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <SectionHeader title="Admin Management" mainHeader />
                <Button
                    label="Add Admin"
                    icon={<Plus size={16} />}
                    onClick={openAddModal}
                />
            </div>

            {/* Filters Section */}
            <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                    <Input
                        label="Search"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                        }
                    />
                </div>
            </div>

            {/* Admins Table */}
            <div className="mt-6">
                <Table
                    columns={columns}
                    data={admins}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isPagination={true}
                />

                {/* Add Admin Modal */}
                <Modal
                    open={addAdminModalOpen}
                    closeModal={closeAddModal}
                    title="Add New Admin"
                    closeButtonOutside={true}
                    width="w-[500px]"
                >
                    <Formik
                        initialValues={{
                            first_name: "",
                            last_name: "",
                            email: "",
                            password: "",
                            is_super_admin: false,
                        }}
                        validationSchema={adminValidationSchema}
                        onSubmit={handleAddAdmin}
                    >
                        {({ isSubmitting, values, handleChange }) => (
                            <Form className="space-y-4">
                                <Field name="first_name">
                                    {({ field, meta }) => (
                                        <Input
                                            label="First Name"
                                            type="text"
                                            placeholder="Enter first name"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="last_name">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Last Name"
                                            type="text"
                                            placeholder="Enter last name"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="email">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="Enter email"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="password">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Password"
                                            type={showPasswordAdd ? "text" : "password"}
                                            placeholder="Enter password"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                            endIcon={showPasswordAdd ? <EyeOff size={16} /> : <Eye size={16} />}
                                            onEndIconClick={() => setShowPasswordAdd(!showPasswordAdd)}
                                        />
                                    )}
                                </Field>

                                <Field name="is_super_admin">
                                    {({ field, meta }) => (
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    className="w-4 h-4 text-[var(--color-text-primary)] mr-2"
                                                />
                                                <span className="text-sm text-[var(--color-text-muted)]">
                                                    Super Admin (can manage other admins)
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </Field>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        label="Cancel"
                                        variant="outline"
                                        onClick={closeAddModal}
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        type="submit"
                                        label={isSubmitting ? "Creating..." : "Create Admin"}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                {/* Edit Admin Modal */}
                <Modal
                    open={editAdminModalOpen}
                    closeModal={closeEditModal}
                    title="Edit Admin"
                    closeButtonOutside={true}
                    width="w-[500px]"
                >
                    <Formik
                        initialValues={{
                            first_name: selectedAdmin?.Roles?.[0]?.UserRole.first_name || "",
                            last_name: selectedAdmin?.Roles?.[0]?.UserRole.last_name || "",
                            email: selectedAdmin?.email || "",
                            password: "",
                            is_super_admin: selectedAdmin?.is_super_admin || false,
                        }}
                        validationSchema={adminValidationSchema}
                        onSubmit={handleEditAdmin}
                    >
                        {({ isSubmitting, values, handleChange }) => (
                            <Form className="space-y-4">
                                <Field name="first_name">
                                    {({ field, meta }) => (
                                        <Input
                                            label="First Name"
                                            type="text"
                                            placeholder="Enter first name"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="last_name">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Last Name"
                                            type="text"
                                            placeholder="Enter last name"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="email">
                                    {({ field, meta }) => (
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            disabled
                                            placeholder="Enter email"
                                            {...field}
                                            error={meta.touched && meta.error ? meta.error : ""}
                                            required
                                        />
                                    )}
                                </Field>

                                <Field name="password">
                                    {({ field, meta }) => (
                                        <Input
                                            label="New Password (leave empty to keep current)"
                                            type={showPasswordEdit ? "text" : "password"}
                                            placeholder="Enter new password"
                                            {...field}
                                            endIcon={showPasswordEdit ? <EyeOff size={16} /> : <Eye size={16} />}
                                            onEndIconClick={() => setShowPasswordEdit(!showPasswordEdit)}
                                        />
                                    )}
                                </Field>

                                <Field name="is_super_admin">
                                    {({ field, meta }) => (
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    className="w-4 h-4 text-[var(--color-text-primary)] mr-2"
                                                />
                                                <span className="text-sm text-[var(--color-text-muted)]">
                                                    Super Admin (can manage other admins)
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </Field>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        label="Cancel"
                                        variant="outline"
                                        onClick={closeEditModal}
                                        disabled={isSubmitting}
                                    />
                                    <Button
                                        type="submit"
                                        label={isSubmitting ? "Updating..." : "Update Admin"}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    closeModal={closeDeleteModal}
                    title="Delete Admin"
                    width="w-[400px]"
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">
                                Are you sure you want to delete the admin account for{" "}
                                <strong>{selectedAdmin?.first_name} {selectedAdmin?.last_name}</strong>?
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                label="Cancel"
                                variant="outline"
                                onClick={closeDeleteModal}
                            />
                            <Button
                                label="Delete Admin"
                                variant="danger"
                                onClick={handleDeleteAdmin}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AdminManagementPage;