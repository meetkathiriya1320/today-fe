"use client";

import SectionHeader from "@/components/sectionHeader";
import Table from "@/components/table";
import Button from "@/components/button";
import Modal from "@/components/modal";
import Input from "@/components/input";
import ConfirmationModal from "@/components/confirmationModal";
import ActionButton from "@/components/actionButton";
import { getResponse, putResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { Shield, ShieldX } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import useSocket from "@/hooks/useSocket";

const AdminOfferReportedPage = () => {
    const socket = useSocket()
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [blockReason, setBlockReason] = useState("");
    const [isBlocking, setIsBlocking] = useState(true); // true for block, false for unblock
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Search state
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    // Filter state
    const [filters, setFilters] = useState({
        branch: "",
        business: "",
    });

    // Available options for filters (from API)
    const [availableBranches, setAvailableBranches] = useState([]);
    const [availableBusinesses, setAvailableBusinesses] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingBusinesses, setLoadingBusinesses] = useState(false);

    // Define table columns
    const columns = [
        {
            key: "",
            header: "Offer title",
            render: (row) => row?.Offer?.offer_title || "-",
        },
        {
            key: "",
            header: "Branch",
            render: (row) => row?.Offer?.Branch.branch_name || "-",
        },
        {
            key: "",
            header: "Business",
            render: (row) => row?.Offer?.Branch?.Business?.business_name || "-",
        },
        {
            key: "user_name",
            header: "Reported By",
            render: (row) => {
                const user = row?.User;
                if (user?.Roles?.[0]?.UserRole) {
                    const { first_name, last_name } = user.Roles[0].UserRole;
                    return `${first_name} ${last_name}`.trim() || "-";
                }
                return "-";
            },
        },
        {
            key: "user_email",
            header: "Reported User Email",
            render: (row) => row?.User?.email || "-",
        },
        {
            key: "note",
            header: "Report Note",
            render: (row) => (
                <div className="max-w-xs truncate" title={row?.note}>
                    {row?.note || "-"}
                </div>
            ),
        },
        {
            key: "created_at",
            header: "Reported At",
            render: (row) =>
                row?.created_at
                    ? new Date(row.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "-",
        },
        {
            key: "is_blocked",
            header: "Blocked",
            render: (row) => (
                <div className="flex items-center justify-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${row?.Offer?.is_blocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {row?.Offer?.is_blocked ? 'Blocked' : 'Not Blocked'}
                    </span>
                </div>
            ),
        },
        {
            header: "Action",
            key: "action",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <ActionButton
                        title={row?.Offer?.is_blocked ? "Unblock" : "Block"}
                        variant={row?.Offer?.is_blocked ? "success" : "warning"}
                        icon={row?.Offer?.is_blocked ? <ShieldX size={16} /> : <Shield size={16} />}
                        onClick={() => {
                            console.log('Button clicked for row:', row);
                            console.log('Offer is_blocked status:', row?.Offer?.is_blocked);
                            openBlockModal(row);
                        }}
                    />
                </div>
            ),
        },
    ];

    // Fetch reported offers
    const fetchReports = async (
        page = pagination.page,
        limit = pagination.limit
    ) => {
        try {
            setLoading(true);

            const params = { page, limit };

            // Add search parameter if present
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            // Add branch filter if present
            if (filters.branch) {
                params.branch_name = filters.branch;
            }

            // Add business filter if present
            if (filters.business) {
                params.business_name = filters.business;
            }

            const queryString = constructQueryParams(params);
            const response = await getResponse({
                apiEndPoint: `/offer-report/get`,
                queryString,
            });

            if (response.successType) {
                const { data, pagination: paginationData } = response.response.data;

                console.log('Reports data received:', data);
                setReports(data || []);

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
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        fetchReports(newPage, pagination.limit);
    };

    // Fetch dropdown options
    const fetchDropdownOptions = async () => {
        try {
            setLoadingBranches(true);
            setLoadingBusinesses(true);

            // Fetch branches
            const branchParams = constructQueryParams({ type: "branch" });
            const branchResponse = await getResponse({
                apiEndPoint: `/offer-report/dropdown`,
                queryString: branchParams,
            });
            if (branchResponse.successType) {
                const branches = branchResponse.response.data || [];
                setAvailableBranches(branches);
            }

            // Fetch businesses
            const businessParams = constructQueryParams({ type: "business" });
            const businessResponse = await getResponse({
                apiEndPoint: `/offer-report/dropdown`,
                queryString: businessParams,
            });

            if (businessResponse.successType) {
                const businesses = businessResponse.response.data || [];
                setAvailableBusinesses(businesses);
            }
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
        } finally {
            setLoadingBranches(false);
            setLoadingBusinesses(false);
        }
    };

    // Open block/unblock modal
    const openBlockModal = (report) => {
        console.log('Report data:', report);
        console.log('Offer ID:', report?.Offer?.id);
        setSelectedOffer(report);
        setIsBlocking(!report?.Offer?.is_blocked); // If currently blocked, we're unblocking; if not blocked, we're blocking
        setBlockReason("");
        setBlockModalOpen(true);
    };

    // Handle block/unblock offer
    const handleBlockUnblockOffer = async () => {
        try {
            let payload = {
                blocked: isBlocking,
            };

            // Only add block_reason when blocking and reason is provided
            if (isBlocking && blockReason.trim()) {
                payload.block_reason = blockReason.trim();
            }

            console.log('Payload being sent:', payload);
            console.log('isBlocking value:', isBlocking);
            console.log('Current offer blocked status:', selectedOffer?.Offer?.is_blocked);

            const response = await putResponse({
                apiEndPoint: `/offers/block/${selectedOffer?.offer_id || selectedOffer?.Offer?.id}`,
                payload,
            });

            if (response.successType) {

                const notificationData = response.response.data.notifications;
                if (notificationData.data.length > 0) {
                    socket.emit("send-notification-to-business-owner", {
                        ...notificationData
                    });
                }
                setBlockModalOpen(false);
                setSelectedOffer(null);
                setBlockReason("");
                fetchReports(pagination.page, pagination.limit);
            }
        } catch (err) {
            console.error(`Error ${isBlocking ? 'blocking' : 'unblocking'} offer:`, err);
        }
    };

    useEffect(() => {
        fetchReports();
        fetchDropdownOptions();
    }, [debouncedSearch, filters.branch, filters.business]);

    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    return (
        <div className="p-4">
            <SectionHeader title="Offer Reports" mainHeader />

            {/* Filters Section */}
            <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="md:col-span-1">
                    <Input
                        label="Search"
                        placeholder="Search by offer title, business name, branch..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Branch Filter */}
                <div className="md:col-span-1">
                    <Input
                        isSelect
                        label="Branch"
                        placeholder="All Branches"
                        selectProps={{
                            value: filters.branch
                                ? {
                                    value: filters.branch,
                                    label: filters.branch,
                                }
                                : null,
                            onChange: (option) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    branch: option ? option.value : "",
                                })),
                            options: availableBranches.map(branch => ({
                                value: branch,
                                label: branch,
                            })),
                            isClearable: true,
                        }}
                    />
                </div>

                {/* Business Filter */}
                <div className="md:col-span-1">
                    <Input
                        isSelect
                        label="Business"
                        placeholder="All Businesses"
                        selectProps={{
                            value: filters.business
                                ? {
                                    value: filters.business,
                                    label: filters.business,
                                }
                                : null,
                            onChange: (option) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    business: option ? option.value : "",
                                })),
                            options: availableBusinesses.map(business => ({
                                value: business,
                                label: business,
                            })),
                            isClearable: true,
                        }}
                    />
                </div>
            </div>

            {/* Reports Table */}
            <div className="mt-6">
                <Table
                    columns={columns}
                    data={reports}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isPagination={true}
                />
            </div>

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
                                ? `Are you sure you want to block the offer "${selectedOffer?.Offer?.offer_title || ""}" from "${selectedOffer?.Offer?.Branch?.Business?.business_name || ""}"?`
                                : `Are you sure you want to unblock the offer "${selectedOffer?.Offer?.offer_title || ""}" from "${selectedOffer?.Offer?.Branch?.Business?.business_name || ""}"?`
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
    );
};

export default AdminOfferReportedPage;