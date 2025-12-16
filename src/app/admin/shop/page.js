"use client";

import ActionButton from "@/components/actionButton";
import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import {
  deleteResponse,
  getResponse,
  patchResponse,
  postResponse,
  putResponse,
} from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { Edit, Key, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ShopOwnerForm from "./ShopOwnerForm";

const AdminShopPage = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shopOwnerToDelete, setShopOwnerToDelete] = useState(null);
  const [editingShopOwner, setEditingShopOwner] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [shopOwnerToReset, setShopOwnerToReset] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [shopOwnerToVerify, setShopOwnerToVerify] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockReasonModalOpen, setBlockReasonModalOpen] = useState(false);
  const [shopOwnerToBlock, setShopOwnerToBlock] = useState(null);
  const [isBlockingAction, setIsBlockingAction] = useState(false); // true = block, false = unblock
  const [blockReason, setBlockReason] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    is_verify: "",
    is_blocked: "",
  });

  // Debounced search value
  const debouncedSearch = useDebounce(filters.search, 500);

  // Handle form submission (create or update)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    try {
      if (isEditMode && editingShopOwner) {
        // UPDATE MODE - Same format as add API
        const formData = new FormData();

        // Personal
        formData.append("email", values.email);
        formData.append("first_name", values.first_name);
        formData.append("last_name", values.last_name);

        // Business
        formData.append("business_name", values.business_name);
        console.log(values.branches)
        // Convert branches array to JSON string (API requirement!)
        formData.append("branches_data", JSON.stringify(values.branches));

        // Images (if any)
        values.images.forEach((file) => {
          formData.append("images", file);
        });
        const res = await patchResponse({
          apiEndPoint: `business/edit-business/${editingShopOwner?.Business?.id}`,
          payload: formData,
          type: "form-data",
        });

        if (res.successType) {
          fetchShopOwners(pagination.page, pagination.limit);
          closeAddModal();
          resetForm();
        }
      } else {
        // CREATE MODE
        const formData = new FormData();

        // Personal
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("first_name", values.first_name);
        formData.append("last_name", values.last_name);

        // Business
        formData.append("business_name", values.business_name);

        // Convert branches array to JSON string (API requirement!)
        formData.append("branches_data", JSON.stringify(values.branches));

        // Images
        values.images.forEach((file) => {
          formData.append("images", file);
        });

        const res = await postResponse({
          apiEndPoint: "/admin/add-user-by-admin",
          payload: formData,
          type: "form-data",
        });

        if (res.successType) {
          fetchShopOwners(pagination.page, pagination.limit);
          closeAddModal();
          resetForm();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Open add/edit modal
  const openAddModal = () => {
    setEditingShopOwner(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  // Open edit modal with shop owner data
  const openEditModal = (shopOwner) => {
    setEditingShopOwner(shopOwner);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  // Close add/edit modal
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingShopOwner(null);
    setIsEditMode(false);
  };

  // Handle shop owner deletion
  const handleDeleteShopOwner = async (shopOwnerId) => {
    try {
      const response = await deleteResponse({
        apiEndPoint: `business/delete-business/${shopOwnerId}`,
      });

      if (response.successType) {
        setDeleteModalOpen(false);
        setShopOwnerToDelete(null);
        fetchShopOwners(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error deleting shop owner:", err);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (shopOwner) => {
    setShopOwnerToDelete(shopOwner);
    setDeleteModalOpen(true);
  };

  // Open reset password modal
  const openResetPasswordModal = (shopOwner) => {
    setShopOwnerToReset(shopOwner);
    setResetPasswordModalOpen(true);
    setGeneratedCredentials(null);
  };

  // Close reset password modal
  const closeResetPasswordModal = () => {
    setResetPasswordModalOpen(false);
    setShopOwnerToReset(null);
    setGeneratedCredentials(null);
  };

  // Open verification modal for unverified users
  const openVerifyModal = (shopOwner) => {
    if (!shopOwner.is_verify) {
      setShopOwnerToVerify(shopOwner);
      setVerifyModalOpen(true);
    }
  };

  // Close verification modal
  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    setShopOwnerToVerify(null);
  };

  // Handle user verification
  const handleVerifyUser = async () => {
    try {
      const queryString = constructQueryParams({
        is_verify: true,
      });
      const response = await patchResponse({
        apiEndPoint: `business/verify-unverify-user/${shopOwnerToVerify?.id}`,
        queryString,
      });

      if (response.successType) {
        setVerifyModalOpen(false);
        setShopOwnerToVerify(null);
        fetchShopOwners(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error verifying user:", err);
    }
  };

  // Open block/unblock modal
  const openBlockModal = (shopOwner) => {
    setShopOwnerToBlock(shopOwner);
    setIsBlockingAction(!shopOwner.is_blocked); // If currently blocked, we'll unblock. If unblocked, we'll block.

    if (!shopOwner.is_blocked) {
      // Opening modal for blocking - need reason
      setBlockReasonModalOpen(true);
      setBlockReason("");
    } else {
      // Opening modal for unblocking - no reason needed
      setBlockModalOpen(true);
    }
  };

  // Close block modal
  const closeBlockModal = () => {
    setBlockModalOpen(false);
    setShopOwnerToBlock(null);
    setIsBlockingAction(false);
  };

  // Close block reason modal
  const closeBlockReasonModal = () => {
    setBlockReasonModalOpen(false);
    setShopOwnerToBlock(null);
    setIsBlockingAction(false);
    setBlockReason("");
  };

  // Handle block with reason
  const handleBlockWithReason = async () => {
    if (blockReason.trim()) {
      // Temporarily store reason before closing modal
      const reason = blockReason.trim();

      // Close reason modal
      setBlockReasonModalOpen(false);
      setBlockReason("");

      // Call block API with reason
      try {
        const response = await putResponse({
          apiEndPoint: `admin/block-business-owner`,
          payload: {
            user_id: shopOwnerToBlock?.id,
            status: 0, // block
            reason: reason,
          },
        });

        if (response.successType) {
          setShopOwnerToBlock(null);
          setIsBlockingAction(false);
          fetchShopOwners(pagination.page, pagination.limit);
        }
      } catch (err) {
        console.error("Error blocking user:", err);
      }
    }
  };

  // Handle user block/unblock
  const handleBlockUser = async () => {
    try {
      const payload = {
        user_id: shopOwnerToBlock?.id,
        status: isBlockingAction ? 0 : 1, // 0 = block, 1 = unblock
      };

      // Add reason only when blocking
      if (isBlockingAction && blockReason.trim()) {
        payload.reason = blockReason.trim();
      }

      const response = await putResponse({
        apiEndPoint: `admin/block-business-owner`,
        payload,
      });

      if (response.successType) {
        setBlockModalOpen(false);
        setShopOwnerToBlock(null);
        setIsBlockingAction(false);
        setBlockReason("");
        fetchShopOwners(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error blocking/unblocking user:", err);
    }
  };

  // Handle expandable row toggle
  const handleToggleExpand = (rowId) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Render branch details in expanded row
  const renderBranchDetails = (shopOwner) => {
    const branches = shopOwner?.Business?.branches || [];

    if (branches.length === 0) {
      return (
        <div className="text-sm text-gray-500 text-center py-4">
          No branches found for this business.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch, index) => (
            <div
              key={branch.id || index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-gray-900">
                  {branch.branch_name}
                </h5>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium w-16">Contact:</span>
                    <span>{branch.contact_name || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Phone:</span>
                    <span>{`+${branch.country_code} ${branch?.phone_number?.slice(branch.country_code?.length)}` || "N/A"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-16">Location:</span>
                    <span className="flex-1">{branch.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Created:</span>
                    <span>
                      {branch.created_at
                        ? new Date(branch.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {branch.latitude && branch.longitude && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Coordinates:</span>{" "}
                      {branch.latitude}, {branch.longitude}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle reset password with Formik
  const handleResetPassword = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await putResponse({
        apiEndPoint: `/admin/update-user-password`,
        payload: {
          user_id: shopOwnerToReset?.id,
          new_password: values.newPassword,
          confirm_password: values.newPassword,
        },
      });

      if (response.successType) {
        // Set generated credentials to display
        setGeneratedCredentials({
          email: shopOwnerToReset?.email || "",
          password: values.newPassword,
        });
        resetForm();
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Define table columns
  const columns = [
    {
      key: "business_name",
      header: "Business Name",
      render: (row) => row?.Business?.business_name || "-",
    },
    {
      key: "first_name",
      header: "First Name",
      render: (row) => row.first_name,
    },
    {
      key: "last_name",
      header: "Last Name",
      render: (row) => row.last_name,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row.email,
    },
    {
      key: "branches_count",
      header: "Branches",
      render: (row) => {
        const branchCount = row?.Business?.branches?.length || 0;
        return (
          <span className="text-sm">
            {branchCount} {branchCount === 1 ? "Branch" : "Branches"}
          </span>
        );
      },
    },
    {
      key: "is_blocked",
      header: "Is Blocked",
      render: (row) => (
        <div
          className="cursor-pointer hover:bg-gray-100 rounded p-1 -m-1"
          onClick={() => openBlockModal(row)}
        >
          <StatusChip status={row.is_blocked === true ? "block" : "unblock"} />
        </div>
      ),
    },
    {
      key: "is_verify",
      header: "Is Verify",
      render: (row) => (
        <div
          className={`cursor-pointer ${!row.is_verify ? "hover:bg-gray-100 rounded p-1 -m-1" : ""
            }`}
          onClick={() => openVerifyModal(row)}
        >
          <StatusChip
            status={row.is_verify === true ? "verified" : "unverified"}
          />
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Edit */}
          <ActionButton
            title="Edit"
            variant="neutral"
            icon={<Edit size={18} />}
            onClick={() => openEditModal(row)}
          />
          <ActionButton
            title="Delete"
            variant="danger"
            icon={<Trash size={18} />}
            onClick={() => openDeleteModal(row)}
          />
          <ActionButton
            title="Reset Password"
            variant="info"
            icon={<Key size={18} />}
            onClick={() => openResetPasswordModal(row)}
          />
        </div>
      ),
    },
  ];

  // Fetch shop owners with pagination and filters
  const fetchShopOwners = async (
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

      // Add is_verify filter (true/false)
      if (filters.is_verify !== "") {
        params.is_verify = filters.is_verify === "verified";
      }

      // Add is_blocked filter (true/false)
      if (filters.is_blocked !== "") {
        params.is_blocked = filters.is_blocked === "blocked";
      }

      const queryString = constructQueryParams(params);

      // Using getResponse as requested with pagination parameters
      const response = await getResponse({
        apiEndPoint: `admin/get-all-business-owner`,
        queryString,
      });

      if (response.successType) {
        const { businessOwners, pagination } = response.response.data;

        setShopOwners(businessOwners || []);

        if (pagination) {
          setPagination({
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 0,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching shop owners:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchShopOwners(newPage, pagination.limit);
  };

  useEffect(() => {
    fetchShopOwners();
  }, [debouncedSearch, filters.is_verify, filters.is_blocked]);

  return (
    <div className="p-4">
      <SectionHeader
        title="Shop Owner Management"
        mainHeader
        rightContent={
          <Button
            label="Add Shop Owner"
            variant="primary"
            size="medium"
            onClick={openAddModal}
          />
        }
      />

      {/* Filters Section */}
      <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input - LARGE */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            placeholder="Search by name, email, business..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        {/* Is Verify Filter - SMALL */}
        <Input
          label="Verification Status"
          isSelect
          placeholder="All Status"
          selectProps={{
            value: filters.is_verify
              ? {
                value: filters.is_verify,
                label:
                  filters.is_verify === "verified"
                    ? "Verified"
                    : "Unverified",
              }
              : null,
            onChange: (option) =>
              setFilters((prev) => ({
                ...prev,
                is_verify: option ? option.value : "",
              })),
            options: [
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ],
            isClearable: true,
          }}
        />

        {/* Is Blocked Filter - SMALL */}
        <Input
          label="Block Status"
          isSelect
          placeholder="All Status"
          selectProps={{
            value: filters.is_blocked
              ? {
                value: filters.is_blocked,
                label:
                  filters.is_blocked === "blocked" ? "Blocked" : "Unblocked",
              }
              : null,
            onChange: (option) =>
              setFilters((prev) => ({
                ...prev,
                is_blocked: option ? option.value : "",
              })),
            options: [
              { value: "blocked", label: "Blocked" },
              { value: "unblocked", label: "Unblocked" },
            ],
            isClearable: true,
          }}
        />
      </div>

      {/* Shop Owner Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={shopOwners}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          isPagination={true}
          expandable={true}
          expandedRows={expandedRows}
          onToggleExpand={handleToggleExpand}
          expandRenderer={renderBranchDetails}
        />

        {/* Add/Edit Shop Owner Modal */}
        <Modal
          title={isEditMode ? "Edit Shop Owner" : "Add New Shop Owner"}
          open={isAddModalOpen}
          closeModal={closeAddModal}
          width="w-[800px]"
          closeButtonOutside={true}
        >
          <ShopOwnerForm
            onSubmit={handleSubmit}
            isEditMode={isEditMode}
            initialData={editingShopOwner}
            close={closeAddModal}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          title="Delete Shop Owner"
          message={`Are you sure you want to delete the shop owner "${shopOwnerToDelete?.Business?.business_name || ""
            }"? This action cannot be undone.`}
          confirmButtonLabel="Delete"
          confirmButtonVariant="danger"
          onConfirm={() =>
            handleDeleteShopOwner(shopOwnerToDelete?.Business?.id)
          }
        />

        {/* Reset Password Modal */}
        <Modal
          title="Reset Password"
          open={resetPasswordModalOpen}
          closeModal={closeResetPasswordModal}
          width="w-[500px]"
        >
          <ResetPasswordForm
            shopOwnerEmail={shopOwnerToReset?.email}
            onSubmit={handleResetPassword}
            onCancel={closeResetPasswordModal}
            generatedCredentials={generatedCredentials}
          />
        </Modal>

        {/* Verify User Modal */}
        <ConfirmationModal
          open={verifyModalOpen}
          onCancel={closeVerifyModal}
          title="Verify User"
          message={`Are you sure you want to verify user "${shopOwnerToVerify?.first_name} ${shopOwnerToVerify?.last_name}"? This action cannot be undone.`}
          confirmButtonLabel="Verify"
          confirmButtonVariant="primary"
          onConfirm={handleVerifyUser}
        />

        {/* Block Reason Modal */}
        <Modal
          open={blockReasonModalOpen}
          closeModal={closeBlockReasonModal}
          title="Block User"
          width="w-[500px]"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for blocking user "
                {shopOwnerToBlock?.first_name} {shopOwnerToBlock?.last_name}":
              </p>
              <Input
                isTextarea={true}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this user..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                label="Cancel"
                variant="outline"
                onClick={closeBlockReasonModal}
              />
              <Button
                label="Block User"
                onClick={handleBlockWithReason}
                disabled={!blockReason.trim()}
              />
            </div>
          </div>
        </Modal>

        {/* Block/Unblock User Modal */}
        <ConfirmationModal
          open={blockModalOpen}
          onCancel={closeBlockModal}
          title={`${isBlockingAction ? "Block" : "Unblock"} User`}
          message={`Are you sure you want to ${isBlockingAction ? "block" : "unblock"
            } user "${shopOwnerToBlock?.first_name} ${shopOwnerToBlock?.last_name
            }"? ${isBlockingAction
              ? "This will prevent the user from accessing the system."
              : "This will allow the user to access the system again."
            }`}
          confirmButtonLabel={isBlockingAction ? "Block" : "Unblock"}
          confirmButtonVariant={isBlockingAction ? "danger" : "primary"}
          onConfirm={handleBlockUser}
        />
      </div>
    </div>
  );
};

export default AdminShopPage;
