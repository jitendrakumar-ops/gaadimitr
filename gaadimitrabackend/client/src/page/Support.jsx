import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminGetAllTickets,
  getTicketById,
  adminReplyToTicket,
  adminUpdateTicketStatus,
  adminDeleteTicket,
  clearSupportError,
  clearSupportSuccess,
  clearSelectedTicket,
  selectSupportTickets,
  selectSelectedTicket,
  selectSupportLoading,
  selectSupportDetailsLoading,
  selectSupportReplyLoading,
  selectSupportStatusUpdateLoading,
  selectSupportDeleteLoading,
  selectSupportError,
  selectSupportDetailsError,
  selectSupportReplyError,
  selectSupportStatusUpdateError,
  selectSupportDeleteError,
  selectSupportSuccess,
  selectSupportMessage,
  selectSupportPagination,
} from "../reducer/slices/supportSlice";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

const formatRelativeTime = (date) => {
  if (!date) return "—";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const categoryColors = {
  account: "bg-blue-50 text-blue-600",
  booking: "bg-indigo-50 text-indigo-600",
  payment: "bg-green-50 text-green-600",
  driver: "bg-amber-50 text-amber-600",
  vehicle: "bg-purple-50 text-purple-600",
  technical: "bg-red-50 text-red-600",
  other: "bg-slate-50 text-slate-600",
};

const priorityColors = {
  low: "bg-slate-50 text-slate-600",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-amber-50 text-amber-600",
  urgent: "bg-red-50 text-red-600",
};

const statusColors = {
  open: "bg-amber-50 text-amber-600",
  pending: "bg-violet-50 text-violet-600",
  resolved: "bg-emerald-50 text-emerald-600",
  closed: "bg-slate-50 text-slate-600",
};

const Support = () => {
  const dispatch = useDispatch();

  /* =====================================================
     SELECTORS
  ===================================================== */
  const tickets = useSelector(selectSupportTickets);
  const selectedTicket = useSelector(selectSelectedTicket);
  const loading = useSelector(selectSupportLoading);
  const detailsLoading = useSelector(selectSupportDetailsLoading);
  const replyLoading = useSelector(selectSupportReplyLoading);
  const statusUpdateLoading = useSelector(selectSupportStatusUpdateLoading);
  const deleteLoading = useSelector(selectSupportDeleteLoading);
  const error = useSelector(selectSupportError);
  const detailsError = useSelector(selectSupportDetailsError);
  const replyError = useSelector(selectSupportReplyError);
  const statusUpdateError = useSelector(selectSupportStatusUpdateError);
  const deleteError = useSelector(selectSupportDeleteError);
  const success = useSelector(selectSupportSuccess);
  const message = useSelector(selectSupportMessage);
  const pagination = useSelector(selectSupportPagination);

  /* =====================================================
     LOCAL STATE
  ===================================================== */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(null);

  const itemsPerPage = 20;

  /* =====================================================
     DEBOUNCE SEARCH
  ===================================================== */
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  /* =====================================================
     FETCH TICKETS
  ===================================================== */
  const fetchTickets = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "all") params.status = statusFilter;

    dispatch(adminGetAllTickets(params));
  }, [dispatch, currentPage, search, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /* =====================================================
     TOAST NOTIFICATIONS
  ===================================================== */
  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(clearSupportSuccess());
    }
  }, [success, message, dispatch]);

  useEffect(() => {
    const err =
      error ||
      detailsError ||
      replyError ||
      statusUpdateError ||
      deleteError;
    if (err) {
      toast.error(typeof err === "string" ? err : "Something went wrong");
      dispatch(clearSupportError());
    }
  }, [
    error,
    detailsError,
    replyError,
    statusUpdateError,
    deleteError,
    dispatch,
  ]);

  /* =====================================================
     STATS
  ===================================================== */
  const stats = useMemo(() => {
    return tickets.reduce(
      (acc, t) => {
        if (t.status === "open") acc.open += 1;
        if (t.status === "pending") acc.pending += 1;
        if (t.status === "resolved") acc.resolved += 1;
        return acc;
      },
      { open: 0, pending: 0, resolved: 0 }
    );
  }, [tickets]);

  /* =====================================================
     PAGINATION (server-side)
  ===================================================== */
  const totalPages = pagination?.totalPages || 1;
  const totalTickets = pagination?.totalTickets || 0;

  /* =====================================================
     ACTIONS
  ===================================================== */
  const openDetailModal = async (ticket) => {
    const ticketId = ticket._id || ticket.id;
    await dispatch(getTicketById(ticketId));
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    dispatch(clearSelectedTicket());
  };

  const handleReply = async (messageText) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket._id || selectedTicket.id;
    await dispatch(adminReplyToTicket({ ticketId, message: messageText })).unwrap();
    // Re-fetch ticket detail implicitly handled if you want, but for now just refresh ticket list maybe or let getTicketById handle update. We can just dispatch getTicketById
    dispatch(getTicketById(ticketId));
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    const ticketId = selectedTicket._id || selectedTicket.id;
    await dispatch(
      adminUpdateTicketStatus({ ticketId, status: newStatus })
    ).unwrap();
    dispatch(getTicketById(ticketId));
    fetchTickets();
  };

  const openDeleteModal = (ticket) => {
    setDeletingTicket(ticket);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeletingTicket(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deletingTicket) return;
    const ticketId = deletingTicket._id || deletingTicket.id;
    try {
      await dispatch(adminDeleteTicket(ticketId)).unwrap();
      closeDeleteModal();
      fetchTickets();
    } catch {
      // Error handled by useEffect
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Support Tickets
              </h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0757D9]">
                {totalTickets}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage and respond to user and driver support requests.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <StatItem
            icon={MessageSquare}
            label="Total Tickets"
            value={totalTickets}
            iconClass="bg-blue-50 text-[#0757D9]"
          />
          <StatItem
            icon={AlertCircle}
            label="Open"
            value={stats.open}
            iconClass="bg-amber-50 text-amber-600"
          />
          <StatItem
            icon={Clock}
            label="Pending"
            value={stats.pending}
            iconClass="bg-violet-50 text-violet-600"
          />
          <StatItem
            icon={CheckCircle}
            label="Resolved"
            value={stats.resolved}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* FILTER BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 lg:w-auto">
              {[
                { key: "all", label: "All" },
                { key: "open", label: "Open" },
                { key: "pending", label: "Pending" },
                { key: "resolved", label: "Resolved" },
                { key: "closed", label: "Closed" },
              ].map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`flex min-w-max items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-white text-[#0757D9] shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tickets..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#0757D9]" />
              <span className="ml-3 text-sm font-bold text-slate-500">
                Loading tickets...
              </span>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Ticket
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Last Activity
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <Search size={22} />
                            </div>
                            <p className="mt-3 text-sm font-bold text-slate-700">
                              No tickets found
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Try changing your search or filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr
                          key={ticket._id || ticket.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-extrabold text-slate-900 truncate max-w-[280px]">
                                  {ticket.subject || "No Subject"}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 capitalize">
                                  {ticket.participantId?.name || "Unknown"}{" "}
                                  ({ticket.participantRole})
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold capitalize ${
                                categoryColors[ticket.category || "other"]
                              }`}
                            >
                              {ticket.category || "Other"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold capitalize ${
                                priorityColors[ticket.priority || "low"]
                              }`}
                            >
                              {ticket.priority || "Low"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold capitalize ${
                                statusColors[ticket.status || "open"]
                              }`}
                            >
                              {ticket.status || "Open"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock size={15} className="text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">
                                {formatRelativeTime(
                                  ticket.lastMessageAt || ticket.updatedAt
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openDetailModal(ticket)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9]"
                                title="View ticket"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(ticket)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                                title="Delete ticket"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="lg:hidden">
                {tickets.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Search size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No tickets found
                    </p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id || ticket.id}
                      className="border-b border-slate-100 p-4 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-slate-900">
                            {ticket.subject || "No Subject"}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-slate-500 capitalize">
                            {ticket.participantId?.name || "Unknown"} (
                            {ticket.participantRole})
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-bold capitalize ${
                            statusColors[ticket.status || "open"]
                          }`}
                        >
                          {ticket.status || "Open"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold capitalize ${
                            categoryColors[ticket.category || "other"]
                          }`}
                        >
                          {ticket.category || "Other"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold capitalize ${
                            priorityColors[ticket.priority || "low"]
                          }`}
                        >
                          {ticket.priority || "Low"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">
                            {formatRelativeTime(
                              ticket.lastMessageAt || ticket.updatedAt
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetailModal(ticket)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(ticket)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              {tickets.length > 0 && (
                <div className="border-t border-slate-100 p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalTickets}
                    limit={itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* TICKET DETAIL MODAL */}
      {detailModalOpen && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={closeDetailModal}
          onReply={handleReply}
          onStatusChange={handleStatusChange}
          replyLoading={replyLoading}
          statusUpdateLoading={statusUpdateLoading}
          detailsLoading={detailsLoading}
        />
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && deletingTicket && (
        <DeleteTicketModal
          ticket={deletingTicket}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          deleting={deleteLoading}
        />
      )}
    </>
  );
};

/* =========================================================
   STAT ITEM
========================================================= */
const StatItem = ({ icon: Icon, label, value, iconClass }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

/* =========================================================
   TICKET DETAIL MODAL
========================================================= */
const TicketDetailModal = ({
  ticket,
  onClose,
  onReply,
  onStatusChange,
  replyLoading,
  statusUpdateLoading,
  detailsLoading,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onReply(message);
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {detailsLoading || !ticket ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#0757D9]" />
            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading details...
            </p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 break-words">
                  {ticket.subject}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-bold">
                    {ticket.participantId?.name || "Unknown"}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-600">
                    {ticket.participantRole}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={ticket.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  disabled={statusUpdateLoading}
                  className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0757D9] disabled:opacity-50 capitalize"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* INFO ROW */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3 sm:px-6">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold capitalize ${
                  categoryColors[ticket.category || "other"]
                }`}
              >
                {ticket.category || "Other"}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold capitalize ${
                  priorityColors[ticket.priority || "low"]
                }`}
              >
                {ticket.priority || "Low"}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Created: {new Date(ticket.createdAt).toLocaleString("en-IN")}
              </span>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50">
              {ticket.messages?.length === 0 ? (
                <div className="text-center text-sm font-semibold text-slate-400 py-10">
                  No messages yet.
                </div>
              ) : (
                ticket.messages?.map((msg, index) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500">
                          {msg.senderRole}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          isAdmin
                            ? "bg-green-100 text-green-900 rounded-tr-sm"
                            : "bg-blue-100 text-blue-900 rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* REPLY INPUT */}
            <form
              onSubmit={handleSubmitReply}
              className="flex items-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6"
            >
              <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply..."
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
              <button
                type="submit"
                disabled={replyLoading || !message.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0757D9] text-white transition hover:bg-[#064bbd] disabled:opacity-50"
              >
                {replyLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   DELETE MODAL
========================================================= */
const DeleteTicketModal = ({ ticket, onClose, onConfirm, deleting }) => {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={22} />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          Delete Ticket?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete the ticket{" "}
          <span className="font-extrabold text-slate-700">
            "{ticket.subject}"
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
