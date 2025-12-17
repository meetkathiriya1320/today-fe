"use client";

import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import MultiDatePicker from "@/components/multiDatePicker";
import ProfileImageUploader from "@/components/profileImageUploader";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import useSocket from "@/hooks/useSocket";
import {
  deleteResponse,
  getResponse,
  patchResponse,
  postResponse,
  putResponse,
} from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import { Field, Form, Formik } from "formik";
import {
  Calendar,
  CircleX,
  Edit,
  FileText,
  Search,
  Tag,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

// ✅ Yup Validation Schema
const validationSchema = Yup.object({
  offer_title: Yup.string().required("Offer title is required"),
  short_description: Yup.string().required("Short description is required"),
  category_id: Yup.string().required("Category is required"),
  branch_id: Yup.string().required("Branch is required"),
  start_date: Yup.date().required("Start date is required"),
  end_date: Yup.date()
    .required("End date is required")
    .min(Yup.ref("start_date"), "End date must be after start date"),
  keywords: Yup.array()
    .of(Yup.string())
    .min(1, "At least one keyword is required"),
});

const OffersPage = () => {

  const socket = useSocket()

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState(null);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    total: 0,
    limit: 10,
    totalPages: 1,
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [branches, setBranches] = useState([]);

  // Filter states - unified filter state object
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    dateRange: [],
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Get user from cookie
  const businessId = getCurrentUserCookie()?.business_id;

  // Fetch all offers
  const fetchOffers = async (page = 1, search = "") => {
    try {
      if (!businessId) {
        console.error("Business ID not found in user cookie");
        return;
      }

      const queryParams = {
        business_id: businessId,
        page: page,
        limit: paginationData.limit,
        search: search.trim(),
      };

      // Add filter parameters from unified filters state
      if (filters.status) {
        queryParams.status = filters.status;
      }
      if (filters.categoryId) {
        queryParams.category_id = filters.categoryId;
      }
      if (filters.dateRange.length === 2) {
        queryParams.start_date = filters.dateRange[0];
        queryParams.end_date = filters.dateRange[1];
      }

      const queryString = constructQueryParams(queryParams);

      const response = await getResponse({
        apiEndPoint: "offers",
        queryString,
      });

      if (response.successType) {
        const { data, pagination } = response.response.data;
        setOffers(data || []);
        setPaginationData({
          page: pagination?.currentPage || 1,
          total: pagination?.totalItems || 0,
          limit: pagination?.itemsPerPage || 10,
          totalPages: pagination?.totalPages || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await getResponse({
        apiEndPoint: "categories",
      });

      if (response.successType) {
        const categoriesData = response.response.data.map((item) => {
          return { id: item.id, value: item.id, label: item.name };
        });
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      if (!businessId) {
        console.error("Business ID not found in user cookie");
        return;
      }
      const queryString = constructQueryParams({
        business_id: businessId,
        page: 1,
        limit: 1000,
      });

      const response = await getResponse({
        apiEndPoint: "business/get-branches",
        queryString,
      });

      if (response.successType) {
        const { branches } = response.response.data;
        setBranches(branches || []);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories only once on component mount
  useEffect(() => {
    fetchCategories();
    fetchBranches();
  }, []);

  // Fetch offers with filter dependencies
  useEffect(() => {
    fetchOffers(1, debouncedSearchQuery);
  }, [
    debouncedSearchQuery,
    businessId,
    filters.status,
    filters.categoryId,
    filters.dateRange,
  ]);

  // Filter handlers - unified approach
  const handleStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters((prev) => ({ ...prev, categoryId }));
  };

  const handleDateRangeFilter = (dateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  };

  // Status options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
  ];

  // Table columns
  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row?.OfferImage?.image}
          alt={row.offer_title}
          className="w-16 h-16 object-cover rounded border border-gray-200"
        />
      ),
    },
    { key: "offer_title", header: "Offer Title" },
    {
      key: "branch_name",
      header: "Branch",
      render: (row) => row?.Branch?.branch_name || "-",
    },
    {
      key: "category_id",
      header: "Category",
      render: (row) => row?.Category?.name,
    },
    { key: "short_description", header: "Description", maxWidth: "300px" },
    {
      key: "reason",
      header: "Reason",
      maxWidth: "300px",
      render: (row) => row.is_blocked ? row?.blocked_reason : row.status === "rejected" ? row?.OfferRequestRejectDetails?.reason : "-",
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (row) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      key: "end_date",
      header: "End Date",
      render: (row) => new Date(row.end_date).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip status={row.is_blocked ? "Blocked" : row.status} />,
    },
    {
      key: "is_active",
      header: "Active",
      render: (row) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row?.is_active || false}
            onChange={() => handleToggleActive(row)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Edit
            size={18}
            className={`${row.status !== "pending"
              ? "cursor-not-allowed opacity-50 text-gray-400" : "cursor-pointer"

              }`}
            onClick={(e) => {
              e.stopPropagation();
              if (row.status === "pending") {
                setOfferToEdit(row);
                setEditMode(true);
                setModalOpen(true);
              }
            }}
          />
          <Trash
            size={18}
            className={`${row.status !== "pending"
              ? "cursor-not-allowed opacity-50 text-gray-400"
              : "cursor-pointer text-[var(--color-error)] hover:text-red-600"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              if (row.status === "pending") {
                setOfferToDelete(row);
                setDeleteModalOpen(true);
              }
            }}
          />
        </div>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages) {
      setLoading(true);
      fetchOffers(newPage, debouncedSearchQuery);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Handle delete offer
  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await deleteResponse({
        apiEndPoint: `offers/${offerToDelete.id}`,
      });

      if (response.successType) {
        setDeleteModalOpen(false);
        setOfferToDelete(null);
        setDeleteLoading(false);
        // Refresh the offers list
        fetchOffers(paginationData.page, debouncedSearchQuery);
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setOfferToDelete(null);
    setDeleteLoading(false);
  };

  // Close modal and reset edit state
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setOfferToEdit(null);
    setImageFile(null);
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    setImageFile(file);
  };

  // Handle toggle active status
  const handleToggleActive = async (offer) => {
    try {
      const newActiveStatus = !offer.is_active;
      const queryString = constructQueryParams({ offer_id: offer.id });

      const response = await patchResponse({
        apiEndPoint: `offers/toggle-active`,
        queryString,
        payload: {
          is_active: newActiveStatus,
        },
      });

      if (response.successType) {
        // Update the local state to reflect the change
        setOffers(prevOffers =>
          prevOffers.map(o =>
            o.id === offer.id ? { ...o, is_active: newActiveStatus } : o
          )
        );
      }
    } catch (err) {
      console.error("Error toggling offer active status:", err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">

        <SectionHeader
          title="Offers"
          mainHeader
        />

        <Button
          label={editMode ? "Edit Offer" : "Add Offer"}
          onClick={() => {
            setEditMode(false);
            setOfferToEdit(null);
            setImageFile(null);
            setModalOpen(true);
          }}
          variant="primary"
        />
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <Input
            label="Search"
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            startIcon={<Search size={18} />}
            onChange={handleSearchChange}
            {...(searchQuery && {
              endIcon: <CircleX size={18} onClick={clearSearch} />,
            })}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Input
            label="Status"
            isSelect
            selectProps={{
              options: statusOptions,
              placeholder: "All Status",
              value:
                statusOptions.find(
                  (option) => option.value === filters.status
                ) || statusOptions[0],
              onChange: (option) => handleStatusFilter(option?.value || ""),
            }}
          />
        </div>

        {/* Category Filter */}
        <div>
          <Input
            label="Category"
            isSelect
            selectProps={{
              options: [{ value: "", label: "All Categories" }, ...categories],
              placeholder: "All Categories",
              value: categories.find(
                (option) => option.value === filters.categoryId
              ) || { value: "", label: "All Categories" },
              onChange: (option) => handleCategoryFilter(option?.value || ""),
            }}
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <MultiDatePicker
            label="Date Range"
            value={filters.dateRange}
            onChange={handleDateRangeFilter}
            placeholder="Select date range"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={offers}
        loading={loading}
        pagination={paginationData}
        onPageChange={handlePageChange}
      />

      {/* ADD/EDIT OFFER MODAL */}
      <Modal
        title={editMode ? "Edit Offer" : "Add New Offer"}
        open={modalOpen}
        closeModal={closeModal}
      >
        <Formik
          initialValues={{
            offer_title: editMode ? offerToEdit?.offer_title || "" : "",
            short_description: editMode
              ? offerToEdit?.short_description || ""
              : "",
            full_description: editMode
              ? offerToEdit?.full_description || ""
              : "",
            category_id: editMode ? offerToEdit?.category_id || "" : "",
            branch_id: editMode ? offerToEdit?.branch_id || "" : "",
            start_date: editMode
              ? offerToEdit?.start_date?.split("T")[0] || ""
              : "",
            end_date: editMode
              ? offerToEdit?.end_date?.split("T")[0] || ""
              : "",
            keywords: editMode
              ? Array.isArray(offerToEdit?.keywords)
                ? offerToEdit.keywords
                : []
              : [],
            is_active: editMode ? offerToEdit?.is_active || false : true,
          }}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            try {
              setSubmitting(true);
              if (!businessId) {
                console.error("Business ID not found in user cookie");
                return;
              }
              // Prepare form data for file upload
              const formData = new FormData();
              formData.append("image", imageFile || "");
              formData.append("category_id", values.category_id);
              formData.append("business_id", businessId);
              formData.append("branch_id", values.branch_id);
              formData.append("offer_title", values.offer_title);
              formData.append("short_description", values.short_description);
              formData.append("full_description", values.full_description);
              formData.append(
                "start_date",
                new Date(values.start_date).toISOString()
              );
              formData.append(
                "end_date",
                new Date(values.end_date).toISOString()
              );
              formData.append("keywords", JSON.stringify(values.keywords));
              formData.append("is_active", values.is_active ? "1" : "0");

              let response;
              if (editMode && offerToEdit?.id) {
                // Update offer - using PUT for update
                response = await putResponse({
                  apiEndPoint: `offers/${offerToEdit.id}`,
                  payload: formData,
                  type: "form-data",
                });
              } else {
                // Create new offer - using POST
                response = await postResponse({
                  apiEndPoint: "offers",
                  payload: formData,
                  type: "form-data",
                });

                const notificationData = { ...response.response.data.notifications }
                socket.emit("send-notification-to-business-owner", {
                  ...notificationData
                });
              }

              if (response.successType) {
                resetForm();
                setImageFile(null);
                closeModal();
                fetchOffers(1, debouncedSearchQuery);
              }
            } catch (error) {
              console.log(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Image Upload - MOVED TO TOP */}
              <div>
                <ProfileImageUploader
                  label="Offer Image"
                  onChange={handleImageUpload}
                  value={editMode ? offerToEdit?.OfferImage?.image : null}
                  className="w-full"
                />
              </div>
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
                      placeholder: "Select Category",
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

              {/* Branch - Using Enhanced Input Component */}
              <Field name="branch_id">
                {({ field, meta }) => (
                  <Input
                    label="Branch"
                    placeholder="Select Branch"
                    isSelect
                    selectProps={{
                      options: branches.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name,
                      })),
                      placeholder: "Select Branch",
                      value: field.value
                        ? branches
                          .map((branch) => ({
                            value: branch.id,
                            label: branch.branch_name,
                          }))
                          .find((o) => o.value === field.value)
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
                      meta.touched && branches.length > 0 && meta.error
                        ? meta.error
                        : ""
                    }
                  />
                )}
              </Field>

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
                      min={new Date().toISOString().split("T")[0]}
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
                      min={new Date().toISOString().split("T")[0]}
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

              {/* Active Status */}
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
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-800 cursor-pointer">
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

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        open={deleteModalOpen}
        title="Delete Offer"
        message={`Are you sure you want to delete "${offerToDelete?.offer_title}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteOffer}
        onCancel={cancelDelete}
        isDisabled={deleteLoading}
      />
    </>
  );
};

export default OffersPage;
