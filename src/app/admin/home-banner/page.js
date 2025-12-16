"use client";

import ActionButton from "@/components/actionButton";
import AdvertiseRequestModal from "@/components/admin/AdvertiseRequestModal";
import BannerModal from "@/components/admin/BannerModal";
import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import MultiDatePicker from "@/components/multiDatePicker";
import useDebounce from "@/hooks/useDebounce";
import { constructQueryParams } from "@/utils/constructQueryParams";
import {
  deleteResponse,
  getResponse,
  postResponse,
  putResponse,
} from "@/lib/response";
import { CheckCircle, CircleX, Edit, Trash, Play, Pause, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSocket from "@/hooks/useSocket";

const AdminHomeBannerPage = () => {
  const socket = useSocket()
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("admin");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Today's banner states
  const [todayBanners, setTodayBanners] = useState([]);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayPagination, setTodayPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Delete banner states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  // Shop tab states
  const [advertiseRequests, setAdvertiseRequests] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);
  const [editingAdvertiseRequest, setEditingAdvertiseRequest] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const [shopPagination, setShopPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateRange: [],
  });

  // Debounced search value
  const debouncedSearch = useDebounce(filters.search, 500);

  // Approve/Reject states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAdvertiseRequest, setSelectedAdvertiseRequest] =
    useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await getResponse({
        apiEndPoint: "home-banners",
        navigate: router,
      });
      if (response.successType) {
        setBanners(response.response.data || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's banners with pagination
  const fetchTodayBanners = async (
    page = todayPagination.page,
    limit = todayPagination.limit
  ) => {
    setTodayLoading(true);
    try {
      // Build query params with pagination
      const params = { page, limit };
      const queryString = constructQueryParams(params);

      const response = await getResponse({
        apiEndPoint: "/advertise-requests/all-todays-banners",
        queryString,
        navigate: router,
      });

      if (response.successType) {
        const { banners, pagination } = response.response.data;
        setTodayBanners(banners || []);

        if (pagination) {
          setTodayPagination({
            page: pagination.page || page,
            limit: pagination.limit || limit,
            total: pagination.total || 0,
            totalPages: pagination.total_pages || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching today's banners:", error);
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchBanners();
    } else if (activeTab === "shop") {
      handleShopTabClick();
    } else if (activeTab === "today") {
      fetchTodayBanners();
    }
  }, [activeTab]);

  // Trigger advertise requests fetching when filters change (for shop tab)
  useEffect(() => {
    if (activeTab === "shop") {
      // Reset to first page when filters change
      setShopPagination((prev) => ({ ...prev, page: 1 }));
      fetchAdvertiseRequests(1, shopPagination.limit);
    }
  }, [debouncedSearch, filters.status, filters.dateRange, activeTab]);

  // Handle form submission (create/update)
  const handleSubmit = async (formData, { setSubmitting }) => {
    setSubmitting(true);

    try {
      let response;
      if (editingBanner) {
        // Update existing banner
        response = await putResponse({
          apiEndPoint: `home-banners/${editingBanner.id}`,
          payload: formData,
          type: "form-data",
          navigate: router,
        });
      } else {
        // Create new banner
        response = await postResponse({
          apiEndPoint: "home-banners",
          payload: formData,
          type: "form-data",
          navigate: router,
        });
      }

      if (response.successType) {
        setShowModal(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (banner) => {
    setBannerToDelete(banner);
    setDeleteModalOpen(true);
  };

  // Handle banner deletion
  const handleDeleteBanner = async () => {
    try {
      const response = await deleteResponse({
        apiEndPoint: `home-banners/${bannerToDelete?.id}`,
        navigate: router,
      });
      if (response.successType) {
        setDeleteModalOpen(false);
        setBannerToDelete(null);
        fetchBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
  };

  // Open image in modal
  const openImageModal = (imageSrc, imageName) => {
    setSelectedImageForModal({ src: imageSrc, name: imageName });
    setImageModalOpen(true);
  };

  // Advertise request modal functions
  const openAdvertiseModal = () => {
    setEditingAdvertiseRequest(null);
    setShowAdvertiseModal(true);
  };

  const openEditAdvertiseModal = (request) => {
    setEditingAdvertiseRequest(request);
    setShowAdvertiseModal(true);
  };

  const closeAdvertiseModal = () => {
    setShowAdvertiseModal(false);
    setEditingAdvertiseRequest(null);
  };

  // Approve/Reject functions
  const openApproveModal = (request) => {
    setSelectedAdvertiseRequest(request);
    setApproveModalOpen(true);
  };

  const openRejectModal = (request) => {
    setSelectedAdvertiseRequest(request);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleApproveAdvertiseRequest = async () => {
    try {
      const response = await putResponse({
        apiEndPoint: `advertise-requests/${selectedAdvertiseRequest?.id}/banner-status`,
        payload: {
          status: "approved",
        },
      });

      console.log(response.response.data.notifications, "RESSSS")
      if (response.successType) {
        if (response.response.data.notifications?.data?.length > 0) {

          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications
          });
        }
        setApproveModalOpen(false);
        setSelectedAdvertiseRequest(null);
        fetchAdvertiseRequests();
      }
    } catch (err) {
      console.error("Error approving advertise request:", err);
    }
  };

  const handleRejectAdvertiseRequest = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      const response = await putResponse({
        apiEndPoint: `advertise-requests/${selectedAdvertiseRequest?.id}/banner-status`,
        payload: {
          status: "rejected",
          reason: rejectReason.trim(),
        },
      });

      if (response.successType) {
        if (response.response.data.notifications?.data?.length > 0) {
          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications
          });
        }
        setRejectModalOpen(false);
        setSelectedAdvertiseRequest(null);
        setRejectReason("");
        fetchAdvertiseRequests();
      }
    } catch (err) {
      console.error("Error rejecting advertise request:", err);
    }
  };

  // Handle advertise request submission
  const handleAdvertiseSubmit = async (formData, { setSubmitting }) => {
    setSubmitting(true);

    try {
      let response;
      if (editingAdvertiseRequest) {
        // Update existing request
        response = await putResponse({
          apiEndPoint: `advertise-requests/${editingAdvertiseRequest.id}`,
          payload: formData,
          type: "form-data",
          navigate: router,
        });
      } else {
        // Create new request
        response = await postResponse({
          apiEndPoint: "advertise-requests/create",
          payload: formData,
          type: "form-data",
          navigate: router,
        });
      }

      if (response.successType) {
        closeAdvertiseModal();
        fetchAdvertiseRequests();
      }
    } catch (error) {
      console.error("Error submitting advertise request:", error);
    } finally {
      setSubmitting(false);
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

  // Render payment details in expanded row
  const renderPaymentDetails = (advertiseRequest) => {
    const payments = advertiseRequest?.AdvertiseBanner?.Payments || [];

    if (payments.length === 0) {
      return (
        <div className="text-sm text-gray-500 text-center py-4">
          No payment details found for this request.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment, index) => (
            <div
              key={payment.id || index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="space-y-3">
                <h5 className="font-medium text-sm text-gray-900">
                  Payment #{payment.id || index + 1}
                </h5>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium w-20">Method:</span>
                    <span className="capitalize">
                      {payment.payment_method || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Transaction:</span>
                    <span className="font-mono text-xs">
                      {payment.transaction_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Date:</span>
                    <span>
                      {payment.date
                        ? new Date(payment.date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Status:</span>
                    <StatusChip
                      status={payment.status || "pending"}
                      size="xs"
                    />
                  </div>
                  {payment.check_number && (
                    <div className="flex items-center">
                      <span className="font-medium w-20">Check #:</span>
                      <span>{payment.check_number}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="font-medium w-20">Created:</span>
                    <span>
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Handle shop tab click - call GET API only
  const handleShopTabClick = async () => {
    setShopLoading(true);
    try {
      // Only fetch existing advertise requests when tab is clicked
      await fetchAdvertiseRequests();
    } catch (error) {
      console.error("Error handling shop tab click:", error);
    } finally {
      setShopLoading(false);
    }
  };

  // Fetch advertise requests with pagination and filters
  const fetchAdvertiseRequests = async (
    page = shopPagination.page,
    limit = shopPagination.limit
  ) => {
    try {
      setShopLoading(true);

      // Build query params with pagination and filters
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
        apiEndPoint: "advertise-requests",
        queryString,
        navigate: router,
      });

      if (response.successType) {
        const { data, pagination } = response.response.data;

        setAdvertiseRequests(data || []);

        if (pagination) {
          setShopPagination({
            page: pagination.currentPage || page,
            limit: pagination.itemsPerPage || limit,
            total: pagination.totalItems || 0,
            totalPages: pagination.totalPages || 0,
          });
        }
      }
      return response;
    } catch (error) {
      console.error("Error fetching advertise requests:", error);
      throw error;
    } finally {
      setShopLoading(false);
    }
  };

  // Handle page change for shop tab
  const handleShopPageChange = (newPage) => {
    // Store current pagination state before update
    const currentPagination = { ...shopPagination };


    // Update pagination state
    setShopPagination((prev) => ({ ...prev, page: newPage }));

    // Call fetch with explicit parameters from current state
    fetchAdvertiseRequests(newPage, currentPagination.limit);
  };

  // Handle page change for today's banner tab
  const handleTodayPageChange = (newPage) => {
    // Store current pagination state before update
    const currentPagination = { ...todayPagination };

    // Update pagination state
    setTodayPagination((prev) => ({ ...prev, page: newPage }));

    // Call fetch with explicit parameters from current state
    fetchTodayBanners(newPage, currentPagination.limit);
  };

  // Table columns for banners
  const bannerColumns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row.image_url || row.image}
          alt="Banner"
          className="w-16 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openImageModal(row.image_url || row.image, "Banner Image")}
          title="Click to view larger image"
        />
      ),
      maxWidth: "100px",
    },
    {
      key: "redirect_url",
      header: "Redirect URL",
      render: (row) => (
        <a
          href={row.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline max-w-[200px] block truncate"
        >
          {row.redirect_url}
        </a>
      ),
      maxWidth: "250px",
    },
    {
      key: "created_at",
      header: "Created",
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
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
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
        </div>
      ),
      maxWidth: "120px",
    },
  ];

  // Handle start banner
  const handleStartBanner = async (banner) => {
    try {
      const response = await putResponse({
        apiEndPoint: `advertise-requests/${banner.id}/banner-status`,
        payload: {
          is_active: true,
        },
      });

      if (response.successType) {
        if (response.response.data.notifications?.data?.length > 0) {
          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications
          });
        }
        fetchTodayBanners(); // Refresh the data
      }
    } catch (err) {
      console.error("Error starting banner:", err);
    }
  };

  // Handle pause banner
  const handlePauseBanner = async (banner) => {
    try {
      const response = await putResponse({
        apiEndPoint: `advertise-requests/${banner.id}/banner-status`,
        payload: {
          is_active: false,
        },
      });

      if (response.successType) {
        if (response.response.data.notifications?.data?.length > 0) {
          socket.emit("send-notification-to-business-owner", {
            ...response.response?.data?.notifications
          });
        }
        fetchTodayBanners(); // Refresh the data
      }
    } catch (err) {
      console.error("Error pausing banner:", err);
    }
  };

  // Table columns for today's banners
  const todayBannerColumns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row.image_url || row.image}
          alt="Banner"
          className="w-16 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openImageModal(row.image_url || row.image, "Banner Image")}
          title="Click to view larger image"
        />
      ),
      maxWidth: "100px",
    },
    {
      key: "type",
      header: "Business",
      render: (row) => row.User.Business.business_name,
    },
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
      key: "created_at",
      header: "Created",
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
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex gap-2">
          {!row.AdvertiseBanner.is_active ? <ActionButton
            title="Start Banner"
            variant="success"
            icon={<Play size={18} />}
            onClick={() => handleStartBanner(row)}
          /> :
            <ActionButton
              title="Pause Banner"
              variant="warning"
              icon={<Pause size={18} />}
              onClick={() => handlePauseBanner(row)}
            />}
        </div>
      ),
      maxWidth: "120px",
    },
  ];

  // Table columns for advertise requests
  const advertiseColumns = [
    {
      key: "first_name",
      header: "First Name",
      render: (row) => row.User.first_name || "-",
    },
    {
      key: "last_name",
      header: "Last Name",
      render: (row) => row.User.last_name || "-",
    },
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
      key: "dates",
      header: "Duration",
      render: (row) => (
        <div className="text-sm">
          <div>
            From:{" "}
            {row.start_date
              ? new Date(row.start_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "-"}
          </div>
          <div>
            To:{" "}
            {row.end_date
              ? new Date(row.end_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "business",
      header: "Business",
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium">
            {row.User?.Business?.business_name || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {row.User?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusChip status={row?.AdvertiseBanner?.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <ActionButton
            title="Approve"
            variant="success"
            disabled={row?.AdvertiseBanner?.status === "approved"}
            icon={<CheckCircle size={18} />}
            onClick={() => openApproveModal(row)}
          />
          <ActionButton
            title="Reject"
            disabled={row?.AdvertiseBanner?.status === "rejected"}
            variant="danger"
            icon={<CircleX size={18} />}
            onClick={() => openRejectModal(row)}
          />
        </div>
      ),
      maxWidth: "150px",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <SectionHeader title="Home page banner" />

        {/* Tabs */}
        <div className="border-b border-gray-200 flex items-center justify-between pb-2 mt-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "admin"
                ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Admin
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "shop"
                ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "today"
                ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Today's Banner
            </button>
          </nav>
          {activeTab === "admin" ? (
            <Button
              label="Add Banner"
              onClick={openAddModal}
              variant="primary"
            />
          ) : activeTab === "shop" ? (
            <Button
              label="Add Request"
              onClick={openAdvertiseModal}
              variant="primary"
            />
          ) : null}
        </div>
      </div>

      {/* Admin Tab Content */}
      {activeTab === "admin" && (
        <div>
          <Table
            columns={bannerColumns}
            data={banners}
            loading={loading}
            isPagination={false}
          />
        </div>
      )}

      {/* Shop Tab Content */}
      {activeTab === "shop" && (
        <div>
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

          <Table
            columns={advertiseColumns}
            data={advertiseRequests}
            loading={shopLoading}
            pagination={shopPagination}
            onPageChange={handleShopPageChange}
            isPagination={true}
            expandable={true}
            expandedRows={expandedRows}
            onToggleExpand={handleToggleExpand}
            expandRenderer={renderPaymentDetails}
          />
        </div>
      )}

      {/* Today's Banner Tab Content */}
      {activeTab === "today" && (
        <div>
          <Table
            columns={todayBannerColumns}
            data={todayBanners}
            loading={todayLoading}
            pagination={todayPagination}
            onPageChange={handleTodayPageChange}
            isPagination={true}
          />
        </div>
      )}

      {/* Banner Modal */}
      <BannerModal
        open={showModal}
        closeModal={closeModal}
        banner={editingBanner}
        onSubmit={handleSubmit}
      />

      {/* Advertise Request Modal */}
      <AdvertiseRequestModal
        open={showAdvertiseModal}
        closeModal={closeAdvertiseModal}
        advertiseRequest={editingAdvertiseRequest}
        onSubmit={handleAdvertiseSubmit}
        loading={shopLoading}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        open={approveModalOpen}
        onCancel={() => setApproveModalOpen(false)}
        title="Approve Advertise Request"
        message={`Are you sure you want to approve the advertise request from "${selectedAdvertiseRequest?.User?.Business?.business_name || ""
          }"?`}
        confirmButtonLabel="Approve"
        confirmButtonVariant="primary"
        onConfirm={handleApproveAdvertiseRequest}
      />

      {/* Reject Modal */}
      <Modal
        open={rejectModalOpen}
        closeModal={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        title="Reject Advertise Request"
        width="w-[500px]"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting the advertise request from "
              {selectedAdvertiseRequest?.User?.Business?.business_name || ""}":
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
              onClick={handleRejectAdvertiseRequest}
              disabled={!rejectReason.trim()}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Banner Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        title="Delete Banner"
        message={`Are you sure you want to delete this banner? This action cannot be undone.`}
        confirmButtonLabel="Delete"
        confirmButtonVariant="danger"
        onConfirm={handleDeleteBanner}
      />

      {/* Image Preview Modal */}
      <Modal
        title={selectedImageForModal?.name || "Banner Image"}
        open={imageModalOpen}
        closeModal={() => {
          setImageModalOpen(false);
          setSelectedImageForModal(null);
        }}
        width="w-[700px]"
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
  );
};

export default AdminHomeBannerPage;
