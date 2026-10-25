import {
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MapPin,
  MessageSquareText,
  Quote,
  RefreshCw,
  Search,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

import {
  clearRatingError,
  getAllRatings,
  selectRatings,
  selectRatingsError,
  selectRatingsLoading,
  selectRatingsPagination,
  selectRatingsTotal,
} from "../reducer/slices/ratingSlice";

/* =========================================================
   ANIMATION HOOK — counts a numeric value up from 0 to target
========================================================= */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useAnimatedNumber = (target, duration = 800) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setValue(startValue + (target - startValue) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatDateTime = (date) => {
  if (!date) return { date: "—", time: "—" };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Ratings = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const ratings = useSelector(selectRatings);
  const totalRatings = useSelector(selectRatingsTotal);
  const loading = useSelector(selectRatingsLoading);
  const pagination = useSelector(selectRatingsPagination);
  const error = useSelector(selectRatingsError);

  // Local State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(null);

  const itemsPerPage = 10;

  /* =======================================================
     DEBOUNCE SEARCH
  ======================================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =======================================================
     FETCH RATINGS
  ======================================================= */
  const fetchRatingsData = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    if (ratingFilter && ratingFilter !== "all") {
      params.rating = Number(ratingFilter);
    }

    dispatch(getAllRatings(params));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearch, ratingFilter]);

  useEffect(() => {
    fetchRatingsData();
  }, [fetchRatingsData]);

  /* =======================================================
     TOASTS
  ======================================================= */
  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to load ratings");
      dispatch(clearRatingError());
    }
  }, [error, dispatch]);

  /* =======================================================
     CALCULATED STATS & BREAKDOWN
  ======================================================= */
  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    const sum = ratings.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
    return sum / ratings.length;
  }, [ratings]);

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((item) => {
      const r = Math.round(Number(item.rating));
      if (counts[r] !== undefined) {
        counts[r] += 1;
      }
    });
    return counts;
  }, [ratings]);

  const ratingFilters = [
    { key: "all", label: "All Ratings", count: totalRatings },
    { key: "5", label: "5 Star", count: starCounts[5] },
    { key: "4", label: "4 Star", count: starCounts[4] },
    { key: "3", label: "3 Star", count: starCounts[3] },
    { key: "2", label: "2 Star", count: starCounts[2] },
    { key: "1", label: "1 Star", count: starCounts[1] },
  ];

  const totalPages = pagination.totalPages || 1;

  return (
    <>
      <div className="space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0757D9]" />
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#0757D9]">
                Quality & Feedback
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Ratings & Reviews
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-[#0757D9]">
                {totalRatings}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Monitor passenger ratings, driver feedback, and trip service reviews.
            </p>
          </div>

          <button
            onClick={fetchRatingsData}
            disabled={loading}
            title="Refresh Ratings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ================= TOP SUMMARY ================= */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          {/* AVERAGE CARD */}
          <AverageRatingCard
            averageRating={averageRating}
            totalReviews={totalRatings}
          />

          {/* BREAKDOWN CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
            <p className="mb-3 text-xs font-extrabold text-slate-400">
              Rating Breakdown (Current Page)
            </p>

            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] || 0;
                const percentage = ratings.length
                  ? Math.round((count / ratings.length) * 100)
                  : 0;

                return (
                  <RatingBarButton
                    key={star}
                    star={star}
                    count={count}
                    percentage={percentage}
                    active={ratingFilter === String(star)}
                    onClick={() => {
                      setRatingFilter((prev) =>
                        prev === String(star) ? "all" : String(star),
                      );
                      setCurrentPage(1);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* RATING TABS */}
            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 xl:w-auto">
              {ratingFilters.map((filter) => {
                const active = ratingFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => {
                      setRatingFilter(filter.key);
                      setCurrentPage(1);
                    }}
                    className={`flex min-w-max items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-extrabold transition-all duration-200 ${
                      active
                        ? "bg-white text-[#0757D9] shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {filter.key !== "all" && (
                      <Star
                        size={13}
                        fill={active ? "currentColor" : "none"}
                        className={active ? "text-[#0757D9]" : "text-slate-400"}
                      />
                    )}

                    {filter.label}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] transition-colors duration-200 ${
                        active
                          ? "bg-blue-50 text-[#0757D9]"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full xl:max-w-sm">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search user, driver, review text..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#0757D9]" />
              <p className="mt-3 text-sm font-bold text-slate-600">
                Loading ratings & reviews...
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Passenger
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Driver
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Ride #
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Review
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {ratings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <EmptyState />
                        </td>
                      </tr>
                    ) : (
                      ratings.map((item) => {
                        const user = item.fromUserId || {};
                        const driver = item.driverId || {};
                        const driverUser = driver.userId || item.toUserId || {};
                        const booking = item.bookingId || {};
                        const bookingNumber =
                          booking.bookingNumber ||
                          (booking._id ? `#${booking._id.slice(-6).toUpperCase()}` : "—");
                        const { date: reviewDate } = formatDateTime(item.createdAt);

                        return (
                          <tr
                            key={item._id || item.id}
                            className="transition-colors hover:bg-slate-50/60"
                          >
                            {/* USER */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={user.name || "User"}
                                  src={user.profileImage}
                                  type="user"
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-extrabold text-slate-900">
                                    {user.name || "Passenger"}
                                  </p>
                                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                    {user.phone || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* DRIVER */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={driverUser.name || "Driver"}
                                  src={driverUser.profileImage}
                                  type="driver"
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-extrabold text-slate-800">
                                    {driverUser.name || "Driver"}
                                  </p>
                                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                    {driver.vehicleModel || driver.vehicleNo || driverUser.phone || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* RIDE */}
                            <td className="px-6 py-4">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
                                {bookingNumber}
                              </span>
                            </td>

                            {/* RATING */}
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1">
                                <Star
                                  size={13}
                                  fill="currentColor"
                                  className="text-amber-400"
                                />
                                <span className="text-xs font-extrabold text-amber-700">
                                  {Number(item.rating).toFixed(1)}
                                </span>
                              </div>
                            </td>

                            {/* REVIEW */}
                            <td className="max-w-[280px] px-6 py-4">
                              <p className="line-clamp-2 text-xs font-semibold text-slate-700">
                                {item.review || (
                                  <span className="italic text-slate-400">
                                    No written review provided.
                                  </span>
                                )}
                              </p>
                            </td>

                            {/* DATE */}
                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays size={13} className="text-slate-400" />
                                {reviewDate}
                              </div>
                            </td>

                            {/* ACTION */}
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedRating(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#0757D9] transition hover:bg-blue-100"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {ratings.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <EmptyState />
                  </div>
                ) : (
                  ratings.map((item) => {
                    const user = item.fromUserId || {};
                    const driver = item.driverId || {};
                    const driverUser = driver.userId || item.toUserId || {};
                    const booking = item.bookingId || {};
                    const bookingNumber =
                      booking.bookingNumber ||
                      (booking._id ? `#${booking._id.slice(-6).toUpperCase()}` : "—");
                    const { date: reviewDate } = formatDateTime(item.createdAt);

                    return (
                      <div key={item._id || item.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar
                              name={user.name || "User"}
                              src={user.profileImage}
                              type="user"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {user.name || "Passenger"}
                              </p>
                              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                Rated {driverUser.name || "Driver"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                            <Star
                              size={12}
                              fill="currentColor"
                              className="text-amber-400"
                            />
                            <span className="text-xs font-extrabold text-amber-700">
                              {Number(item.rating).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {item.review && (
                          <div className="mt-3 rounded-xl bg-slate-50 p-3">
                            <div className="flex items-start gap-2">
                              <Quote
                                size={14}
                                className="mt-0.5 shrink-0 text-[#0757D9]"
                              />
                              <p className="text-xs font-medium leading-5 text-slate-700">
                                {item.review}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ride #{bookingNumber}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                              {reviewDate}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedRating(item)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* ================= PAGINATION ================= */}
          {!loading && ratings.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalRatings}
                limit={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= REVIEW DETAILS MODAL ================= */}
      {selectedRating && (
        <ReviewModal
          rating={selectedRating}
          onClose={() => setSelectedRating(null)}
        />
      )}
    </>
  );
};

/* =========================================================
   AVERAGE RATING CARD
========================================================= */

const AverageRatingCard = ({ averageRating, totalReviews }) => {
  const animatedAverage = useAnimatedNumber(averageRating, 800);
  const animatedTotal = useAnimatedNumber(totalReviews, 800);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(animatedAverage / 5, 1));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-extrabold text-slate-400">Average Rating</p>

      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="10"
            />

            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-900">
              {animatedAverage.toFixed(1)}
            </span>
            <Star size={13} fill="#F59E0B" className="mt-0.5 text-amber-400" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-0.5">
            <StarRating rating={averageRating} size={16} />
          </div>

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Based on{" "}
            <span className="font-extrabold text-slate-700">
              {Math.round(animatedTotal)}
            </span>{" "}
            total ratings
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   RATING BAR BUTTON
========================================================= */

const RatingBarButton = ({ star, count, percentage, active, onClick }) => {
  const animatedCount = useAnimatedNumber(count, 800);
  const [fillPercentage, setFillPercentage] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFillPercentage(percentage));
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  return (
    <button type="button" onClick={onClick} className="group text-left">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className={`text-xs font-extrabold ${
              active ? "text-[#0757D9]" : "text-slate-700"
            }`}
          >
            {star}
          </span>
          <Star size={12} fill="currentColor" className="text-amber-400" />
        </div>

        <span className="text-[10px] font-bold text-slate-400">
          {Math.round(animatedCount)}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{
            width: `${fillPercentage}%`,
            transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </button>
  );
};

/* =========================================================
   STAR RATING
========================================================= */

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;

        return (
          <Star
            key={star}
            size={size}
            fill={filled ? "currentColor" : "none"}
            className={filled ? "text-amber-400" : "text-slate-300"}
          />
        );
      })}
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ name = "", src, type }) => {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "GM";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
        type === "driver"
          ? "bg-violet-50 text-violet-600"
          : "bg-blue-50 text-[#0757D9]"
      }`}
    >
      {initials}
    </div>
  );
};

/* =========================================================
   REVIEW DETAILS MODAL
========================================================= */

const ReviewModal = ({ rating, onClose }) => {
  const user = rating.fromUserId || {};
  const driver = rating.driverId || {};
  const driverUser = driver.userId || rating.toUserId || {};
  const booking = rating.bookingId || {};
  const bookingNumber =
    booking.bookingNumber ||
    (booking._id ? `#${booking._id.slice(-6).toUpperCase()}` : "—");
  const { date: reviewDate, time: reviewTime } = formatDateTime(
    rating.createdAt,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Trip Rating & Review
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              Booking #{bookingNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-5 p-6">
          {/* USER & DRIVER CARDS */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={user.name || "Passenger"}
                  src={user.profileImage}
                  type="user"
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                    Passenger
                  </p>
                  <p className="mt-0.5 truncate text-sm font-extrabold text-slate-800">
                    {user.name || "Passenger"}
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-400">
                    {user.phone || user.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={driverUser.name || "Driver"}
                  src={driverUser.profileImage}
                  type="driver"
                />

                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                    Driver
                  </p>
                  <p className="mt-0.5 truncate text-sm font-extrabold text-slate-800">
                    {driverUser.name || "Driver"}
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-400">
                    {driver.vehicleModel || driver.vehicleNo || driverUser.phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RATING DISPLAY */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 text-center">
            <p className="text-xs font-extrabold text-amber-700">Passenger Rating</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <StarRating rating={rating.rating} size={24} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {Number(rating.rating).toFixed(1)} / 5.0
            </p>
          </div>

          {/* REVIEW TEXT */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Review Content
            </p>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex gap-3">
                <Quote size={18} className="mt-0.5 shrink-0 text-[#0757D9]" />
                <p className="text-sm font-medium leading-6 text-slate-700">
                  {rating.review || (
                    <span className="italic text-slate-400">
                      The passenger gave a star rating without adding written comments.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* TRIP ROUTE / DATES */}
          <div className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 text-xs">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600">
                {reviewDate} at {reviewTime}
              </span>
            </div>

            {booking.pickupAddress && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#0757D9] shrink-0" />
                <span className="truncate font-semibold text-slate-600">
                  {booking.pickupAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#0757D9] px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#064bbd]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <MessageSquareText size={22} />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-700">No reviews found</p>
      <p className="mt-1 text-xs text-slate-400">
        There are no ratings matching your current search or star filter.
      </p>
    </div>
  );
};

export default Ratings;
