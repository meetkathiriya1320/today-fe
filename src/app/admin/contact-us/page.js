"use client";

import React from "react";
import { useEffect, useState } from "react";
import SectionHeader from "@/components/sectionHeader";
import Table from "@/components/table";
import Tooltip from "@/components/tooltip";
import { getResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";

const AdminContactUsPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Define table columns
    const columns = [
        {
            key: "first_name",
            header: "Name",
            render: (res) => {
                return `${res.first_name} ${res.last_name}`
            }
        },
        {
            key: "email",
            header: "Email",
        },
        {
            key: "iso_code",
            header: "ISO Code",
            render: (row) => row?.iso_code || "-",
        },
        {
            key: "phone_number",
            header: "Phone Number",
            render: (row) => row?.country_code ? `+${row.country_code} ${row.phone_number.slice(row.country_code.length)}` : row.phone_number,
        },
        {
            key: "note",
            header: "Message",
            maxWidth: "400px",
            render: (row) => {
                const message = row?.note || "-";
                const isLongMessage = message.length > 20;

                if (isLongMessage) {
                    // Show first part in table, full message in tooltip
                    const previewText = message.substring(0, 20) + "...";
                    return (
                        <Tooltip content={message} position="top">
                            <div className="max-w-[400px] cursor-help">
                                <div className="text-sm leading-relaxed">
                                    {previewText}
                                </div>

                            </div>
                        </Tooltip>
                    );
                }

                // For shorter messages, show full content with normal text size
                return (
                    <Tooltip content={message} position="top">
                        <div className="cursor-help max-w-[200px]">
                            <div className="text-sm leading-relaxed break-words">
                                {message}
                            </div>
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            key: "created_at",
            header: "Date",
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

    // Fetch contacts
    const fetchContacts = async (
        page = pagination.page,
        limit = pagination.limit
    ) => {
        try {
            setLoading(true);

            const params = { page, limit };
            const queryString = constructQueryParams(params);
            const response = await getResponse({
                apiEndPoint: `settings/contact`,
                queryString,
            });

            if (response.successType) {
                const { data: contacts, pagination: paginationData } = response.response.data;

                setContacts(contacts || []);

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
            console.error("Error fetching contacts:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        fetchContacts(newPage, pagination.limit);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    return (
        <div className="p-4">
            <SectionHeader title="Contact Us" mainHeader />

            {/* Contacts Table */}
            <div className="mt-6">
                <Table
                    columns={columns}
                    data={contacts}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isPagination={true}
                />
            </div>
        </div>
    );
};

export default AdminContactUsPage;