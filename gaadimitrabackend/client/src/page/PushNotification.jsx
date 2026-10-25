import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  ImagePlus,
  Inbox,
  Link2,
  Loader2,
  Megaphone,
  MessageSquareText,
  Radio,
  RefreshCcw,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  Tag,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

import {
  clearNotificationsError,
  clearSendNotificationStatus,
  getAdminNotifications,
  selectLastSentNotificationResult,
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsPagination,
  selectNotificationsTotal,
  selectSendNotificationError,
  selectSendNotificationLoading,
  selectSendNotificationSuccess,
  sendPushNotification,
} from "../reducer/slices/adminSlice";

/* =========================================================
   OPTIONS & CONSTANTS
========================================================= */

const AUDIENCE_OPTIONS = [
  {
    value: "all",
    label: "All Users & Drivers",
    description: "Send to all registered users and drivers",
  },
  {
    value: "users",
    label: "Passengers Only",
    description: "Send to registered passenger accounts",
  },
  {
    value: "drivers",
    label: "Drivers Only",
    description: "Send to active registered drivers",
  },
];

const TYPE_OPTIONS = [
  { value: "general", label: "General", color: "bg-blue-50 text-blue-600" },
  {
    value: "promotion",
    label: "Promotion",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    value: "announcement",
    label: "Announcement",
    color: "bg-purple-50 text-purple-600",
  },
  {
    value: "admin_alert",
    label: "Urgent Alert",
    color: "bg-rose-50 text-rose-600",
  },
];

const INITIAL_FORM = {
  title: "Your ride is waiting 🚗",
  message:
    "Book your next ride with GaadiMitra and enjoy a smooth, comfortable journey.",
  audience: "all",
  type: "general",
  actionUrl: "",
};

