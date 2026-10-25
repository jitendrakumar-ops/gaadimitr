import {
  Ban,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle,
  UserRound,
  UsersIcon,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../components/Pagination";

import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccountById,
  getAdminAccounts,
  selectAccounts,
  selectAdminError,
  selectAdminLoading,
  selectSelectedAccount,
  updateAdminAccount,
} from "../reducer/slices/adminSlice";

/* =========================================================
   HELPERS
========================================================= */

const normalizeRoleForApi = (role) => {
  if (!role) return undefined;

  if (role.toLowerCase() === "all") {
    return undefined;
  }

  return role.toLowerCase();
};

const normalizeStatusForApi = (status) => {
  if (!status || status === "All") {
    return undefined;
  }

  return status === "Active";
};

const getUserId = (user) => {
  return user?._id || user?.id || user?.userId || user?.accountId || "";
};

const getUserName = (user) => {
  return user?.name || user?.fullName || user?.username || "Unknown User";
};

const getUserEmail = (user) => {
  return user?.email || "-";
};

const getUserPhone = (user) => {
  return user?.phone || user?.mobile || "-";
};

const getUserRole = (user) => {
  const role = user?.role || "user";

  return role.toLowerCase() === "admin" ? "Admin" : "User";
};

const getUserStatus = (user) => {
  return user?.isActive === false ? "Inactive" : "Active";
};

