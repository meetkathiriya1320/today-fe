"use client";

import Input from "@/components/input";
import SectionHeader from "@/components/sectionHeader";
import StatusChip from "@/components/statusChip";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import { getResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import { CreditCard, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

const AdminPaymentPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
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
    });

    // Debounced search value
    const debouncedSearch = useDebounce(filters.search, 500);

    // Define table columns
    const columns = [
        {
            key: "business_name",
            header: "Business Name",
            render: (row) => row?.AdvertiseBanner?.AdvertiseRequest?.User?.Business?.business_name || "-",
        },
        {
            key: "amount",
            header: "Amount",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row?.amount ? `₹${row.amount}` : "-"}</span>
                </div>
            ),
        },
        {
            key: "payment_method",
            header: "Payment Method",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="capitalize">
                        {row?.payment_method?.replace("_", " ") || "-"}
                    </span>
                </div>
            ),
        },
        {
            key: "transaction_id",
            header: "Transaction ID",
            render: (row) => row?.transaction_id || "-",
        },
        {
            key: "check_number",
            header: "Check Number",
            render: (row) => row?.check_number || "-",
        },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <StatusChip
                    status={
                        row?.status === "completed"
                            ? "approved"
                            : row?.status === "pending"
                                ? "pending"
                                : row?.status === "failed"
                                    ? "rejected"
                                    : "pending"
                    }
                />
            ),
        },
        {
            key: "created_at",
            header: "Payment Date",
            render: (row) =>
                row?.created_at
                    ? new Date(row.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "-",
        },
    ];

    // Fetch payments
    const fetchPayments = async (
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

            const queryString = constructQueryParams(params);
            const response = await getResponse({
                apiEndPoint: `admin/payments`,
                queryString,
            });

            if (response.successType) {
                const { data, pagination: paginationData } = response.response.data;

                setPayments(data || []);

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
            console.error("Error fetching payments:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        fetchPayments(newPage, pagination.limit);
    };

    useEffect(() => {
        fetchPayments();
    }, [debouncedSearch, filters.status]);

    return (
        <div className="p-4">
            <SectionHeader title="Payment Management" mainHeader />

            {/* Filters Section */}
            <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                    <Input
                        label="Search"
                        placeholder="Search by business name, transaction ID..."
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
                                    filters.status === "completed"
                                        ? "Completed"
                                        : filters.status === "pending"
                                            ? "Pending"
                                            : filters.status === "failed"
                                                ? "Failed"
                                                : "All",
                            }
                            : null,
                        onChange: (option) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: option ? option.value : "",
                            })),
                        options: [
                            { value: "pending", label: "Pending" },
                            { value: "completed", label: "Completed" },
                            { value: "failed", label: "Failed" },
                        ],
                        isClearable: true,
                    }}
                />
            </div>

            {/* Payments Table */}
            <div className="mt-6">
                <Table
                    columns={columns}
                    data={payments}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isPagination={true}
                />
            </div>
        </div>
    );
};

export default AdminPaymentPage;