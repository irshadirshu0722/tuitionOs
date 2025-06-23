import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./atomic/button/Button";
import toast from "react-hot-toast";

const PaymentFormModal = ({
  onClose,
  initialData,
  onMarkAsPaid,
  handleUnPaid,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0], // Default to today
  });

  const modalRef = useRef();

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount || "",
        date:
          new Date(initialData.paidAt).toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    initialData ? onMarkAsPaid(true, formData) : onMarkAsPaid(false, formData);
  };
  console.log();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {initialData ? "Edit Payment" : "Add Payment"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Date of payment
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={handleUnPaid}
              className="px-4 py-2 border rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              Mark as Unpaid
            </button>
            <Button
              
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {initialData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentFormModal;
