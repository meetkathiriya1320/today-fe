"use client";

import AddressAutocomplete from "@/components/addressAutocomplete";
import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import Table from "@/components/table";
import {
  deleteResponse,
  getResponse,
  patchResponse,
  postResponse,
  putResponse,
} from "@/lib/response";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  GitBranch,
  MapPin,
  Phone,
  User,
  Search,
  CircleX,
  Trash,
  Edit,
} from "lucide-react";
import { constructQueryParams } from "@/utils/constructQueryParams";
import StatusChip from "@/components/statusChip";

// ✅ Yup Validation Schema
const validationSchema = Yup.object({
  branch_name: Yup.string().required("Branch name is required"),
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
  contact_name: Yup.string().required("Contact name is required"),
  location: Yup.string().required("Location is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
});

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState(null);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    total: 0,
    limit: 10,
    totalPages: 1,
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Get user from cookie
  const businessId = getCurrentUserCookie()?.business_id;

  // Fetch all branches
  const fetchBranches = async (page = 1, search = "") => {
    try {
      if (!businessId) {
        console.error("Business ID not found in user cookie");
        return;
      }
      const queryString = constructQueryParams({
        business_id: businessId,
        page: page,
        limit: paginationData.limit,
        search: search.trim(),
      });

      const response = await getResponse({
        apiEndPoint: "business/get-branches",
        queryString,
      });

      if (response.successType) {
        const { branches, pagination } = response.response.data;
        setBranches(branches || []);
        setPaginationData({
          page: pagination?.currentPage || 1,
          total: pagination?.totalItems || 0,
          limit: pagination?.itemsPerPage || 10,
          totalPages: pagination?.totalPages || 1,
        });
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(1, debouncedSearchQuery);
  }, [debouncedSearchQuery, businessId]);

  // Table columns
  const columns = [
    { key: "branch_name", header: "Branch Name" },
    { key: "phone_number", header: "Phone Number", render: (row) => `+${row?.country_code} ${row?.phone_number?.slice(row?.country_code?.length)}` },
    { key: "contact_name", header: "Contact Name" },
    { key: "location", header: "Location", maxWidth: "350px" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Edit
            size={18}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setBranchToEdit(row);
              setEditMode(true);
              setModalOpen(true);
            }}
          />
          <Trash
            size={18}
            className="cursor-pointer text-[var(--color-error)] hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              setBranchToDelete(row);
              setDeleteModalOpen(true);
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
      fetchBranches(newPage, debouncedSearchQuery);
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

  // Handle delete branch
  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await deleteResponse({
        apiEndPoint: `business/delete-branch/${branchToDelete.id}`,
      });

      if (response.successType) {
        setDeleteModalOpen(false);
        setBranchToDelete(null);
        setDeleteLoading(false);
        // Refresh the branches list with current search context
        fetchBranches(paginationData.page, debouncedSearchQuery);
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBranchToDelete(null);
    setDeleteLoading(false);
  };

  // Close modal and reset edit state
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setBranchToEdit(null);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Branches
        </h1>

        <Button
          label={editMode ? "Edit Branch" : "Add Branch"}
          onClick={() => {
            setEditMode(false);
            setBranchToEdit(null);
            setModalOpen(true);
          }}
          variant="primary"
        />
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            label="Search"
            type="text"
            placeholder="Search branches..."
            value={searchQuery}
            startIcon={<Search size={18} />}
            onChange={handleSearchChange}
            {...(searchQuery && {
              endIcon: <CircleX size={18} onClick={clearSearch} />,
            })}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={branches}
        loading={loading}
        pagination={paginationData}
        onPageChange={handlePageChange}
      />

      {/* ADD/EDIT BRANCH MODAL */}
      <Modal
        title={editMode ? "Edit Branch" : "Add New Branch"}
        open={modalOpen}
        closeModal={closeModal}
      >
        <Formik
          initialValues={{
            branch_name: editMode ? branchToEdit?.branch_name || "" : "",
            phone_number: editMode ? branchToEdit?.phone_number || "" : "",
            country_code: editMode ? branchToEdit?.country_code || "" : "",
            phone_number: editMode ? branchToEdit?.phone_number || "" : "",
            contact_name: editMode ? branchToEdit?.contact_name || "" : "",
            iso_code: editMode ? branchToEdit?.iso_code || "" : "",
            location: editMode ? branchToEdit?.location || "" : "",
            latitude: editMode ? branchToEdit?.latitude || "" : "",
            longitude: editMode ? branchToEdit?.longitude || "" : "",
            city: editMode ? branchToEdit?.city || "" : "",
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

              const payload = {
                ...values,
                business_id: businessId,
              };

              let response;
              if (editMode) {
                // Update branch
                response = await patchResponse({
                  apiEndPoint: `business/edit-branches/${branchToEdit.id}`,
                  payload,
                });
              } else {
                // Create new branch
                response = await postResponse({
                  apiEndPoint: "business/create-branch",
                  payload,
                });
              }

              if (response.successType) {
                resetForm();
                closeModal();
                fetchBranches(1, debouncedSearchQuery);
              }
            } catch (error) {
              console.log(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-4">
              {/* Branch Name */}
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

              {/* Phone Number */}
              <Field name="phone_number">
                {({ field, meta }) => (
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    {...field}
                    error={meta.touched && meta.error ? meta.error : ""}
                    isPhone
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
                    startIcon={<Phone size={18} />}
                  />
                )}
              </Field>

              {/* Contact Name */}
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

              {/* Location with Autocomplete + auto lat/lng */}
              <Field name="location">
                {({ meta }) => (
                  <AddressAutocomplete
                    label="Location"
                    value={formik.values.location}
                    startIcon={<MapPin size={18} />}
                    error={meta.touched && meta.error ? meta.error : ""}
                    required
                    onSelect={(place) => {
                      formik.setFieldValue("location", place.formatted);
                      formik.setFieldValue("latitude", place.lat);
                      formik.setFieldValue("longitude", place.lon);
                      // @todo remove static city =======
                      formik.setFieldValue("city", place.item.properties.city || "Surat");
                    }}
                  />
                )}
              </Field>

              <div className="flex justify-end gap-4 mt-6">
                <Button label="Cancel" onClick={closeModal} variant="outline" />
                <Button
                  label={editMode ? "Update Branch" : "Create Branch"}
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
        title="Delete Branch"
        message={`Are you sure you want to delete "${branchToDelete?.branch_name}"? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteBranch}
        onCancel={cancelDelete}
        isDisabled={deleteLoading}
      />
    </>
  );
};

export default BranchesPage;
