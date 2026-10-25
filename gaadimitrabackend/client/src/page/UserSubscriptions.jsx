import {
  AlertCircle,
  Ban,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileText,
  Filter,
  IndianRupee,
  Layers,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Timer,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import {
  clearPackageError,
  clearUserPackagesError,
  getAllUserPackages,
  selectUpdateUserPackageLoading,
  selectUserPackages,
  selectUserPackagesError,
  selectUserPackagesLoading,
  updateUserPackageStatus,
} from "../reducer/slices/packageSlice";

/* =========================================================
   HELPERS & FORMATTERS
========================================================= */

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRemainingDaysInfo = (expiryDate, status) => {
  if (status === "cancelled") {
    return { text: "Cancelled", color: "bg-red-50 text-red-600 border-red-200" };
  }
  if (!expiryDate) {
    return { text: "No Expiry", color: "bg-slate-50 text-slate-500 border-slate-200" };
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDaysAgo = Math.abs(diffDays);
    return {
      text: expiredDaysAgo === 1 ? "Expired yesterday" : `Expired ${expiredDaysAgo}d ago`,
      color: "bg-slate-100 text-slate-500 border-slate-200",
    };
  }

  if (diffDays === 0) {
    return { text: "Expires today", color: "bg-amber-50 text-amber-700 border-amber-200" };
  }

  if (diffDays <= 3) {
    return {
      text: `${diffDays} ${diffDays === 1 ? "day" : "days"} left`,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    text: `${diffDays} days left`,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

const getUserInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

/* =========================================================
   STAT CARD COMPONENT
========================================================= */

const StatCard = ({ icon: Icon, label, value, subtext, iconClass, borderClass }) => (
  <div
    className={`
      relative overflow-hidden rounded-2xl border bg-white p-5
      shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_6px_22px_rgba(15,23,42,0.06)]
      ${borderClass || "border-slate-200/90"}
    `}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtext}</p>
        )}
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>
    </div>
  </div>
);

/* =========================================================
   DETAILS MODAL COMPONENT
========================================================= */

const UserSubscriptionDetailsModal = ({
  subscription,
  isOpen,
  onClose,
  onCancelRequest,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !subscription) return null;

  const user = subscription.user || subscription.userId || {};
  const pkg = subscription.package || subscription.packageId || {};
  const vehicle = subscription.vehicle || subscription.vehicleId;
  const driver = subscription.driver || subscription.driverId;

  const userName = user.name || "Unknown User";
  const userPhone = user.phone || "—";
  const userEmail = user.email || "—";
  const userAvatar = user.profileImage || null;

  const planName = pkg.name || subscription.dayType || "Subscription Plan";
  const badgeName = pkg.badgeName || pkg.bedgeName;
  const dayType = subscription.dayType || pkg.dayType || "—";
  const basePrice = pkg.price || subscription.finalAmount;
  const discount = pkg.off || 0;
  const finalAmount = subscription.finalAmount;

  const paymentMethod = subscription.paymentMethod || "upi";
  const paymentStatus = subscription.paymentStatus || "paid";
  const transactionId = subscription.transactionId || "—";
  const status = subscription.status || "active";

  const remainingInfo = getRemainingDaysInfo(subscription.expiryDate, status);

  const copyTransactionId = () => {
    if (subscription.transactionId) {
      navigator.clipboard.writeText(subscription.transactionId);
      setCopiedId(true);
      toast.success("Transaction ID copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl border border-slate-100 bg-slate-50 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0757D9]">
            <Crown size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Subscription Details
              </h2>
              <span
                className={`
                  inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold capitalize
                  ${
                    status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : status === "cancelled"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                  }
                `}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Purchase ID: #{subscription._id?.slice(-8) || subscription.id?.slice(-8)}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
              Customer Information
            </p>

            <div className="flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#0757D9] to-blue-400 text-sm font-black text-white shadow-sm">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  getUserInitials(userName)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">{userName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Phone size={13} className="text-slate-400" />
                    {userPhone}
                  </span>
                  {userEmail !== "—" && (
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Mail size={13} className="text-slate-400" />
                      {userEmail}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Pricing Breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
              Plan & Validity Details
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                <span className="text-[11px] font-bold text-slate-400">Purchased Plan</span>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{planName}</p>
                  {badgeName && (
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
                      {badgeName}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Day Type: <span className="font-bold text-slate-700">{dayType}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                <span className="text-[11px] font-bold text-slate-400">Validity Remaining</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-extrabold ${remainingInfo.color}`}
                  >
                    <Clock size={13} />
                    {remainingInfo.text}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  <span>From: {formatDate(subscription.startDate)}</span>
                  <span className="mx-1.5">•</span>
                  <span>To: {formatDate(subscription.expiryDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Transaction Info */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
              Payment & Invoicing
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500">Base Price</span>
                <span className="font-bold text-slate-700">{formatCurrency(basePrice)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 text-emerald-600">
                  <span className="font-semibold">Discount Applied</span>
                  <span className="font-extrabold">-{discount}%</span>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-extrabold text-slate-900">Total Paid Amount</span>
                <span className="text-base font-black text-[#0757D9]">
                  {formatCurrency(finalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-500">Payment Method</span>
                <span className="font-extrabold uppercase tracking-wide text-slate-800">
                  {paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Payment Status</span>
                <span
                  className={`
                    inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold capitalize
                    ${
                      paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : paymentStatus === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }
                  `}
                >
                  <CheckCircle2 size={12} />
                  {paymentStatus}
                </span>
              </div>

              {transactionId !== "—" && (
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-500">Transaction ID</span>
                  <button
                    type="button"
                    onClick={copyTransactionId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-700 transition hover:bg-slate-100"
                    title="Click to copy"
                  >
                    <span>{transactionId}</span>
                    <Copy size={12} className={copiedId ? "text-emerald-500" : "text-slate-400"} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-500">Purchased On</span>
                <span className="font-medium text-slate-700">
                  {formatDateTime(subscription.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle / Driver Info if present */}
          {(vehicle || driver) && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                Assigned Details
              </p>
              {vehicle && (
                <p className="font-semibold text-slate-700">
                  Vehicle:{" "}
                  <span className="font-bold text-slate-900">
                    {vehicle.title || vehicle.vehicleNumber || vehicle.model || "Assigned"}
                  </span>
                </p>
              )}
              {driver && (
                <p className="mt-1 font-semibold text-slate-700">
                  Driver:{" "}
                  <span className="font-bold text-slate-900">
                    {driver.name || "Assigned Driver"} ({driver.phone || "—"})
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          {status === "active" && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCancelRequest(subscription);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              <Ban size={14} />
              Cancel Subscription
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT: UserSubscriptions
========================================================= */

const UserSubscriptions = () => {
  const dispatch = useDispatch();

  // Redux state
  const userPackages = useSelector(selectUserPackages);
  const loading = useSelector(selectUserPackagesLoading);
  const error = useSelector(selectUserPackagesError);
  const actionLoading = useSelector(selectUpdateUserPackageLoading);

  // Local state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected subscription for detail view modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Confirmation modal for cancelling subscription
  const [subToCancel, setSubToCancel] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchUserPackages = useCallback(() => {
    const params = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;
    if (search.trim()) params.search = search.trim();

    dispatch(getAllUserPackages(params));
  }, [dispatch, statusFilter, paymentStatusFilter, search]);

  useEffect(() => {
    fetchUserPackages();
  }, [fetchUserPackages]);

  /* =======================================================
     ERROR TOAST
  ======================================================= */

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to load user subscriptions");
      dispatch(clearUserPackagesError());
    }
  }, [error, dispatch]);

  /* =======================================================
     METRICS & STATS
  ======================================================= */

  const stats = useMemo(() => {
    let totalPurchases = userPackages.length;
    let activeCount = 0;
    let expiredCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    userPackages.forEach((sub) => {
      if (sub.status === "active") activeCount += 1;
      else if (sub.status === "cancelled") cancelledCount += 1;
      else if (sub.status === "expired") expiredCount += 1;

      if (sub.paymentStatus === "paid" && sub.finalAmount) {
        totalRevenue += Number(sub.finalAmount);
      }
    });

    return {
      totalPurchases,
      activeCount,
      expiredCount,
      cancelledCount,
      totalRevenue,
    };
  }, [userPackages]);

  /* =======================================================
     CLIENT FILTERING & PAGINATION
  ======================================================= */

  const filteredSubscriptions = useMemo(() => {
    return userPackages.filter((sub) => {
      const user = sub.user || sub.userId || {};
      const pkg = sub.package || sub.packageId || {};

      const userName = user.name || "";
      const userPhone = user.phone || "";
      const userEmail = user.email || "";
      const planName = pkg.name || sub.dayType || "";
      const transactionId = sub.transactionId || "";

      // Search match
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        userName.toLowerCase().includes(query) ||
        userPhone.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        planName.toLowerCase().includes(query) ||
        transactionId.toLowerCase().includes(query);

      // Status match
      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter;

      // Payment Status match
      const matchesPayment =
        paymentStatusFilter === "all" || sub.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [userPackages, search, statusFilter, paymentStatusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, paymentStatusFilter]);

  // Slice for current page
  const totalItems = filteredSubscriptions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSubscriptions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubscriptions, currentPage, itemsPerPage]);

  /* =======================================================
     ACTIONS: VIEW DETAILS & CANCEL
  ======================================================= */

  const handleOpenDetails = (sub) => {
    setSelectedSub(sub);
    setDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedSub(null);
    setDetailModalOpen(false);
  };

  const handleRequestCancel = (sub) => {
    setSubToCancel(sub);
    setConfirmModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!subToCancel) return;
    const subId = subToCancel._id || subToCancel.id;

    try {
      await dispatch(
        updateUserPackageStatus({
          userPackageId: subId,
          status: "cancelled",
        }),
      ).unwrap();

      toast.success("Subscription has been successfully cancelled");
      setConfirmModalOpen(false);
      setSubToCancel(null);
      fetchUserPackages();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to cancel subscription");
    }
  };

  /* =======================================================
     EXPORT TO CSV
  ======================================================= */

  const exportToCSV = () => {
    if (filteredSubscriptions.length === 0) {
      toast.error("No subscriptions data to export");
      return;
    }

    const headers = [
      "Purchase ID",
      "User Name",
      "User Phone",
      "User Email",
      "Plan Name",
      "Day Type",
      "Amount Paid (INR)",
      "Payment Method",
      "Payment Status",
      "Transaction ID",
      "Status",
      "Start Date",
      "Expiry Date",
      "Purchased At",
    ];

    const rows = filteredSubscriptions.map((sub) => {
      const user = sub.user || sub.userId || {};
      const pkg = sub.package || sub.packageId || {};
      return [
        `"${sub._id || sub.id}"`,
        `"${user.name || "Unknown"}"`,
        `"${user.phone || ""}"`,
        `"${user.email || ""}"`,
        `"${pkg.name || sub.dayType || ""}"`,
        `"${sub.dayType || ""}"`,
        `"${sub.finalAmount || 0}"`,
        `"${sub.paymentMethod || ""}"`,
        `"${sub.paymentStatus || ""}"`,
        `"${sub.transactionId || ""}"`,
        `"${sub.status || ""}"`,
        `"${formatDate(sub.startDate)}"`,
        `"${formatDate(sub.expiryDate)}"`,
        `"${formatDateTime(sub.createdAt)}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `user_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("User subscriptions report exported!");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER SECTION
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              User Subscriptions
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-[#0757D9]">
              {userPackages.length} Total
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and track which users have purchased which subscription plans across the platform.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchUserPackages}
            disabled={loading}
            className="
              inline-flex items-center justify-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3.5 py-2.5 text-xs
              font-extrabold text-slate-700 shadow-sm transition
              hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9]
              disabled:opacity-50
            "
            title="Refresh subscriptions"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#0757D9]" : ""} />
            <span>Refresh</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={exportToCSV}
            className="
              inline-flex items-center justify-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3.5 py-2.5 text-xs
              font-extrabold text-slate-700 shadow-sm transition
              hover:border-slate-300 hover:bg-slate-50
            "
            title="Export CSV Report"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {/* Link to Subscription Plans Management */}
          <Link
            to="/admin/subscriptions"
            className="
              inline-flex items-center justify-center gap-2 rounded-xl
              bg-[#0757D9] px-4 py-2.5 text-xs font-extrabold text-white
              shadow-sm transition hover:bg-[#064bbd]
            "
          >
            <Crown size={15} />
            <span>Manage Plans</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          METRICS STATS CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Layers}
          label="Total Subscriptions"
          value={stats.totalPurchases}
          subtext="All-time purchases"
          iconClass="bg-blue-50 text-[#0757D9]"
          borderClass="border-blue-100"
        />

        <StatCard
          icon={CheckCircle2}
          label="Active Subscriptions"
          value={stats.activeCount}
          subtext="Currently enjoying plan benefits"
          iconClass="bg-emerald-50 text-emerald-600"
          borderClass="border-emerald-100"
        />

        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtext="Paid subscription revenue"
          iconClass="bg-violet-50 text-violet-600"
          borderClass="border-violet-100"
        />

        <StatCard
          icon={Timer}
          label="Expired / Cancelled"
          value={stats.expiredCount + stats.cancelledCount}
          subtext={`${stats.expiredCount} Expired • ${stats.cancelledCount} Cancelled`}
          iconClass="bg-amber-50 text-amber-600"
          borderClass="border-amber-100"
        />
      </div>

      {/* =====================================================
          FILTER & SEARCH TOOLBAR
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Tabs */}
          <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
            {[
              { key: "all", label: "All Subscriptions", count: userPackages.length },
              { key: "active", label: "Active", count: stats.activeCount },
              { key: "expired", label: "Expired", count: stats.expiredCount },
              { key: "cancelled", label: "Cancelled", count: stats.cancelledCount },
            ].map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`
                    flex min-w-max items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition
                    ${
                      active
                        ? "bg-white text-[#0757D9] shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`
                      rounded-full px-1.5 py-0.2 text-[10px] font-black
                      ${
                        active
                          ? "bg-blue-50 text-[#0757D9]"
                          : "bg-slate-200/70 text-slate-500"
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Payment Filter Controls */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            {/* Payment Status Dropdown */}
            <div className="relative min-w-[150px]">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="
                  h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3
                  text-xs font-bold text-slate-700 outline-none transition
                  focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50
                "
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, plan, TXN..."
                className="
                  h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4
                  text-xs font-medium text-slate-800 outline-none transition
                  placeholder:text-slate-400 focus:border-[#0757D9] focus:bg-white
                  focus:ring-4 focus:ring-blue-50
                "
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE / LIST CONTAINER
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#0757D9]" />
            <p className="mt-3 text-sm font-bold text-slate-500">
              Loading user subscriptions...
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    User / Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Purchased Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Amount & Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Validity Timeline
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Crown size={26} />
                        </div>
                        <p className="mt-3 text-sm font-extrabold text-slate-700">
                          No user subscriptions found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try adjusting your search criteria or filter options.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSubscriptions.map((sub) => {
                    const user = sub.user || sub.userId || {};
                    const pkg = sub.package || sub.packageId || {};
                    const userName = user.name || "Unknown User";
                    const userPhone = user.phone || "—";
                    const userEmail = user.email || "";
                    const planName = pkg.name || sub.dayType || "Subscription Plan";
                    const badgeName = pkg.badgeName || pkg.bedgeName;
                    const dayType = sub.dayType || pkg.dayType || "—";
                    const remaining = getRemainingDaysInfo(sub.expiryDate, sub.status);

                    return (
                      <tr
                        key={sub._id || sub.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* USER COLUMN */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#0757D9] to-blue-400 text-xs font-black text-white shadow-sm">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={userName}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                getUserInitials(userName)
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {userName}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone size={12} className="text-slate-400" />
                                <span>{userPhone}</span>
                              </div>
                              {userEmail && (
                                <p className="mt-0.5 max-w-[200px] truncate text-[11px] text-slate-400">
                                  {userEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* PLAN COLUMN */}
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-extrabold text-slate-900">
                                {planName}
                              </p>
                              {badgeName && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                                  {badgeName}
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays size={13} className="text-slate-400" />
                              <span className="font-semibold">{dayType}</span>
                            </div>
                          </div>
                        </td>

                        {/* AMOUNT & PAYMENT COLUMN */}
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900">
                              {formatCurrency(sub.finalAmount)}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                                {sub.paymentMethod || "UPI"}
                              </span>

                              <span
                                className={`
                                  rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize
                                  ${
                                    sub.paymentStatus === "paid"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : sub.paymentStatus === "pending"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-red-50 text-red-700"
                                  }
                                `}
                              >
                                {sub.paymentStatus || "paid"}
                              </span>
                            </div>

                            {sub.transactionId && (
                              <p className="mt-1 font-mono text-[10px] text-slate-400">
                                TXN: #{sub.transactionId.slice(-8)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* VALIDITY TIMELINE COLUMN */}
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold ${remaining.color}`}
                            >
                              <Clock size={12} />
                              {remaining.text}
                            </span>

                            <div className="mt-1.5 text-[11px] text-slate-500">
                              <p>
                                Started: <span className="font-bold text-slate-700">{formatDate(sub.startDate)}</span>
                              </p>
                              <p className="mt-0.5">
                                Expires: <span className="font-bold text-slate-700">{formatDate(sub.expiryDate)}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* STATUS COLUMN */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`
                              inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black capitalize
                              ${
                                sub.status === "active"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : sub.status === "cancelled"
                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                    : "border-slate-200 bg-slate-100 text-slate-600"
                              }
                            `}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                sub.status === "active"
                                  ? "bg-emerald-500"
                                  : sub.status === "cancelled"
                                    ? "bg-rose-500"
                                    : "bg-slate-400"
                              }`}
                            />
                            {sub.status || "active"}
                          </span>
                        </td>

                        {/* ACTIONS COLUMN */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(sub)}
                              className="
                                flex h-9 w-9 items-center justify-center rounded-xl
                                border border-slate-200 bg-white text-slate-600 transition
                                hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9]
                              "
                              title="View purchase details"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Cancel Subscription (if active) */}
                            {sub.status === "active" && (
                              <button
                                type="button"
                                onClick={() => handleRequestCancel(sub)}
                                className="
                                  flex h-9 w-9 items-center justify-center rounded-xl
                                  border border-red-100 bg-red-50 text-red-500 transition
                                  hover:border-red-200 hover:bg-red-100 hover:text-red-700
                                "
                                title="Cancel subscription"
                              >
                                <Ban size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile View */}
        {!loading && (
          <div className="divide-y divide-slate-100 lg:hidden">
            {paginatedSubscriptions.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Crown size={22} />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">
                  No user subscriptions found
                </p>
              </div>
            ) : (
              paginatedSubscriptions.map((sub) => {
                const user = sub.user || sub.userId || {};
                const pkg = sub.package || sub.packageId || {};
                const userName = user.name || "Unknown User";
                const userPhone = user.phone || "—";
                const planName = pkg.name || sub.dayType || "Subscription Plan";
                const remaining = getRemainingDaysInfo(sub.expiryDate, sub.status);

                return (
                  <div key={sub._id || sub.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#0757D9] to-blue-400 text-xs font-black text-white">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={userName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getUserInitials(userName)
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{userName}</p>
                          <p className="text-xs text-slate-500">{userPhone}</p>
                        </div>
                      </div>

                      <span
                        className={`
                          inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-black capitalize
                          ${
                            sub.status === "active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : sub.status === "cancelled"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                          }
                        `}
                      >
                        {sub.status || "active"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{planName}</span>
                        <span className="text-sm font-black text-[#0757D9]">
                          {formatCurrency(sub.finalAmount)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Day Type: {sub.dayType}</span>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${remaining.color}`}>
                          {remaining.text}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        Expires: {formatDate(sub.expiryDate)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(sub)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          View Details
                        </button>

                        {sub.status === "active" && (
                          <button
                            type="button"
                            onClick={() => handleRequestCancel(sub)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredSubscriptions.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* =====================================================
          VIEW DETAILS MODAL
      ====================================================== */}

      <UserSubscriptionDetailsModal
        subscription={selectedSub}
        isOpen={detailModalOpen}
        onClose={handleCloseDetails}
        onCancelRequest={(sub) => {
          handleRequestCancel(sub);
        }}
      />

      {/* =====================================================
          CONFIRM CANCEL MODAL
      ====================================================== */}

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSubToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel User Subscription?"
        description="Are you sure you want to cancel this user's active subscription plan? The user will no longer be eligible for the subscription perks."
        confirmText="Yes, Cancel Subscription"
        cancelText="Keep Active"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default UserSubscriptions;
