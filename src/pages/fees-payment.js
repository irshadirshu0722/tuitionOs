"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { format, addMonths, subMonths } from "date-fns";
import {
  getPaymentForDay,
  createFeesPayment,
  updateFeesPayment,
  deleteFeesPayment,
} from "../lib/appwrite";
import { toast } from "react-hot-toast";
import { useUserContext } from "@/context/GlobalContext";

import { useStudents } from "@/hooks/useStudents";
import FeesSearch from "@/components/FeesSearch";
import FeesTable from "@/components/FeesTable";
import PaymentFormModal from "@/components/PaymentFormModal";
import ProtectedRoute from "@/components/middleware/ProtectedRouter";

function AttendancePage() {
  const {
    selectedYear,
    selectedClass,
    centerStudents,
    branchDetails,
    studentLoading,
  } = useUserContext();
  const [filteredData, setFilteredData] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const formattedDateForAppWrite = format(selectedDate, "yyyy-MM");
  const formattedDateDisplay = format(selectedDate, "MMMM yyyy");
  const [paymentLoading, setPaymentLoading] = useState(new Set());
  const [actionPaymentId, setActionPaymentId] = useState();
  const [openForm, setOpenForm] = useState(false);
  const [initData, setInitData] = useState(null);
  const [studentTotalPaid, setStudentTotalPaid] = useState({});
  useEffect(() => {
    console.log("fetching fees payment ", centerStudents, selectedDate);

    if (centerStudents && centerStudents != null) {
      console.log("enter to fetch");
      setSearchTerm("");
      setPaymentRecords([]);
      setLoading(true);
      fetchFeesPaymentData();
    }
  }, [centerStudents, selectedDate]);
  const fetchFeesPaymentData = async () => {
    setSearchTerm("");
    try {
      const data = await getPaymentForDay(
        branchDetails.$id,
        selectedClass,
        selectedYear,
        formattedDateForAppWrite
      );
      combineStudentAndPayments(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch fees payments, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const combineStudentAndPayments = (data) => {
    const paymentStudentIds = {};
    data.forEach((item) => {
      paymentStudentIds[item.studentId] = {
        paymentId: item.$id,
        paidAt: item.paidAt,
        totalPaid: 0,
        amount: item.amount,
      };
    });
    const paymentsData = centerStudents.map((item) => {
      const totalPaid =
        item.$id in studentTotalPaid
          ? studentTotalPaid[item.$id]
          : item.feesPayments
              .map((item) => item.amount)
              .reduce((acc, curr) => acc + curr, 0);
      return item.$id in paymentStudentIds
        ? {
            ...item,
            paid: true,
            ...paymentStudentIds[item.$id],
            totalPaid: totalPaid,
          }
        : { ...item, paid: false, totalPaid: totalPaid };
    });
    setPaymentRecords(paymentsData);
  };
  const handlePrevDate = () => {
    setSearchTerm("");
    setSelectedDate((prevDate) => subMonths(prevDate, 1));
  };
  const handleNextDate = () => {
    setSearchTerm("");
    setSelectedDate((prevDate) => addMonths(prevDate, 1));
  };
  const openDialogue = (id, isCreate) => {
    setActionPaymentId(id);
    if (!isCreate) {
      setInitData(paymentRecords.find((item) => item.paymentId == id));
    }
    setOpenForm(true);
  };

  const onMarkAsPaid = async (isEdit, data) => {
    setOpenForm(false);
    setPaymentLoading((prev) => new Set(prev).add(actionPaymentId));
    if (isEdit) {
      try {
        const response = await updateFeesPayment(actionPaymentId, {
          amount: parseFloat(`${data.amount}`),
          paidAt: data.date,
        });
        setPaymentRecords((prev) =>
          prev.map((item) => {
            if (item.paymentId == actionPaymentId) {
              setStudentTotalPaid({
                ...prev,
                [item.$id]: item.totalPaid - item.amount + response.amount,
              });
            }
            return item.paymentId != actionPaymentId
              ? item
              : {
                  ...item,
                  totalPaid: item.totalPaid - item.amount + response.amount,
                  amount: response.amount,
                  paidAt: response.paidAt,
                  feesMonth: formattedDateForAppWrite,
                };
          })
        );

        toast.success("Payment Edited successfully.");
      } catch (error) {
        console.log(error);
        toast.error("Failed to edit payment, try again later.");
      }
    } else {
      try {
        const responseData = await createFeesPayment(
          branchDetails.$id,
          selectedClass,
          selectedYear,
          actionPaymentId,
          {
            amount: parseFloat(`${data.amount}`),
            paidAt: format(data.date, "yyyy-MM-dd"),
            feesMonth: formattedDateForAppWrite,
          }
        );
        setPaymentRecords((prev) =>
          prev.map((item) => {
            if (item.$id == actionPaymentId) {
              setStudentTotalPaid({
                ...prev,
                [item.$id]: item.totalPaid + responseData.amount,
              });
            }
            return item.$id != actionPaymentId
              ? item
              : {
                  ...item,
                  paid: true,
                  paymentId: responseData.$id,
                  amount: responseData.amount,
                  paidAt: responseData.paidAt,
                  totalPaid: item.totalPaid + responseData.amount,
                };
          })
        );
        toast.success("Payment created successfully.");
      } catch (error) {
        console.log(error);
        toast.error("Failed to make payment, try again later.");
      }
    }
    setPaymentLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(actionPaymentId);
      return newSet;
    });
    setActionPaymentId(null);
    setInitData(null);
  };
  const onMarkAsUnpaid = async () => {
    setOpenForm(false);
    setPaymentLoading((prev) => new Set(prev).add(actionPaymentId));
    try {
      await deleteFeesPayment(actionPaymentId);
      toast.success("Payment Marked as unpaid successfully.");
      setPaymentRecords((prev) =>
        prev.map((item) => {
          if (item.paymentId == actionPaymentId) {
            setStudentTotalPaid({
              ...prev,
              [item.$id]: item.totalPaid - item.amount,
            });
          }
          return item.paymentId != actionPaymentId
            ? item
            : {
                ...item,
                paid: false,
                paymentId: null,
                amount: null,
                paidAt: null,
                totalPaid: item.totalPaid - item.amount,
              };
        })
      );
    } catch (error) {
      toast.error("Failed  Marked as unpaid, try again later.");
    }
    setPaymentLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(actionPaymentId);
      return newSet;
    });
    setActionPaymentId(null);
    setInitData(null);
  };

  useEffect(() => {
    if (paymentRecords) {
      setFilteredData(
        paymentRecords.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, paymentRecords]);
  useEffect(() => {
    setSearchTerm("");
  }, [selectedClass, selectedYear, selectedDate]);

  return (
    <div>
      <FeesSearch
        date={formattedDateDisplay}
        onNextDate={handleNextDate}
        onPrevDate={handlePrevDate}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        loading={loading}
      />
      <FeesTable
        loading={loading || studentLoading}
        onHandlePaid={openDialogue}
        paymentLoading={paymentLoading}
        paymentsData={filteredData}
      />
      {openForm && (
        <PaymentFormModal
          initialData={initData}
          onMarkAsPaid={onMarkAsPaid}
          handleUnPaid={onMarkAsUnpaid}
          onClose={() => {
            setInitData(null);
            setActionPaymentId(null);
            setOpenForm(false);
          }}
        />
      )}
    </div>
  );
}
export default function WrappedPage() {
  return <ProtectedRoute Component={AttendancePage} />;
}