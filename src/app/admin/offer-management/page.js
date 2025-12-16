"use client";

import ActionButton from "@/components/actionButton";
import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import MultiDatePicker from "@/components/multiDatePicker";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import { getResponse, putResponse, deleteResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { CheckCircle, CircleX, Plus, Trash2, Edit, Eye, EyeOff, MapPin, Calendar, Building2, User, Tag, ExternalLink, Shield, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import AddOfferModal from "@/components/admin/AddOfferModal";
import useSocket from "@/hooks/useSocket";

const AdminOfferManagementPage = () => {
  const socket = useSocket()
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(true); // true for block, false for unblock
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateRange: [],
  });

  // Debounced search value
  const debouncedSearch = useDebounce(filters.search, 500);

  // Define table columns
  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row?.OfferImage?.image || "/placeholder-image.png"}
          alt="Offer"
          className="w-16 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openImageModal(row?.OfferImage?.image, row?.offer_title)}
          title="Click to view larger image"
        />
      ),
      maxWidth: "100px",
    },
    {
      key: "offer_title",
      header: "Offer Title",
      render: (row) => row?.offer_title || "-",
    },
    {
      key: "business_name",
      header: "Business Name",
      render: (row) => row?.Branch?.Business?.business_name || "-",
    },
    {
      key: "branch_name",
      header: "Branch",
      render: (row) => row?.Branch?.branch_name || "-",
    },
    {
      key: "",
      header: "First Name",
      render: (row) => row?.Branch?.Business.User.UserRoles[0]?.first_name || "-",
    },
    {
      key: "last_name",
      header: "Last Name",
      render: (row) => row?.Branch?.Business.User.UserRoles[0]?.last_name || "-",
    },
    {
      key: "category",
      header: "Category",
      render: (row) => row?.Category?.name || "-",
    },

    {
      key: "reason",
      header: "Reason",
      maxWidth: "250px",
      render: (row) => row?.OfferRequestRejectDetails?.reason || "-",
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (row) =>
        row?.start_date
          ? new Date(row.start_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "-",
    },
    {
      key: "end_date",
      header: "End Date",
      render: (row) =>
        row?.end_date
          ? new Date(row.end_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          : "-",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip status={row?.status} />,
    },
    {
      key: "is_active",
      header: "Active",
      render: (row) => (
        <div className="flex items-center justify-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${row?.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {row?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: "is_blocked",
      header: "Blocked",
      render: (row) => (
        <div className="flex items-center justify-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${row?.is_blocked
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {row?.is_blocked ? 'Blocked' : 'Not Blocked'}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-3">
          <>
            <ActionButton
              title="View Details"
              variant="primary"
              icon={<Eye size={18} />}
              onClick={() => openViewModal(row)}
            />
            <ActionButton
              title="Edit"
              variant="info"
              icon={<Edit size={18} />}
              onClick={() => openEditModal(row)}
            />
            <ActionButton
              title="Approve"
              variant="success"
              icon={<CheckCircle size={18} />}
              onClick={() => openApproveModal(row)}
            />
            <ActionButton
              title="Reject"
              variant="neutral"
              icon={<CircleX size={18} />}
              onClick={() => openRejectModal(row)}
            />
            <ActionButton
              title={row?.is_blocked ? "Unblock" : "Block"}
              variant={row?.is_blocked ? "success" : "warning"}
              icon={row?.is_blocked ? <ShieldX size={18} /> : <Shield size={18} />}
              onClick={() => openBlockModal(row)}
            />
            <ActionButton
              title="Delete"
              variant="danger"
              icon={<Trash2 size={18} />}
              onClick={() => openDeleteModal(row)}
            />
          </>
        </div>
      ),
    },
  ];

  // Fetch offers
  const fetchOffers = async (
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

      // Add status filter
      if (filters.status) {
        params.status = filters.status;
      }

      // Add date range filter
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.start_date = filters.dateRange[0];
        params.end_date = filters.dateRange[1];
      }

      const queryString = constructQueryParams(params);
      const response = await getResponse({
        apiEndPoint: `offers`,
        queryString,
      });

      if (response.successType) {
        const { data, pagination: paginationData } = response.response.data;

        setOffers(data || []);

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
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchOffers(newPage, pagination.limit);
  };

  // Open approve modal
  const openApproveModal = (offer) => {
    setSelectedOffer(offer);
    setApproveModalOpen(true);
  };

  // Open reject modal
  const openRejectModal = (offer) => {
    setSelectedOffer(offer);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setAddOfferModalOpen(true);
  };

  // Open view modal
  const openViewModal = (offer) => {
    setSelectedOffer(offer);
    setViewModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setSelectedOffer(null);
    setViewModalOpen(false);
  };

  // Open image in modal
  const openImageModal = (imageSrc, imageName) => {
    if (imageSrc) {
      console.log(imageSrc)
      setSelectedImageForModal({ src: imageSrc, name: imageName });
      setImageModalOpen(true);
    }

  };

  // Open delete modal
  const openDeleteModal = (offer) => {
    setSelectedOffer(offer);
    setDeleteModalOpen(true);
  };

  // Open block/unblock modal
  const openBlockModal = (offer) => {
    setSelectedOffer(offer);
    setIsBlocking(!offer?.is_blocked); // If currently blocked, we're unblocking; if not blocked, we're blocking
    setBlockReason("");
    setBlockModalOpen(true);
  };

  // Handle approve offer
  const handleApproveOffer = async () => {
    try {
      const response = await putResponse({
        apiEndPoint: `offers/${selectedOffer?.id}/status`,
        payload: {
          status: "approved",
        },
      });

      if (response.successType) {

        const notificationData = response.response.data.notifications
        socket.emit("send-notification-to-business-owner", {
          ...notificationData
        });
        setApproveModalOpen(false);
        setSelectedOffer(null);
        fetchOffers(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error approving offer:", err);
    }
  };

  // Handle reject offer
  const handleRejectOffer = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      const response = await putResponse({
        apiEndPoint: `/offers/${selectedOffer?.id}/status`,
        payload: {
          status: "rejected",
          reason: rejectReason.trim(),
        },
      });

      if (response.successType) {
        const notificationData = response.response.data.notifications
        socket.emit("send-notification-to-business-owner", {
          ...notificationData
        });
        setRejectModalOpen(false);
        setSelectedOffer(null);
        setRejectReason("");
        fetchOffers(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error rejecting offer:", err);
    }
  };

  // Handle add offer success
  const handleAddOfferSuccess = () => {
    fetchOffers(pagination.page, pagination.limit);
    setEditingOffer(null);
  };

  // Handle add offer modal close
  const handleAddOfferModalClose = () => {
    setAddOfferModalOpen(false);
    setEditingOffer(null);
  };

  // Handle delete offer
  const handleDeleteOffer = async () => {
    try {
      const response = await deleteResponse({
        apiEndPoint: `offers/${selectedOffer?.id}`,
      });

      if (response.successType) {
        setDeleteModalOpen(false);
        setSelectedOffer(null);
        fetchOffers(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  // Handle block/unblock offer
  const handleBlockUnblockOffer = async () => {
    try {
      const payload = {
        blocked: isBlocking,
        ...(isBlocking && blockReason.trim() && { block_reason: blockReason.trim() })
      };

      const response = await putResponse({
        apiEndPoint: `/offers/block/${selectedOffer?.id}`,
        payload,
      });

      if (response.successType) {
        const notificationData = response.response.data.notifications
        socket.emit("send-notification-to-business-owner", {
          ...notificationData
        });
        setBlockModalOpen(false);
        setSelectedOffer(null);
        setBlockReason("");
        fetchOffers(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error(`Error ${isBlocking ? 'blocking' : 'unblocking'} offer:`, err);
    }
  };


  useEffect(() => {
    fetchOffers();
  }, [debouncedSearch, filters.status, filters.dateRange]);

  return (
    <div className="p-4">
      <SectionHeader
        title="Offer Management"
        mainHeader
        rightContent={
          <Button
            label="Add Offer"
            onClick={() => setAddOfferModalOpen(true)}
            icon={<Plus size={18} />}
          />
        }
      />

      {/* Filters Section */}
      <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            placeholder="Search by offer title, business name..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
        {/* Status Filter */}
        <Input
          isSelect
          label="Status"
          placeholder="All Status"
          selectProps={{
            value: filters.status
              ? {
                value: filters.status,
                label:
                  filters.status === "approved"
                    ? "Approved"
                    : filters.status === "pending"
                      ? "Pending"
                      : "Rejected",
              }
              : null,
            onChange: (option) =>
              setFilters((prev) => ({
                ...prev,
                status: option ? option.value : "",
              })),
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ],
            isClearable: true,
          }}
        />

        {/* Date Range Picker */}
        <MultiDatePicker
          label="Date Range"
          placeholder="Select date range"
          value={filters.dateRange}
          onChange={(range) =>
            setFilters((prev) => ({ ...prev, dateRange: range }))
          }
        />
      </div>

      {/* Offers Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={offers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          isPagination={true}
        />

        {/* View Offer Details Modal */}
        <Modal
          open={viewModalOpen}
          closeModal={closeViewModal}
          title="Offer Details"
          width="w-[800px]"
        >
          {selectedOffer && (
            <div className="space-y-6">
              {/* Offer Image */}
              <div className="flex justify-center">
                <img
                  src={selectedOffer?.OfferImage?.image || "/placeholder-image.png"}
                  alt={selectedOffer?.offer_title}
                  className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>

              {/* Offer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Tag size={20} />
                  Offer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Offer Title</label>
                    <p className="mt-1 font-medium">{selectedOffer?.offer_title || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="mt-1">{selectedOffer?.Category?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <StatusChip status={selectedOffer?.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Active</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedOffer?.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedOffer?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Blocked</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedOffer?.is_blocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedOffer?.is_blocked ? 'Blocked' : 'Not Blocked'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-md font-medium text-gray-600">Description</label>
                  <p className="mt-1">{selectedOffer?.short_description || "N/A"}</p>
                </div>
                <div className="mt-4">
                  <label className="text-md font-medium text-gray-600">Full Description</label>
                  <p className="mt-1">{selectedOffer?.full_description || "N/A"}</p>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Keywords</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedOffer?.keywords && selectedOffer.keywords.length > 0 ? (
                      selectedOffer.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No keywords available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Business & Branch Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 size={20} />
                  Business & Branch Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Name</label>
                    <p className="mt-1">{selectedOffer?.Branch?.Business?.business_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Branch Name</label>
                    <p className="mt-1">{selectedOffer?.Branch?.branch_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Owner Name</label>
                    <p className="mt-1">
                      {selectedOffer?.Branch?.Business.User.UserRoles[0]?.first_name}{" "}
                      {selectedOffer?.Branch?.Business.User.UserRoles[0]?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1">{selectedOffer?.Branch?.Business.User?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Branch Location</label>
                  <p className="mt-1 flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedOffer?.Branch?.location || "N/A"}
                  </p>
                </div>
              </div>

              {/* Date Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={20} />
                  Date Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="mt-1">
                      {selectedOffer?.start_date
                        ? new Date(selectedOffer.start_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="mt-1">
                      {selectedOffer?.end_date
                        ? new Date(selectedOffer.end_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="mt-1">
                      {selectedOffer?.created_at
                        ? new Date(selectedOffer.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated At</label>
                    <p className="mt-1">
                      {selectedOffer?.updated_at
                        ? new Date(selectedOffer.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if any) */}
              {selectedOffer?.status === "rejected" && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-3 text-red-800">Rejection Reason</h3>
                  <p className="text-red-700">{selectedOffer.OfferRequestRejectDetails.reason}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Approve Confirmation Modal */}
        <ConfirmationModal
          open={approveModalOpen}
          onCancel={() => setApproveModalOpen(false)}
          title="Approve Offer"
          message={`Are you sure you want to approve the offer "${selectedOffer?.offer_title || ""}" from "${selectedOffer?.Business?.business_name || ""}"?`}
          confirmButtonLabel="Approve"
          confirmButtonVariant="primary"
          onConfirm={handleApproveOffer}
        />

        {/* Reject Confirmation Modal */}
        <Modal
          open={rejectModalOpen}
          closeModal={() => {
            setRejectModalOpen(false);
            setRejectReason("");
          }}
          title="Reject Offer"
          width="w-[500px]"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {`Please provide a reason for rejecting the offer "${selectedOffer?.offer_title || ""}" from "${selectedOffer?.Branch?.Business?.business_name || ""}":`}
              </p>
              <Input
                isTextarea={true}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                label="Cancel"
                variant="outline"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason("");
                }}
              />
              <Button
                label="Reject Offer"
                onClick={handleRejectOffer}
                disabled={!rejectReason.trim()}
              />
            </div>
          </div>
        </Modal>

        {/* Add Offer Modal */}
        <AddOfferModal
          open={addOfferModalOpen}
          closeModal={handleAddOfferModalClose}
          onSuccess={handleAddOfferSuccess}
          editMode={!!editingOffer}
          offerToEdit={editingOffer}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          title="Delete Offer"
          message={`Are you sure you want to delete the offer "${selectedOffer?.offer_title || ""}"? This action cannot be undone.`}
          confirmButtonLabel="Delete"
          confirmButtonVariant="danger"
          onConfirm={handleDeleteOffer}
        />

        {/* Image Preview Modal */}
        <Modal
          title={selectedImageForModal?.name || "Offer Image"}
          open={imageModalOpen}
          closeModal={() => {
            setImageModalOpen(false);
            setSelectedImageForModal(null);
          }}
          width="w-[600px]"
        >
          <div className="flex justify-center">
            <img
              src={selectedImageForModal?.src}
              alt={selectedImageForModal?.name}
              className="max-w-full max-h-[500px] object-contain rounded"
            />
          </div>
        </Modal>

        {/* Block/Unblock Confirmation Modal */}
        <Modal
          open={blockModalOpen}
          closeModal={() => {
            setBlockModalOpen(false);
            setBlockReason("");
          }}
          title={isBlocking ? "Block Offer" : "Unblock Offer"}
          width="w-[500px]"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {isBlocking
                  ? `Are you sure you want to block the offer "${selectedOffer?.offer_title || ""}" from "${selectedOffer?.Branch?.Business?.business_name || ""}"?`
                  : `Are you sure you want to unblock the offer "${selectedOffer?.offer_title || ""}" from "${selectedOffer?.Branch?.Business?.business_name || ""}"?`
                }
              </p>
              {isBlocking && (
                <div>
                  <Input
                    isTextarea={true}
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason for blocking..."
                    required
                    label="Block Reason"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                label="Cancel"
                variant="outline"
                onClick={() => {
                  setBlockModalOpen(false);
                  setBlockReason("");
                }}
              />
              <Button
                label={isBlocking ? "Block Offer" : "Unblock Offer"}
                variant="primary"
                onClick={handleBlockUnblockOffer}
                disabled={isBlocking && !blockReason.trim()}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminOfferManagementPage;