const formatDateTime = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const PushNotification = () => {
  const dispatch = useDispatch();

  // Redux Selectors
  const notifications = useSelector(selectNotifications);
  const notificationsTotal = useSelector(selectNotificationsTotal);
  const notificationsLoading = useSelector(selectNotificationsLoading);
  const pagination = useSelector(selectNotificationsPagination);
  const sending = useSelector(selectSendNotificationLoading);
  const sendSuccess = useSelector(selectSendNotificationSuccess);
  const sendError = useSelector(selectSendNotificationError);
  const lastResult = useSelector(selectLastSentNotificationResult);

  // View Mode: 'compose' or 'history'
  const [activeView, setActiveView] = useState("compose");

  // Form State
  const [form, setForm] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showAudience, setShowAudience] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const fileInputRef = useRef(null);

  // History Filters & Pagination
  const [historySearch, setHistorySearch] = useState("");
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState("");
  const [historyType, setHistoryType] = useState("all");
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;

  /* =======================================================
     DEBOUNCE HISTORY SEARCH
  ======================================================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHistorySearch(historySearch);
      setHistoryPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [historySearch]);

  /* =======================================================
     FETCH NOTIFICATIONS (HISTORY)
  ======================================================= */
  const fetchNotifications = useCallback(() => {
    const params = {
      page: historyPage,
      limit: historyLimit,
    };

    if (debouncedHistorySearch.trim()) {
      params.search = debouncedHistorySearch.trim();
    }

    if (historyType && historyType !== "all") {
      params.type = historyType;
    }

    dispatch(getAdminNotifications(params));
  }, [dispatch, historyPage, historyLimit, debouncedHistorySearch, historyType]);

  useEffect(() => {
    if (activeView === "history") {
      fetchNotifications();
    }
  }, [activeView, fetchNotifications]);

  /* =======================================================
     TOAST NOTIFICATIONS & STATUS
  ======================================================= */
  useEffect(() => {
    if (sendSuccess) {
      toast.success("Push notification dispatched successfully!");
      setShowSuccessCard(true);
      dispatch(clearSendNotificationStatus());
      // Refresh history in background
      fetchNotifications();
    }
  }, [sendSuccess, dispatch, fetchNotifications]);

  useEffect(() => {
    if (sendError) {
      toast.error(typeof sendError === "string" ? sendError : "Failed to send notification");
      dispatch(clearSendNotificationStatus());
    }
  }, [sendError, dispatch]);

  /* =======================================================
     FORM HANDLERS
  ======================================================= */
  const selectedAudience = useMemo(
    () =>
      AUDIENCE_OPTIONS.find((item) => item.value === form.audience) ||
      AUDIENCE_OPTIONS[0],
    [form.audience],
  );

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowSuccessCard(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setImage(null);
    setImagePreview("");
    setShowSuccessCard(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a notification title.");
      return;
    }

    if (!form.message.trim()) {
      toast.error("Please enter a notification message.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      body: form.message.trim(),
      type: form.type || "general",
      target: form.audience || "all",
      data: {},
    };

    if (form.actionUrl.trim()) {
      payload.data.actionUrl = form.actionUrl.trim();
    }

    dispatch(sendPushNotification(payload));
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0757D9] text-white shadow-md shadow-blue-500/20">
              <Bell size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Push Notifications
              </h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:text-sm">
                Broadcast announcements, alerts, and promotions to users & drivers.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveView("compose")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                activeView === "compose"
                  ? "bg-white text-[#0757D9] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Megaphone size={15} />
              Send Notification
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("history");
                setHistoryPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                activeView === "history"
                  ? "bg-white text-[#0757D9] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History size={15} />
              History & Logs
              {notificationsTotal > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-[#0757D9]">
                  {notificationsTotal}
                </span>
              )}
            </button>
          </div>

          {activeView === "compose" ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={14} />
              Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={notificationsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={notificationsLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          VIEW 1: COMPOSE NOTIFICATION
      ====================================================== */}
      {activeView === "compose" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* LEFT - NOTIFICATION COMPOSER */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            {/* Section Header */}
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                  <Megaphone size={19} />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Create Push Notification
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Select your target audience and compose your broadcast.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* AUDIENCE SELECT */}
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <Users size={16} className="text-slate-400" />
                  Target Audience
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAudience((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 focus:border-[#0757D9] focus:outline-none focus:ring-4 focus:ring-blue-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0757D9]">
                        <Users size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                          {selectedAudience.label}
                        </p>
                        <p className="truncate text-xs font-medium text-slate-500">
                          {selectedAudience.description}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition ${
                        showAudience ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showAudience && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      {AUDIENCE_OPTIONS.map((option) => {
                        const active = form.audience === option.value;

                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                              updateField("audience", option.value);
                              setShowAudience(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                              active ? "bg-blue-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                active
                                  ? "bg-[#0757D9] text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Users size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-slate-800">
                                {option.label}
                              </p>
                              <p className="text-xs font-medium text-slate-500">
                                {option.description}
                              </p>
                            </div>

                            {active && (
                              <div className="ml-auto h-2 w-2 rounded-full bg-[#0757D9]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* NOTIFICATION TYPE */}
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <Tag size={16} className="text-slate-400" />
                  Notification Category
                </label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TYPE_OPTIONS.map((t) => {
                    const active = form.type === t.value;
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => updateField("type", t.value)}
                        className={`flex h-10 items-center justify-center rounded-xl border px-3 text-xs font-extrabold transition ${
                          active
                            ? "border-[#0757D9] bg-blue-50/70 text-[#0757D9] ring-2 ring-blue-500/20"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TITLE */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <Bell size={16} className="text-slate-400" />
                    Notification Title
                    <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs font-bold text-slate-400">
                    {form.title.length}/150
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={150}
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter notification title"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* MESSAGE BODY */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                    <MessageSquareText size={16} className="text-slate-400" />
                    Message Content
                    <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs font-bold text-slate-400">
                    {form.message.length}/1500
                  </span>
                </div>

                <textarea
                  rows={4}
                  maxLength={1500}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Write your push notification message..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* IMAGE UPLOAD (PREVIEW) */}
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <ImagePlus size={16} className="text-slate-400" />
                  Preview Image
                  <span className="text-xs font-semibold text-slate-400">(Optional visual display)</span>
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex min-h-[110px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-5 text-center transition hover:border-[#0757D9] hover:bg-blue-50/30"
                  >
                    <ImagePlus size={20} className="mb-2 text-slate-400 transition group-hover:text-[#0757D9]" />
                    <p className="text-xs font-extrabold text-slate-700">
                      Upload preview image
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                      PNG, JPG or WEBP
                    </p>
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="Notification preview"
                      className="h-36 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white backdrop-blur-sm transition hover:bg-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* ACTION URL */}
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <Link2 size={16} className="text-slate-400" />
                  Target Deep Link / Route
                  <span className="text-xs font-semibold text-slate-400">(Optional)</span>
                </label>

                <div className="relative">
                  <Link2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={form.actionUrl}
                    onChange={(e) => updateField("actionUrl", e.target.value)}
                    placeholder="e.g. /rides or /subscriptions"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* DISPATCH FEEDBACK CARD */}
              {showSuccessCard && lastResult && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <CheckCircle2 size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-emerald-900">
                        Broadcast Completed Successfully
                      </p>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                        <div className="rounded-lg bg-white/80 p-2 shadow-xs">
                          <span className="font-semibold text-slate-400">Targeted Users</span>
                          <p className="mt-0.5 text-sm font-black text-slate-800">
                            {lastResult.targetedCount ?? 0}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/80 p-2 shadow-xs">
                          <span className="font-semibold text-slate-400">Tokens Registered</span>
                          <p className="mt-0.5 text-sm font-black text-slate-800">
                            {lastResult.deviceTokensCount ?? 0}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/80 p-2 shadow-xs">
                          <span className="font-semibold text-emerald-600">Dispatched Push</span>
                          <p className="mt-0.5 text-sm font-black text-emerald-700">
                            {lastResult.successPushCount ?? 0}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/80 p-2 shadow-xs">
                          <span className="font-semibold text-slate-400">Delivery Mode</span>
                          <p className="mt-0.5 text-sm font-black uppercase text-[#0757D9]">
                            {lastResult.mode || "fcm"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveView("history")}
                          className="text-xs font-extrabold text-[#0757D9] hover:underline"
                        >
                          View Logs in History →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={sending}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Clear Form
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(7,87,217,0.22)] transition hover:bg-[#064bbd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Push Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT - PHONE PREVIEW */}
          <section className="xl:sticky xl:top-[90px] xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Smartphone size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Live Notification Preview
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500">
                      Simulated lock screen view
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center bg-[#eef2f7] px-4 py-6">
                <div className="relative w-full max-w-[280px]">
                  {/* Phone Frame */}
                  <div className="relative overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.25)]">
                    {/* Screen */}
                    <div className="relative min-h-[520px] overflow-hidden bg-gradient-to-b from-[#91a9c8] via-[#d9e1eb] to-[#f3f5f8]">
                      {/* Wallpaper shapes */}
                      <div className="absolute -right-16 top-16 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
                      <div className="absolute -left-16 bottom-16 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />

                      {/* Status Bar */}
                      <div className="relative z-10 flex items-center justify-between px-4 pt-2.5 text-[9px] font-extrabold text-white drop-shadow-sm">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px]">5G</span>
                          <div className="h-2 w-4 rounded-[2px] border border-white/80" />
                        </div>
                      </div>

                      {/* Lockscreen Time */}
                      <div className="relative z-10 px-4 pt-8 text-white drop-shadow-md">
                        <p className="text-[34px] font-light leading-none tracking-tight">
                          9:41
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-white/90">
                          GaadiMitra Alert
                        </p>
                      </div>

                      {/* Push Notification Bubble */}
                      <div className="relative z-10 mt-7 px-3">
                        <div className="overflow-hidden rounded-[18px] border border-white/40 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                          <div className="flex items-center gap-2.5 px-3.5 pb-2 pt-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#0757D9] text-white shadow-xs">
                              <span className="text-xs font-black">G</span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-800">
                                  GaadiMitra
                                </p>
                                <span className="text-[8px] font-bold text-slate-400">
                                  now
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="px-3.5 pb-3.5">
                            <p className="text-[12px] font-extrabold leading-4 text-slate-900">
                              {form.title || "Notification Title"}
                            </p>
                            <p className="mt-1 text-[10px] font-medium leading-[15px] text-slate-600">
                              {form.message || "Your notification message will appear here."}
                            </p>

                            {imagePreview && (
                              <div className="mt-2.5 overflow-hidden rounded-xl">
                                <img
                                  src={imagePreview}
                                  alt="Notification"
                                  className="h-24 w-full object-cover"
                                />
                              </div>
                            )}

                            {form.actionUrl && (
                              <div className="mt-2 flex items-center gap-1 text-[9px] font-extrabold text-[#0757D9]">
                                <Link2 size={10} />
                                Tap to open {form.actionUrl}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom home indicator */}
                      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center">
                        <div className="h-1 w-24 rounded-full bg-white/70 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Island Notch */}
                  <div className="absolute left-1/2 top-[10px] z-30 h-[18px] w-[80px] -translate-x-1/2 rounded-full bg-black" />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-xs">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-extrabold text-slate-600">
                    Live target: {selectedAudience.label}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          VIEW 2: NOTIFICATION HISTORY & LOGS
      ====================================================== */}
      {activeView === "history" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            {/* Type filters */}
            <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1">
              {[
                { key: "all", label: "All Types" },
                { key: "general", label: "General" },
                { key: "promotion", label: "Promotion" },
                { key: "announcement", label: "Announcement" },
                { key: "admin_alert", label: "Alerts" },
              ].map((t) => {
                const active = historyType === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setHistoryType(t.key);
                      setHistoryPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-white text-[#0757D9] shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history by title or message..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {notificationsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#0757D9]" />
                <p className="mt-3 text-xs font-bold text-slate-500">
                  Loading notification logs...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Inbox size={24} />
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-slate-700">
                  No notifications found
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  There are no notification logs matching your filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3.5">Recipient</th>
                      <th className="px-5 py-3.5">Notification</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Sent Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {notifications.map((n) => {
                      const recipient = n.recipientId || {};
                      const typeConfig =
                        TYPE_OPTIONS.find((t) => t.value === n.type) || {
                          label: n.type || "General",
                          color: "bg-slate-100 text-slate-600",
                        };

                      return (
                        <tr key={n._id || n.id} className="hover:bg-slate-50/60">
                          {/* Recipient */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-[#0757D9]">
                                {recipient.name ? recipient.name[0].toUpperCase() : "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-extrabold text-slate-800">
                                  {recipient.name || "Broadcast User"}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400">
                                  {recipient.phone || recipient.email || recipient.role || "User"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Title & Body */}
                          <td className="px-5 py-4 max-w-md">
                            <p className="font-extrabold text-slate-900">
                              {n.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                              {n.body}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-extrabold capitalize ${typeConfig.color}`}
                            >
                              {typeConfig.label}
                            </span>
                          </td>

                          {/* Read status */}
                          <td className="px-5 py-4">
                            {n.isRead ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600">
                                <CheckCircle2 size={13} />
                                Read
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                <Clock3 size={13} />
                                Delivered
                              </span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="px-5 py-4 text-right font-medium text-slate-400">
                            {formatDateTime(n.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!notificationsLoading && notifications.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <Pagination
                  currentPage={historyPage}
                  totalPages={totalPages}
                  totalItems={notificationsTotal}
                  limit={historyLimit}
                  onPageChange={(p) => setHistoryPage(p)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotification;
