import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { checkAdminAuth, selectAdminAuth } from "../reducer/slices/adminSlice";

const PrivateRoute = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAdminAuth);

  const isAuthenticated =
    auth?.isAuthenticated || !!auth?.accessToken || !!auth?.admin;

  useEffect(() => {
    /*
     * On a hard refresh, Redux state (and thus accessToken)
     * is wiped by design — we never persist it to storage.
     * The only way to know if the admin still has a valid
     * session is to ask the backend, which reads the httpOnly
     * refreshToken cookie (never touched by JS) and — if valid —
     * hands back a new accessToken.
     */
    if (!auth?.authChecked) {
      dispatch(checkAdminAuth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session check in flight — don't redirect yet, or a valid
  // session gets bounced to /admin/login on every refresh.
  if (!auth?.authChecked) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
