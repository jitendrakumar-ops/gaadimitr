import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  IndianRupee,
  RefreshCcw,
  Route,
  ShieldAlert,
  ShoppingBag,
  Star,
  UserPlus,
  UserRoundCheck,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  getAdminOverview,
  selectAdmin,
  selectAdminOverview,
  selectOverviewLoading,
} from "../reducer/slices/adminSlice";
import { getBookings, selectBookings } from "../reducer/slices/bookingSlice";
import {
  getAllUserPackages,
  selectUserPackages,
} from "../reducer/slices/packageSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

/* =========================================================
   MAIN STATS
========================================================= */

const stats = [
  {
    title: "Total Users",
    value: 12840,
    change: "12.5%",
    trend: "up",
    subtitle: "vs last month",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-[#0757D9]",
  },
  {
    title: "Active Drivers",
    value: 1284,
    change: "8.2%",
    trend: "up",
    subtitle: "vs last month",
    icon: UserRoundCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Total Rides",
    value: 28492,
    change: "14.8%",
    trend: "up",
    subtitle: "vs last month",
    icon: Route,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Total Revenue",
    value: 18.42,
    change: "10.6%",
    trend: "up",
    subtitle: "vs last month",
    icon: IndianRupee,
    prefix: "₹",
    suffix: "L",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

/* =========================================================
   SECONDARY STATS
========================================================= */

const secondaryStats = [
  {
    title: "New Users",
    value: 486,
    subtitle: "Joined this month",
    change: "+18.4%",
    trend: "up",
    icon: UserPlus,
    iconBg: "bg-blue-50",
    iconColor: "text-[#0757D9]",
  },
  {
    title: "New Drivers",
    value: 126,
    subtitle: "Joined this month",
    change: "+11.2%",
    trend: "up",
    icon: UserRoundCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Pending Documents",
    value: 34,
    subtitle: "Need verification",
    change: "8 urgent",
    trend: "down",
    icon: ShieldAlert,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    title: "Today's Recharge",
    value: 428600,
    subtitle: "Total wallet purchases",
    change: "+16.7%",
    trend: "up",
    prefix: "₹",
    icon: WalletCards,
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

/* =========================================================
   RIDE DATA
========================================================= */

const rideData = [
  { day: "Mon", rides: 420 },
  { day: "Tue", rides: 580 },
  { day: "Wed", rides: 490 },
  { day: "Thu", rides: 690 },
  { day: "Fri", rides: 760 },
  { day: "Sat", rides: 920 },
  { day: "Sun", rides: 840 },
];

/* =========================================================
   RIDE STATUS
========================================================= */

const rideStatuses = [
  {
    label: "Completed",
    value: 68,
    count: "19,374",
    color: "#0757D9",
  },
  {
    label: "Ongoing",
    value: 12,
    count: "3,419",
    color: "#38BDF8",
  },
  {
    label: "Requested",
    value: 8,
    count: "2,279",
    color: "#A78BFA",
  },
  {
    label: "Cancelled",
    value: 12,
    count: "3,420",
    color: "#E2E8F0",
  },
];

/* =========================================================
   RECENT RIDES
========================================================= */

const recentRides = [
  {
    id: "#GM-28491",
    user: "Rahul Sharma",
    route: "Noida → Connaught Place",
    driver: "Amit Kumar",
    amount: "₹486",
    status: "Completed",
    time: "2 min ago",
  },
  {
    id: "#GM-28490",
    user: "Priya Singh",
    route: "Indirapuram → Delhi Airport",
    driver: "Rohit Verma",
    amount: "₹724",
    status: "Ongoing",
    time: "5 min ago",
  },
  {
    id: "#GM-28489",
    user: "Arjun Mehta",
    route: "Sector 62 → Botanical Garden",
    driver: "Sanjay Yadav",
    amount: "₹218",
    status: "Completed",
    time: "8 min ago",
  },
  {
    id: "#GM-28488",
    user: "Neha Gupta",
    route: "Vaishali → Anand Vihar",
    driver: "Vikas Singh",
    amount: "₹304",
    status: "Cancelled",
    time: "12 min ago",
  },
  {
    id: "#GM-28487",
    user: "Karan Malhotra",
    route: "Noida Sector 18 → Gurugram",
    driver: "Deepak Kumar",
    amount: "₹912",
    status: "Completed",
    time: "16 min ago",
  },
];

/* =========================================================
   LIVE RIDES
========================================================= */

const liveRides = [
  {
    user: "Rohit Mehra",
    route: "Noida → Delhi",
    driver: "Vivek Singh",
    vehicle: "DL 8C AX 4281",
    progress: 72,
  },
  {
    user: "Ananya Sharma",
    route: "Indirapuram → Airport",
    driver: "Mohit Kumar",
    vehicle: "UP 16 BT 8214",
    progress: 48,
  },
  {
    user: "Aditya Jain",
    route: "Sector 18 → Gurugram",
    driver: "Rahul Yadav",
    vehicle: "UP 14 DX 1028",
    progress: 31,
  },
];

/* =========================================================
   TOP ROUTES
========================================================= */

const topRoutes = [
  {
    route: "Noida → Delhi",
    rides: "4,284",
    revenue: "₹8.42L",
  },
  {
    route: "Delhi → Noida",
    rides: "3,912",
    revenue: "₹7.84L",
  },
  {
    route: "Noida → Gurugram",
    rides: "2,841",
    revenue: "₹6.18L",
  },
  {
    route: "Indirapuram → Airport",
    rides: "2,416",
    revenue: "₹5.72L",
  },
];

/* =========================================================
   RECENT RECHARGES
========================================================= */

const recentRecharges = [
  {
    id: "#RP-98241",
    user: "Rahul Sharma",
    userId: "GM10284",
    amount: "₹2,000",
    method: "UPI",
    status: "Success",
    time: "2 min ago",
  },
  {
    id: "#RP-98240",
    user: "Priya Singh",
    userId: "GM10492",
    amount: "₹1,000",
    method: "Razorpay",
    status: "Success",
    time: "6 min ago",
  },
  {
    id: "#RP-98239",
    user: "Arjun Mehta",
    userId: "GM10821",
    amount: "₹500",
    method: "UPI",
    status: "Success",
    time: "11 min ago",
  },
  {
    id: "#RP-98238",
    user: "Neha Gupta",
    userId: "GM11104",
    amount: "₹1,500",
    method: "Card",
    status: "Pending",
    time: "15 min ago",
  },
  {
    id: "#RP-98237",
    user: "Karan Malhotra",
    userId: "GM11542",
    amount: "₹2,500",
    method: "UPI",
    status: "Success",
    time: "21 min ago",
  },
];

/* =========================================================
   ACTIVITIES
========================================================= */

const activities = [
  {
    icon: UserRoundCheck,
    title: "New driver approved",
    description: "Vivek Sharma was approved as a driver",
    time: "8 min ago",
  },
  {
    icon: Users,
    title: "New user registered",
    description: "Ananya Verma joined GaadiMitra",
    time: "14 min ago",
  },
  {
    icon: Star,
    title: "New rating received",
    description: "Rahul gave 5 stars to driver Amit",
    time: "21 min ago",
  },
  {
    icon: CarFront,
    title: "Vehicle added",
    description: "UP 16 BT 8214 added by Rohit Kumar",
    time: "34 min ago",
  },
];

/* =========================================================
   COUNTER
========================================================= */

const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1200,
}) => {
  const numericVal = typeof value === "number" ? value : parseFloat(value) || 0;
  const isFloat = !Number.isInteger(numericVal);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) {
        startTimestamp = timestamp;
      }

      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);

      if (isFloat) {
        setCount(parseFloat((easeOut * numericVal).toFixed(2)));
      } else {
        setCount(Math.floor(easeOut * numericVal));
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericVal);
      }
    };

    window.requestAnimationFrame(step);
  }, [numericVal, duration, isFloat]);

  const formatNumber = (num) => {
    if (isFloat) {
      return num.toFixed(2);
    }
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return num.toLocaleString("en-IN");
    }
    return num;
  };

  return (
    <span>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const dispatch = useDispatch();
  const overview = useSelector(selectAdminOverview);
  const overviewLoading = useSelector(selectOverviewLoading);
  const adminState = useSelector(selectAdmin);
  const bookings = useSelector(selectBookings);
  const userPackages = useSelector(selectUserPackages);

  const [range, setRange] = useState("30D");

  const rangeApiMap = useMemo(
    () => ({
      "7D": "7day",
      "30D": "30day",
      "3M": "3month",
      "1Y": "1year",
    }),
    [],
  );

  const handleFetchAllData = () => {
    dispatch(getAdminOverview(rangeApiMap[range] || "30day"));
    dispatch(getBookings({ limit: 10 }));
    dispatch(getAllUserPackages({ limit: 10 }));
  };

  useEffect(() => {
    dispatch(getAdminOverview(rangeApiMap[range] || "30day"));
  }, [dispatch, range, rangeApiMap]);

  useEffect(() => {
    dispatch(getBookings({ limit: 10 }));
    dispatch(getAllUserPackages({ limit: 10 }));
  }, [dispatch]);

  /* =======================================================
     PRIMARY STATS (DYNAMIC FROM BACKEND)
  ======================================================= */

  const primaryStats = useMemo(() => {
    const summary = overview?.summary;
    const revRaw = summary?.totalRevenue;
    let revValue = 18.42;
    let revSuffix = "L";
    if (revRaw !== undefined && revRaw !== null) {
      if (revRaw >= 100000) {
        revValue = parseFloat((revRaw / 100000).toFixed(2));
        revSuffix = "L";
      } else if (revRaw >= 1000) {
        revValue = parseFloat((revRaw / 1000).toFixed(1));
        revSuffix = "K";
      } else {
        revValue = revRaw;
        revSuffix = "";
      }
    }

    return [
      {
        title: "Total Users",
        value: summary?.totalUsers !== undefined ? summary.totalUsers : 12840,
        change: "12.5%",
        trend: "up",
        subtitle: "vs last month",
        icon: Users,
        iconBg: "bg-blue-50",
        iconColor: "text-[#0757D9]",
      },
      {
        title: "Active Drivers",
        value:
          summary?.activeDrivers !== undefined ? summary.activeDrivers : 1284,
        change: "8.2%",
        trend: "up",
        subtitle: "vs last month",
        icon: UserRoundCheck,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        title: "Total Rides",
        value: summary?.totalRides !== undefined ? summary.totalRides : 28492,
        change: "14.8%",
        trend: "up",
        subtitle: "vs last month",
        icon: Route,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
      },
      {
        title: "Total Revenue",
        value: revValue,
        change: "10.6%",
        trend: "up",
        subtitle: "vs last month",
        icon: IndianRupee,
        prefix: "₹",
        suffix: revSuffix,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ];
  }, [overview]);

  /* =======================================================
     SECONDARY STATS (DYNAMIC FROM BACKEND)
  ======================================================= */

  const secondaryStatsList = useMemo(() => {
    const summary = overview?.summary;
    return [
      {
        title: "New Users",
        value: summary?.newUsers !== undefined ? summary.newUsers : 486,
        subtitle: "Joined this period",
        change: "+18.4%",
        trend: "up",
        icon: UserPlus,
        iconBg: "bg-blue-50",
        iconColor: "text-[#0757D9]",
      },
      {
        title: "New Drivers",
        value: summary?.newDrivers !== undefined ? summary.newDrivers : 126,
        subtitle: "Joined this period",
        change: "+11.2%",
        trend: "up",
        icon: UserRoundCheck,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        title: "Pending Documents",
        value:
          summary?.pendingDocuments !== undefined
            ? summary.pendingDocuments
            : 34,
        subtitle: "Need verification",
        change:
          summary?.pendingDocuments > 0
            ? `${summary.pendingDocuments} urgent`
            : "All verified",
        trend: summary?.pendingDocuments > 0 ? "down" : "up",
        icon: ShieldAlert,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
      },
      {
        title: "Today's Recharge",
        value:
          summary?.todayRecharge !== undefined ? summary.todayRecharge : 428600,
        subtitle: "Total wallet purchases",
        change: "+16.7%",
        trend: "up",
        prefix: "₹",
        icon: WalletCards,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
      },
    ];
  }, [overview]);

  /* =======================================================
     REVENUE & EARNINGS CHART DATA
  ======================================================= */

  const revenueChartData = useMemo(() => {
    const fin = overview?.financialOverview;
    if (Array.isArray(fin) && fin.length > 0) {
      const categories = fin.map((item) => item.month);
      const earnings = fin.map((item) =>
        Math.round(Number(item.revenue || 0) / 1000),
      );
      const orders = fin.map((item) =>
        Math.max(1, Math.round(Number(item.revenue || 0) / 350) || 5),
      );
      const refunds = fin.map(() => 0);
      return {
        categories,
        series: [
          { name: "Orders", type: "area", data: orders },
          { name: "Earnings (₹K)", type: "column", data: earnings },
          { name: "Refunds", type: "line", data: refunds },
        ],
      };
    }
    return {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      series: [
        {
          name: "Orders",
          type: "area",
          data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67],
        },
        {
          name: "Earnings",
          type: "column",
          data: [89, 98, 69, 109, 77, 84, 51, 28, 92, 42, 88, 36],
        },
        {
          name: "Refunds",
          type: "line",
          data: [8, 12, 7, 17, 20, 11, 5, 9, 7, 29, 13, 34],
        },
      ],
    };
  }, [overview]);

  const revenueChartOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height: "100%",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: "easeinout", speed: 600 },
      },
      colors: ["#0757D9", "#38B8A6", "#F66A4A"],
      stroke: { width: [3, 0, 2.5], curve: "smooth", dashArray: [0, 0, 7] },
      fill: {
        type: ["gradient", "solid", "solid"],
        opacity: [0.2, 1, 1],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
      markers: { size: [0, 0, 0], hover: { sizeOffset: 4 } },
      plotOptions: { bar: { columnWidth: "38%", borderRadius: 4 } },
      dataLabels: { enabled: false },
      grid: {
        borderColor: "#eef2f6",
        strokeDashArray: 4,
        padding: { top: 0, right: 8, bottom: 0, left: 0 },
      },
      xaxis: {
        categories: revenueChartData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#94A3B8",
            fontSize: "10px",
            fontFamily: "inherit",
            fontWeight: 600,
          },
        },
      },
      yaxis: {
        min: 0,
        labels: {
          style: {
            colors: "#94A3B8",
            fontSize: "10px",
            fontFamily: "inherit",
            fontWeight: 600,
          },
          formatter: (value) => {
            // ✅ ₹1k format for better readability
            const num = Number(value);
            if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
            return `₹${num.toFixed(0)}`;
          },
        },
      },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "10px",
        fontFamily: "inherit",
        fontWeight: 600,
        labels: { colors: "#64748B" },
        markers: { width: 8, height: 8, radius: 50 },
        itemMargin: { horizontal: 10, vertical: 3 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: "light",
        style: { fontSize: "11px", fontFamily: "inherit" },
        y: {
          formatter: (value) => `₹${Number(value).toLocaleString("en-IN")}`,
        },
      },
    }),
    [revenueChartData.categories],
  );

  /* =======================================================
     USER / DRIVER GROWTH CHART DATA
  ======================================================= */

  const growthChartData = useMemo(() => {
    const gr = overview?.userDriverGrowth;
    if (Array.isArray(gr) && gr.length > 0) {
      return {
        categories: gr.map((item) => item.day),
        series: [
          { name: "Users", data: gr.map((item) => item.users) },
          { name: "Drivers", data: gr.map((item) => item.drivers) },
        ],
      };
    }
    return {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      series: [
        { name: "Users", data: [520, 680, 760, 920, 1080, 1260, 1420] },
        { name: "Drivers", data: [210, 270, 310, 380, 440, 520, 610] },
      ],
    };
  }, [overview]);

  const growthOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, speed: 700 },
      },
      colors: ["#0757D9", "#10B981"],
      stroke: { curve: "smooth", width: 2.5 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.02,
          stops: [0, 100],
        },
      },
      markers: { size: 0, hover: { size: 5 } },
      dataLabels: { enabled: false },
      grid: { borderColor: "#eef2f6", strokeDashArray: 4 },
      xaxis: {
        categories: growthChartData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#94A3B8",
            fontSize: "10px",
            fontFamily: "inherit",
            fontWeight: 600,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#94A3B8",
            fontSize: "10px",
            fontFamily: "inherit",
            fontWeight: 600,
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "10px",
        fontWeight: 600,
        markers: { width: 8, height: 8 },
      },
      tooltip: { shared: true, intersect: false, theme: "light" },
    }),
    [growthChartData.categories],
  );

  /* =======================================================
     RIDE STATUS DOUGHNUT
  ======================================================= */

  const calculatedRideStatuses = useMemo(() => {
    if (Array.isArray(bookings) && bookings.length > 0) {
      const completed = bookings.filter(
        (b) => b.status === "trip_completed",
      ).length;
      const ongoing = bookings.filter((b) =>
        [
          "driver_assigned",
          "driver_arriving",
          "driver_arrived",
          "on_trip",
        ].includes(b.status),
      ).length;
      const requested = bookings.filter((b) =>
        ["pending", "searching_driver"].includes(b.status),
      ).length;
      const cancelled = bookings.filter((b) => b.status === "cancelled").length;
      const total = bookings.length;

      return [
        {
          label: "Completed",
          value: Math.round((completed / total) * 100) || 0,
          count: completed.toLocaleString("en-IN"),
          color: "#0757D9",
        },
        {
          label: "Ongoing",
          value: Math.round((ongoing / total) * 100) || 0,
          count: ongoing.toLocaleString("en-IN"),
          color: "#38BDF8",
        },
        {
          label: "Requested",
          value: Math.round((requested / total) * 100) || 0,
          count: requested.toLocaleString("en-IN"),
          color: "#A78BFA",
        },
        {
          label: "Cancelled",
          value: Math.round((cancelled / total) * 100) || 0,
          count: cancelled.toLocaleString("en-IN"),
          color: "#E2E8F0",
        },
      ];
    }
    return rideStatuses;
  }, [bookings]);

  const doughnutData = useMemo(
    () => ({
      labels: calculatedRideStatuses.map((item) => item.label),
      datasets: [
        {
          data: calculatedRideStatuses.map((item) => item.value),
          backgroundColor: calculatedRideStatuses.map((item) => item.color),
          borderWidth: 0,
          hoverOffset: 5,
        },
      ],
    }),
    [calculatedRideStatuses],
  );

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "76%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        bodyFont: { size: 11 },
        padding: 9,
        cornerRadius: 8,
      },
    },
  };

  const totalRidesFormatted = useMemo(() => {
    const total = overview?.summary?.totalRides ?? 28492;
    if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}K`;
    }
    return String(total);
  }, [overview]);

  /* =======================================================
     WEEKLY RIDES BAR
  ======================================================= */

  const weeklyRideChart = useMemo(() => {
    const wr = overview?.weeklyRide;
    if (Array.isArray(wr) && wr.length > 0) {
      return {
        labels: wr.map((item) => item.day),
        datasets: [
          {
            label: "Rides",
            data: wr.map((item) => item.rides),
            backgroundColor: "#0757D9",
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 22,
          },
        ],
      };
    }
    return {
      labels: rideData.map((item) => item.day),
      datasets: [
        {
          label: "Rides",
          data: rideData.map((item) => item.rides),
          backgroundColor: "#0757D9",
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 22,
        },
      ],
    };
  }, [overview]);

  const weeklyRideOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        padding: 9,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94A3B8", font: { size: 10, weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#EEF2F6", drawBorder: false },
        border: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 10, weight: "600" },
          callback: (value) => (value >= 1000 ? `${value / 1000}K` : value),
        },
      },
    },
  };

  /* =======================================================
     DYNAMIC RECENT RIDES & RECHARGES
  ======================================================= */

  const recentRidesList = useMemo(() => {
    if (Array.isArray(bookings) && bookings.length > 0) {
      return bookings.slice(0, 5).map((ride) => {
        const id = ride.bookingId
          ? `#${ride.bookingId}`
          : `#GM-${ride._id?.slice(-5).toUpperCase()}`;
        const userName = ride.userId?.name || ride.user?.name || "Passenger";
        const pickup = ride.pickupLocation?.address || "Pickup";
        const drop = ride.dropoffLocation?.address || "Dropoff";
        const route = `${pickup.slice(0, 20)} → ${drop.slice(0, 20)}`;
        const driverName =
          ride.driverId?.name || ride.driver?.name || "Unassigned";
        const amount = `₹${((ride.fare || 0) + (ride.tokenMoney || 0)).toLocaleString("en-IN")}`;
        const status =
          ride.status === "trip_completed"
            ? "Completed"
            : ride.status === "cancelled"
              ? "Cancelled"
              : "Ongoing";
        const time = ride.createdAt
          ? new Date(ride.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
          : "Recently";

        return {
          id,
          user: userName,
          route,
          driver: driverName,
          amount,
          status,
          time,
        };
      });
    }
    return recentRides;
  }, [bookings]);

  const recentRechargesList = useMemo(() => {
    if (Array.isArray(userPackages) && userPackages.length > 0) {
      return userPackages.slice(0, 5).map((pkg) => {
        const id = pkg.transactionId
          ? `#${pkg.transactionId.slice(-7)}`
          : `#RP-${pkg._id?.slice(-5).toUpperCase()}`;
        const userName = pkg.user?.name || pkg.userId?.name || "Subscriber";
        const userCode =
          pkg.user?.code ||
          (pkg.userId?._id
            ? `GM${pkg.userId._id.slice(-5).toUpperCase()}`
            : "GM10284");
        const amount = `₹${(pkg.finalAmount || pkg.package?.price || 0).toLocaleString("en-IN")}`;
        const method = pkg.paymentGateway || "Online";
        const status = pkg.paymentStatus === "paid" ? "Success" : "Pending";
        const time = pkg.createdAt
          ? new Date(pkg.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
          : "Recently";

        return {
          id,
          user: userName,
          userId: userCode,
          amount,
          method,
          status,
          time,
        };
      });
    }
    return recentRecharges;
  }, [userPackages]);

  const liveRidesList = useMemo(() => {
    const ongoing = (bookings || []).filter((b) =>
      [
        "driver_assigned",
        "driver_arriving",
        "driver_arrived",
        "on_trip",
      ].includes(b.status),
    );
    if (ongoing.length > 0) {
      return ongoing.slice(0, 3).map((r) => {
        const userName = r.userId?.name || r.user?.name || "Passenger";
        const pickup = r.pickupLocation?.address || "Pickup";
        const drop = r.dropoffLocation?.address || "Destination";
        const route = `${pickup.slice(0, 15)} → ${drop.slice(0, 15)}`;
        const driverName = r.driverId?.name || r.driver?.name || "Driver";
        const vehicle = r.driverId?.vehicleNo || r.vehicleNo || "DL 8C AX 4281";
        const progress =
          r.status === "on_trip" ? 75 : r.status === "driver_arrived" ? 45 : 20;
        return {
          user: userName,
          route,
          driver: driverName,
          vehicle,
          progress,
        };
      });
    }
    return liveRides;
  }, [bookings]);

  const todayRechargeTotal = useMemo(() => {
    const tr = overview?.summary?.todayRecharge;
    if (tr !== undefined && tr !== null) {
      if (tr >= 100000) {
        return `₹${(tr / 100000).toFixed(2)}L`;
      }
      return `₹${tr.toLocaleString("en-IN")}`;
    }
    return "₹4.28L";
  }, [overview]);

  const miniOrders = useMemo(() => {
    const o = overview?.summary?.totalRides;
    return o !== undefined ? o : 7585;
  }, [overview]);

  const miniEarnings = useMemo(() => {
    const r = overview?.summary?.totalRevenue;
    if (r !== undefined && r !== null) {
      return `₹${(r / 1000).toFixed(1)}K`;
    }
    return "₹22.89K";
  }, [overview]);

  const miniRefunds = 0;

  const totalPurchasedPackages = Array.isArray(userPackages)
    ? userPackages.length
    : 1842;

  const avgRideValue =
    overview?.summary?.totalRides && overview?.summary?.totalRevenue
      ? `₹${Math.round(overview.summary.totalRevenue / overview.summary.totalRides)}`
      : "₹428";

  return (
    <div className="min-h-full bg-[#F5F8FC]">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-5">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-emerald-600">
                System operational
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Good morning,{" "}
              {adminState?.admin?.name ||
                adminState?.admin?.username ||
                "Admin"}
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Here's what's happening across GaadiMitra today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {["7D", "30D", "3M", "1Y"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-extrabold transition ${
                    range === item
                      ? "bg-blue-50 text-[#0757D9]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFetchAllData}
              disabled={overviewLoading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCcw
                size={14}
                className={overviewLoading ? "animate-spin text-[#0757D9]" : ""}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0757D9] px-4 text-[11px] font-extrabold text-white shadow-[0_7px_18px_rgba(7,87,217,0.18)] transition hover:bg-[#064bbd]"
            >
              <Activity size={14} />
              View Reports
            </button>
          </div>
        </div>

        {/* =================================================
            PRIMARY KPI
        ================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {item.title}
                    </p>

                    <h3 className="mt-2 text-[25px] font-extrabold tracking-tight text-slate-900">
                      <AnimatedNumber
                        value={item.value}
                        prefix={item.prefix}
                        suffix={item.suffix}
                      />
                    </h3>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600">
                    <ArrowUpRight size={12} />
                    {item.change}
                  </span>

                  <span className="text-[10px] font-medium text-slate-400">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            SECONDARY OPERATIONAL STATS
        ================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {secondaryStatsList.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_5px_20px_rgba(15,23,42,0.025)]"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon size={17} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-extrabold ${
                      item.trend === "down"
                        ? "bg-red-50 text-red-500"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {item.trend === "down" ? (
                      <ArrowDownRight size={11} />
                    ) : (
                      <ArrowUpRight size={11} />
                    )}

                    {item.change}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                    <AnimatedNumber value={item.value} prefix={item.prefix} />
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            REVENUE + RIDE STATUS
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_0.8fr]">
          {/* Revenue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Financial overview
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Revenue & Earnings
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <MiniMetric
                  label="Orders"
                  value={
                    typeof miniOrders === "number"
                      ? miniOrders.toLocaleString("en-IN")
                      : miniOrders
                  }
                />

                <MiniMetric label="Earnings" value={miniEarnings} />

                <MiniMetric label="Refunds" value={miniRefunds} />
              </div>
            </div>

            <div className="mt-4 h-[300px] w-full">
              <ReactApexChart
                options={revenueChartOptions}
                series={revenueChartData.series}
                type="line"
                height="100%"
                width="100%"
              />
            </div>
          </div>

          {/* Ride Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Operations
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Ride Status
                </h3>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                <Activity size={17} />
              </div>
            </div>

            <div className="relative mx-auto mt-3 h-[175px] max-w-[230px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {totalRidesFormatted}
                </span>

                <span className="text-[9px] font-bold text-slate-400">
                  Total Rides
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-2.5">
              {calculatedRideStatuses.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="flex-1 text-[10px] font-semibold text-slate-500">
                    {item.label}
                  </span>

                  <span className="text-[10px] font-extrabold text-slate-700">
                    {item.count}
                  </span>

                  <span className="w-7 text-right text-[9px] font-bold text-slate-400">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================
            WEEKLY RIDES + USER DRIVER GROWTH
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Weekly Rides */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ride analytics
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Weekly Ride Volume
                </h3>
              </div>

              <div className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[9px] font-extrabold text-[#0757D9]">
                +14.8%
              </div>
            </div>

            <div className="mt-5 h-[260px]">
              <Bar data={weeklyRideChart} options={weeklyRideOptions} />
            </div>
          </div>

          {/* Growth */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Growth analytics
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  User & Driver Growth
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-[#0757D9]" />
                  Users
                </span>

                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Drivers
                </span>
              </div>
            </div>

            <div className="mt-2 h-[280px]">
              <ReactApexChart
                options={growthOptions}
                series={growthChartData.series}
                type="area"
                height="100%"
                width="100%"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            LIVE RIDES + TOP ROUTES
        ================================================== */}

        {/* <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
      
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                  <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-emerald-600">
                    Live Operations
                  </p>
                </div>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Ongoing Rides
                </h3>
              </div>

              <button
                type="button"
                className="text-[10px] font-extrabold text-[#0757D9] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {liveRidesList.map((ride) => (
                <div
                  key={ride.user}
                  className="p-4 transition hover:bg-slate-50/70 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                      <Navigation size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-slate-800">
                            {ride.user}
                          </p>

                          <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
                            {ride.route}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-extrabold text-emerald-600">
                          ON TRIP
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#0757D9] transition-all"
                            style={{
                              width: `${ride.progress}%`,
                            }}
                          />
                        </div>

                        <span className="text-[9px] font-extrabold text-slate-500">
                          {ride.progress}%
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[8px] font-semibold text-slate-400">
                        <span>Driver: {ride.driver}</span>

                        <span>{ride.vehicle}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-slate-400">
                  Performance
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Top Routes
                </h3>
              </div>

              <Route size={17} className="text-[#0757D9]" />
            </div>

            <div className="divide-y divide-slate-100">
              {topRoutes.map((item, index) => (
                <div
                  key={item.route}
                  className="flex items-center gap-3 p-4 transition hover:bg-slate-50/70"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[9px] font-extrabold text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-extrabold text-slate-800">
                      {item.route}
                    </p>

                    <p className="mt-1 text-[9px] font-medium text-slate-400">
                      {item.rides} rides
                    </p>
                  </div>

                  <p className="text-[10px] font-extrabold text-slate-700">
                    {item.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* =================================================
            RECENT RECHARGES + RECENT RIDES
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr]">
          {/* Recent Recharge */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-slate-400">
                  Wallet activity
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Recent Recharge & Purchases
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-50 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold text-cyan-600">
                    Today's total
                  </p>

                  <p className="text-xs font-extrabold text-cyan-700">
                    {todayRechargeTotal}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFetchAllData}
                  disabled={overviewLoading}
                  className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-[#0757D9] disabled:opacity-50"
                  title="Refresh wallet activity"
                >
                  <RefreshCcw
                    size={14}
                    className={
                      overviewLoading ? "animate-spin text-[#0757D9]" : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      Method
                    </th>

                    <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentRechargesList.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[9px] font-extrabold text-[#0757D9]">
                            {item.user
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <p className="text-[10px] font-extrabold text-slate-700">
                              {item.user}
                            </p>

                            <p className="mt-0.5 text-[8px] font-medium text-slate-400">
                              {item.userId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-extrabold text-slate-800">
                          {item.amount}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-[8px] font-extrabold text-slate-500">
                          <WalletCards size={10} />
                          {item.method}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-extrabold ${
                            item.status === "Success"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {item.status === "Success" ? (
                            <CheckCircle2 size={9} />
                          ) : (
                            <Clock3 size={9} />
                          )}

                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right text-[9px] font-semibold text-slate-400">
                        {item.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {recentRechargesList.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[9px] font-extrabold text-[#0757D9]">
                    {item.user
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-extrabold text-slate-700">
                      {item.user}
                    </p>

                    <p className="mt-1 text-[8px] font-medium text-slate-400">
                      {item.method} · {item.time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-extrabold text-slate-800">
                      {item.amount}
                    </p>

                    <span
                      className={`text-[8px] font-extrabold ${
                        item.status === "Success"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-5 py-3">
              <Link
                to="/admin/user-subscriptions"
                type="button"
                className="text-[10px] font-extrabold text-[#0757D9] hover:underline"
              >
                View all transactions →
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {/* <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-slate-400">
                  System
                </p>

                <h3 className="mt-1 text-base font-extrabold text-slate-900">
                  Recent Activity
                </h3>
              </div>

              <BellRing size={17} className="text-[#0757D9]" />
            </div>

            <div className="divide-y divide-slate-100">
              {activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.title}
                    className="flex gap-3 p-4 transition hover:bg-slate-50/70"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0757D9]">
                      <Icon size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] font-extrabold text-slate-700">
                          {activity.title}
                        </p>

                        <span className="shrink-0 text-[8px] font-semibold text-slate-400">
                          {activity.time}
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                className="text-[10px] font-extrabold text-[#0757D9] hover:underline"
              >
                View activity log →
              </button>
            </div>
          </div> */}
        </div>

        {/* =================================================
            RECENT RIDES
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.025)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[1.3px] text-slate-400">
                Ride management
              </p>

              <h3 className="mt-1 text-base font-extrabold text-slate-900">
                Recent Rides
              </h3>
            </div>

            <Link
              to="/admin/rides"
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#0757D9] hover:underline"
            >
              View all rides
              <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Ride ID
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Route
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Driver
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentRidesList.map((ride) => (
                  <tr
                    key={ride.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-extrabold text-[#0757D9]">
                        {ride.id}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-extrabold text-slate-700">
                        {ride.user}
                      </span>
                    </td>

                    <td className="max-w-[240px] px-5 py-3.5">
                      <span className="block truncate text-[10px] font-semibold text-slate-500">
                        {ride.route}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-semibold text-slate-600">
                        {ride.driver}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-extrabold text-slate-800">
                        {ride.amount}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={ride.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right text-[9px] font-semibold text-slate-400">
                      {ride.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {recentRidesList.map((ride) => (
              <div key={ride.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold text-[#0757D9]">
                      {ride.id}
                    </p>

                    <p className="mt-1 text-xs font-extrabold text-slate-800">
                      {ride.user}
                    </p>
                  </div>

                  <StatusBadge status={ride.status} />
                </div>

                <p className="mt-2 text-[10px] font-medium text-slate-500">
                  {ride.route}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-slate-400">
                    Driver: {ride.driver}
                  </span>

                  <span className="text-[10px] font-extrabold text-slate-800">
                    {ride.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            FOOTER SUMMARY
        ================================================== */}

        <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-4">
          <FooterMetric
            icon={ShoppingBag}
            label="Subscriptions"
            value={totalPurchasedPackages.toLocaleString("en-IN")}
          />

          <FooterMetric icon={Star} label="Avg. Rating" value="4.7 / 5" />

          <FooterMetric
            icon={CircleDollarSign}
            label="Avg. Ride Value"
            value={avgRideValue}
          />

          <FooterMetric icon={Clock3} label="Avg. Pickup" value="6.4 min" />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MINI METRIC
========================================================= */

const MiniMetric = ({ label, value }) => {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <p className="text-[8px] font-bold text-slate-400">{label}</p>

      <p className="mt-0.5 text-[10px] font-extrabold text-slate-700">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   FOOTER METRIC
========================================================= */

const FooterMetric = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0757D9]">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-xs font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    Completed: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-600",
    },

    Ongoing: {
      icon: Activity,
      className: "bg-blue-50 text-[#0757D9]",
    },

    Cancelled: {
      icon: XCircle,
      className: "bg-red-50 text-red-500",
    },
  };

  const current = config[status] || config.Completed;

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-extrabold ${current.className}`}
    >
      <Icon size={9} />
      {status}
    </span>
  );
};

export default Dashboard;
