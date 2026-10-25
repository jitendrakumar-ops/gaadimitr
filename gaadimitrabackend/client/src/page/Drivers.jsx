import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import Pagination from "../components/Pagination";

import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDocumentError,
  clearDocumentSuccess,
  getDriverDocuments,
  getAllDriverDocuments,
  selectDocumentMessage,
  selectDocumentsLoading,
  selectDriverDocuments,
  selectDrivers,
  selectDriversLoading,
  selectDriversError,
  selectVerifyError,
  selectVerifyLoading,
  selectVerifySuccess,
  verifyDocuments,
} from "../reducer/slices/documentSlice";

import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileCheck2,
  FileQuestion,
  FileText,
  IdCard,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  Upload,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   FALLBACK DATA
========================================================= */

const INITIAL_DRIVERS = [];

/* =========================================================
   HELPERS
========================================================= */

const getDocumentStats = (driver) => {
  const documents = driver?.documents || [];

  const total = documents.length;

  const approved = documents.filter(
    (document) => document.status === "approved",
  ).length;

  const pending = documents.filter(
    (document) => document.status === "pending",
  ).length;

  return {
    total,
    approved,
    pending,
  };
};

const formatFileName = (name) => {
  if (!name) return "Document";

  return name.length > 24 ? `${name.slice(0, 24)}...` : name;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });

const urlToDataUrl = async (url) => {
  const response = await fetch(url, {
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch image");
  }

  const blob = await response.blob();

  return await fileToDataUrl(blob);
};

const getDocumentImage = async (document) => {
  try {
    if (document?.file instanceof File) {
      return await fileToDataUrl(document.file);
    }

    if (document?.url) {
      return await urlToDataUrl(document.url);
    }

    return null;
  } catch (error) {
    console.warn(`Could not load ${document?.type || "document"} image`, error);

    return null;
  }
};

/* =========================================================
   DOCUMENT DEFINITIONS & HELPERS
========================================================= */

const DOC_CONFIGS = [
  {
    key: "drivingLicense",
    title: "Driving License (DL)",
    icon: IdCard,
    accentColor: "blue",
    fields: [
      { label: "License Number", key: "dlNo" },
      { label: "License Type", key: "dlType" },
    ],
    photos: [
      { label: "Front Side Photo", key: "frontPhoto" },
      { label: "Back Side Photo", key: "backPhoto" },
    ],
  },
  {
    key: "rc",
    title: "Vehicle Registration (RC)",
    icon: Truck,
    accentColor: "indigo",
    fields: [{ label: "Registration No (RC)", key: "rcNo" }],
    photos: [
      { label: "RC Front Photo", key: "frontPhoto" },
      { label: "RC Back Photo", key: "backPhoto" },
    ],
  },
  {
    key: "insurance",
    title: "Vehicle Insurance",
    icon: ShieldCheck,
    accentColor: "emerald",
    fields: [{ label: "Insurance Policy No", key: "insuranceNo" }],
    photos: [{ label: "Insurance Document Photo", key: "photo" }],
  },
  {
    key: "permit",
    title: "Commercial Permit",
    icon: FileText,
    accentColor: "purple",
    fields: [
      { label: "Permit Number", key: "permitNo" },
      { label: "Permit Type", key: "type" },
    ],
    photos: [{ label: "Permit Document Photo", key: "photo" }],
  },
  {
    key: "aadharCard",
    title: "Aadhaar Card (Identity)",
    icon: IdCard,
    accentColor: "teal",
    fields: [{ label: "Aadhaar Card No", key: "cardNo" }],
    photos: [
      { label: "Aadhaar Front Photo", key: "frontPhoto" },
      { label: "Aadhaar Back Photo", key: "backPhoto" },
    ],
  },
];

const REJECTION_PRESETS = [
  "Document image is blurry or unreadable",
  "Driving License has expired",
  "Vehicle Registration (RC) details do not match",
  "Insurance policy document has expired or is invalid",
  "Commercial Permit is expired or invalid for this region",
  "Aadhaar card details do not match driver profile",
  "Suspicious or tampered document submitted",
];

/* =========================================================
   MAIN PAGE
========================================================= */

const Drivers = () => {
  const dispatch = useDispatch();
  const apiDrivers = useSelector(selectDrivers);
  const apiLoading = useSelector(selectDriversLoading);

  const [activeTab, setActiveTab] = useState("all");

  const [search, setSearch] = useState("");

  const [verifyDriverId, setVerifyDriverId] = useState(null);
  const [verifyDriverName, setVerifyDriverName] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null);

  const [editDriver, setEditDriver] = useState(null);

  const [deleteDriver, setDeleteDriver] = useState(null);

  const [previewDocument, setPreviewDocument] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // Fetch all driver documents from backend
  useEffect(() => {
    dispatch(getAllDriverDocuments());
  }, [dispatch]);

  const drivers = useMemo(() => {
    return Array.isArray(apiDrivers) ? apiDrivers : [];
  }, [apiDrivers]);

  /* =======================================================
     STATS
  ======================================================= */

  const documentStats = useMemo(() => {
    return drivers.reduce(
      (accumulator, driver) => {
        const stats = getDocumentStats(driver);

        accumulator.total += stats.total;
        accumulator.approved += stats.approved;
        accumulator.pending += stats.pending;

        return accumulator;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
      },
    );
  }, [drivers]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredDrivers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const stats = getDocumentStats(driver);

      const matchesSearch =
        !searchValue ||
        driver.name.toLowerCase().includes(searchValue) ||
        driver.userId.toLowerCase().includes(searchValue) ||
        driver.phone.toLowerCase().includes(searchValue) ||
        driver.email.toLowerCase().includes(searchValue);

      let matchesTab = true;

      if (activeTab === "pending") {
        matchesTab = stats.pending > 0;
      }

      if (activeTab === "approved") {
        matchesTab = stats.approved > 0 && stats.pending === 0;
      }

      return matchesSearch && matchesTab;
    });
  }, [drivers, search, activeTab]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrivers.length / itemsPerPage),
  );

  const paginatedDrivers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredDrivers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDrivers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =======================================================
     OPEN VIEW
  ======================================================= */

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setDetailsModalOpen(true);
  };

  /* =======================================================
     APPROVE DOCUMENT
  ======================================================= */

  const handleApproveDocument = async (driverId, documentId) => {
    const targetDriver = drivers.find(
      (d) => d.id === driverId || d.driverId === driverId,
    );
    const targetDoc = targetDriver?.documents?.find((doc) => doc.id === documentId);
    const docKey = targetDoc?.key || "drivingLicense";

    try {
      await dispatch(
        verifyDocuments({
          driverId,
          status: "pending",
          itemVerifications: {
            [docKey]: true,
          },
        }),
      ).unwrap();
      toast.success(`${targetDoc?.type || "Document"} marked as verified`);
      dispatch(getAllDriverDocuments());

      setSelectedDriver((currentDriver) => {
        if (
          !currentDriver ||
          (currentDriver.id !== driverId && currentDriver.driverId !== driverId)
        ) {
          return currentDriver;
        }

        return {
          ...currentDriver,
          documents: (currentDriver.documents || []).map((document) =>
            document.id === documentId
              ? {
                  ...document,
                  status: "approved",
                }
              : document,
          ),
        };
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to verify document");
    }
  };

  /* =======================================================
     EDIT DOCUMENTS
  ======================================================= */

  const handleOpenEdit = (driver) => {
    setEditDriver(driver);
    setEditModalOpen(true);
  };

  const handleSaveDocuments = (driverId, updatedDocuments) => {
    const updatedDriver = drivers.find((driver) => driver.id === driverId);

    if (!updatedDriver) return;

    const nextDriver = {
      ...updatedDriver,
      documents: updatedDocuments,
    };

    setDrivers((currentDrivers) =>
      currentDrivers.map((driver) =>
        driver.id === driverId ? nextDriver : driver,
      ),
    );

    setSelectedDriver((currentDriver) =>
      currentDriver?.id === driverId ? nextDriver : currentDriver,
    );

    setEditDriver(null);
    setEditModalOpen(false);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDeleteDriver = () => {
    if (!deleteDriver) return;

    setDrivers((currentDrivers) =>
      currentDrivers.filter((driver) => driver.id !== deleteDriver.id),
    );

    if (selectedDriver?.id === deleteDriver.id) {
      setSelectedDriver(null);
      setDetailsModalOpen(false);
    }

    setDeleteDriver(null);
    setDeleteModalOpen(false);
  };

  /* =======================================================
     EXPORT PDF
  ======================================================= */

  const exportDriverPDF = async (driver) => {
    if (!driver) return;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();

    const pageHeight = pdf.internal.pageSize.getHeight();

    const stats = getDocumentStats(driver);

    /* -----------------------------------------------------
       HEADER
    ----------------------------------------------------- */

    pdf.setFillColor(7, 87, 217);

    pdf.rect(0, 0, pageWidth, 34, "F");

    pdf.setTextColor(255, 255, 255);

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(20);

    pdf.text("GaadiMitra", 15, 14);

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(10);

    pdf.text("Driver Documents Report", 15, 23);

    pdf.setTextColor(15, 23, 42);

    /* -----------------------------------------------------
       DRIVER DETAILS
    ----------------------------------------------------- */

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(15);

    pdf.text("Driver Details", 15, 47);

    autoTable(pdf, {
      startY: 53,

      theme: "grid",

      head: [["Field", "Details"]],

      body: [
        ["Driver Name", driver.name || "-"],
        ["User ID", driver.userId || "-"],
        ["Phone", driver.phone || "-"],
        ["Email", driver.email || "-"],
        ["Location", driver.location || "-"],
        ["Joined Date", driver.joined || "-"],
      ],

      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [15, 23, 42],
      },

      headStyles: {
        fillColor: [7, 87, 217],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [245, 248, 252],
      },
    });

    /* -----------------------------------------------------
       DOCUMENT SUMMARY
    ----------------------------------------------------- */

    let summaryY = pdf.lastAutoTable.finalY + 12;

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(15);

    pdf.text("Document Summary", 15, summaryY);

    autoTable(pdf, {
      startY: summaryY + 6,

      theme: "grid",

      head: [["Total Documents", "Approved", "Pending"]],

      body: [
        [String(stats.total), String(stats.approved), String(stats.pending)],
      ],

      styles: {
        fontSize: 11,
        halign: "center",
        cellPadding: 5,
      },

      headStyles: {
        fillColor: [7, 87, 217],
        textColor: [255, 255, 255],
      },

      bodyStyles: {
        fontStyle: "bold",
      },
    });

    /* -----------------------------------------------------
       DOCUMENT TABLE
    ----------------------------------------------------- */

    const documentsY = pdf.lastAutoTable.finalY + 12;

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(15);

    pdf.text("Documents", 15, documentsY);

    autoTable(pdf, {
      startY: documentsY + 6,

      theme: "grid",

      head: [["#", "Document Type", "Document Number", "Status", "Uploaded"]],

      body: driver.documents.map((document, index) => [
        String(index + 1),
        document.type || "-",
        document.number || "-",
        document.status === "approved" ? "Approved" : "Pending",
        document.uploadedAt || "-",
      ]),

      styles: {
        fontSize: 9,
        cellPadding: 4,
      },

      headStyles: {
        fillColor: [7, 87, 217],
        textColor: [255, 255, 255],
      },

      alternateRowStyles: {
        fillColor: [245, 248, 252],
      },

      didParseCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          const value = String(data.cell.raw).toLowerCase();

          if (value === "approved") {
            data.cell.styles.textColor = [22, 163, 74];
          }

          if (value === "pending") {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      },
    });

    /* -----------------------------------------------------
       DOCUMENT IMAGES
    ----------------------------------------------------- */

    for (let index = 0; index < driver.documents.length; index++) {
      const document = driver.documents[index];

      pdf.addPage();

      pdf.setTextColor(15, 23, 42);

      pdf.setFont("helvetica", "bold");

      pdf.setFontSize(17);

      pdf.text(`${index + 1}. ${document.type || "Document"}`, 15, 20);

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(10);

      pdf.text(`Document Number: ${document.number || "-"}`, 15, 29);

      pdf.text(
        `Status: ${document.status === "approved" ? "Approved" : "Pending"}`,
        15,
        37,
      );

      pdf.text(`Uploaded: ${document.uploadedAt || "-"}`, 15, 45);

      try {
        const imageData = await getDocumentImage(document);

        if (imageData) {
          const imageProperties = pdf.getImageProperties(imageData);

          const maxWidth = pageWidth - 30;

          const maxHeight = pageHeight - 68;

          let imageWidth = maxWidth;

          let imageHeight =
            (imageProperties.height / imageProperties.width) * imageWidth;

          if (imageHeight > maxHeight) {
            imageHeight = maxHeight;

            imageWidth =
              (imageProperties.width / imageProperties.height) * imageHeight;
          }

          const x = (pageWidth - imageWidth) / 2;

          const y = 55;

          let imageType = imageProperties.fileType || "JPEG";

          if (imageType === "PNG") {
            imageType = "PNG";
          } else {
            imageType = "JPEG";
          }

          pdf.addImage(imageData, imageType, x, y, imageWidth, imageHeight);
        } else {
          pdf.setFontSize(11);

          pdf.setTextColor(100, 116, 139);

          pdf.text("Document image could not be embedded.", 15, 62);
        }
      } catch (error) {
        console.error("PDF image error:", error);

        pdf.setFontSize(11);

        pdf.setTextColor(100, 116, 139);

        pdf.text("Document image could not be loaded.", 15, 62);
      }
    }

    /* -----------------------------------------------------
       FOOTER
    ----------------------------------------------------- */

    const totalPages = pdf.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      pdf.setPage(page);

      pdf.setFont("helvetica", "normal");

      pdf.setFontSize(8);

      pdf.setTextColor(100, 116, 139);

      pdf.text("GaadiMitra • Driver Documents Report", 15, pageHeight - 10);

      pdf.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - 38,
        pageHeight - 10,
      );
    }

    const safeName = (driver.name || "driver")
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-");

    const safeUserId = (driver.userId || "user").replace(/[^a-z0-9]/gi, "-");

    pdf.save(`${safeName}-${safeUserId}.pdf`);
  };

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      key: "all",
      label: "All Documents",
      count: documentStats.total,
      icon: FileText,
    },
    {
      key: "pending",
      label: "Pending Documents",
      count: documentStats.pending,
      icon: Clock3,
    },
    {
      key: "approved",
      label: "Approved Documents",
      count: documentStats.approved,
      icon: FileCheck2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Drivers
              </h1>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0757D9]">
                {drivers.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage driver profiles and verify their documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(getAllDriverDocuments())}
            disabled={apiLoading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={apiLoading ? "animate-spin text-[#0757D9]" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* =================================================
            DOCUMENT SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryItem
            icon={FileText}
            label="All Documents"
            value={documentStats.total}
            iconClass="bg-blue-50 text-[#0757D9]"
          />

          <SummaryItem
            icon={ShieldCheck}
            label="Approved Documents"
            value={documentStats.approved}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryItem
            icon={AlertCircle}
            label="Pending Documents"
            value={documentStats.pending}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Tabs */}

            <div className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 xl:w-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex min-w-max
                      items-center gap-2
                      rounded-lg
                      px-4 py-2.5
                      text-sm font-bold
                      transition
                      ${
                        isActive
                          ? "bg-white text-[#0757D9] shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    <Icon size={16} />

                    <span>{tab.label}</span>

                    <span
                      className={`
                        rounded-full px-2 py-0.5 text-[11px]
                        ${
                          isActive
                            ? "bg-blue-50 text-[#0757D9]"
                            : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}

            <div className="relative w-full xl:max-w-sm">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search driver, user ID, phone..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-4
                  text-sm
                  font-medium
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-[#0757D9]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-50
                "
              />
            </div>
          </div>
        </div>

        {/* =================================================
            DRIVER TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
          {/* Desktop */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Driver
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    User ID
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Documents
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Approved
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Pending
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {apiLoading && drivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Loader2
                          size={32}
                          className="animate-spin text-[#0757D9]"
                        />
                        <p className="mt-3 text-sm font-bold text-slate-700">
                          Loading drivers...
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Fetching driver profiles and credentials from backend
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Search size={22} />
                        </div>

                        <p className="mt-3 text-sm font-bold text-slate-700">
                          No drivers found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDrivers.map((driver) => {
                    const stats = getDocumentStats(driver);

                    return (
                      <tr
                        key={driver.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        {/* DRIVER */}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-[#0757D9]">
                              {driver.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-slate-900">
                                {driver.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {driver.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* USER ID */}

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-extrabold text-slate-700">
                            {driver.userId}
                          </span>
                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-extrabold text-slate-800">
                            {stats.total}
                          </span>
                        </td>

                        {/* APPROVED */}

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex min-w-[34px] items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                            {stats.approved}
                          </span>
                        </td>

                        {/* PENDING */}

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`
                                inline-flex
                                min-w-[34px]
                                items-center
                                justify-center
                                rounded-full
                                px-2.5 py-1
                                text-xs font-extrabold
                                ${
                                  stats.pending > 0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }
                              `}
                          >
                            {stats.pending}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewDriver(driver)}
                              className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-blue-100
                                  bg-blue-50
                                  px-3
                                  py-2
                                  text-xs
                                  font-extrabold
                                  text-[#0757D9]
                                  transition
                                  hover:bg-blue-100
                                "
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setVerifyDriverId(driver.id);
                                setVerifyDriverName(driver.name);
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                              title="Verify documents"
                            >
                              <FileCheck size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(driver)}
                              className="
                                  flex h-9 w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-500
                                  transition
                                  hover:border-blue-200
                                  hover:bg-blue-50
                                  hover:text-[#0757D9]
                                "
                              title="Edit documents"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteDriver(driver);

                                setDeleteModalOpen(true);
                              }}
                              className="
                                  flex h-9 w-9
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-red-100
                                  bg-red-50
                                  text-red-500
                                  transition
                                  hover:bg-red-100
                                "
                              title="Delete driver"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}

          <div className="lg:hidden">
            {apiLoading && drivers.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-[#0757D9]"
                />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  Loading drivers...
                </p>
              </div>
            ) : paginatedDrivers.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search size={22} />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-700">
                  No drivers found
                </p>
              </div>
            ) : (
              paginatedDrivers.map((driver) => {
                const stats = getDocumentStats(driver);

                return (
                  <div
                    key={driver.id}
                    className="border-b border-slate-100 p-4 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-[#0757D9]">
                          {driver.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {driver.name}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-500">
                            {driver.userId}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewDriver(driver)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0757D9]"
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400">
                          Documents
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-800">
                          {stats.total}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-400">
                          Approved
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-emerald-600">
                          {stats.approved}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-400">
                          Pending
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-amber-600">
                          {stats.pending}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewDriver(driver)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0757D9] px-3 py-2.5 text-xs font-extrabold text-white"
                      >
                        <Eye size={15} />
                        View Documents
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVerifyDriverId(driver.id);
                          setVerifyDriverName(driver.name);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                      >
                        <FileCheck size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(driver)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteDriver(driver);

                          setDeleteModalOpen(true);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredDrivers.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDrivers.length}
                limit={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          DRIVER DETAILS MODAL
      ===================================================== */}

      {detailsModalOpen && selectedDriver && (
        <DriverDetailsModal
          driver={selectedDriver}
          onClose={() => {
            setDetailsModalOpen(false);

            setSelectedDriver(null);
          }}
          onApprove={handleApproveDocument}
          onEdit={() => handleOpenEdit(selectedDriver)}
          onExportPDF={exportDriverPDF}
          onPreviewDocument={setPreviewDocument}
        />
      )}

      {/* =====================================================
          EDIT DOCUMENTS MODAL
      ===================================================== */}

      {editModalOpen && editDriver && (
        <EditDocumentsModal
          driver={editDriver}
          onClose={() => {
            setEditModalOpen(false);

            setEditDriver(null);
          }}
          onSave={handleSaveDocuments}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModalOpen && deleteDriver && (
        <DeleteDriverModal
          driver={deleteDriver}
          onClose={() => {
            setDeleteModalOpen(false);

            setDeleteDriver(null);
          }}
          onConfirm={handleDeleteDriver}
        />
      )}

      {/* =====================================================
          IMAGE PREVIEW MODAL
      ===================================================== */}

      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
      {verifyDriverId && (
        <DocumentVerificationModal
          driverId={verifyDriverId}
          driverName={verifyDriverName}
          onClose={() => {
            setVerifyDriverId(null);
            setVerifyDriverName("");
          }}
        />
      )}
    </>
  );
};

/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummaryItem = ({ icon: Icon, label, value, iconClass }) => {
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
   DRIVER DETAILS MODAL
========================================================= */

const DriverDetailsModal = ({
  driver,
  onClose,
  onApprove,
  onEdit,
  onExportPDF,
  onPreviewDocument,
}) => {
  const stats = getDocumentStats(driver);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-[#0757D9]">
              {driver.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                {driver.name}
              </h2>

              <p className="mt-0.5 text-xs font-bold text-slate-500">
                User ID: <span className="text-slate-700">{driver.userId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* DRIVER INFO */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoItem icon={Phone} label="Phone" value={driver.phone} />

            <InfoItem icon={Mail} label="Email" value={driver.email} />

            <InfoItem icon={MapPin} label="Location" value={driver.location} />

            <InfoItem
              icon={CalendarDays}
              label="Joined"
              value={driver.joined}
            />
          </div>

          {/* SUMMARY */}

          <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
            <div className="border-r border-slate-200 px-3 py-4 text-center">
              <p className="text-[11px] font-bold text-slate-400">Total</p>

              <p className="mt-1 text-xl font-extrabold text-slate-900">
                {stats.total}
              </p>
            </div>

            <div className="border-r border-slate-200 px-3 py-4 text-center">
              <p className="text-[11px] font-bold text-slate-400">Approved</p>

              <p className="mt-1 text-xl font-extrabold text-emerald-600">
                {stats.approved}
              </p>
            </div>

            <div className="px-3 py-4 text-center">
              <p className="text-[11px] font-bold text-slate-400">Pending</p>

              <p className="mt-1 text-xl font-extrabold text-amber-600">
                {stats.pending}
              </p>
            </div>
          </div>

          {/* DOCUMENTS */}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Driver Documents
                </h3>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Click any document image to view it in full size.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                {stats.total} Documents
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              {driver.documents.map((document, index) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 border-b border-slate-100 p-4 last:border-0 sm:flex-row sm:items-center"
                >
                  {/* IMAGE */}

                  <button
                    type="button"
                    onClick={() => onPreviewDocument(document)}
                    className="group relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-20 sm:w-28"
                  >
                    {document.url ? (
                      <img
                        src={document.url}
                        alt={document.type}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageIcon size={24} />
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                      <Eye
                        size={19}
                        className="text-white opacity-0 transition group-hover:opacity-100"
                      />
                    </div>
                  </button>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {document.type}
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        #{index + 1}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                      {document.number || "No document number"}
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Uploaded {document.uploadedAt || "-"}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span
                      className={`
                          rounded-full
                          px-3
                          py-1.5
                          text-[11px]
                          font-extrabold
                          ${
                            document.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        `}
                    >
                      {document.status === "approved" ? "Approved" : "Pending"}
                    </span>

                    {document.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onApprove(driver.id, document.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-700"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit Documents
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onExportPDF(driver)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#064bbd]"
            >
              <Download size={16} />
              Export PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0757D9] shadow-sm">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   EDIT DOCUMENTS MODAL
========================================================= */

const EditDocumentsModal = ({ driver, onClose, onSave }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (driver) {
      setDocuments(
        driver.documents.map((document) => ({
          ...document,
        })),
      );
    }
  }, [driver]);

  const updateDocument = (documentId, field, value) => {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              [field]: value,
            }
          : document,
      ),
    );
  };

  const handleFileChange = (documentId, event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const localPreview = URL.createObjectURL(file);

    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              file,
              url: localPreview,
            }
          : document,
      ),
    );
  };

  const handleSave = () => {
    onSave(driver.id, documents);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Edit Documents
            </h2>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {driver.name} • {driver.userId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {documents.map((document, index) => (
            <div
              key={document.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Document #{index + 1}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Update document details or replace the file.
                  </p>
                </div>

                <span
                  className={`
                      rounded-full
                      px-2.5
                      py-1
                      text-[10px]
                      font-extrabold
                      ${
                        document.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }
                    `}
                >
                  {document.status === "approved" ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* TYPE */}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                    Document Type
                  </label>

                  <input
                    type="text"
                    value={document.type}
                    onChange={(event) =>
                      updateDocument(document.id, "type", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* NUMBER */}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                    Document Number
                  </label>

                  <input
                    type="text"
                    value={document.number}
                    onChange={(event) =>
                      updateDocument(document.id, "number", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                    Status
                  </label>

                  <select
                    value={document.status}
                    onChange={(event) =>
                      updateDocument(document.id, "status", event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#0757D9] focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="pending">Pending</option>

                    <option value="approved">Approved</option>
                  </select>
                </div>

                {/* FILE */}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                    Replace Document
                  </label>

                  <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-500 transition hover:border-[#0757D9] hover:bg-blue-50 hover:text-[#0757D9]">
                    <Upload size={16} />

                    <span className="truncate">
                      {document.file
                        ? formatFileName(document.file.name)
                        : "Choose new file"}
                    </span>

                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(event) => handleFileChange(document.id, event)}
                    />
                  </label>
                </div>
              </div>

              {/* PREVIEW */}

              {document.url && (
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={document.url}
                    alt={document.type}
                    className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
                  />

                  <div>
                    <p className="text-xs font-extrabold text-slate-700">
                      Current Preview
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      The uploaded document image is shown here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#064bbd]"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DELETE MODAL
========================================================= */

const DeleteDriverModal = ({ driver, onClose, onConfirm }) => {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          Delete Driver?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-extrabold text-slate-700">{driver.name}</span>?
          All associated driver document data will also be removed.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete Driver
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   LARGE DOCUMENT PREVIEW
========================================================= */

const DocumentPreviewModal = ({ document, onClose }) => {
  if (!document) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-extrabold text-slate-900">
              {document.type || "Document"}
            </h3>

            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
              {document.number || "No document number"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* IMAGE */}

        <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-auto bg-slate-950 p-4 sm:p-8">
          {document.url ? (
            <img
              src={document.url}
              alt={document.type || "Document"}
              className="max-h-[76vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <ImageIcon size={48} />

              <p className="text-sm font-semibold">
                Document image not available
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-extrabold
                ${
                  document.status === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }
              `}
            >
              {document.status === "approved" ? "Approved" : "Pending"}
            </span>

            <span className="text-xs font-semibold text-slate-400">
              Uploaded {document.uploadedAt || "-"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#0757D9] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#064bbd]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DOCUMENT VERIFICATION MODAL
========================================================= */

const DocumentVerificationModal = ({ driverId, driverName, onClose }) => {
  const dispatch = useDispatch();

  const documents = useSelector(selectDriverDocuments);
  const loading = useSelector(selectDocumentsLoading);
  const verifyLoading = useSelector(selectVerifyLoading);
  const verifySuccess = useSelector(selectVerifySuccess);
  const verifyError = useSelector(selectVerifyError);
  const documentMessage = useSelector(selectDocumentMessage);

  const [overallStatus, setOverallStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [itemVerifications, setItemVerifications] = useState({
    drivingLicense: false,
    rc: false,
    insurance: false,
    permit: false,
    aadharCard: false,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (driverId) {
      dispatch(getDriverDocuments(driverId));
    }
  }, [dispatch, driverId]);

  useEffect(() => {
    if (documents) {
      setOverallStatus(documents.status || "pending");
      setRejectionReason(documents.rejectionReason || "");
      setItemVerifications({
        drivingLicense: Boolean(documents.drivingLicense?.isVerified),
        rc: Boolean(documents.rc?.isVerified),
        insurance: Boolean(documents.insurance?.isVerified),
        permit: Boolean(documents.permit?.isVerified),
        aadharCard: Boolean(documents.aadharCard?.isVerified),
      });
    }
  }, [documents]);

  useEffect(() => {
    if (verifySuccess) {
      toast.success(
        documentMessage || "Verification status updated successfully!",
      );
      dispatch(clearDocumentSuccess());
      dispatch(getAllDriverDocuments());
      onClose();
    }
  }, [verifySuccess, documentMessage, dispatch, onClose]);

  useEffect(() => {
    if (verifyError) {
      toast.error(verifyError);
      dispatch(clearDocumentError());
    }
  }, [verifyError, dispatch]);

  const handleToggleItemVerification = (docKey) => {
    setItemVerifications((prev) => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  };

  const handleMarkAllVerified = () => {
    setItemVerifications({
      drivingLicense: true,
      rc: true,
      insurance: true,
      permit: true,
      aadharCard: true,
    });
    setOverallStatus("approved");
    setRejectionReason("");
    toast.success("All documents marked as verified!");
  };

  const handleSaveVerification = async () => {
    if (overallStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Please specify a reason for rejecting the documents");
      return;
    }

    try {
      await dispatch(
        verifyDocuments({
          driverId,
          status: overallStatus,
          rejectionReason:
            overallStatus === "rejected" ? rejectionReason.trim() : "",
          itemVerifications,
        }),
      ).unwrap();
    } catch {
      // error handled in useEffect
    }
  };

  const verifiedCount = useMemo(() => {
    return Object.values(itemVerifications).filter(Boolean).length;
  }, [itemVerifications]);

  const verifiedPercent = Math.round((verifiedCount / 5) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
              <FileCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Document Verification
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Driver:{" "}
                <span className="font-bold text-slate-700">{driverName}</span> (
                {driverId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && !documents ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Loader2 size={32} className="animate-spin text-[#0757D9]" />
              <p className="mt-3 text-sm font-bold text-slate-800">
                Loading Documents...
              </p>
            </div>
          ) : !documents ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <FileQuestion size={32} className="text-slate-400" />
              <h3 className="mt-4 text-base font-bold text-slate-800">
                No Documents Found
              </h3>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        overallStatus === "approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : overallStatus === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {overallStatus === "approved" ? (
                        <CheckCircle2 size={26} />
                      ) : overallStatus === "rejected" ? (
                        <XCircle size={26} />
                      ) : (
                        <Clock size={26} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Overall Status:
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize ${
                            overallStatus === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : overallStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              overallStatus === "approved"
                                ? "bg-emerald-500"
                                : overallStatus === "rejected"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {overallStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Driver ID:{" "}
                        <span className="font-mono font-bold text-slate-700">
                          {documents.driverId}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-600">
                        <span>Item Verification</span>
                        <span className="text-[#0757D9]">
                          {verifiedCount}/5 Verified ({verifiedPercent}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full transition-all duration-300 ${
                            verifiedPercent === 100
                              ? "bg-emerald-500"
                              : verifiedPercent >= 60
                                ? "bg-[#0757D9]"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${verifiedPercent}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkAllVerified}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Verify All 5 Items</span>
                    </button>
                  </div>
                </div>

                {overallStatus === "rejected" && documents.rejectionReason && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700">
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <div>
                      <span className="font-bold">Rejection Reason: </span>
                      <span>{documents.rejectionReason}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {DOC_CONFIGS.map((doc) => {
                  const Icon = doc.icon;
                  const docData = documents[doc.key] || {};
                  const isItemVerified = Boolean(itemVerifications[doc.key]);

                  return (
                    <div
                      key={doc.key}
                      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition ${
                        isItemVerified
                          ? "border-emerald-200/90 shadow-[0_4px_16px_rgba(16,185,129,0.06)]"
                          : "border-slate-200/90"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                isItemVerified
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-blue-50 text-[#0757D9]"
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-extrabold text-slate-800">
                                {doc.title}
                              </h3>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                              isItemVerified
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isItemVerified ? (
                              <>
                                <CheckCircle2
                                  size={12}
                                  className="text-emerald-600"
                                />
                                Verified
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="text-slate-400" />
                                Unverified
                              </>
                            )}
                          </span>
                        </div>

                        <div className="mt-3.5 grid grid-cols-2 gap-3">
                          {doc.fields.map((field) => (
                            <div
                              key={field.key}
                              className="rounded-xl bg-slate-50/70 p-2.5"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {field.label}
                              </p>
                              <p className="mt-0.5 truncate text-xs font-mono font-bold text-slate-800">
                                {docData[field.key] || (
                                  <span className="font-sans font-normal italic text-slate-400">
                                    Not provided
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Uploaded Document Photos
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {doc.photos.map((photo) => {
                              const photoUrl = docData[photo.key];

                              return (
                                <div
                                  key={photo.key}
                                  className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50"
                                >
                                  <div className="relative h-28 w-full overflow-hidden bg-slate-900/5">
                                    {photoUrl ? (
                                      <>
                                        <img
                                          src={photoUrl}
                                          alt={photo.label}
                                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                        <div
                                          onClick={() =>
                                            setPreviewImage({
                                              url: photoUrl,
                                              title: `${doc.title} - ${photo.label}`,
                                            })
                                          }
                                          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
                                        >
                                          <span className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow">
                                            <Eye size={12} /> View Full
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex h-full flex-col items-center justify-center text-slate-300">
                                        <ImageIcon size={24} />
                                        <span className="mt-1 text-[10px] font-medium text-slate-400">
                                          No Image Uploaded
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-2.5 py-1.5">
                                    <span className="truncate text-[10px] font-bold text-slate-600">
                                      {photo.label}
                                    </span>
                                    {photoUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage({
                                            url: photoUrl,
                                            title: `${doc.title} - ${photo.label}`,
                                          })
                                        }
                                        className="text-slate-400 hover:text-[#0757D9]"
                                        title="Open"
                                      >
                                        <ExternalLink size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50/60 p-2.5 transition hover:bg-slate-100/70">
                          <span className="text-xs font-bold text-slate-700">
                            Mark this document as verified
                          </span>
                          <input
                            type="checkbox"
                            checked={isItemVerified}
                            onChange={() =>
                              handleToggleItemVerification(doc.key)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-[#0757D9] focus:ring-[#0757D9]"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldAlert size={18} className="text-[#0757D9]" />
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Admin Final Verification Decision
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Select Status
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOverallStatus("approved");
                          setRejectionReason("");
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition ${
                          overallStatus === "approved"
                            ? "border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle2
                          size={20}
                          className={
                            overallStatus === "approved"
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }
                        />
                        <span className="text-xs font-extrabold">Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverallStatus("pending")}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition ${
                          overallStatus === "pending"
                            ? "border-amber-500 bg-amber-50/80 text-amber-800 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Clock
                          size={20}
                          className={
                            overallStatus === "pending"
                              ? "text-amber-600"
                              : "text-slate-400"
                          }
                        />
                        <span className="text-xs font-extrabold">Pending</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverallStatus("rejected")}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition ${
                          overallStatus === "rejected"
                            ? "border-red-500 bg-red-50/80 text-red-800 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <XCircle
                          size={20}
                          className={
                            overallStatus === "rejected"
                              ? "text-red-600"
                              : "text-slate-400"
                          }
                        />
                        <span className="text-xs font-extrabold">Reject</span>
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-500">
                      Changing status updates the driver record in backend and
                      notifies the driver via app notifications.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Rejection Reason{" "}
                      {overallStatus === "rejected" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify clear feedback why documents were rejected so the driver can re-upload..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-medium text-slate-800 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
                    />
                    {overallStatus === "rejected" && (
                      <div className="mt-2">
                        <p className="mb-1 text-[10px] font-bold text-slate-400">
                          Quick Preset Reasons:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {REJECTION_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setRejectionReason(preset)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleSaveVerification}
                    disabled={verifyLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0757D9] px-6 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {verifyLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating Status...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Save & Update Verification Status</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(null);
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h4 className="text-xs font-extrabold text-slate-800">
                {previewImage.title || "Document Preview"}
              </h4>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Open original"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center overflow-auto bg-slate-900 p-4">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
