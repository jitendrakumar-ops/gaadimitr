import {
  AlertTriangle,
  Bike,
  Car,
  Check,
  Loader2,
  Package,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../components/Pagination";

import {
  clearServiceError,
  clearServiceSuccess,
  createService,
  deleteService,
  getServices,
  selectServiceCreateLoading,
  selectServiceDeleteLoading,
  selectServiceError,
  selectServiceMessage,
  selectServices,
  selectServicesLoading,
  selectServiceSuccess,
  selectServiceUpdateLoading,
  updateService,
} from "../reducer/slices/serviceSlice";

/* =========================================================
   ICONS & HELPERS
========================================================= */

const getServiceIcon = (title = "") => {
  const value = String(title || "").toLowerCase();

  if (value.includes("bike") || value.includes("scooter")) return Bike;
  if (value.includes("car") || value.includes("cab")) return Car;
  if (value.includes("truck") || value.includes("lorry")) return Truck;
  if (value.includes("pickup")) return Package;
  if (value.includes("auto")) return Car;

  return Package;
};

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
      active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-emerald-500" : "bg-slate-400"
      }`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const MiniStat = ({ label, value, icon: Icon, className }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-[0_3px_15px_rgba(15,23,42,0.035)]">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
    >
      <Icon size={19} />
    </div>

    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  </div>
);

/* =========================================================
   IMAGE UPLOAD COMPONENT
========================================================= */

const ImageUpload = ({ value, onChange, error }) => {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    onChange({
      file,
      preview: previewUrl,
    });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Service Image
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value?.preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img
            src={value.preview}
            alt="Service preview"
            className="h-44 w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
            <span className="max-w-[70%] truncate text-xs font-bold text-white">
              {value.file?.name || "Service image"}
            </span>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
            error
              ? "border-red-300 bg-red-50/30"
              : "border-slate-200 bg-slate-50 hover:border-[#0757D9] hover:bg-blue-50/30"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0757D9] shadow-sm">
            <Upload size={21} />
          </div>

          <p className="mt-3 text-sm font-extrabold text-slate-700">
            Upload service image
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PNG, JPG or WEBP · Max 5MB
          </p>
        </button>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
};

/* =========================================================
   ADD / EDIT SERVICE MODAL
========================================================= */

const ServiceModal = ({ open, onClose, onSave, editingService, loading }) => {
  const [form, setForm] = useState({
    title: "",
    image: null,
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setForm({
      title: editingService?.title || "",
      image: editingService?.image
        ? {
            preview: editingService.image,
            file: null,
          }
        : null,
      description: editingService?.description || "",
      isActive: editingService?.isActive ?? true,
    });

    setErrors({});
  }, [open, editingService]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Service title is required";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: form.title.trim(),
      image: form.image?.preview || "",
      imageFile: form.image?.file || null,
      description: form.description.trim(),
      isActive: form.isActive,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingService ? "Edit Service" : "Add Service"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {editingService
                ? "Update service details and availability"
                : "Add a new transportation service category"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 sm:p-6"
        >
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Service Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Bike, Car, Auto, Courier"
                className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                  errors.title
                    ? "border-red-300"
                    : "border-slate-200 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                }`}
              />

              {errors.title && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={form.image}
              error={errors.image}
              onChange={(value) => updateField("image", value)}
            />

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe this service (features, capacity, etc.)..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Service Status
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Make this service available to passengers
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateField("isActive", !form.isActive)}
                className={`relative h-7 w-12 rounded-full transition ${
                  form.isActive ? "bg-[#0757D9]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    form.isActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 hover:bg-[#064bbd] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : editingService ? (
                "Save Changes"
              ) : (
                "Add Service"
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

const DeleteModal = ({ open, service, onClose, onConfirm, loading }) => {
  if (!open || !service) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle size={23} />
        </div>

        <h2 className="mt-5 text-xl font-extrabold text-slate-900">
          Delete Service?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-800">{service.title}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Service"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SERVICE ROW
========================================================= */

const ServiceRow = ({ service, onEdit, onDelete, onToggle }) => {
  const Icon = getServiceIcon(service.title);
  const serviceId = service._id || service.id;

  return (
    <div className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-slate-50/70 sm:grid-cols-[70px_1fr_2fr_120px_100px] lg:grid-cols-[76px_1.2fr_2fr_130px_110px]">
      {/* Image */}
      <div className="hidden sm:block">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon size={21} className="text-slate-400" />
          )}
        </div>
      </div>

      {/* Title & ID */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:hidden">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon size={20} className="text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-800">
              {service.title}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="hidden truncate text-sm font-medium text-slate-500 sm:block">
        {service.description || "No description added."}
      </p>

      {/* Status Toggle */}
      <div className="justify-self-end sm:justify-self-start">
        <button
          onClick={() => onToggle(service)}
          title="Click to toggle status"
          className="transition hover:opacity-80"
        >
          <StatusBadge active={service.isActive} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onEdit(service)}
          title="Edit service"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-[#0757D9]"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(service)}
          title="Delete service"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN SERVICES COMPONENT
========================================================= */

const Services = () => {
  const dispatch = useDispatch();

  // Redux State
  const services = useSelector(selectServices);
  const loading = useSelector(selectServicesLoading);
  const createLoading = useSelector(selectServiceCreateLoading);
  const updateLoading = useSelector(selectServiceUpdateLoading);
  const deleteLoading = useSelector(selectServiceDeleteLoading);
  const error = useSelector(selectServiceError);
  const success = useSelector(selectServiceSuccess);
  const message = useSelector(selectServiceMessage);

  // Local State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  /* =======================================================
     DEBOUNCE SEARCH
  ======================================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =======================================================
     FETCH SERVICES
  ======================================================= */
  const fetchServicesData = useCallback(() => {
    const params = {};

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (statusFilter !== "all") {
      params.isActive = statusFilter === "active" ? "true" : "false";
    }

    dispatch(getServices(params));
  }, [dispatch, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchServicesData();
  }, [fetchServicesData]);

  /* =======================================================
     NOTIFICATIONS / TOASTS
  ======================================================= */
  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearServiceSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "An error occurred");
      dispatch(clearServiceError());
    }
  }, [error, dispatch]);

  /* =======================================================
     FILTERED & PAGINATED DATA
  ======================================================= */
  const totalPages = Math.max(1, Math.ceil(services.length / itemsPerPage));

  const paginatedServices = useMemo(() => {
    return services.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [services, page, itemsPerPage]);

  /* =======================================================
     STATS
  ======================================================= */
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;
  const inactiveServices = services.filter((s) => !s.isActive).length;

  /* =======================================================
     HANDLERS
  ======================================================= */
  const openAddModal = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleSaveService = async (data) => {
    const serviceId = editingService?._id || editingService?.id;

    let payload;
    if (data.imageFile) {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("image", data.imageFile);
      if (data.description) formData.append("description", data.description);
      formData.append("isActive", String(data.isActive));
      payload = formData;
    } else {
      payload = {
        title: data.title,
        image: typeof data.image === "string" ? data.image : null,
        description: data.description || "",
        isActive: Boolean(data.isActive),
      };
    }

    try {
      if (editingService) {
        await dispatch(
          updateService({ serviceId, serviceData: payload }),
        ).unwrap();
      } else {
        await dispatch(createService(payload)).unwrap();
      }
      setModalOpen(false);
      setEditingService(null);
    } catch {
      // Toast handles error in useEffect
    }
  };

  const handleToggleService = async (service) => {
    const serviceId = service._id || service.id;
    try {
      await dispatch(
        updateService({
          serviceId,
          serviceData: { isActive: !service.isActive },
        }),
      ).unwrap();
    } catch {
      // Toast handles error in useEffect
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const serviceId = deleteTarget._id || deleteTarget.id;

    try {
      await dispatch(deleteService(serviceId)).unwrap();
      setDeleteTarget(null);
    } catch {
      // Toast handles error in useEffect
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0757D9]" />
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#0757D9]">
                Service Management
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Services
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-[#0757D9]">
                {totalServices}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage the transportation service categories provided by
              GaadiMitra.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchServicesData}
              disabled={loading}
              title="Refresh"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#064bbd]"
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniStat
            label="Total Services"
            value={totalServices}
            icon={Package}
            className="bg-blue-50 text-[#0757D9]"
          />

          <MiniStat
            label="Active Services"
            value={activeServices}
            icon={Check}
            className="bg-emerald-50 text-emerald-600"
          />

          <MiniStat
            label="Inactive Services"
            value={inactiveServices}
            icon={Power}
            className="bg-slate-100 text-slate-500"
          />
        </div>

        {/* List Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search services by title..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3.5 py-2 text-xs font-extrabold transition ${
                    statusFilter === value
                      ? "bg-[#0757D9] text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden grid-cols-[70px_1fr_2fr_120px_100px] border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:grid lg:grid-cols-[76px_1.2fr_2fr_130px_110px]">
            <span>Image</span>
            <span>Service</span>
            <span>Description</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows / Loading / Empty */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#0757D9]" />
              <p className="mt-3 text-sm font-bold text-slate-600">
                Loading services...
              </p>
            </div>
          ) : paginatedServices.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginatedServices.map((service) => (
                <ServiceRow
                  key={service._id || service.id}
                  service={service}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onToggle={handleToggleService}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Package size={26} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                No services found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search query or filter.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && services.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={services.length}
                limit={itemsPerPage}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ServiceModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        editingService={editingService}
        loading={createLoading || updateLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={Boolean(deleteTarget)}
        service={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default Services;
