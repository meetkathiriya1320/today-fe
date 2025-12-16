"use client";

import ActionButton from "@/components/actionButton";
import Button from "@/components/button";
import ConfirmationModal from "@/components/confirmationModal";
import Input from "@/components/input";
import Modal from "@/components/modal";
import ProfileImageUploader from "@/components/profileImageUploader";
import SectionHeader from "@/components/sectionHeader";
import Table from "@/components/table";
import {
  deleteResponse,
  getResponse,
  postResponse,
  putResponse,
} from "@/lib/response";
import { Field, Form, Formik } from "formik";
import { Edit, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Preview image
  const [selectedImage, setSelectedImage] = useState(null);

  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Category name is required"),
    image: Yup.mixed().required("Image is required"),
  });

  // Handle form submission (create or update)
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.image) {
        formData.append("image", values.image);
      }

      let response;
      if (isEditMode && editingCategory) {
        // Update existing category
        response = await putResponse({
          apiEndPoint: `categories/${editingCategory.id}`,
          payload: formData,
          type: "form-data",
        });
      } else {
        // Create new category
        response = await postResponse({
          apiEndPoint: "categories",
          payload: formData,
          type: "form-data",
        });
      }

      if (response.successType) {
        closeModal();
        fetchCategories();
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal with category data
  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsEditMode(true);
    setIsModalOpen(true);

    // Pre-fill form values
    setSelectedImage(category.image);
    // Note: Formik initial values will be set in the modal component
  };

  // Close and reset modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setIsEditMode(false);
    setSelectedImage(null);
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await deleteResponse({
        apiEndPoint: `categories/${categoryId}`,
      });

      if (response.successType) {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      }
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
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

  // Define table columns
  const columns = [
    {
      key: "image",
      header: "Image",
      render: (row) => (
        <img
          src={row?.image}
          alt={row.name}
          className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openImageModal(row?.image, row.name)}
          title="Click to view larger image"
        />
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => row.name,
    },
    {
      header: "Action",
      key: "action",
      render: (row) => (
        <div className="flex items-center gap-2">
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
    },
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getResponse({ apiEndPoint: "categories" });
      if (response.successType) {
        setCategories(response.response.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-4">
      <SectionHeader
        title="Category Management"
        mainHeader
        rightContent={
          <Button
            label="Add Category"
            startIcon={<Plus size={18} />}
            variant="primary"
            size="medium"
            onClick={() => setIsModalOpen(true)}
          />
        }
      />

      {/* Category Table */}
      <div className="mt-6">
        <Table
          columns={columns}
          data={categories}
          loading={loading}
          isPagination={false}
        />

        {/* Add/Edit Category Modal */}
        <Modal
          title={isEditMode ? "Edit Category" : "Add New Category"}
          open={isModalOpen}
          closeModal={closeModal}
          width="w-[600px]"
          closeButtonOutside={true}
        >
          <Formik
            initialValues={{
              name: editingCategory?.name || "",
              image: editingCategory?.image || null,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Image Upload Field */}
                <Field name="image">
                  {({ meta }) => (
                    <ProfileImageUploader
                      label="Category Image"
                      required
                      value={selectedImage}
                      onChange={(file) => {
                        setFieldValue("image", file);
                        setSelectedImage(URL.createObjectURL(file));
                      }}
                      onDelete={() => {
                        setFieldValue("image", null);
                        setSelectedImage(null);
                      }}
                      error={meta.touched && meta.error ? meta.error : ""}
                    />
                  )}
                </Field>

                {/* Category Name Input */}
                <Field name="name">
                  {({ field, meta }) => (
                    <Input
                      label="Category Name"
                      required
                      placeholder="Enter category name"
                      {...field}
                      error={meta.touched && meta.error ? meta.error : ""}
                    />
                  )}
                </Field>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    label="Cancel"
                    variant="outline"
                    onClick={closeModal}
                  />
                  <Button
                    type="submit"
                    label={
                      isSubmitting
                        ? isEditMode
                          ? "Updating..."
                          : "Adding..."
                        : isEditMode
                          ? "Update Category"
                          : "Add Category"
                    }
                    variant="primary"
                    disabled={isSubmitting}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.name || ""
            }"? This action cannot be undone.`}
          confirmButtonLabel="Delete"
          confirmButtonVariant="danger"
          onConfirm={() => handleDeleteCategory(categoryToDelete?.id)}
        />

        {/* Image Preview Modal */}
        <Modal
          title={selectedImageForModal?.name || "Category Image"}
          open={imageModalOpen}
          closeModal={closeImageModal}
          width="w-[500px]"
        >
          <div className="flex justify-center">
            <img
              src={selectedImageForModal?.src}
              alt={selectedImageForModal?.name}
              className="max-w-full max-h-[400px] object-contain rounded"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminCategoryPage;
