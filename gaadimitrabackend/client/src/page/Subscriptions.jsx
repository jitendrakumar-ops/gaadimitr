import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  IndianRupee,
  Loader2,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
  clearPackageError,
  clearPackageSuccess,
  selectPackages,
  selectPackageLoading,
  selectPackageCreateLoading,
  selectPackageUpdateLoading,
  selectPackageDeleteLoading,
  selectPackagePagination,
  selectPackageError,
  selectPackageCreateError,
  selectPackageUpdateError,
  selectPackageDeleteError,
  selectPackageSuccess,
  selectPackageMessage,
} from "../reducer/slices/packageSlice";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  dayType: "",
  off: "",
  badgeName: "",
  isActive: true,
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const Subscriptions = () => {
  const dispatch = useDispatch();

  /* =====================================================
     SELECTORS
  ===================================================== */

  const packages = useSelector(selectPackages);
  const loading = useSelector(selectPackageLoading);
  const createLoading = useSelector(selectPackageCreateLoading);
  const updateLoading = useSelector(selectPackageUpdateLoading);
  const deleteLoading = useSelector(selectPackageDeleteLoading);
  const pagination = useSelector(selectPackagePagination);
  const error = useSelector(selectPackageError);
  const createError = useSelector(selectPackageCreateError);
  const updateError = useSelector(selectPackageUpdateError);
  const deleteError = useSelector(selectPackageDeleteError);
  const success = useSelector(selectPackageSuccess);
  const message = useSelector(selectPackageMessage);

  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const itemsPerPage = 6;

  /* =====================================================
     FETCH PACKAGES
  ===================================================== */

  const fetchPackages = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "all") params.isActive = statusFilter === "active";

    dispatch(getPackages(params));
  }, [dispatch, currentPage, search, statusFilter]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  /* =====================================================
     TOAST NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearPackageSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    const err = error || createError || updateError || deleteError;
    if (err) {
      toast.error(typeof err === "string" ? err : "Something went wrong");
      dispatch(clearPackageError());
    }
  }, [error, createError, updateError, deleteError, dispatch]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    return packages.reduce(
      (acc, pkg) => {
        acc.total += 1;
        if (pkg.isActive) acc.active += 1;
        if (!pkg.isActive) acc.inactive += 1;
        return acc;
      },
      { total: 0, active: 0, inactive: 0 },
    );
  }, [packages]);

  /* =====================================================
     PAGINATION (server-side)
  ===================================================== */

  const totalPages = pagination.totalPages || 1;

  /* =====================================================
     MODAL
  ===================================================== */

  const openAddModal = () => {
    setEditingSubscription(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingSubscription(pkg);

    setForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: String(pkg.price ?? ""),
      dayType: pkg.dayType || "",
      off: String(pkg.off ?? ""),
      badgeName: pkg.badgeName || pkg.bedgeName || "",
      isActive: pkg.isActive ?? true,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSubscription(null);
    setForm(emptyForm);
  };

  /* =====================================================
     FORM
  ===================================================== */

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) return;
    if (form.price === "" || Number(form.price) < 0) return;
    if (!form.dayType.trim()) return;

    const packageData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      dayType: form.dayType.trim(),
      off: form.off ? Number(form.off) : 0,
      badgeName: form.badgeName.trim() || null,
      isActive: form.isActive,
    };

    try {
      if (editingSubscription) {
        const packageId =
          editingSubscription._id || editingSubscription.id;

        await dispatch(
          updatePackage({ packageId, packageData }),
        ).unwrap();
      } else {
        await dispatch(createPackage(packageData)).unwrap();
      }

      closeModal();
      fetchPackages();
    } catch {
      // error handled by the useEffect toast
    }
  };

  /* =====================================================
     STATUS TOGGLE
  ===================================================== */

  const toggleStatus = async (pkg) => {
    const packageId = pkg._id || pkg.id;

    try {
      await dispatch(
        updatePackage({
          packageId,
          packageData: { isActive: !pkg.isActive },
        }),
      ).unwrap();

      fetchPackages();
    } catch {
      // error handled by the useEffect toast
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const openDeleteModal = (pkg) => {
    setDeletingSubscription(pkg);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeletingSubscription(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deletingSubscription) return;

    const packageId =
      deletingSubscription._id || deletingSubscription.id;

    try {
      await dispatch(deletePackage(packageId)).unwrap();
      closeDeleteModal();
      fetchPackages();
    } catch {
      // error handled by the useEffect toast
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Subscriptions
              </h1>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0757D9]">
                {pagination.totalPackages}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage subscription plans for your users.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/user-subscriptions"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                py-2.5
                text-sm
                font-extrabold
                text-slate-700
                shadow-sm
                transition
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-[#0757D9]
              "
            >
              <CreditCard size={17} />
              Monitor User Subscriptions
            </Link>

            <button
              type="button"
              onClick={openAddModal}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0757D9]
                px-4
                py-2.5
                text-sm
                font-extrabold
                text-white
                shadow-sm
                transition
                hover:bg-[#064bbd]
              "
            >
              <Plus size={18} />
              Add Subscription
            </button>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatItem
            icon={Crown}
            label="Total Plans"
            value={pagination.totalPackages}
            iconClass="bg-blue-50 text-[#0757D9]"
          />

          <StatItem
            icon={Check}
            label="Active Plans"
            value={stats.active}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatItem
            icon={Users}
            label="Inactive Plans"
            value={stats.inactive}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* STATUS */}

            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
              {[
                {
                  key: "all",
                  label: "All Plans",
                },
                {
                  key: "active",
                  label: "Active",
                },
                {
                  key: "inactive",
                  label: "Inactive",
                },
              ].map((tab) => {
                const active = statusFilter === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`
                      flex
                      min-w-max
                      items-center
                      gap-2
                      rounded-lg
                      px-4
                      py-2.5
                      text-sm
                      font-bold
                      transition
                      ${
                        active
                          ? "bg-white text-[#0757D9] shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* SEARCH */}

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search subscription..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-4
                  text-sm
                  font-medium
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#0757D9]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          {/* LOADING OVERLAY */}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#0757D9]" />
              <span className="ml-3 text-sm font-bold text-slate-500">
                Loading packages...
              </span>
            </div>
          )}

          {/* DESKTOP */}

          {!loading && (
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Subscription
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Day Type
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Discount
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={22} />
                          </div>

                          <p className="mt-3 text-sm font-bold text-slate-700">
                            No subscriptions found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr
                        key={pkg._id || pkg.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        {/* PLAN */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                              <Crown size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-slate-900">
                                {pkg.name || "—"}
                              </p>

                              <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500">
                                {pkg.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* PRICE */}

                        <td className="px-6 py-4">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(pkg.price)}
                          </span>
                        </td>

                        {/* DAY TYPE */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <span className="text-sm font-bold text-slate-700">
                              {pkg.dayType || "—"}
                            </span>
                          </div>
                        </td>

                        {/* DISCOUNT */}

                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-extrabold text-slate-800">
                            {pkg.off ? `${pkg.off}%` : "—"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleStatus(pkg)}
                            disabled={updateLoading}
                            className="inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {pkg.isActive ? (
                              <>
                                <ToggleRight
                                  size={21}
                                  className="text-emerald-600"
                                />

                                <span className="text-xs font-extrabold text-emerald-700">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft
                                  size={21}
                                  className="text-slate-400"
                                />

                                <span className="text-xs font-extrabold text-slate-500">
                                  Inactive
                                </span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(pkg)}
                              className="
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-500
                                  transition
                                  hover:border-blue-200
                                  hover:bg-blue-50
                                  hover:text-[#0757D9]
                                "
                              title="Edit subscription"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(pkg)}
                              className="
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-red-100
                                  bg-red-50
                                  text-red-500
                                  transition
                                  hover:bg-red-100
                                "
                              title="Delete subscription"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE */}

          {!loading && (
            <div className="lg:hidden">
              {packages.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search size={22} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No subscriptions found
                  </p>
                </div>
              ) : (
                packages.map((pkg) => (
                  <div
                    key={pkg._id || pkg.id}
                    className="border-b border-slate-100 p-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                          <Crown size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {pkg.name || "—"}
                          </p>

                          <p className="mt-0.5 text-xs font-bold text-slate-500">
                            {formatCurrency(pkg.price)} / {pkg.dayType}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleStatus(pkg)}
                        disabled={updateLoading}
                      >
                        {pkg.isActive ? (
                          <ToggleRight
                            size={23}
                            className="text-emerald-600"
                          />
                        ) : (
                          <ToggleLeft size={23} className="text-slate-400" />
                        )}
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {pkg.description || "No description"}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">
                          Discount
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-800">
                          {pkg.off ? `${pkg.off}%` : "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(pkg)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(pkg)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAGINATION */}
          {!loading && packages.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={pagination?.totalPackages || 0}
                limit={pagination?.limit || itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {modalOpen && (
        <SubscriptionModal
          editingSubscription={editingSubscription}
          form={form}
          updateForm={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={createLoading || updateLoading}
        />
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteModalOpen && deletingSubscription && (
        <DeleteSubscriptionModal
          subscription={deletingSubscription}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          deleting={deleteLoading}
        />
      )}
    </>
  );
};

/* =========================================================
   STAT ITEM
========================================================= */

const StatItem = ({ icon: Icon, label, value, iconClass }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={19} />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>

        <p className="mt-0.5 text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

/* =========================================================
   SUBSCRIPTION MODAL
========================================================= */

const SubscriptionModal = ({
  editingSubscription,
  form,
  updateForm,
  onClose,
  onSubmit,
  saving,
}) => {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
              <Crown size={19} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingSubscription ? "Edit Subscription" : "Add Subscription"}
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {editingSubscription
                  ? "Update subscription plan details."
                  : "Create a new subscription plan."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {/* NAME */}

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                Package Name
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="e.g. Premium"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Describe the benefits of this plan..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* PRICE / DAY TYPE / DISCOUNT */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                  Price
                  <span className="text-red-500"> *</span>
                </label>

                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) =>
                      updateForm("price", event.target.value)
                    }
                    placeholder="499"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                  Day Type
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  value={form.dayType}
                  onChange={(event) =>
                    updateForm("dayType", event.target.value)
                  }
                  placeholder="e.g. Weekday, Weekend"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                  Discount (%)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.off}
                  onChange={(event) =>
                    updateForm("off", event.target.value)
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {/* BADGE NAME */}

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                Badge Name
              </label>

              <input
                type="text"
                value={form.badgeName}
                onChange={(event) =>
                  updateForm("badgeName", event.target.value)
                }
                placeholder="e.g. Gold, Silver"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* STATUS */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Plan Status
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Inactive plans cannot be purchased by users.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateForm("isActive", !form.isActive)}
                className={`
                  relative
                  h-6
                  w-11
                  rounded-full
                  transition
                  ${form.isActive ? "bg-[#0757D9]" : "bg-slate-300"}
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow-sm
                    transition
                    ${form.isActive ? "left-6" : "left-1"}
                  `}
                />
              </button>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#064bbd] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {editingSubscription ? "Save Changes" : "Create Subscription"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   DELETE MODAL
========================================================= */

const DeleteSubscriptionModal = ({
  subscription,
  onClose,
  onConfirm,
  deleting,
}) => {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          Delete Subscription?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-extrabold text-slate-700">
            {subscription.name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
