import {
  CalendarDays,
  Check,
  Edit3,
  ImagePlus,
  Link2,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  Trash2,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  clearSettingError,
  clearSettingSuccess,
  getSettings,
  removePromotionImage,
  selectSettingDeleteLoading,
  selectSettingDeleteSuccess,
  selectSettingMessage,
  selectSettings,
  selectSettingsError,
  selectSettingsLoading,
  selectSettingUpdateLoading,
  selectSettingUpdateSuccess,
  updateSettings,
} from "../reducer/slices/settingSlice";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

const TYPE_OPTIONS = [
  {
    value: "user",
    label: "User",
    icon: Users,
    description: "Show promotion to app users",
  },
  {
    value: "driver",
    label: "Driver",
    icon: UserRound,
    description: "Show promotion to drivers",
  },
];

const INITIAL_FORM = {
  type: "user",
  title: "",
  description: "",
  buttonText: "Book Now",
  buttonLink: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const DEFAULT_PROMOTIONS = [
  {
    id: "promo-user-default",
    type: "user",
    title: "Get 20% OFF",
    description: "Book your next ride and get flat 20% off on your first trip.",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
    buttonText: "Book Now",
    buttonLink: "/rides",
    startDate: "2026-09-20",
    endDate: "2026-09-30",
    isActive: true,
  },
  {
    id: "promo-driver-default",
    type: "driver",
    title: "Earn More With GaadiMitra",
    description:
      "Complete more rides this week and unlock exciting bonus rewards.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80",
    buttonText: "View Offer",
    buttonLink: "/driver/offers",
    startDate: "2026-09-18",
    endDate: "2026-10-05",
    isActive: true,
  },
];

const ITEMS_PER_PAGE = 6;

const PromotionPopup = () => {
  const dispatch = useDispatch();

  // Redux state
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);
  const error = useSelector(selectSettingsError);
  const updateLoading = useSelector(selectSettingUpdateLoading);
  const updateSuccess = useSelector(selectSettingUpdateSuccess);
  const deleteLoading = useSelector(selectSettingDeleteLoading);
  const deleteSuccess = useSelector(selectSettingDeleteSuccess);
  const message = useSelector(selectSettingMessage);

  // Local state
  const [promotions, setPromotions] = useState(DEFAULT_PROMOTIONS);
  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // 1. Fetch settings on mount
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  // 2. Sync backend settings into local promotions
  useEffect(() => {
    if (!settings) return;

    let baseList = [];
    if (Array.isArray(settings.extraSettings?.promotions)) {
      baseList = [...settings.extraSettings.promotions];
    } else {
      baseList = [...DEFAULT_PROMOTIONS];
    }

    // Reconcile user promotion image from backend
    if (settings.userPromotionImage) {
      const userIndex = baseList.findIndex((p) => p.type === "user");
      if (userIndex !== -1) {
        baseList[userIndex] = {
          ...baseList[userIndex],
          image: settings.userPromotionImage,
          isActive: settings.isUserPromotionActive !== false,
        };
      } else {
        baseList.unshift({
          id: "promo-user-active",
          type: "user",
          title: "Special User Promotion",
          description: "Exclusive promotional offer for riders.",
          image: settings.userPromotionImage,
          buttonText: "Book Now",
          buttonLink: "/rides",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "2026-12-31",
          isActive: settings.isUserPromotionActive !== false,
        });
      }
    }

    // Reconcile driver promotion image from backend
    if (settings.driverPromotionImage) {
      const driverIndex = baseList.findIndex((p) => p.type === "driver");
      if (driverIndex !== -1) {
        baseList[driverIndex] = {
          ...baseList[driverIndex],
          image: settings.driverPromotionImage,
          isActive: settings.isDriverPromotionActive !== false,
        };
      } else {
        baseList.push({
          id: "promo-driver-active",
          type: "driver",
          title: "Driver Partner Promotion",
          description: "Earn extra bonus on peak rides.",
          image: settings.driverPromotionImage,
          buttonText: "View Details",
          buttonLink: "/driver/offers",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "2026-12-31",
          isActive: settings.isDriverPromotionActive !== false,
        });
      }
    }

    setPromotions(baseList);
  }, [settings]);

  // 3. Handle Toast notifications
  useEffect(() => {
    if (updateSuccess) {
      toast.success(message || "Promotion saved successfully!");
      dispatch(clearSettingSuccess());
    }
  }, [updateSuccess, message, dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success(message || "Promotion deleted successfully!");
      dispatch(clearSettingSuccess());
    }
  }, [deleteSuccess, message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSettingError());
    }
  }, [error, dispatch]);

  /* =========================================================
     FILTER & PAGINATION
  ========================================================= */

  const filteredPromotions = useMemo(() => {
    return promotions.filter((item) => {
      const matchesType = activeType === "all" || item.type === activeType;
      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        item.title?.toLowerCase().includes(searchValue) ||
        item.description?.toLowerCase().includes(searchValue);

      return matchesType && matchesSearch;
    });
  }, [promotions, activeType, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE),
  );

  const paginatedPromotions = useMemo(() => {
    return filteredPromotions.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE,
    );
  }, [filteredPromotions, page]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total = promotions.length;
    const users = promotions.filter((item) => item.type === "user").length;
    const drivers = promotions.filter((item) => item.type === "driver").length;
    const active = promotions.filter((item) => item.isActive).length;

    return { total, users, drivers, active };
  }, [promotions]);

  /* =========================================================
     FORM ACTIONS
  ========================================================= */

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingPromotion(null);
    setShowModal(true);
  };

  const openEditModal = (promotion) => {
    setEditingPromotion(promotion);

    setForm({
      type: promotion.type || "user",
      title: promotion.title || "",
      description: promotion.description || "",
      buttonText: promotion.buttonText || "Book Now",
      buttonLink: promotion.buttonLink || "",
      startDate: promotion.startDate || "",
      endDate: promotion.endDate || "",
      isActive: promotion.isActive !== false,
    });

    setImage(null);
    setImagePreview(promotion.image || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setEditingPromotion(null);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================================================
     IMAGE HANDLING
  ========================================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB.");
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

  /* =========================================================
     SUBMIT / SAVE TO BACKEND
  ========================================================= */

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter promotion title.");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Please enter promotion description.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Please select start and end date.");
      return;
    }

    if (form.startDate > form.endDate) {
      toast.error("End date cannot be before start date.");
      return;
    }

    if (!imagePreview && !image) {
      toast.error("Please upload a promotion image.");
      return;
    }

    // Build the updated promotion item
    const targetId = editingPromotion ? editingPromotion.id : `promo-${Date.now()}`;
    const updatedPromo = {
      id: targetId,
      ...form,
      image: imagePreview,
    };

    let nextPromotions = [];
    if (editingPromotion) {
      nextPromotions = promotions.map((item) =>
        item.id === editingPromotion.id ? updatedPromo : item,
      );
    } else {
      nextPromotions = [updatedPromo, ...promotions];
    }

    // Sync to backend setting
    const formData = new FormData();
    if (image instanceof File) {
      if (form.type === "user") {
        formData.append("userPromotionImage", image);
      } else {
        formData.append("driverPromotionImage", image);
      }
    } else if (imagePreview && !imagePreview.startsWith("blob:")) {
      if (form.type === "user") {
        formData.append("userPromotionImage", imagePreview);
      } else {
        formData.append("driverPromotionImage", imagePreview);
      }
    }

    if (form.type === "user") {
      formData.append("isUserPromotionActive", String(form.isActive));
    } else {
      formData.append("isDriverPromotionActive", String(form.isActive));
    }

    formData.append(
      "extraSettings",
      JSON.stringify({
        ...(settings?.extraSettings || {}),
        promotions: nextPromotions,
      }),
    );

    try {
      await dispatch(updateSettings(formData)).unwrap();
      setPromotions(nextPromotions);
      closeModal();
    } catch {
      // Handled by useEffect error toast
    }
  };

  /* =========================================================
     DELETE ACTION
  ========================================================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const remainingPromotions = promotions.filter(
      (item) => item.id !== deleteTarget.id,
    );

    try {
      // If deleting the active banner type, remove from backend
      if (
        deleteTarget.type === "user" &&
        settings?.userPromotionImage === deleteTarget.image
      ) {
        await dispatch(removePromotionImage("user")).unwrap();
      } else if (
        deleteTarget.type === "driver" &&
        settings?.driverPromotionImage === deleteTarget.image
      ) {
        await dispatch(removePromotionImage("driver")).unwrap();
      }

      // Update extraSettings list
      await dispatch(
        updateSettings({
          extraSettings: {
            ...(settings?.extraSettings || {}),
            promotions: remainingPromotions,
          },
        }),
      ).unwrap();

      setPromotions(remainingPromotions);
      setDeleteTarget(null);

      const newTotalPages = Math.max(
        1,
        Math.ceil(remainingPromotions.length / ITEMS_PER_PAGE),
      );
      if (page > newTotalPages) {
        setPage(newTotalPages);
      }
    } catch {
      // Handled in useEffect
    }
  };

  /* =========================================================
     TOGGLE STATUS ACTION
  ========================================================= */

  const handleToggleStatus = async (promo) => {
    const newActive = !promo.isActive;
    const nextPromotions = promotions.map((item) =>
      item.id === promo.id ? { ...item, isActive: newActive } : item,
    );

    setPromotions(nextPromotions);

    const payload = {
      extraSettings: {
        ...(settings?.extraSettings || {}),
        promotions: nextPromotions,
      },
    };

    if (promo.type === "user") {
      payload.isUserPromotionActive = newActive;
    } else {
      payload.isDriverPromotionActive = newActive;
    }

    try {
      await dispatch(updateSettings(payload)).unwrap();
      toast.success(
        `${promo.title || "Promotion"} ${newActive ? "activated" : "deactivated"}!`,
      );
    } catch {
      // Revert if error
      setPromotions(promotions);
    }
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getTypeConfig = (type) =>
    TYPE_OPTIONS.find((item) => item.value === type) || TYPE_OPTIONS[0];

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const selectedTypeConfig = getTypeConfig(form.type);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0757D9] text-white shadow-sm">
              <Megaphone size={20} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Promotion Popup
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage promotional popups, modal banners, and campaigns for users & drivers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(getSettings())}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-[#0757D9]" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-4 text-xs font-extrabold text-white shadow-[0_6px_18px_rgba(7,87,217,0.22)] transition hover:bg-blue-700"
          >
            <Plus size={16} />
            <span>Add Promotion</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS BOXES
      ====================================================== */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatBox
          label="Total Promotions"
          value={stats.total}
          icon={Megaphone}
        />
        <StatBox label="User Promotions" value={stats.users} icon={Users} />
        <StatBox
          label="Driver Promotions"
          value={stats.drivers}
          icon={UserRound}
        />
        <StatBox label="Active Campaigns" value={stats.active} icon={Zap} />
      </div>

      {/* =====================================================
          MAIN CARD WITH TOOLBAR & TABLE
      ====================================================== */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Type Tabs */}
            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 xl:w-auto">
              {[
                { value: "all", label: "All", count: promotions.length },
                { value: "user", label: "User", count: stats.users },
                { value: "driver", label: "Driver", count: stats.drivers },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => {
                    setActiveType(tab.value);
                    setPage(1);
                  }}
                  className={`flex min-w-[90px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                    activeType === tab.value
                      ? "bg-white text-[#0757D9] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeType === tab.value
                        ? "bg-blue-50 text-[#0757D9]"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full xl:w-[280px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search promotions..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Promotion Banner
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Target Type
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Campaign Period
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedPromotions.map((promotion) => {
                const typeConfig = getTypeConfig(promotion.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <tr
                    key={promotion.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    {/* Promotion Details */}
                    <td className="px-5 py-4">
                      <div className="flex min-w-[340px] items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                          {promotion.image ? (
                            <img
                              src={promotion.image}
                              alt={promotion.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <ImagePlus size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-800">
                            {promotion.title}
                          </p>
                          <p className="mt-1 line-clamp-1 max-w-[320px] text-xs font-medium text-slate-400">
                            {promotion.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Target Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          promotion.type === "driver"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-[#0757D9]"
                        }`}
                      >
                        <TypeIcon size={13} />
                        <span className="capitalize">{typeConfig.label}</span>
                      </span>
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <CalendarDays size={14} className="text-slate-400" />
                        <span>{formatDate(promotion.startDate)}</span>
                        <span className="text-slate-300">→</span>
                        <span>{formatDate(promotion.endDate)}</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(promotion)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold transition ${
                          promotion.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            promotion.isActive
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span>{promotion.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(promotion)}
                          title="Edit promotion"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9]"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(promotion)}
                          title="Delete promotion"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedPromotions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="divide-y divide-slate-100 lg:hidden">
          {paginatedPromotions.map((promotion) => {
            const typeConfig = getTypeConfig(promotion.type);
            const TypeIcon = typeConfig.icon;

            return (
              <div key={promotion.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                    {promotion.image ? (
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImagePlus size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          promotion.type === "driver"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-[#0757D9]"
                        }`}
                      >
                        <TypeIcon size={11} />
                        <span className="capitalize">{typeConfig.label}</span>
                      </span>
                    </div>

                    <h4 className="mt-1 truncate text-xs font-extrabold text-slate-900">
                      {promotion.title}
                    </h4>

                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                      {promotion.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(promotion)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      promotion.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        promotion.isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <span>{promotion.isActive ? "Active" : "Inactive"}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(promotion)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(promotion)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {paginatedPromotions.length === 0 && (
            <div className="py-10 text-center">
              <EmptyState />
            </div>
          )}
        </div>

        {/* =====================================================
            MODERN PREMIUM PAGINATION
        ====================================================== */}
        {filteredPromotions.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredPromotions.length}
              limit={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      {/* =====================================================
          ADD / EDIT PROMOTION MODAL (WITH LIVE PREVIEW)
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingPromotion ? "Edit Promotion Banner" : "Create New Promotion Popup"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Configure promotion image, audience, display dates, and action button.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={updateLoading}
                className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12">
              {/* Form Side */}
              <div className="p-6 space-y-4 lg:col-span-7">
                {/* Target Audience */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = form.type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField("type", opt.value)}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-[#0757D9] bg-blue-50/60 text-[#0757D9]"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={18} />
                          <div>
                            <p className="text-xs font-extrabold">{opt.label}</p>
                            <p className="text-[10px] text-slate-400">
                              {opt.value === "user" ? "Riders & Customers" : "Driver Partners"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Promotion Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Flat 20% Off on Weekend Rides"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-bold text-slate-800 outline-none transition focus:border-[#0757D9] focus:bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Brief description about the discount, coupon code, or campaign details..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0757D9] focus:bg-white"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Promotion Banner Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 rounded-lg bg-red-600 p-1.5 text-white shadow hover:bg-red-700"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-[#0757D9] hover:bg-blue-50/30 hover:text-[#0757D9]"
                    >
                      <ImagePlus size={20} />
                      <span className="mt-1 text-xs font-bold">
                        Click to upload image (Max 5MB)
                      </span>
                    </button>
                  )}
                </div>

                {/* Date Schedule */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0757D9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => updateField("endDate", e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0757D9] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Button Text & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={form.buttonText}
                      onChange={(e) => updateField("buttonText", e.target.value)}
                      placeholder="e.g. Book Now"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0757D9] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Action Link / Route
                    </label>
                    <input
                      type="text"
                      value={form.buttonLink}
                      onChange={(e) => updateField("buttonLink", e.target.value)}
                      placeholder="e.g. /rides or /offers"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0757D9] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-xs font-bold text-slate-700">
                    Set Promotion as Active Immediately
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0757D9] focus:ring-[#0757D9]"
                  />
                </label>
              </div>

              {/* Mobile Phone Mockup Preview Side */}
              <div className="flex flex-col items-center justify-center border-t border-slate-100 bg-slate-50 p-6 lg:border-l lg:border-t-0 lg:col-span-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Smartphone size={15} />
                  <span>Live App Modal Preview</span>
                </div>

                <div className="relative h-[380px] w-[210px] overflow-hidden rounded-[28px] border-4 border-slate-800 bg-slate-900 shadow-xl">
                  {/* Notch */}
                  <div className="absolute left-1/2 top-1.5 z-20 h-3 w-16 -translate-x-1/2 rounded-full bg-slate-800" />

                  {/* App Screen Overlay */}
                  <div className="relative flex h-full w-full flex-col justify-center bg-slate-950/70 p-3 backdrop-blur-[1px]">
                    {/* The Popup Card inside phone */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                      <div className="h-28 w-full bg-slate-200">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Mockup"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <ImagePlus size={22} />
                          </div>
                        )}
                      </div>

                      <div className="p-3 text-center">
                        <h4 className="truncate text-xs font-extrabold text-slate-900">
                          {form.title || "Your Promotion Title"}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                          {form.description || "Promotion offer details will appear here."}
                        </p>

                        <button
                          type="button"
                          className="mt-3 flex h-8 w-full items-center justify-center rounded-lg bg-[#0757D9] text-[10px] font-extrabold text-white"
                        >
                          {form.buttonText || "Book Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-3.5">
              <button
                type="button"
                onClick={closeModal}
                disabled={updateLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={updateLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {updateLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>{editingPromotion ? "Update Promotion" : "Create Promotion"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Promotion Banner?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title || "this promotion"}"? This action will remove it from the mobile apps.`}
        confirmText="Yes, Delete Promotion"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

/* =========================================================
   STAT BOX COMPONENT
========================================================= */

const StatBox = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY STATE COMPONENT
========================================================= */

const EmptyState = () => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Megaphone size={22} />
      </div>
      <h3 className="mt-3 text-sm font-extrabold text-slate-700">
        No promotions found
      </h3>
      <p className="mt-1 max-w-sm text-xs font-medium text-slate-400">
        Try adjusting your search query or filter by a different audience type.
      </p>
    </div>
  );
};

export default PromotionPopup;
