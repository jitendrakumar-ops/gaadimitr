import { Bell, ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";

const Topbar = ({ setMobileOpen, collapsed }) => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === "/admin") {
      return "Dashboard";
    }

    if (location.pathname.startsWith("/admin/users")) {
      return "Users";
    }

    if (location.pathname.startsWith("/admin/rides")) {
      return "Rides";
    }

    if (location.pathname.startsWith("/admin/drivers")) {
      return "Drivers";
    }

    return "Dashboard";
  };

  return (
    <header
      className={`
        fixed right-0 top-0 z-30
        h-[76px]
        border-b border-slate-200
        bg-white/95 backdrop-blur-xl
        transition-all duration-300

        left-0
        ${collapsed ? "lg:left-[76px]" : "lg:left-[260px]"}
      `}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="
              rounded-xl border border-slate-200
              p-2.5 text-slate-600
              transition hover:bg-slate-50
              lg:hidden
            "
          >
            <Menu size={20} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] font-medium text-slate-400 sm:block">
                Overview
              </span>

              <span className="hidden text-slate-300 sm:block">/</span>

              <h2 className="text-[16px] font-bold text-slate-900 sm:text-[17px]">
                {getTitle()}
              </h2>
            </div>

            <p className="hidden text-[10px] text-slate-400 sm:block">
              GaadiMitra Admin Console
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div
            className="
              hidden h-10 w-[230px]
              items-center gap-2
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-3
              md:flex
            "
          >
            <Search size={17} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search..."
              className="
                w-full bg-transparent
                text-xs text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

            <span
              className="
                rounded-md
                border border-slate-200
                bg-white
                px-1.5 py-0.5
                text-[9px] font-semibold
                text-slate-400
              "
            >
              ⌘K
            </span>
          </div>

          {/* Mobile Search */}
          <button
            className="
              rounded-xl border border-slate-200
              p-2.5 text-slate-500
              md:hidden
            "
          >
            <Search size={18} />
          </button>

          {/* Notification */}
          <button
            className="
              relative rounded-xl
              border border-slate-200
              p-2.5 text-slate-500
              transition
              hover:bg-blue-50
              hover:text-[#0757D9]
            "
          >
            <Bell size={18} />

            <span
              className="
                absolute right-2 top-2
                h-1.5 w-1.5
                rounded-full
                bg-[#0757D9]
                ring-2 ring-white
              "
            />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <button
            className="
              flex items-center gap-2
              rounded-xl
              px-1.5 py-1.5
              transition
              hover:bg-slate-50
            "
          >
            <div
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-xl
                bg-blue-50
                text-[#0757D9]
              "
            >
              <UserRound size={18} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-[12px] font-bold text-slate-800">Admin</p>

              <p className="text-[9px] text-slate-400">Super Admin</p>
            </div>

            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