const getUserJoinedDate = (user) => {
  const date = user?.createdAt || user?.joinedAt || user?.dateJoined;

  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getUserRides = (user) => {
  return user?.rides ?? user?.totalRides ?? user?.rideCount ?? 0;
};

const getUserAvatar = (user) => {
  const name = getUserName(user);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "U";
};

/* =========================================================
   USERS PAGE
========================================================= */

const Users = () => {
  const dispatch = useDispatch();

  /* =======================================================
     REDUX
  ======================================================= */

  const accounts = useSelector(selectAccounts);

  const selectedAccount = useSelector(selectSelectedAccount);

  const loading = useSelector(selectAdminLoading);

  const error = useSelector(selectAdminError);

  const adminState = useSelector((state) => state.admin);

  const totalAccounts = adminState?.totalAccounts || 0;

  const totalPages = adminState?.totalPages || 1;

  const reduxCurrentPage = adminState?.currentPage || 1;

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [roleFilter, setRoleFilter] = useState("All");

  const [showUserModal, setShowUserModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [deletingUser, setDeletingUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [actionLoading, setActionLoading] = useState(false);

  const usersPerPage = 10;

  /* =======================================================
     FETCH USERS
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        getAdminAccounts({
          search: search.trim(),
          role: normalizeRoleForApi(roleFilter),
          isActive: normalizeStatusForApi(statusFilter),
          page: currentPage,
          limit: usersPerPage,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [dispatch, search, statusFilter, roleFilter, currentPage]);

  /* =======================================================
     RESET PAGE WHEN FILTER CHANGES
  ======================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter]);

  /* =======================================================
     NORMALIZE API USERS FOR UI
  ======================================================= */

  const users = useMemo(() => {
    return (accounts || []).map((user) => ({
      ...user,

      id: getUserId(user),

      name: getUserName(user),

      email: getUserEmail(user),

      phone: getUserPhone(user),

      role: getUserRole(user),

      status: getUserStatus(user),

      joined: getUserJoinedDate(user),

      rides: getUserRides(user),

      avatar: getUserAvatar(user),
    }));
  }, [accounts]);

  /* =======================================================
     CURRENT PAGE STATS
  ======================================================= */

  const activeUsers = useMemo(() => {
    return users.filter((user) => user.status === "Active").length;
  }, [users]);

  const inactiveUsers = useMemo(() => {
    return users.filter((user) => user.status === "Inactive").length;
  }, [users]);

  const adminUsers = useMemo(() => {
    return users.filter((user) => user.role === "Admin").length;
  }, [users]);

  /* =======================================================
     ADD USER
  ======================================================= */

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  /* =======================================================
     EDIT USER
  ======================================================= */

  const handleEditUser = async (user) => {
    const id = getUserId(user);

    if (!id) {
      console.error("User ID is missing");
      return;
    }

    try {
      setActionLoading(true);

      // Get the exact user/account by clicked user's ID
      const result = await dispatch(getAdminAccountById(id)).unwrap();

      // IMPORTANT:
      // Do NOT use selectedAccount here.
      // Use the response of the clicked user directly.
      const account = result?.data || result;

      setEditingUser(account);
      setShowUserModal(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     SAVE USER
  ======================================================= */

  const handleSaveUser = async (formData) => {
    try {
      setActionLoading(true);

      const payload = {
        name: formData.name.trim(),

        email: formData.email.trim(),

        phone: formData.phone.trim(),

        role: formData.role.toLowerCase(),

        isActive: formData.status === "Active",
      };

      /* ===============================================
         UPDATE
      =============================================== */

      if (editingUser) {
        const id = getUserId(editingUser);

        if (!id) {
          throw new Error("User ID is missing");
        }

        await dispatch(
          updateAdminAccount({
            id,
            data: payload,
          }),
        ).unwrap();
      } else {
        /* ===============================================
         CREATE
      =============================================== */
        await dispatch(createAdminAccount(payload)).unwrap();
      }

      setShowUserModal(false);
      setEditingUser(null);

      /* Refresh current page */
      dispatch(
        getAdminAccounts({
          search: search.trim(),
          role: normalizeRoleForApi(roleFilter),
          isActive: normalizeStatusForApi(statusFilter),
          page: currentPage,
          limit: usersPerPage,
        }),
      );
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     DELETE USER
  ======================================================= */

  const handleDelete = async () => {
    if (!deletingUser) {
      return;
    }

    const id = getUserId(deletingUser);

    if (!id) {
      return;
    }

    try {
      setActionLoading(true);

      await dispatch(deleteAdminAccount(id)).unwrap();

      setDeletingUser(null);

      setShowDeleteModal(false);

      /*
       * If current page becomes empty,
       * move one page back.
       */
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else {
        dispatch(
          getAdminAccounts({
            search: search.trim(),

            role: normalizeRoleForApi(roleFilter),

            isActive: normalizeStatusForApi(statusFilter),

            page: currentPage,

            limit: usersPerPage,
          }),
        );
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const toggleStatus = async (user) => {
    const id = getUserId(user);

    if (!id) {
      return;
    }

    try {
      setActionLoading(true);

      await dispatch(
        updateAdminAccount({
          id,

          data: {
            isActive: user.status !== "Active",
          },
        }),
      ).unwrap();

      dispatch(
        getAdminAccounts({
          search: search.trim(),

          role: normalizeRoleForApi(roleFilter),

          isActive: normalizeStatusForApi(statusFilter),

          page: currentPage,

          limit: usersPerPage,
        }),
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1),
  );

  const showingFrom =
    totalAccounts === 0 ? 0 : (safeCurrentPage - 1) * usersPerPage + 1;

  const showingTo =
    totalAccounts === 0
      ? 0
      : Math.min(safeCurrentPage * usersPerPage, totalAccounts);

  /* =======================================================
     PAGINATION NUMBERS
  ======================================================= */

  const paginationPages = useMemo(() => {
    const pages = [];

    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }

      return pages;
    }

    let start = Math.max(1, safeCurrentPage - 2);

    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  }, [totalPages, safeCurrentPage]);

  /* =======================================================
     LOADING
  ======================================================= */

  const isInitialLoading = loading && users.length === 0;

  return (
    <>
      <div className="space-y-5">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0757D9]">
                <UserRound size={15} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#0757D9]">
                User Management
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-[-0.7px] text-slate-900">
              Users
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Manage users, account status and access roles.
            </p>
          </div>

          <button
            onClick={handleAddUser}
            disabled={actionLoading}
            className="
              inline-flex items-center justify-center
              gap-2 rounded-xl
              bg-[#0757D9]
              px-4 py-2.5
              text-xs font-bold text-white
              shadow-[0_8px_20px_rgba(7,87,217,0.18)]
              transition hover:bg-[#064bbd]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {/* =================================================
            MINI STATS
        ================================================= */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat
            label="Total Users"
            value={totalAccounts}
            icon={UsersIcon}
          />

          <MiniStat
            label="Active Users"
            value={activeUsers}
            icon={CheckCircle2}
          />

          <MiniStat label="Admins" value={adminUsers} icon={ShieldCheck} />

          <MiniStat label="Inactive" value={inactiveUsers} icon={Ban} />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div
          className="
            rounded-2xl
            border border-slate-200
            bg-white
            p-3
            sm:p-4
          "
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search */}

            <div
              className="
                flex h-10 flex-1
                items-center gap-2.5
                rounded-xl
                border border-slate-200
                bg-slate-50
                px-3
              "
            >
              <Search size={16} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);

                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, phone or user ID..."
                className="
                  w-full bg-transparent
                  text-xs text-slate-700
                  outline-none
                  placeholder:text-slate-400
                "
              />

              {search && (
                <button
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);

                setCurrentPage(1);
              }}
              className="
                h-10 rounded-xl
                border border-slate-200
                bg-white px-3
                text-xs font-medium
                text-slate-600
                outline-none
                focus:border-[#0757D9]
              "
            >
              <option value="All">All Status</option>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>
            </select>

            {/* Role */}

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);

                setCurrentPage(1);
              }}
              className="
                h-10 rounded-xl
                border border-slate-200
                bg-white px-3
                text-xs font-medium
                text-slate-600
                outline-none
                focus:border-[#0757D9]
              "
            >
              <option value="All">All Roles</option>

              <option value="Admin">Admin</option>

              <option value="User">User</option>
            </select>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-medium text-red-600">{error}</p>

            <button
              onClick={() => {
                dispatch(
                  getAdminAccounts({
                    search: search.trim(),

                    role: normalizeRoleForApi(roleFilter),

                    isActive: normalizeStatusForApi(statusFilter),

                    page: currentPage,

                    limit: usersPerPage,
                  }),
                );
              }}
              className="text-[10px] font-bold text-red-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* Table Header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">
                All Users
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {totalAccounts} users found
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-semibold text-slate-400">
                Live data
              </span>
            </div>
          </div>

          {/* =================================================
              INITIAL LOADING
          ================================================= */}

          {isInitialLoading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#0757D9]" />

              <p className="mt-3 text-xs font-medium text-slate-400">
                Loading users...
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <TableHead>User</TableHead>

                      <TableHead>Contact</TableHead>

                      <TableHead>Role</TableHead>

                      <TableHead>Rides</TableHead>

                      <TableHead>Status</TableHead>

                      <TableHead>Joined</TableHead>

                      <TableHead align="right">Action</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="
                            border-b border-slate-100
                            last:border-0
                            transition hover:bg-slate-50/60
                          "
                      >
                        {/* User */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />

                            <div>
                              <p className="text-[11px] font-bold text-slate-800">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-5 py-4">
                          <p className="text-[10px] font-medium text-slate-600">
                            {user.email}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-400">
                            {user.phone}
                          </p>
                        </td>

                        {/* Role */}

                        <td className="px-5 py-4">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* Rides */}

                        <td className="px-5 py-4">
                          <span className="text-[11px] font-bold text-slate-700">
                            {user.rides}
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <button
                            disabled={actionLoading}
                            onClick={() => toggleStatus(user)}
                            className={`
                                inline-flex items-center gap-1.5
                                rounded-full px-2.5 py-1
                                text-[9px] font-bold
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                ${
                                  user.status === "Active"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }
                              `}
                          >
                            <span
                              className={`
                                  h-1.5 w-1.5 rounded-full
                                  ${
                                    user.status === "Active"
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }
                                `}
                            />

                            {user.status}
                          </button>
                        </td>

                        {/* Joined */}

                        <td className="px-5 py-4">
                          <span className="text-[10px] text-slate-500">
                            {user.joined}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              icon={Pencil}
                              label="Edit"
                              loading={actionLoading}
                              onClick={() => handleEditUser(user)}
                            />

                            <ActionButton
                              icon={Trash2}
                              label="Delete"
                              danger
                              loading={actionLoading}
                              onClick={() => {
                                setDeletingUser(user);

                                setShowDeleteModal(true);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar user={user} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold text-slate-800">
                              {user.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400">
                              {user.id}
                            </p>
                          </div>

                          <RoleBadge role={user.role} />
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-1.5">
                          <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <Mail size={12} />

                            {user.email}
                          </div>

                          <div className="flex items-center gap-2 text-[9px] text-slate-500">
                            <Phone size={12} />

                            {user.phone}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-slate-400">
                              {user.rides} rides
                            </span>

                            <span className="text-[9px] text-slate-400">
                              {user.joined}
                            </span>
                          </div>

                          <button
                            disabled={actionLoading}
                            onClick={() => toggleStatus(user)}
                            className={`
                                rounded-full px-2.5 py-1
                                text-[8px] font-bold
                                disabled:opacity-50
                                ${
                                  user.status === "Active"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-500"
                                }
                              `}
                          >
                            {user.status}
                          </button>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleEditUser(user)}
                            className="
                                flex flex-1 items-center
                                justify-center gap-1.5
                                rounded-lg
                                border border-slate-200
                                py-2
                                text-[9px] font-bold
                                text-slate-600
                                disabled:opacity-50
                              "
                          >
                            <Pencil size={12} />
                            Edit
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => {
                              setDeletingUser(user);

                              setShowDeleteModal(true);
                            }}
                            className="
                                flex flex-1 items-center
                                justify-center gap-1.5
                                rounded-lg
                                bg-red-50
                                py-2
                                text-[9px] font-bold
                                text-red-500
                                disabled:opacity-50
                              "
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  EMPTY
              ================================================= */}

              {users.length === 0 && (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <UsersIcon size={22} />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No users found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filters.
                  </p>
                </div>
              )}

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalAccounts > 0 && (
                <div className="border-t border-slate-100 p-4">
                  <Pagination
                    currentPage={safeCurrentPage}
                    totalPages={totalPages}
                    totalItems={totalAccounts}
                    limit={usersPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showUserModal && (
        <UserModal
          user={editingUser}
          loading={actionLoading}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal && deletingUser && (
        <DeleteModal
          user={deletingUser}
          loading={actionLoading}
          onClose={() => {
            setDeletingUser(null);

            setShowDeleteModal(false);
          }}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

/* =========================================================
   USER MODAL
========================================================= */

const UserModal = ({ user, onClose, onSave, loading }) => {
  const isEdit = !!user;

  const [form, setForm] = useState({
    name: getUserName(user) === "Unknown User" ? "" : getUserName(user),

    email: user?.email || "",

    phone: user?.phone || "",

    role: getUserRole(user),

    status: getUserStatus(user),
  });

  useEffect(() => {
    setForm({
      name: user?.name || user?.fullName || user?.username || "",

      email: user?.email || "",

      phone: user?.phone || user?.mobile || "",

      role: getUserRole(user),

      status: getUserStatus(user),
    });
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {isEdit
                ? "Update account details and assign access role."
                : "Create a new GaadiMitra user account."}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-5 sm:p-6"
        >
          <div className="space-y-4">
            <FormField
              label="Full Name"
              icon={UserCircle}
              value={form.name}
              onChange={(value) => handleChange("name", value)}
              placeholder="Enter full name"
            />

            <FormField
              label="Email Address"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(value) => handleChange("email", value)}
              placeholder="Enter email address"
            />

            <FormField
              label="Phone Number"
              icon={Phone}
              value={form.phone}
              onChange={(value) => handleChange("phone", value)}
              placeholder="+91 XXXXX XXXXX"
            />

            {/* Role */}

            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Assign Role
              </label>

              <div className="grid grid-cols-2 gap-3">
                <RoleOption
                  active={form.role === "User"}
                  icon={UserRound}
                  title="User"
                  description="Standard access"
                  onClick={() => handleChange("role", "User")}
                />

                <RoleOption
                  active={form.role === "Admin"}
                  icon={ShieldCheck}
                  title="Admin"
                  description="Management access"
                  onClick={() => handleChange("role", "Admin")}
                />
              </div>

              {form.role === "Admin" && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-[9px] leading-4 text-amber-700">
                    Admin access gives this account permission to manage users
                    and dashboard operations.
                  </p>
                </div>
              )}
            </div>

            {/* Status */}

            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
                Account Status
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange("status", "Active")}
                  disabled={loading}
                  className={`
                    flex items-center gap-2
                    rounded-xl border p-3
                    text-left transition
                    disabled:opacity-50
                    ${
                      form.status === "Active"
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200"
                    }
                  `}
                >
                  <CheckCircle2
                    size={17}
                    className={
                      form.status === "Active"
                        ? "text-emerald-600"
                        : "text-slate-300"
                    }
                  />

                  <div>
                    <p className="text-[10px] font-bold text-slate-700">
                      Active
                    </p>

                    <p className="text-[8px] text-slate-400">Account enabled</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange("status", "Inactive")}
                  disabled={loading}
                  className={`
                    flex items-center gap-2
                    rounded-xl border p-3
                    text-left transition
                    disabled:opacity-50
                    ${
                      form.status === "Inactive"
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200"
                    }
                  `}
                >
                  <Ban
                    size={17}
                    className={
                      form.status === "Inactive"
                        ? "text-red-500"
                        : "text-slate-300"
                    }
                  />

                  <div>
                    <p className="text-[10px] font-bold text-slate-700">
                      Inactive
                    </p>

                    <p className="text-[8px] text-slate-400">
                      Account disabled
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}

          <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex-1 rounded-xl
                border border-slate-200
                py-2.5
                text-xs font-bold text-slate-600
                hover:bg-slate-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 inline-flex items-center justify-center gap-2
                rounded-xl
                bg-[#0757D9]
                py-2.5
                text-xs font-bold text-white
                shadow-[0_8px_20px_rgba(7,87,217,0.18)]
                hover:bg-[#064bbd]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading && <Loader2 size={14} className="animate-spin" />}

              {isEdit ? "Save Changes" : "Create User"}
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

const DeleteModal = ({ user, onClose, onDelete, loading }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[390px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-4 text-base font-extrabold text-slate-900">
          Delete user?
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-700">{getUserName(user)}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              flex-1 rounded-xl
              border border-slate-200
              py-2.5
              text-xs font-bold text-slate-600
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={loading}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              rounded-xl
              bg-red-500
              py-2.5
              text-xs font-bold text-white
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MINI STAT
========================================================= */

const MiniStat = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-[9px] font-medium text-slate-400">{label}</p>

        <p className="mt-0.5 text-lg font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ user }) => {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[10px] font-extrabold text-[#0757D9]">
      {getUserAvatar(user)}
    </div>
  );
};

/* =========================================================
   ROLE BADGE
========================================================= */

const RoleBadge = ({ role }) => {
  const isAdmin = role === "Admin";

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full px-2.5 py-1
        text-[8px] font-bold
        ${isAdmin ? "bg-blue-50 text-[#0757D9]" : "bg-slate-100 text-slate-500"}
      `}
    >
      {isAdmin ? <ShieldCheck size={10} /> : <UserRound size={10} />}

      {role}
    </span>
  );
};

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = ({ icon: Icon, label, danger, onClick, loading }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`
        flex h-8 w-8
        items-center justify-center
        rounded-lg
        transition
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          danger
            ? "text-red-400 hover:bg-red-50 hover:text-red-500"
            : "text-slate-400 hover:bg-blue-50 hover:text-[#0757D9]"
        }
      `}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Icon size={14} />
      )}
    </button>
  );
};

/* =========================================================
   TABLE HEAD
========================================================= */

const TableHead = ({ children, align = "left" }) => {
  return (
    <th
      className={`
        px-5 py-3
        text-${align}
        text-[9px]
        font-bold uppercase
        tracking-[0.7px]
        text-slate-400
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   PAGINATION BUTTON
========================================================= */

const PaginationButton = ({ children, disabled, onClick }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="
        flex h-8 w-8
        items-center justify-center
        rounded-lg
        text-slate-400
        transition
        hover:bg-slate-100
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      {children}
    </button>
  );
};

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
        {label}
      </label>

      <div className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-[#0757D9] focus-within:bg-white">
        <Icon size={15} className="text-slate-400" />

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="
            w-full bg-transparent
            text-xs text-slate-700
            outline-none
            placeholder:text-slate-400
          "
        />
      </div>
    </div>
  );
};

/* =========================================================
   ROLE OPTION
========================================================= */

const RoleOption = ({ active, icon: Icon, title, description, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center gap-3
        rounded-xl border p-3
        text-left transition
        ${
          active
            ? "border-[#0757D9] bg-blue-50/70"
            : "border-slate-200 bg-white hover:border-blue-200"
        }
      `}
    >
      <div
        className={`
          flex h-9 w-9 items-center justify-center
          rounded-lg
          ${active ? "bg-[#0757D9] text-white" : "bg-slate-100 text-slate-400"}
        `}
      >
        <Icon size={16} />
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-700">{title}</p>

        <p className="mt-0.5 text-[8px] text-slate-400">{description}</p>
      </div>

      {active && (
        <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#0757D9] text-white">
          <Check size={10} />
        </div>
      )}
    </button>
  );
};

export default Users;
