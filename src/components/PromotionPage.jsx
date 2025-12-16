"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  CheckCircle,
  CircleX,
  Trash,
  SquarePen,
} from "lucide-react";
import ActionButton from "@/components/actionButton";
import Button from "@/components/button";
import Input from "@/components/input";
import Modal from "@/components/modal";
import MultiDatePicker from "@/components/multiDatePicker";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import { getResponse, putResponse, deleteResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { getCurrentUserCookie } from "@/utils/cookieUtils";
import LoadingSpinner from "@/components/loadingSpinner";
import AddPromotionModal from "@/components/admin/AddPromotionModal";
import useSocket from "@/hooks/useSocket";

const PromotionPage = ({ isAdmin = false }) => {
  const socket = useSocket();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addPromotionModalOpen, setAddPromotionModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Note state for rejection
  const [rejectionNote, setRejectionNote] = useState("");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [pendingRejectPromotion, setPendingRejectPromotion] = useState(null);

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeletePromotion, setPendingDeletePromotion] = useState(null);

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

  // Define table columns based on isAdmin
  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row?.image || "/placeholder-image.png"}
          alt="Promotion"
          className="w-16 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            openImageModal(
              row?.image || "/placeholder-image.png",
              row?.User?.Business?.business_name || "Promotion"
            )
          }
          title="Click to view larger image"
        />
      ),
      maxWidth: "100px",
    },
    {
      key: "business_name",
      header: "Business Name",
      render: (row) => row?.User?.Business?.business_name || "-",
    },
    ...(isAdmin
      ? [
        {
          key: "first_name",
          header: "First Name",
          render: (row) => row?.User?.first_name || "-",
        },
        {
          key: "last_name",
          header: "Last Name",
          render: (row) => row.User.last_name,
        },
      ]
      : []),
    {
      key: "location",
      header: "Location",
      render: (row) => (
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          <span className="truncate max-w-[150px]">{`${row?.city}`}</span>
        </div>
      ),
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
      key: "advertise_banner_status",
      header: "Banner Status",
      render: (row) => <StatusChip status={row?.AdvertiseBanner?.status} />,
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-2">
          {isAdmin && (
            <ActionButton
              title="Approve"
              variant="success"
              icon={<CheckCircle size={18} />}
              onClick={() => {
                updatePromotionStatus(row?.id, "approved");
                closeViewModal();
              }}
            />
          )}
          {isAdmin && (
            <ActionButton
              title="Reject"
              variant="danger"
              icon={<CircleX size={18} />}
              onClick={() => openRejectionModal(row)}
            />
          )}
          {/* {row?.AdvertiseBanner?.status === "pending" && (
            <ActionButton
              title="Edit"
              variant="danger"
              icon={<SquarePen  size={18} />}
             
            />
          )} */}

          <ActionButton
            title="Delete"
            disabled={row.AdvertiseBanner.status != "pending" && !isAdmin}
            variant="danger"
            icon={<Trash size={18} />}
            onClick={() => openDeleteModal(row)}
          />

          <ActionButton
            title="View Details"
            variant="primary"
            icon={<Eye size={16} />}
            onClick={() => openViewModal(row)}
          />
        </div>
      ),
    },
  ];

  // Fetch promotions
  const fetchPromotions = async (
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

      // Add user filter for non-admin
      if (!isAdmin) {
        const currentUser = getCurrentUserCookie();
        if (currentUser?.id) {
          params.user_id = currentUser.id;
        }
      }

      const queryString = constructQueryParams(params);

      const response = await getResponse({
        apiEndPoint: `advertise-requests`,
        queryString,
      });

      if (response.successType) {
        const { data, pagination: paginationData } = response.response.data;

        setPromotions(data || []);

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
      console.error("Error fetching promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchPromotions(newPage, pagination.limit);
  };

  // Open view modal
  const openViewModal = (promotion) => {
    setSelectedPromotion(promotion);
    setRejectionNote(""); // Clear note when opening modal
    setViewModalOpen(true);
  };

  // Close view modal
  const closeViewModal = () => {
    setSelectedPromotion(null);
    setRejectionNote("");
    setViewModalOpen(false);
  };

  // Handle add promotion success
  const handleAddPromotionSuccess = () => {
    fetchPromotions(pagination.page, pagination.limit);
  };

  // Open rejection modal
  const openRejectionModal = (promotion) => {
    setPendingRejectPromotion(promotion);
    setRejectionNote("");
    setRejectionModalOpen(true);
    setViewModalOpen(false); // Close the main modal
  };

  // Close rejection modal
  const closeRejectionModal = () => {
    setPendingRejectPromotion(null);
    setRejectionNote("");
    setRejectionModalOpen(false);
  };

  // Confirm rejection with note
  const confirmRejection = () => {
    if (pendingRejectPromotion) {
      updatePromotionStatus(
        pendingRejectPromotion.id,
        "rejected",
        rejectionNote || "-"
      );
      closeRejectionModal();
    }
  };

  // Update promotion status
  const updatePromotionStatus = async (promotionId, status, note = "") => {
    try {
      const payload = { status };

      // Add note field only for reject status
      if (status === "rejected" && note) {
        payload.note = note;
        payload.is_active = false;
      }

      if (status === "approved") {
        payload.is_active = true;
      }

      const response = await putResponse({
        apiEndPoint: `advertise-requests/${promotionId}/banner-status`,
        payload,
      });

      if (response.successType) {
        if (response.response.data.notifications?.data?.length > 0) {
          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications,
          });
        }
        fetchPromotions(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error updating promotion status:", err);
    }
  };

  // Delete promotion
  const deletePromotion = async (promotionId) => {
    try {
      const response = await deleteResponse({
        apiEndPoint: `advertise-requests/${promotionId}`,
      });

      if (response.successType) {
        fetchPromotions(pagination.page, pagination.limit);
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  };

  // Open delete modal
  const openDeleteModal = (promotion) => {
    setPendingDeletePromotion(promotion);
    setDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setPendingDeletePromotion(null);
    setDeleteModalOpen(false);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (pendingDeletePromotion) {
      deletePromotion(pendingDeletePromotion.id);
    }
  };

  // Open image in modal
  const openImageModal = (imageSrc, imageName) => {
    setSelectedImageForModal({ src: imageSrc, name: imageName });
    setImageModalOpen(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageForModal(null);
  };

  useEffect(() => {
    fetchPromotions();
  }, [debouncedSearch, filters.status, filters.dateRange]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <SectionHeader
          title={isAdmin ? "Promotions Management" : "My Promotions"}
          mainHeader
        />
        <Button
          label="Add Promotion"
          icon={<Plus size={16} />}
          onClick={() => setAddPromotionModalOpen(true)}
        />
      </div>

      {/* Filters Section */}
      <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            placeholder="Search by user name, location..."
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
                  filters.status.charAt(0).toUpperCase() +
                  filters.status.slice(1),
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

      {/* Promotions Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={promotions}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          isPagination={true}
        />

        {/* View Details Modal */}
        <Modal
          open={viewModalOpen}
          closeModal={closeViewModal}
          title="Promotion Details"
          width="w-[800px]"
        >
          {selectedPromotion && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User size={20} />
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <p className="mt-1">
                      {selectedPromotion?.User?.first_name}{" "}
                      {selectedPromotion?.User?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="mt-1">{selectedPromotion?.User?.email}</p>
                  </div>
                </div>
              </div>

              {/* Promotion Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={20} />
                  Promotion Details
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <p className="mt-1 flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedPromotion?.city || "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 my-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Start Date
                    </label>
                    <p className="mt-1">
                      {selectedPromotion?.start_date
                        ? new Date(
                          selectedPromotion.start_date
                        ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      End Date
                    </label>
                    <p className="mt-1">
                      {selectedPromotion?.end_date
                        ? new Date(
                          selectedPromotion.end_date
                        ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  {/* <label className="text-sm font-medium text-gray-600">
                    Offer URL
                  </label>
                  {selectedPromotion?.offer_url ? (
                    <a
                      href={selectedPromotion.offer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={14} />
                      {selectedPromotion.offer_url}
                    </a>
                  ) : (
                    <p className="mt-1">N/A</p>
                  )} */}
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">
                    Redirect URL
                  </label>
                  {selectedPromotion?.external_url ? (
                    <a
                      href={selectedPromotion.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink size={14} />
                      {selectedPromotion.external_url}
                    </a>
                  ) : (
                    <p className="mt-1">N/A</p>
                  )}
                </div>
              </div>

              {/* Banner & Payment Information */}
              {selectedPromotion?.AdvertiseBanner && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign size={20} />
                    Banner & Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Banner Status
                      </label>
                      <div className="mt-1">
                        <StatusChip
                          status={selectedPromotion?.AdvertiseBanner?.status}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Created At
                      </label>
                      <p className="mt-1">
                        {selectedPromotion?.AdvertiseBanner?.created_at
                          ? new Date(
                            selectedPromotion.AdvertiseBanner.created_at
                          ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  {selectedPromotion?.AdvertiseBanner?.Payments?.[0] && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Payment Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Method
                          </label>
                          <p className="mt-1">
                            {
                              selectedPromotion?.AdvertiseBanner?.Payments[0]
                                ?.payment_method
                            }
                          </p>
                        </div>
                        {selectedPromotion?.AdvertiseBanner?.Payments[0]
                          ?.transaction_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Transaction ID
                              </label>
                              <p className="mt-1">
                                {
                                  selectedPromotion?.AdvertiseBanner?.Payments[0]
                                    ?.transaction_id
                                }
                              </p>
                            </div>
                          )}
                        {selectedPromotion?.AdvertiseBanner?.Payments[0]
                          ?.check_number && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Check Number
                              </label>
                              <p className="mt-1">
                                {
                                  selectedPromotion?.AdvertiseBanner?.Payments[0]
                                    ?.check_number
                                }
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {isAdmin &&
                  selectedPromotion?.AdvertiseBanner?.status === "pending" && (
                    <>
                      <Button
                        label="Approve"
                        onClick={() => {
                          updatePromotionStatus(
                            selectedPromotion?.id,
                            "approved"
                          );
                          closeViewModal();
                        }}
                      />
                      <Button
                        label="Reject"
                        variant="outline"
                        onClick={() => openRejectionModal(selectedPromotion)}
                      />
                    </>
                  )}
              </div>
            </div>
          )}
        </Modal>

        {/* Rejection Confirmation Modal */}
        {isAdmin && (
          <Modal
            open={rejectionModalOpen}
            closeModal={closeRejectionModal}
            title="Reject Unblock Request"
            width="w-[500px]"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to reject this banner request?
                </p>
                <Input
                  isTextarea={true}
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  label="Cancel"
                  variant="outline"
                  onClick={closeRejectionModal}
                />
                <Button
                  label="Reject Request"
                  onClick={confirmRejection}
                  disabled={!rejectionNote.trim()}
                />
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          closeModal={closeDeleteModal}
          title="Delete Promotion Request"
          width="w-[500px]"
        >
          <div className="space-y-4">
            <div>
              {pendingDeletePromotion && (
                <div className="bg-gray-50 py-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Business:</strong>{" "}
                    {pendingDeletePromotion?.User?.Business?.business_name ||
                      "N/A"}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this promotion request? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                label="Cancel"
                variant="outline"
                onClick={closeDeleteModal}
              />
              <Button
                label="Delete Request"
                variant="primary"
                onClick={confirmDelete}
              />
            </div>
          </div>
        </Modal>

        {/* Add Promotion Modal */}

        <AddPromotionModal
          open={addPromotionModalOpen}
          closeModal={() => setAddPromotionModalOpen(false)}
          onSuccess={handleAddPromotionSuccess}
          isAdmin={isAdmin}
        />

        {/* Image Preview Modal */}
        <Modal
          title={selectedImageForModal?.name || "Promotion Image"}
          open={imageModalOpen}
          closeModal={closeImageModal}
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
      </div>
    </div>
  );
};

export default PromotionPage;
