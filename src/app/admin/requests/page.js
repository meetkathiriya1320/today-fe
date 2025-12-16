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
import { getResponse, putResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { CheckCircle, CircleX } from "lucide-react";
import { useEffect, useState } from "react";

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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
      key: "first_name",
      header: "First Name",
      render: (row) => row?.User?.UserRoles?.[0]?.first_name,
    },
    {
      key: "last_name",
      header: "Last Name",
      render: (row) => row?.User?.UserRoles?.[0]?.last_name,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row?.User?.email || "-",
    },
    {
      key: "note",
      header: "Request Note",
      maxWidth: "250px",
    },
    {
      key: "decline_reason",
      header: "Decline Reason",
      maxWidth: "250px",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusChip
          status={
            row?.status === "pending"
              ? "pending"
              : row?.status === "rejected"
                ? "rejected"
                : "approved"
          }
        />
      ),
    },
    {
      key: "created_at",
      header: "Request Date",
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
      render: (row) => (
        <div className="flex items-center gap-3">
          {row?.status === "pending" && (
            <>
              <ActionButton
                title="Approve"
                variant="success"
                icon={<CheckCircle size={18} />}
                onClick={() => openApproveModal(row)}
              />
              <ActionButton
                title="Reject"
                variant="danger"
                icon={<CircleX size={18} />}
                onClick={() => openRejectModal(row)}
              />
            </>
          )}
          {row?.status !== "pending" && (
            <span className="text-sm text-gray-500">No action available</span>
          )}
        </div>
      ),
    },
  ];

  // Fetch unblock requests
  const fetchRequests = async (
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
        apiEndPoint: `admin/get-blocked-business-owner-request-listing`,
        queryString,
      });

      if (response.successType) {
        const { requests, pagination: paginationData } = response.response.data;

        setRequests(requests || []);

        if (paginationData) {
          setPagination({
            page: paginationData.page || 1,
            limit: paginationData.limit || 10,
            total: paginationData.total || 0,
            totalPages: paginationData.totalPages || 0,
          });
        }

      }
    } catch (err) {
      console.error("Error fetching unblock requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchRequests(newPage, pagination.limit);
  };

  // Open approve modal
  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  // Open reject modal
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Handle approve request
  const handleApproveRequest = async () => {
    try {
      const response = await putResponse({
        apiEndPoint: `admin/approve-decline-block-request`,
        payload: {
          request_id: selectedRequest?.id,
          action: "approve",
        },
      });

      if (response.successType) {
        setApproveModalOpen(false);
        setSelectedRequest(null);
        fetchRequests(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  // Handle reject request
  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      const response = await putResponse({
        apiEndPoint: `admin/approve-decline-block-request`,
        payload: {
          request_id: selectedRequest?.id,
          action: "decline",
          reason: rejectReason.trim(),
        },
      });

      if (response.successType) {
        setRejectModalOpen(false);
        setSelectedRequest(null);
        setRejectReason("");
        fetchRequests(pagination.page, pagination.limit);
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [debouncedSearch, filters.status, filters.dateRange]);

  return (
    <div className="p-4">
      <SectionHeader title="Unblock Requests" mainHeader />

      {/* Filters Section */}
      <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            placeholder="Search by name, email, request note, decline reason..."
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
          label="Request Date"
          placeholder="Select date range"
          value={filters.dateRange}
          onChange={(range) =>
            setFilters((prev) => ({ ...prev, dateRange: range }))
          }
        />
      </div>

      {/* Requests Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          isPagination={true}
        />

        {/* Approve Confirmation Modal */}
        <ConfirmationModal
          open={approveModalOpen}
          onCancel={() => setApproveModalOpen(false)}
          title="Approve Unblock Request"
          message={`Are you sure you want to approve the unblock request from "${selectedRequest?.User?.first_name || ""
            } ${selectedRequest?.User?.last_name || ""
            }"? This will unblock the user and allow them to access the system.`}
          confirmButtonLabel="Approve"
          confirmButtonVariant="primary"
          onConfirm={handleApproveRequest}
        />

        {/* Reject Confirmation Modal */}
        <Modal
          open={rejectModalOpen}
          closeModal={() => {
            setRejectModalOpen(false);
            setRejectReason("");
          }}
          title="Reject Unblock Request"
          width="w-[500px]"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting the unblock request from "
                {selectedRequest?.User?.first_name || ""}{" "}
                {selectedRequest?.User?.last_name || ""}":
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
                label="Reject Request"
                onClick={handleRejectRequest}
                disabled={!rejectReason.trim()}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
