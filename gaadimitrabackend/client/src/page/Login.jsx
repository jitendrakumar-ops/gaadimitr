import {
  ArrowRight,
  Bike,
  Check,
  LockKeyhole,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  adminLogin,
  clearAdminError,
  clearAdminSuccess,
  sendAdminLoginOtp,
} from "../reducer/slices/adminSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { otpLoading, loginLoading, error, success, message, isAuthenticated } =
    useSelector((state) => state.admin);

  const [showOtp, setShowOtp] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    otp: "",
    remember: false,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      dispatch(clearAdminError());
    }

    if (success) {
      dispatch(clearAdminSuccess());
    }
  };

  // =====================================================
  // Login Credentials Button
  // =====================================================

  const handleLoginCredentials = () => {
    setForm((prev) => ({
      ...prev,
      phone: "1234567890",
    }));

    dispatch(clearAdminError());
    dispatch(clearAdminSuccess());
  };

  // =====================================================
  // Send OTP
  // =====================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const phone = form.phone.trim();

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10 digit phone number.");
      return;
    }

    try {
      const result = await dispatch(sendAdminLoginOtp(phone)).unwrap();

      setShowOtp(true);

      alert(result?.message || "OTP sent successfully.");
    } catch (error) {
      console.error("Send OTP Error:", error);
    }
  };

  // =====================================================
  // Admin Login
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    const phone = form.phone.trim();
    const otp = form.otp.trim();

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10 digit phone number.");
      return;
    }

    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }

    if (!/^\d{4,6}$/.test(otp)) {
      alert("Please enter a valid OTP.");
      return;
    }

    try {
      await dispatch(
        adminLogin({
          phone,
          otp,
          platform: "web",
          deviceToken: "",
        }),
      ).unwrap();

      // Login successful
      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin Login Error:", error);
    }
  };

  // =====================================================
  // Reset OTP
  // =====================================================

  const handleChangeNumber = () => {
    setShowOtp(false);

    setForm((prev) => ({
      ...prev,
      otp: "",
    }));

    dispatch(clearAdminError());
    dispatch(clearAdminSuccess());
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F8FC]">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute -bottom-48 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      </div>

      {/* =====================================================
          CENTER WRAPPER
      ====================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[440px]">
          {/* =================================================
              BRAND
          ================================================== */}

          <div className="mb-7 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0757D9] text-white shadow-[0_10px_25px_rgba(7,87,217,0.22)]">
              <Bike size={27} strokeWidth={2.3} />
            </div>

            <div className="mt-3 text-center">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                GaadiMitra
              </h1>

              <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0757D9]">
                Admin Panel
              </p>
            </div>
          </div>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            {/* Welcome */}

            <div className="mb-7">
              <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0757D9]">
                  Welcome back, Admin
                </span>
              </div>

              <h2 className="text-[27px] font-extrabold tracking-tight text-slate-900">
                Sign in to your account
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Enter your phone number to continue to the GaadiMitra dashboard.
              </p>
            </div>

            {/* =================================================
                LOGIN CREDENTIALS BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handleLoginCredentials}
              className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-extrabold text-[#0757D9] transition hover:border-blue-300 hover:bg-blue-100"
            >
              <ShieldCheck size={16} />
              Login Credentials
            </button>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-xs font-bold leading-5 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================== */}

            {success && message && !showOtp && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-xs font-bold leading-5 text-green-600">
                  {message}
                </p>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={showOtp ? handleLogin : handleSendOtp}
              className="space-y-5"
            >
              {/* Phone */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700">
                    Phone Number
                  </label>

                  {showOtp && (
                    <button
                      type="button"
                      onClick={handleChangeNumber}
                      className="text-[11px] font-extrabold text-[#0757D9] hover:underline"
                    >
                      Change Number
                    </button>
                  )}
                </div>

                <div className="group relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0757D9]"
                  />

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      if (value.length <= 10) {
                        updateField("phone", value);
                      }
                    }}
                    placeholder="Enter admin phone number"
                    autoComplete="tel"
                    maxLength={10}
                    disabled={showOtp}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* =================================================
                  OTP
              ================================================== */}

              {showOtp && (
                <div>
                  <label className="mb-2 block text-xs font-extrabold text-slate-700">
                    OTP
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0757D9]"
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        if (value.length <= 6) {
                          updateField("otp", value);
                        }
                      }}
                      placeholder="Enter OTP"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 text-sm font-semibold tracking-[0.25em] text-slate-800 outline-none transition placeholder:text-slate-400 placeholder:tracking-normal hover:border-slate-300 focus:border-[#0757D9] focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-slate-400">
                      OTP sent to {form.phone}
                    </p>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="text-[10px] font-extrabold text-[#0757D9] hover:underline disabled:opacity-50"
                    >
                      {otpLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  Remember
              ================================================== */}

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => updateField("remember", !form.remember)}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition ${
                      form.remember
                        ? "border-[#0757D9] bg-[#0757D9] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {form.remember && <Check size={12} strokeWidth={3} />}
                  </span>

                  <span className="text-xs font-bold text-slate-500">
                    Remember me
                  </span>
                </button>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <ShieldCheck size={14} />
                  Secure login
                </div>
              </div>

              {/* =================================================
                  Main Button
              ================================================== */}

              <button
                type="submit"
                disabled={otpLoading || loginLoading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0757D9] text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(7,87,217,0.20)] transition hover:bg-[#064bbd] hover:shadow-[0_12px_28px_rgba(7,87,217,0.27)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading || loginLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    {loginLoading ? "Signing in..." : "Sending OTP..."}
                  </>
                ) : (
                  <>
                    {showOtp ? "Verify & Sign In" : "Send OTP"}

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                SECURITY INFO
            ================================================== */}

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0757D9] shadow-sm">
                <ShieldCheck size={16} />
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-slate-700">
                  Secure Admin Access
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  Authorized administrators only.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="mt-5 text-center">
            <p className="text-[10px] font-semibold text-slate-400">
              © 2026 GaadiMitra Admin Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
