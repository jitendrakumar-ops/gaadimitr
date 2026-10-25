import {
  AlertTriangle,
  Bike,
  Car,
  Check,
  IndianRupee,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../components/Pagination";

import {
  createVehicle,
  deleteVehicle as deleteVehicleThunk,
  getServices,
  getVehicleById,
  getVehicles,
  selectSelectedVehicle,
  selectServices,
  selectServicesError,
  selectServicesLoading,
  selectVehicleCreateLoading,
  selectVehicleDeleteLoading,
  selectVehicleDetailsLoading,
  selectVehicleError,
  selectVehicleUpdateLoading,
  selectVehicles,
  updateVehicle,
} from "../reducer/slices/vehicleSlice";

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (value = "") => /^[a-fA-F0-9]{24}$/.test(String(value));

const getServiceId = (vehicle) => {
  if (!vehicle) return "";

  if (typeof vehicle.serviceId === "object" && vehicle.serviceId !== null) {
    return vehicle.serviceId?._id || vehicle.serviceId?.id || "";
  }

  return vehicle.serviceId || "";
};

const getServiceName = (vehicle) => {
  if (!vehicle) return "Unassigned";

  if (vehicle.serviceId && typeof vehicle.serviceId === "object") {
    return vehicle.serviceId?.title || "Unassigned";
  }

  if (vehicle.service && typeof vehicle.service === "object") {
    return vehicle.service?.title || vehicle.service?.name || "Unassigned";
  }

  if (typeof vehicle.service === "string") {
    return vehicle.service;
  }

  return "Unassigned";
};

const normalizeVehicle = (vehicle) => {
  if (!vehicle) return null;

  return {
    ...vehicle,
    id: vehicle.id || vehicle._id,
    serviceId: getServiceId(vehicle),
    service:
      typeof vehicle.serviceId === "object"
        ? vehicle.serviceId
        : vehicle.service,
  };
};

const getVehicleIcon = (type = "") => {
  const value = String(type).toLowerCase();

  if (value.includes("bike") || value.includes("scooter")) {
    return Bike;
  }

  if (value.includes("truck") || value.includes("pickup")) {
    return Truck;
  }

  if (value.includes("auto")) {
    return Package;
  }

  return Car;
};

const formatVehicleType = (type = "") => {
  return String(type)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* =========================================================
   STATUS BADGE
========================================================= */

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

/* =========================================================
   STAT
========================================================= */

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
   IMAGE UPLOAD
========================================================= */

const ImageUpload = ({ value, onChange, error }) => {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image must be smaller than 5MB.");
      return;
    }

    setLocalError("");

    const preview = URL.createObjectURL(file);

    onChange({
      file,
      preview,
    });
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Vehicle Image
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
            alt="Vehicle preview"
            className="h-44 w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10">
            <span className="max-w-[65%] truncate text-xs font-bold text-white">
              {value.file?.name || "Current vehicle image"}
            </span>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700"
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
            Upload vehicle image
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PNG, JPG or WEBP · Max 5MB
          </p>
        </button>
      )}

      {(error || localError) && (
        <p className="mt-1.5 text-xs font-semibold text-red-500">
          {error || localError}
        </p>
      )}
    </div>
  );
};

/* =========================================================
   ADD / EDIT MODAL
========================================================= */

