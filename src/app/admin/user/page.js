"use client";

import Input from "@/components/input";
import SectionHeader from "@/components/sectionHeader";
import Table from "@/components/table";
import useDebounce from "@/hooks/useDebounce";
import { deleteResponse, getResponse } from "@/lib/response";
import { constructQueryParams } from "@/utils/constructQueryParams";
import ConfirmationModal from "@/components/confirmationModal";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import StatusChip from "@/components/statusChip";
import ActionButton from "@/components/actionButton";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
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
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
  });

  // Debounced search value
  const debouncedSearch = useDebounce(filters.search, 500);

  // Handle delete user
  const handleDeleteUser = (user) => {
    setDeleteModal({
      isOpen: true,
      user: user,
    });
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return;

    try {

      const queryString = constructQueryParams({ id: deleteModal.user.UserRoles?.[0]?.id });
      await deleteResponse({
        apiEndPoint: `/user/delete-user`,
        queryString,
      });

      if (response.successType) {
        setDeleteModal({
          isOpen: false,
          user: null,
        });
        await fetchUsers()
      }

    } catch (error) {
      console.error("Error deleting user:", error);
      // Handle error (show toast notification, etc.)
    }
  };

  // Cancel delete
  const cancelDeleteUser = () => {
    setDeleteModal({
      isOpen: false,
      user: null,
    });
  };

  // Define table columns
  const columns = [
    {
      key: "first_name",
      header: "First Name",
      render: (row) => row?.first_name || "-",
    },
    {
      key: "last_name",
      header: "Last Name",
      render: (row) => row?.last_name || "-",
    },
    {
      key: "email",
      header: "Email",
      render: (row) => row?.email || "-",
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
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton
            title="Delete"
            variant="danger"
            icon={<Trash2 size={18} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row);
            }}
          />
        </div>
      ),
    },
  ];

  // Fetch users
  const fetchUsers = async (
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

      const queryString = constructQueryParams(params);
      const response = await getResponse({
        apiEndPoint: `admin/user`,
        queryString,
      });

      if (response.successType) {
        const { users, pagination: paginationData } = response.response.data;

        setUsers(users || []);

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
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, pagination.limit);
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  return (
    <div className="p-4">
      <SectionHeader title="User Management" mainHeader />

      {/* Filters Section */}
      <div className="mt-6 mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Input
            label="Search"
            placeholder="Search by name, email..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          isPagination={true}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.isOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteModal.user?.first_name} ${deleteModal.user?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={cancelDeleteUser}
      />
    </div>
  );
};

export default AdminUserPage;