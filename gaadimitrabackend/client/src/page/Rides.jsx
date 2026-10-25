import {
  AlertCircle,
  Ban,
  Bike,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  Search,
  Timer,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

import {
  cancelBooking,
  clearBookingError,
  clearBookingSuccess,
  clearSelectedBooking,
  getBookingById,
  getBookings,
  selectBookingCancelLoading,
  selectBookingDetailsLoading,
  selectBookingError,
  selectBookingLoading,
  selectBookingMessage,
  selectBookingPagination,
  selectBookings,
  selectBookingSuccess,
  selectSelectedBooking,
} from "../reducer/slices/bookingSlice";

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig = {
  requested: {
    label: "Requested",
    className: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
    icon: Timer,
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    icon: CheckCircle2,
  },
  driverArriving: {
    label: "Driver Arriving",
    className: "bg-cyan-50 text-cyan-600",
    dot: "bg-cyan-500",
    icon: Clock3,
  },
  driverArrived: {
    label: "Driver Arrived",
    className: "bg-indigo-50 text-indigo-600",
    dot: "bg-indigo-500",
    icon: MapPin,
  },
  tripStarted: {
    label: "Trip Started",
    className: "bg-violet-50 text-violet-600",
    dot: "bg-violet-500",
    icon: Navigation,
  },
  tripCompleted: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-500",
    dot: "bg-red-500",
    icon: Ban,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-500",
    dot: "bg-rose-500",
    icon: Ban,
  },
  expired: {
    label: "Expired",
    className: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
    icon: Clock3,
  },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "tripStarted", label: "Trip Started" },
  { key: "tripCompleted", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

/* =========================================================
   HELPERS
========================================================= */

const getVehicleIcon = (type) => {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("bike") || normalized.includes("scooter") || normalized.includes("two")) {
    return Bike;
  }
  return Car;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDateTime = (date) => {
  if (!date) return { date: "—", time: "—" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

const getInitials = (name) => {
  if (!name) return "GM";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.requested;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
};

const Avatar = ({ initials, src, size = "small" }) => {
  const classes = size === "large" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";

  if (src) {
    return (
      <img
        src={src}
        alt="avatar"
        className={`shrink-0 rounded-xl object-cover ${classes}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-[#0757D9] ${classes}`}
    >
      {initials}
    </div>
  );
};

/* =========================================================
   RIDE DETAILS MODAL
========================================================= */

const RideDetailsModal = ({
  ride,
  onClose,
  onCancelRide,
  cancelLoading,
}) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!ride) return null;

  const bookingId = ride._id || ride.id;
  const bookingNumber = ride.bookingNumber || bookingId;
  const passenger = ride.userId || {};
  const driver = ride.driverId || {};
  const vehicle = ride.vehicleId || driver.vehicleId || {};
  const service = ride.serviceId || {};
  const vehicleType = vehicle.type || "car";
  const VehicleIcon = getVehicleIcon(vehicleType);

  const pickupAddress =
    ride.pickupLocation?.address || ride.pickupLocation?.title || "—";
  const dropAddress =
    ride.dropLocation?.address || ride.dropLocation?.title || "—";

  const { date: createdDate, time: createdTime } = formatDateTime(ride.createdAt);
  const isTerminal = ["tripCompleted", "cancelled", "rejected", "expired"].includes(ride.status);

  const handleConfirmCancel = () => {
    onCancelRide(bookingId, cancelReason);
    setCancelModalOpen(false);
    setCancelReason("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Ride Details
              </h2>
              <StatusBadge status={ride.status} />
            </div>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              #{bookingNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(92vh-80px)] overflow-y-auto p-5 sm:p-6">
          {/* Route */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#0757D9]">
                  <MapPin size={17} />
                </div>

                <div className="my-1 h-9 w-px border-l border-dashed border-slate-300" />

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Navigation size={16} />
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Pickup Location
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {pickupAddress}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Drop Location
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {dropAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400">DISTANCE</p>
                <p className="mt-1 text-sm font-extrabold text-slate-700">
                  {ride.distance ? `${ride.distance} km` : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400">PAYMENT</p>
                <p className="mt-1 text-sm font-extrabold capitalize text-slate-700">
                  {ride.paymentMethod || "Cash"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400">PAY STATUS</p>
                <p className="mt-1 text-sm font-extrabold capitalize text-slate-700">
                  {ride.paymentStatus || "Pending"}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger + Driver */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Passenger
              </p>

              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  initials={getInitials(passenger.name)}
                  src={passenger.profileImage}
                  size="large"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {passenger.name || "Unknown Passenger"}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Phone size={11} />
                    {passenger.phone || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Driver
              </p>

              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  initials={getInitials(driver.name)}
                  src={driver.profileImage}
                  size="large"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {driver.name || "Not assigned yet"}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Phone size={11} />
                    {driver.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle / Fare */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Vehicle & Service
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                  <VehicleIcon size={19} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {vehicle.title || driver.vehicleModel || "Vehicle"}
                    {driver.vehicleNo ? ` (${driver.vehicleNo})` : ""}
                  </p>

                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                    {service.title || "Standard Ride"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Ride Fare
              </p>

              <div className="mt-3 flex items-center gap-1">
                <IndianRupee size={19} className="text-[#0757D9]" />
                <span className="text-2xl font-extrabold text-slate-900">
                  {ride.fare || 0}
                </span>
              </div>

              {ride.tokenMoney > 0 && (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Token advance: ₹{ride.tokenMoney}
                </p>
              )}
            </div>
          </div>

          {/* Meta & Cancellation */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
              <CalendarDays size={14} />
              Booked: {createdDate}
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
              <Clock3 size={14} />
              {createdTime}
            </div>

            {ride.cancellationReason && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
                <Ban size={14} />
                Reason: {ride.cancellationReason}
              </div>
            )}
          </div>

          {/* Admin Cancel Action (if ride is active) */}
          {!isTerminal && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              {!cancelModalOpen ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
                >
                  <Ban size={15} />
                  Cancel Ride (Admin Action)
                </button>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
                  <p className="text-xs font-extrabold text-red-700">
                    Provide reason for cancellation
                  </p>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Passenger no-show, driver dispute..."
                    className="mt-2 h-10 w-full rounded-xl border border-red-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(false)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      disabled={cancelLoading}
                      onClick={handleConfirmCancel}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Confirm Cancel"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   RIDE ROW (Desktop)
========================================================= */

const RideRow = ({ ride, onView }) => {
  const passenger = ride.userId || {};
  const driver = ride.driverId || {};
  const vehicle = ride.vehicleId || driver.vehicleId || {};
  const vehicleType = vehicle.type || "car";
  const bookingNumber = ride.bookingNumber || ride._id || ride.id;

  const pickupAddress =
    ride.pickupLocation?.address || ride.pickupLocation?.title || "—";
  const dropAddress =
    ride.dropLocation?.address || ride.dropLocation?.title || "—";

  return (
    <div className="grid grid-cols-[1.25fr_1.25fr_1.7fr_120px_100px_80px] items-center gap-4 px-4 py-4 transition hover:bg-slate-50/70 lg:grid-cols-[1.2fr_1.2fr_1.7fr_120px_110px_70px]">
      {/* Passenger */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          initials={getInitials(passenger.name)}
          src={passenger.profileImage}
        />

        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-slate-800">
            {passenger.name || "Passenger"}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
            #{bookingNumber}
          </p>
        </div>
      </div>

      {/* Driver */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          initials={getInitials(driver.name)}
          src={driver.profileImage}
        />

        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-slate-700">
            {driver.name || "Unassigned"}
          </p>

          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
            {vehicle.title || driver.vehicleModel || "Vehicle"}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="mt-1 flex flex-col items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0757D9]" />
            <span className="my-0.5 h-3 border-l border-dashed border-slate-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-slate-600">
              {pickupAddress}
            </p>

            <p className="mt-1 truncate text-[11px] font-bold text-slate-400">
              {dropAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <StatusBadge status={ride.status} />
      </div>

      {/* Amount */}
      <div>
        <p className="text-sm font-extrabold text-slate-800">
          ₹{ride.fare || 0}
        </p>

        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
          {ride.distance ? `${ride.distance} km` : "—"}
        </p>
      </div>

      {/* View */}
      <div className="flex justify-end">
        <button
          onClick={() => onView(ride)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-[#0757D9]"
          title="View ride"
        >
          <Eye size={17} />
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   MOBILE RIDE ITEM
========================================================= */

const MobileRideItem = ({ ride, onView }) => {
  const passenger = ride.userId || {};
  const driver = ride.driverId || {};
  const vehicle = ride.vehicleId || driver.vehicleId || {};
  const bookingNumber = ride.bookingNumber || ride._id || ride.id;

  const pickupAddress =
    ride.pickupLocation?.address || ride.pickupLocation?.title || "—";
  const dropAddress =
    ride.dropLocation?.address || ride.dropLocation?.title || "—";

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            initials={getInitials(passenger.name)}
            src={passenger.profileImage}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-800">
              {passenger.name || "Passenger"}
            </p>

            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
              #{bookingNumber}
            </p>
          </div>
        </div>

        <StatusBadge status={ride.status} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <div className="flex gap-2">
          <Route size={15} className="mt-0.5 shrink-0 text-[#0757D9]" />

          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-600">
              {pickupAddress}
            </p>

            <div className="my-1 border-t border-dashed border-slate-200" />

            <p className="truncate text-xs font-bold text-slate-400">
              {dropAddress}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">
            {driver.name || "Unassigned"}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {vehicle.title || driver.vehicleModel || "Vehicle"}{" "}
            {ride.distance ? `· ${ride.distance} km` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-extrabold text-slate-800">
            ₹{ride.fare || 0}
          </p>

          <button
            onClick={() => onView(ride)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN RIDES COMPONENT
========================================================= */

const Rides = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const bookings = useSelector(selectBookings);
  const loading = useSelector(selectBookingLoading);
  const detailsLoading = useSelector(selectBookingDetailsLoading);
  const cancelLoading = useSelector(selectBookingCancelLoading);
  const pagination = useSelector(selectBookingPagination);
  const error = useSelector(selectBookingError);
  const success = useSelector(selectBookingSuccess);
  const message = useSelector(selectBookingMessage);
  const selectedBooking = useSelector(selectSelectedBooking);

  // Local State
  const [activeTab, setActiveTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const itemsPerPage = 10;

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
     FETCH BOOKINGS
  ======================================================= */
  const fetchBookings = useCallback(() => {
    const params = {
      page,
      limit: itemsPerPage,
    };

    if (activeTab && activeTab !== "all") {
      params.status = activeTab;
    }

    if (debouncedSearch?.trim()) {
      params.search = debouncedSearch.trim();
    }

    dispatch(getBookings(params));
  }, [dispatch, page, activeTab, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */
  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearBookingSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "An error occurred");
      dispatch(clearBookingError());
    }
  }, [error, dispatch]);

  /* =======================================================
     ACTIONS
  ======================================================= */
  const handleViewRide = (ride) => {
    const bookingId = ride._id || ride.id;
    dispatch(getBookingById(bookingId));
    setDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailsModalOpen(false);
    dispatch(clearSelectedBooking());
  };

  const handleCancelRide = async (bookingId, reason) => {
    try {
      await dispatch(cancelBooking({ bookingId, reason })).unwrap();
      fetchBookings();
    } catch {
      // Toast handles error in useEffect
    }
  };

  /* =======================================================
     PAGINATION & STATS
  ======================================================= */
  const totalPages = pagination.totalPages || 1;
  const totalFares = useMemo(() => {
    return bookings.reduce((sum, b) => sum + (Number(b.fare) || 0), 0);
  }, [bookings]);

  return (
    <>
      <div className="space-y-5">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0757D9]" />
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#0757D9]">
                Ride Management
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Rides
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-[#0757D9]">
                {pagination.totalBookings}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Monitor and manage all live and historical rides.
            </p>
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative w-full lg:w-[320px]">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by #ID, user, driver, route..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-[#0757D9] focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              onClick={fetchBookings}
              disabled={loading}
              title="Refresh"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* =================================================
            STATUS TABS
        ================================================= */}

        <div className="rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`group flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-200 sm:px-4 ${
                    active
                      ? "bg-[#0757D9] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            QUICK SUMMARY
        ================================================= */}

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_3px_15px_rgba(15,23,42,0.04)]">
            <CircleDot size={14} className="text-[#0757D9]" />
            <span className="text-xs font-bold text-slate-500">
              {pagination.totalBookings} total rides
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_3px_15px_rgba(15,23,42,0.04)]">
            <IndianRupee size={14} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-500">
              {formatCurrency(totalFares)} page fare
            </span>
          </div>
        </div>

        {/* =================================================
            TABLE & LIST
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          {/* Desktop header */}
          <div className="hidden grid-cols-[1.25fr_1.25fr_1.7fr_120px_100px_80px] items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 lg:grid">
            <span>Passenger</span>
            <span>Driver</span>
            <span>Route</span>
            <span>Status</span>
            <span>Fare</span>
            <span className="text-right">View</span>
          </div>

          {/* Loading Overlay */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#0757D9]" />
              <p className="mt-3 text-sm font-bold text-slate-600">
                Loading rides...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop rows */}
              <div className="hidden divide-y divide-slate-100 lg:block">
                {bookings.length > 0 ? (
                  bookings.map((ride) => (
                    <RideRow
                      key={ride._id || ride.id}
                      ride={ride}
                      onView={handleViewRide}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>

              {/* Mobile */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {bookings.length > 0 ? (
                  bookings.map((ride) => (
                    <MobileRideItem
                      key={ride._id || ride.id}
                      ride={ride}
                      onView={handleViewRide}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && bookings.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={pagination?.totalBookings || 0}
                limit={pagination?.limit || itemsPerPage}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {detailsModalOpen && (
        <RideDetailsModal
          ride={selectedBooking}
          onClose={handleCloseModal}
          onCancelRide={handleCancelRide}
          cancelLoading={cancelLoading}
        />
      )}
    </>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = () => (
  <div className="px-6 py-16 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
      <Route size={26} />
    </div>

    <h3 className="mt-4 text-sm font-extrabold text-slate-800">
      No rides found
    </h3>

    <p className="mt-1 text-xs font-semibold text-slate-400">
      There are no rides matching your current filter or search criteria.
    </p>
  </div>
);

export default Rides;
