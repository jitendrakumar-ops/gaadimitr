import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <Topbar collapsed={collapsed} setMobileOpen={setMobileOpen} />

      <main
        className={`
          min-h-screen
          pt-[76px]
          transition-all duration-300

          ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}
        `}
      >
        <div className="p-4 sm:p-5 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
