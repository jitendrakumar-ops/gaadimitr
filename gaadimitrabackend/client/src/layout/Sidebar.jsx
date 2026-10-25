import {
  BellRing,
  Bike,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Crown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Route,
  Settings2,
  ShieldCheck,
  Star,
  UserRoundCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { adminLogout, getAdminAccountById } from "../reducer/slices/adminSlice";

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    admin,
    selectedAccount,
    accountLoading,
    logoutLoading,
    isAuthenticated,
  } = useSelector((state) => state.admin);

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    // {
    //   label: "Chat",
    //   path: "/admin/chat",
    //   icon: MessageSquareText,
    // },
    {
      label: "Services",
      path: "/admin/services",
      icon: Wrench,
    },
    {
      label: "Vehicles",
      path: "/admin/vehicles",
      icon: CarFront,
    },
    {
      label: "Rides",
      path: "/admin/rides",
      icon: Route,
    },
    {
      label: "Drivers",
      path: "/admin/drivers",
      icon: UserRoundCheck,
    },
    {
      label: "Subscriptions",
      path: "/admin/subscriptions",
      icon: Crown,
    },
    {
      label: "User Subscriptions",
      path: "/admin/user-subscriptions",
      icon: CreditCard,
    },
    {
      label: "Ratings",
      path: "/admin/ratings",
      icon: Star,
    },
    {
      label: "Push Notifications",
      path: "/admin/push-notifications",
      icon: BellRing,
    },
    {
      label: "Promotion Popups",
      path: "/admin/promotion-popup",
      icon: Megaphone,
    },
    {
      label: "Support",
      path: "/admin/support",
      icon: CircleHelp,
    },
  ];

  // =====================================================
  // GET ADMIN ID
  // =====================================================

  const adminId = admin?._id || admin?.id || admin?.userId || admin?.accountId;

  // =====================================================
  // GET ADMIN PROFILE
  // =====================================================

  useEffect(() => {
    if (!adminId) return;

    // Avoid unnecessary request if profile is already loaded
    if (selectedAccount?._id === adminId) return;

    dispatch(getAdminAccountById(adminId));
  }, [dispatch, adminId, selectedAccount?._id]);

  // =====================================================
  // PROFILE DATA
  // =====================================================

  const profile = selectedAccount || admin || {};

  const adminName = profile?.name || profile?.fullName || "Admin";

  const adminEmail = profile?.email || "";

  const adminRole =
    profile?.role === "admin"
      ? "Super Admin"
      : profile?.role
        ? profile.role
        : "Admin";

  const profileImage =
    profile?.profileImage || profile?.avatar || profile?.image || null;

  const initials = adminName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    if (logoutLoading) return;

    try {
      await dispatch(adminLogout()).unwrap();

      setMobileOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin logout error:", error);

      // Even if backend logout fails,
      // local Redux state is cleared by the thunk.
      navigate("/login", {
        replace: true,
      });
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[3px] lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          border-r border-slate-200/80
          bg-white
          shadow-[4px_0_24px_rgba(15,23,42,0.025)]
          transition-all duration-300 ease-in-out

          ${collapsed ? "w-[78px]" : "w-[264px]"}

          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* =================================================
            LOGO AREA
        ================================================== */}

        <div
          className={`
            relative flex h-[76px] items-center
            border-b border-slate-100
            ${collapsed ? "justify-center px-3" : "px-5"}
          `}
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}

            <div
              className="
                relative flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-[13px]
                bg-[#0757D9]
                text-white
                shadow-[0_8px_22px_rgba(7,87,217,0.22)]
              "
            >
              <Bike size={22} strokeWidth={2.2} />

              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-[18px] font-extrabold tracking-[-0.7px] text-slate-900">
                  Gaadi<span className="text-[#0757D9]">Mitra</span>
                </h1>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-[1.4px] text-slate-400">
                    Admin Console
                  </span>

                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Close */}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
              ml-auto flex h-9 w-9 items-center justify-center
              rounded-xl text-slate-400
              transition hover:bg-slate-100 hover:text-slate-700
              lg:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <div className="flex h-[calc(100vh-76px)] flex-col">
          <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-5">
            {!collapsed && (
              <div className="mb-3 flex items-center justify-between px-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[1.6px] text-slate-400">
                  Main Menu
                </p>

                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-extrabold text-slate-400">
                  ADMIN
                </span>
              </div>
            )}

            {collapsed && (
              <div className="mb-3 flex justify-center">
                <div className="h-1 w-5 rounded-full bg-slate-200" />
              </div>
            )}

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin"}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : ""}
                    className={({ isActive }) => `
                      group relative flex items-center
                      rounded-xl
                      transition-all duration-200

                      ${
                        collapsed
                          ? "justify-center px-2 py-3"
                          : "gap-3 px-3 py-[10px]"
                      }

                      ${
                        isActive
                          ? "bg-[#0757D9] text-white shadow-[0_7px_18px_rgba(7,87,217,0.18)]"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !collapsed && (
                          <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#0757D9]" />
                        )}

                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center
                            rounded-lg
                            transition-all duration-200

                            ${
                              isActive
                                ? "bg-white/15 text-white"
                                : "bg-transparent text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0757D9]"
                            }
                          `}
                        >
                          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.9} />
                        </span>

                        {!collapsed && (
                          <span
                            className={`
                              truncate text-[12.5px] font-bold
                              ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-600 group-hover:text-slate-900"
                              }
                            `}
                          >
                            {item.label}
                          </span>
                        )}

                        {isActive && collapsed && (
                          <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* =================================================
              BOTTOM AREA
          ================================================== */}

          <div className="border-t border-slate-100 p-3">
            {/* =================================================
                ADMIN PROFILE
            ================================================== */}

            {!collapsed && (
              <div
                className="
                  mb-2 flex items-center gap-3
                  rounded-xl bg-slate-50
                  px-3 py-2.5
                "
              >
                {/* Profile Image / Initials */}

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0757D9] text-xs font-extrabold text-white">
                  {accountLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt={adminName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    initials || "AD"
                  )}

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-50 bg-emerald-400" />
                </div>

                {/* Profile Details */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-slate-800">
                    {adminName}
                  </p>

                  <div className="mt-0.5 flex items-center gap-1">
                    <ShieldCheck
                      size={10}
                      className="shrink-0 text-[#0757D9]"
                    />

                    <p className="truncate text-[9px] font-bold capitalize text-slate-400">
                      {adminRole}
                    </p>
                  </div>

                  {adminEmail && (
                    <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400">
                      {adminEmail}
                    </p>
                  )}
                </div>

                <Settings2 size={15} className="shrink-0 text-slate-300" />
              </div>
            )}

            {/* =================================================
                COLLAPSED PROFILE
            ================================================== */}

            {collapsed && (
              <div
                className="
                  mb-2 flex justify-center
                  rounded-xl bg-slate-50 p-2
                "
                title={adminName}
              >
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[#0757D9] text-xs font-extrabold text-white">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={adminName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || "AD"
                  )}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-50 bg-emerald-400" />
                </div>
              </div>
            )}

            {/* =================================================
                HELP
            ================================================== */}

            <button
              type="button"
              className={`
                group flex w-full items-center
                rounded-xl
                py-2.5
                text-[12px] font-bold
                text-slate-500
                transition
                hover:bg-slate-50
                hover:text-slate-800

                ${collapsed ? "justify-center px-2" : "gap-3 px-3"}
              `}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-slate-100 group-hover:text-slate-700">
                <CircleHelp size={18} />
              </span>

              {!collapsed && <span>Help & Support</span>}
            </button>

            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`
                group mt-1 flex w-full items-center
                rounded-xl
                py-2.5
                text-[12px] font-bold
                text-red-500
                transition
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-60

                ${collapsed ? "justify-center px-2" : "gap-3 px-3"}
              `}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition group-hover:bg-red-100 group-hover:text-red-500">
                {logoutLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}
              </span>

              {!collapsed && (
                <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            COLLAPSE BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-[88px]
            hidden h-6 w-6
            items-center justify-center
            rounded-full
            border border-slate-200
            bg-white
            text-slate-500
            shadow-[0_3px_10px_rgba(15,23,42,0.08)]
            transition-all
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-[#0757D9]
            lg:flex
          "
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* =====================================================
          CUSTOM SCROLLBAR
      ====================================================== */}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #dbe3ef;
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #c5d0df;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
