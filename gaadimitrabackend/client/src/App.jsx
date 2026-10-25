import { Navigate, Route, Routes } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./layout/AdminLayout";

import Chat from "./page/Chat";
import Dashboard from "./page/Dashboard";
import Drivers from "./page/Drivers";
import Login from "./page/Login";
import PromotionPopup from "./page/PromotionPopup";
import PushNotification from "./page/PushNotification";
import Ratings from "./page/Ratings";
import Rides from "./page/Rides";
import Services from "./page/Services";
import Subscriptions from "./page/Subscriptions";
import UserSubscriptions from "./page/UserSubscriptions";
import Support from "./page/Support";
import Users from "./page/Users";
import Vehicles from "./page/Vehicles";

const App = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC ADMIN LOGIN
      ========================= */}
      <Route path="/admin/login" element={<Login />} />

      {/* =========================
          PRIVATE ADMIN PANEL
      ========================= */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Users */}
          <Route path="users" element={<Users />} />

          {/* Chat */}
          <Route path="chat" element={<Chat />} />

          {/* Services */}
          <Route path="services" element={<Services />} />

          {/* Vehicles */}
          <Route path="vehicles" element={<Vehicles />} />

          {/* Rides */}
          <Route path="rides" element={<Rides />} />

          {/* Drivers */}
          <Route path="drivers" element={<Drivers />} />

          {/* Subscriptions */}
          <Route path="subscriptions" element={<Subscriptions />} />

          {/* User Subscriptions Monitoring */}
          <Route path="user-subscriptions" element={<UserSubscriptions />} />

          {/* Ratings */}
          <Route path="ratings" element={<Ratings />} />

          {/* Push Notifications */}
          <Route path="push-notifications" element={<PushNotification />} />

          {/* Promotion Popup */}
          <Route path="promotion-popup" element={<PromotionPopup />} />

          {/* Support */}
          <Route path="support" element={<Support />} />
        </Route>
      </Route>

      {/* =========================
          FALLBACK
      ========================= */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default App;