const VehicleModal = ({
  open,
  onClose,
  onSave,
  editingVehicle,
  services = [],
  loading = false,
}) => {
  const servicesLoading = useSelector(selectServicesLoading);

  const [form, setForm] = useState({
    title: "",
    serviceId: "",
    image: null,
    seat: "",
    type: "sedan",
    fee: "",
    platformCharge: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setForm({
      title: editingVehicle?.title || "",
      serviceId: getServiceId(editingVehicle) || "",
      image: editingVehicle?.image
        ? {
            preview: editingVehicle.image,
            file: null,
          }
        : null,
      seat: editingVehicle?.seat ?? "",
      type: editingVehicle?.type || "sedan",
      fee: editingVehicle?.fee ?? "",
      platformCharge: editingVehicle?.platformCharge ?? "",
      isActive: editingVehicle?.isActive ?? true,
    });

    setErrors({});
  }, [open, editingVehicle]);

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
      nextErrors.title = "Vehicle title is required";
    }

    if (!form.serviceId) {
      nextErrors.serviceId = "Please select a service";
    } else if (!isValidObjectId(form.serviceId)) {
      nextErrors.serviceId = "Invalid service selected";
    } else if (
      services.length > 0 &&
      !services.some((service) => service.id === String(form.serviceId))
    ) {
      nextErrors.serviceId = "Please select a valid service";
    }

    if (!editingVehicle && !form.image?.preview) {
      nextErrors.image = "Vehicle image is required";
    }

    if (!form.type.trim()) {
      nextErrors.type = "Vehicle type is required";
    }

    if (form.fee === "" || Number(form.fee) < 0) {
      nextErrors.fee = "Valid fee is required";
    }

    if (form.platformCharge === "" || Number(form.platformCharge) < 0) {
      nextErrors.platformCharge = "Valid platform charge is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      title: form.title.trim(),
      serviceId: form.serviceId,
      image: form.image?.preview || "",
      imageFile: form.image?.file || null,
      seat: form.seat === "" ? null : Number(form.seat),
      type: form.type.trim().toLowerCase(),
      fee: Number(form.fee),
      platformCharge: Number(form.platformCharge),
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {editingVehicle
                ? "Update vehicle details"
                : "Add a new vehicle to your fleet"}
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
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Vehicle title */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Vehicle Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Honda Activa, Maruti Swift"
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

            {/* Service */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Service
              </label>

              {services.length === 0 && !servicesLoading && (
                <p className="mb-2 text-xs font-semibold text-amber-600">
                  No services with valid IDs are available. Load services from
                  the Services API before adding a vehicle.
                </p>
              )}

              <select
                value={form.serviceId}
                onChange={(e) => updateField("serviceId", e.target.value)}
                disabled={servicesLoading || services.length === 0}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold outline-none transition ${
                  servicesLoading || services.length === 0
                    ? "cursor-not-allowed bg-slate-50 text-slate-400"
                    : ""
                } ${
                  errors.serviceId
                    ? "border-red-300"
                    : "border-slate-200 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                }`}
              >
                <option value="">Select Service</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>

              {errors.serviceId && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.serviceId}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Vehicle Type
              </label>

              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold outline-none transition ${
                  errors.type
                    ? "border-red-300"
                    : "border-slate-200 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                }`}
              >
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="suv">SUV</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="auto">Auto</option>
                <option value="pickup">Pickup</option>
                <option value="mini-truck">Mini Truck</option>
                <option value="truck">Truck</option>
              </select>

              {errors.type && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Image */}
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.image}
                error={errors.image}
                onChange={(value) => updateField("image", value)}
              />
            </div>

            {/* Seats */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Seats
              </label>

              <div className="relative">
                <Users
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="1"
                  value={form.seat}
                  onChange={(e) => updateField("seat", e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Fee */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Fee
              </label>

              <div className="relative">
                <IndianRupee
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fee}
                  onChange={(e) => updateField("fee", e.target.value)}
                  placeholder="0"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-semibold outline-none transition ${
                    errors.fee
                      ? "border-red-300"
                      : "border-slate-200 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />
              </div>

              {errors.fee && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.fee}
                </p>
              )}
            </div>

            {/* Platform charge */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Platform Charge
              </label>

              <div className="relative">
                <IndianRupee
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.platformCharge}
                  onChange={(e) =>
                    updateField("platformCharge", e.target.value)
                  }
                  placeholder="0"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-semibold outline-none transition ${
                    errors.platformCharge
                      ? "border-red-300"
                      : "border-slate-200 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />
              </div>

              {errors.platformCharge && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                  {errors.platformCharge}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    Vehicle Status
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Make this vehicle available for booking
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
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#0757D9] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 hover:bg-[#064bbd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? editingVehicle
                  ? "Saving..."
                  : "Adding..."
                : editingVehicle
                  ? "Save Changes"
                  : "Add Vehicle"}
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

const DeleteModal = ({ open, vehicle, onClose, onConfirm, loading }) => {
  if (!open || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle size={23} />
        </div>

        <h2 className="mt-5 text-xl font-extrabold text-slate-900">
          Delete Vehicle?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-800">{vehicle.title}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   VEHICLE ROW
========================================================= */

const VehicleRow = ({ vehicle, onEdit, onDelete, onToggle }) => {
  const Icon = getVehicleIcon(vehicle.type);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-slate-50/70 sm:grid-cols-[70px_1.2fr_130px_110px_110px_130px_100px] lg:grid-cols-[76px_1.3fr_140px_120px_100px_140px_110px]">
      {/* Image */}
      <div className="hidden sm:block">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon size={21} className="text-slate-400" />
          )}
        </div>
      </div>

      {/* Vehicle */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:hidden">
            {vehicle.image ? (
              <img
                src={vehicle.image}
                alt={vehicle.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon size={20} className="text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-800">
              {vehicle.title}
            </p>
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="hidden sm:block">
        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-[#0757D9]">
          {getServiceName(vehicle)}
        </span>
      </div>

      {/* Type */}
      <div className="hidden sm:block">
        <p className="text-xs font-bold text-slate-600">
          {formatVehicleType(vehicle.type)}
        </p>
      </div>

      {/* Seats */}
      <div className="hidden items-center gap-1.5 text-xs font-bold text-slate-600 sm:flex">
        <Users size={14} className="text-slate-400" />
        {vehicle.seat ?? "-"}
      </div>

      {/* Fee */}
      <div className="hidden sm:block">
        <p className="text-xs font-extrabold text-slate-800">₹{vehicle.fee}</p>

        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
          + ₹{vehicle.platformCharge} platform
        </p>
      </div>

      {/* Status + Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onToggle(vehicle)}
          title="Toggle status"
          className="mr-1"
        >
          <StatusBadge active={vehicle.isActive} />
        </button>

        <button
          onClick={() => onEdit(vehicle)}
          title="Edit vehicle"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-[#0757D9]"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(vehicle)}
          title="Delete vehicle"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN
========================================================= */

const Vehicles = () => {
  const dispatch = useDispatch();

  const reduxVehicles = useSelector(selectVehicles);
  const reduxServices = useSelector(selectServices);
  const servicesError = useSelector(selectServicesError);
  const selectedVehicle = useSelector(selectSelectedVehicle);

  const loading = useSelector(selectVehicleDetailsLoading);
  const createLoading = useSelector(selectVehicleCreateLoading);
  const updateLoading = useSelector(selectVehicleUpdateLoading);
  const deleteLoading = useSelector(selectVehicleDeleteLoading);
  const error = useSelector(selectVehicleError);

  const totalVehiclesFromStore = useSelector(
    (state) => state.vehicle?.totalVehicles || 0,
  );
  const totalPagesFromStore = useSelector(
    (state) => state.vehicle?.totalPages || 1,
  );

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* =======================================================
     QUERY PARAMS HELPER
  ======================================================= */

  const buildQueryParams = (overrides = {}) => ({
    page,
    limit: itemsPerPage,
    search,
    type: typeFilter === "all" ? undefined : typeFilter,
    serviceId: serviceFilter === "all" ? undefined : serviceFilter,
    status: statusFilter === "all" ? undefined : statusFilter === "active",
    ...overrides,
  });

  /* =======================================================
     LOAD SERVICES
  ======================================================= */

  useEffect(() => {
    dispatch(getServices({ page: 1, limit: 100 }));
  }, [dispatch]);

  /* =======================================================
     LOAD VEHICLES
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getVehicles(buildQueryParams()));
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, search, typeFilter, serviceFilter, statusFilter]);

  /* =======================================================
     NORMALIZE API DATA
  ======================================================= */

  const vehicles = useMemo(
    () => (reduxVehicles || []).map(normalizeVehicle).filter(Boolean),
    [reduxVehicles],
  );

  /* =======================================================
     SERVICES (from vehicles + services slice)
  ======================================================= */

  const vehicleServices = useMemo(() => {
    const map = new Map();

    (reduxServices || []).forEach((service) => {
      const id = service?._id || service?.id;
      const title = service?.title || service?.name;
      if (isValidObjectId(id) && title) {
        map.set(id, { id, title });
      }
    });

    vehicles.forEach((vehicle) => {
      const serviceObject =
        typeof vehicle.service === "object" ? vehicle.service : null;

      const id =
        serviceObject?._id || serviceObject?.id || getServiceId(vehicle);

      const title =
        serviceObject?.title ||
        (typeof vehicle.service === "string" ? vehicle.service : null) ||
        getServiceName(vehicle);

      if (isValidObjectId(id) && title && title !== "Unassigned") {
        map.set(id, { id, title });
      }
    });

    return Array.from(map.values());
  }, [vehicles, reduxServices]);

  /* =======================================================
     SERVICE FILTER (client-side fallback)
  ======================================================= */

  const filteredVehicles = useMemo(() => {
    if (serviceFilter === "all") {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) => getServiceId(vehicle) === serviceFilter,
    );
  }, [vehicles, serviceFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalVehicles = totalVehiclesFromStore || vehicles.length;

  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive).length;

  const inactiveVehicles = vehicles.filter(
    (vehicle) => !vehicle.isActive,
  ).length;

  const totalPages = Math.max(1, totalPagesFromStore || 1);

  /* =======================================================
     ADD
  ======================================================= */

  const openAddModal = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEditModal = async (vehicle) => {
    const vehicleId = vehicle?._id || vehicle?.id;

    if (!vehicleId) return;

    try {
      const result = await dispatch(getVehicleById(vehicleId)).unwrap();

      const fetchedVehicle = normalizeVehicle(
        result?.data?.vehicle || result?.data || result?.vehicle || result,
      );

      setEditingVehicle(fetchedVehicle || normalizeVehicle(vehicle));

      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch vehicle:", err);

      setEditingVehicle(normalizeVehicle(vehicle));
      setModalOpen(true);
    }
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const saveVehicle = async (data) => {
    if (!isValidObjectId(data?.serviceId)) {
      console.error("Invalid serviceId:", data?.serviceId);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("serviceId", data.serviceId);
      formData.append("seat", data.seat ?? "");
      formData.append("type", data.type);
      formData.append("fee", String(data.fee));
      formData.append("platformCharge", String(data.platformCharge));
      formData.append("isActive", String(data.isActive));

      if (data.imageFile) {
        formData.append("image", data.imageFile);
      }

      if (editingVehicle) {
        const vehicleId = editingVehicle?._id || editingVehicle?.id;

        await dispatch(
          updateVehicle({
            vehicleId,
            vehicleData: formData,
          }),
        ).unwrap();
      } else {
        await dispatch(createVehicle(formData)).unwrap();
      }

      setModalOpen(false);
      setEditingVehicle(null);

      dispatch(getVehicles(buildQueryParams()));
    } catch (err) {
      console.error("Failed to save vehicle:", err);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const vehicleId = deleteTarget?._id || deleteTarget?.id;

    if (!vehicleId) return;

    try {
      await dispatch(deleteVehicleThunk(vehicleId)).unwrap();

      setDeleteTarget(null);

      if (vehicles.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        dispatch(getVehicles(buildQueryParams()));
      }
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const toggleVehicle = async (vehicle) => {
    const vehicleId = vehicle?._id || vehicle?.id;

    if (!vehicleId) return;

    try {
      const formData = new FormData();

      formData.append("title", vehicle.title || "");
      formData.append("serviceId", getServiceId(vehicle));
      formData.append("seat", vehicle.seat ?? "");
      formData.append("type", vehicle.type || "");
      formData.append("fee", String(vehicle.fee ?? 0));
      formData.append("platformCharge", String(vehicle.platformCharge ?? 0));
      formData.append("isActive", String(!vehicle.isActive));

      await dispatch(
        updateVehicle({
          vehicleId,
          vehicleData: formData,
        }),
      ).unwrap();

      dispatch(getVehicles(buildQueryParams()));
    } catch (err) {
      console.error("Failed to toggle vehicle:", err);
    }
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0757D9]" />

              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#0757D9]">
                Fleet Management
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Vehicles
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage vehicles available across your transportation services.
            </p>
          </div>

          <button
            onClick={openAddModal}
            disabled={createLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#064bbd] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Plus size={18} />
            )}
            Add Vehicle
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        {servicesError && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            <AlertTriangle size={17} />
            {servicesError}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniStat
            label="Total Vehicles"
            value={totalVehicles}
            icon={Car}
            className="bg-blue-50 text-[#0757D9]"
          />

          <MiniStat
            label="Active Vehicles"
            value={activeVehicles}
            icon={Check}
            className="bg-emerald-50 text-emerald-600"
          />

          <MiniStat
            label="Inactive Vehicles"
            value={inactiveVehicles}
            icon={Power}
            className="bg-slate-100 text-slate-500"
          />
        </div>

        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          {/* TOOLBAR */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search vehicles..."
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

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 outline-none focus:border-[#0757D9]"
              >
                <option value="all">All Services</option>

                {vehicleServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 outline-none focus:border-[#0757D9]"
              >
                <option value="all">All Vehicle Types</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="suv">SUV</option>
                <option value="auto">Auto</option>
                <option value="pickup">Pickup</option>
                <option value="mini-truck">Mini Truck</option>
                <option value="truck">Truck</option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE HEADER */}
          <div className="hidden grid-cols-[70px_1.2fr_130px_110px_100px_130px_100px] border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:grid lg:grid-cols-[76px_1.3fr_140px_120px_100px_140px_110px]">
            <span>Image</span>
            <span>Vehicle</span>
            <span>Service</span>
            <span>Type</span>
            <span>Seats</span>
            <span>Fee</span>
            <span className="text-right">Actions</span>
          </div>

          {/* LOADING */}
          {loading && vehicles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#0757D9]" />
              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading vehicles...
              </p>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredVehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onToggle={toggleVehicle}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <Car size={26} />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-800">
                No vehicles found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {/* PAGINATION */}
          {totalVehicles > 0 && (
            <div className="border-t border-slate-100 px-4 py-3">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalVehicles}
                limit={itemsPerPage}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <VehicleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingVehicle(null);
        }}
        onSave={saveVehicle}
        loading={createLoading || updateLoading}
        services={vehicleServices}
        editingVehicle={
          selectedVehicle &&
          editingVehicle &&
          (selectedVehicle?._id || selectedVehicle?.id) ===
            (editingVehicle?._id || editingVehicle?.id)
            ? normalizeVehicle(selectedVehicle)
            : editingVehicle
        }
      />

      {/* DELETE */}
      <DeleteModal
        open={Boolean(deleteTarget)}
        vehicle={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </>
  );
};

export default Vehicles;
