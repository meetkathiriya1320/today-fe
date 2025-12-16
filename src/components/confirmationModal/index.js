"use client";
import Button from "../button";
import Modal from "../modal"; // your custom modal

const ConfirmationModal = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDisabled = false, // optional to disable buttons
}) => {
  return (
    <Modal
      open={open}
      closeModal={onCancel}
      title={title}
      width="w-[400px]"
      isBlock={false}
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-600">{message}</p>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            label={cancelText}
            onClick={onCancel}
            disabled={isDisabled}
          />
          <Button
            label={confirmText}
            onClick={onConfirm}
            disabled={isDisabled}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
