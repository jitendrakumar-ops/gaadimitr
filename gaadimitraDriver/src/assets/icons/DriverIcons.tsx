import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Ellipse,
} from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

// -------------------------------------------------------------------
// 1. BRAND LOGO - Steering Wheel Emblem
// -------------------------------------------------------------------
export const GaadimitraDriverLogo: React.FC<{ size?: number; variant?: 'white' | 'blue' }> = ({
  size = 72,
  variant = 'white',
}) => {
  const isWhite = variant === 'white';
  const circleColor = isWhite ? '#FFFFFF' : '#1D4ED8';
  const iconColor = isWhite ? '#1E40AF' : '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="38" fill={circleColor} />
      <Circle cx="40" cy="40" r="38" stroke={isWhite ? '#93C5FD' : '#3B82F6'} strokeWidth="1.5" />
      
      {/* Steering Wheel Outer Ring */}
      <Circle cx="40" cy="40" r="24" stroke={iconColor} strokeWidth="4.5" fill="none" />
      {/* Center Hub */}
      <Circle cx="40" cy="40" r="9" fill={iconColor} />
      <Circle cx="40" cy="40" r="4.5" fill={circleColor} />
      
      {/* Spokes */}
      {/* Left Spoke */}
      <Path d="M16 40H31" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
      {/* Right Spoke */}
      <Path d="M49 40H64" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
      {/* Bottom Spoke */}
      <Path d="M40 49V64" stroke={iconColor} strokeWidth="4" strokeLinecap="round" />
      {/* Top Grip Accents */}
      <Path d="M30 18C33 17 47 17 50 18" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
};

// Small header version
export const DriverHeaderLogo: React.FC<{ size?: number }> = ({ size = 38 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Circle cx="22" cy="22" r="21" fill="#2563EB" />
      <Circle cx="22" cy="22" r="13" stroke="#FFFFFF" strokeWidth="2.8" fill="none" />
      <Circle cx="22" cy="22" r="5" fill="#FFFFFF" />
      <Path d="M9 22H17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M27 22H35" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M22 27V35" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
};

// -------------------------------------------------------------------
// 2. BADGE ICONS FOR HEADERS
// -------------------------------------------------------------------

// Screen 03: Phone badge icon (Light blue circle with blue phone & user)
export const PhoneBadgeIcon: React.FC<{ size?: number }> = ({ size = 72 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="40" fill="#EBF2FE" />
      <Rect x="26" y="18" width="28" height="44" rx="6" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
      {/* Speaker bar */}
      <Rect x="36" y="22" width="8" height="2.5" rx="1.2" fill="#93C5FD" />
      {/* Avatar inside phone */}
      <Circle cx="40" cy="34" r="5" fill="#2563EB" />
      <Path d="M32 46C32 42.5 35.5 41 40 41C44.5 41 48 42.5 48 46" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
      {/* Home button dot */}
      <Circle cx="40" cy="56" r="2" fill="#93C5FD" />
    </Svg>
  );
};

// Screen 04: Verify OTP Document badge (Light blue circle with clipboard & checkmark)
export const VerifyBadgeIcon: React.FC<{ size?: number }> = ({ size = 72 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="40" fill="#EBF2FE" />
      {/* Document / Clipboard */}
      <Rect x="26" y="20" width="28" height="38" rx="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.2" />
      {/* Clip top */}
      <Rect x="34" y="16" width="12" height="6" rx="2" fill="#2563EB" />
      <Circle cx="40" cy="19" r="1.5" fill="#FFFFFF" />
      {/* Document lines */}
      <Path d="M32 29H48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <Path d="M32 35H48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <Path d="M32 41H42" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <Path d="M32 47H40" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      
      {/* Checkmark Badge */}
      <Circle cx="54" cy="50" r="10" fill="#1D4ED8" />
      <Path d="M49.5 50L52.5 53L58.5 47" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// Screen 05: Personal Profile Badge (Light blue circle with avatar user)
export const ProfileBadgeIcon: React.FC<{ size?: number }> = ({ size = 72 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="40" fill="#EBF2FE" />
      {/* User Avatar Circle */}
      <Circle cx="40" cy="31" r="10" fill="#2563EB" />
      {/* Body */}
      <Path
        d="M24 55C24 47 31 45 40 45C49 45 56 47 56 55"
        fill="#2563EB"
      />
    </Svg>
  );
};

// Indian National Flag (Tiranga) Icon
export const IndiaFlagIcon: React.FC<{ width?: number; height?: number }> = ({
  width = 22,
  height = 15,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 16" fill="none">
      <Defs>
        <LinearGradient id="flagClip" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>
      {/* Background / Base with rounded corners */}
      <Rect width="24" height="16" rx="2.5" fill="#FFFFFF" />

      {/* Top Saffron Stripe */}
      <Rect width="24" height="5.33" rx="2" fill="#FF9933" />
      <Rect y="2.5" width="24" height="2.83" fill="#FF9933" />

      {/* Middle White Stripe */}
      <Rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />

      {/* Bottom Green Stripe */}
      <Rect y="10.67" width="24" height="5.33" rx="2" fill="#138808" />
      <Rect y="10.67" width="24" height="2.83" fill="#138808" />

      {/* Ashoka Chakra in Center */}
      <Circle cx="12" cy="8" r="2.2" stroke="#000080" strokeWidth="0.6" fill="none" />
      <Circle cx="12" cy="8" r="0.6" fill="#000080" />
      {/* 8 spokes representation for crisp rendering */}
      <Path d="M12 5.9V10.1M9.9 8H14.1M10.5 6.5L13.5 9.5M10.5 9.5L13.5 6.5" stroke="#000080" strokeWidth="0.4" />

      {/* Subtle border */}
      <Rect width="24" height="16" rx="2.5" stroke="#000000" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
    </Svg>
  );
};

export const BackArrowIcon: React.FC<IconProps> = ({ size = 24, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserInputIcon: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    <Path d="M4 20C4 16.5 7.5 14.5 12 14.5C16.5 14.5 20 16.5 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const PhoneInputIcon: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22 20.48 21.54 20.94 20.98 20.92C18.23 20.73 15.6 19.8 13.25 18.25C11.13 16.84 9.3 15.01 7.89 12.89C6.34 10.54 5.41 7.91 5.22 5.16C5.2 4.6 5.66 4.14 6.22 4.14H9.22C9.72 4.14 10.14 4.51 10.22 5.01C10.37 5.96 10.64 6.88 11.02 7.74C11.16 8.05 11.07 8.42 10.82 8.65L9.36 10.11C10.66 12.4 12.54 14.28 14.83 15.58L16.29 14.12C16.52 13.87 16.89 13.78 17.2 13.92C18.06 14.3 18.98 14.57 19.93 14.72C20.43 14.8 20.8 15.22 20.8 15.72"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CameraPhotoIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

export const LocationPinIcon: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const HomeAddressIcon: React.FC<IconProps> = ({ size = 18, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShieldLockIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const RefreshOtpIcon: React.FC<IconProps> = ({ size = 16, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4V10H17M1 20V14H7M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27541C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.63 5.64L1 10M23 14L18.37 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1113 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClockTimerIcon: React.FC<IconProps> = ({ size = 15, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const CheckmarkBadge: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#2563EB" />
    <Path d="M7 12L10.5 15.5L17 8.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const MoreDotsIcon: React.FC<IconProps> = ({ size = 28, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="15" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
    <Circle cx="10" cy="16" r="2" fill={color} />
    <Circle cx="16" cy="16" r="2" fill={color} />
    <Circle cx="22" cy="16" r="2" fill={color} />
  </Svg>
);

// -------------------------------------------------------------------
// 4. VEHICLE ILLUSTRATIONS FOR SCREEN 06 (3x3 Grid)
// -------------------------------------------------------------------

// 1. E-Rickshaw (Electric passenger toto/rickshaw)
export const ERickshawIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Body / Cabin */}
    <Path d="M20 54L15 36C14 30 18 20 28 18H62C72 18 78 26 78 35V54H20Z" fill="#0284C7" />
    {/* Canopy / Top */}
    <Path d="M18 18H75C78 18 80 16 80 13C80 10 77 8 72 8H22C17 8 15 10 15 13C15 16 16 18 18 18Z" fill="#0369A1" />
    {/* Windshield / Window */}
    <Path d="M26 22H46V36H20L26 22Z" fill="#BAE6FD" />
    <Path d="M50 22H70C72 22 74 24 74 27V36H50V22Z" fill="#E0F2FE" />
    {/* Side bars */}
    <Rect x="46" y="20" width="3" height="34" fill="#38BDF8" />
    {/* Wheels */}
    <Circle cx="28" cy="56" r="10" fill="#1E293B" />
    <Circle cx="28" cy="56" r="5" fill="#94A3B8" />
    <Circle cx="68" cy="56" r="10" fill="#1E293B" />
    <Circle cx="68" cy="56" r="5" fill="#94A3B8" />
    {/* Headlight */}
    <Circle cx="16" cy="40" r="3" fill="#FDE047" />
  </Svg>
);

// 2. E-Rickshaw Loader (Electric 3-wheel cargo)
export const ELoaderIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Front Cabin */}
    <Path d="M22 54L16 34C15 28 19 20 28 20H42V54H22Z" fill="#0284C7" />
    {/* Canopy */}
    <Path d="M18 20H44V14C44 11 41 9 38 9H24C20 9 18 11 18 14V20Z" fill="#0369A1" />
    {/* Window */}
    <Path d="M24 24H38V36H18L24 24Z" fill="#BAE6FD" />
    {/* Cargo Bed */}
    <Rect x="44" y="28" width="46" height="26" rx="2" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
    <Rect x="46" y="32" width="42" height="4" fill="#38BDF8" />
    {/* Wheels */}
    <Circle cx="26" cy="56" r="10" fill="#1E293B" />
    <Circle cx="26" cy="56" r="5" fill="#94A3B8" />
    <Circle cx="74" cy="56" r="10" fill="#1E293B" />
    <Circle cx="74" cy="56" r="5" fill="#94A3B8" />
  </Svg>
);

// 3. Scorpio (SUV)
export const ScorpioIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Body */}
    <Path d="M12 42L18 30C20 26 25 22 32 22H68C73 22 78 25 80 29L88 42V54H12V42Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
    {/* Roof rails */}
    <Path d="M30 20H72" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
    {/* Windows */}
    <Path d="M24 30L28 25H46V36H20L24 30Z" fill="#38BDF8" fillOpacity="0.6" />
    <Path d="M49 25H68L74 36H49V25Z" fill="#38BDF8" fillOpacity="0.6" />
    {/* Grille & Headlight */}
    <Rect x="82" y="42" width="6" height="6" fill="#CBD5E1" />
    <Circle cx="86" cy="45" r="2.5" fill="#FDE047" />
    {/* Wheels */}
    <Circle cx="26" cy="54" r="9" fill="#1E293B" />
    <Circle cx="26" cy="54" r="4.5" fill="#CBD5E1" />
    <Circle cx="74" cy="54" r="9" fill="#1E293B" />
    <Circle cx="74" cy="54" r="4.5" fill="#CBD5E1" />
  </Svg>
);

// 4. Bolero
export const BoleroIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Boxy Bolero Body */}
    <Path d="M10 42L14 26C15 23 18 22 22 22H72C76 22 78 24 80 27L86 42V54H10V42Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
    {/* Boxy windows */}
    <Rect x="20" y="25" width="22" height="12" fill="#93C5FD" fillOpacity="0.7" />
    <Rect x="46" y="25" width="24" height="12" fill="#93C5FD" fillOpacity="0.7" />
    {/* Side stripe */}
    <Path d="M12 44H84" stroke="#0284C7" strokeWidth="2.5" />
    {/* Wheels */}
    <Circle cx="24" cy="54" r="9" fill="#1E293B" />
    <Circle cx="24" cy="54" r="4" fill="#E2E8F0" />
    <Circle cx="72" cy="54" r="9" fill="#1E293B" />
    <Circle cx="72" cy="54" r="4" fill="#E2E8F0" />
  </Svg>
);

// 5. 5 Seater Car (Sedan)
export const FiveSeaterIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Sedan aerodynamic body */}
    <Path d="M8 44L18 36L30 24H64L76 36L92 42V54H8V44Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
    {/* Slanted windows */}
    <Path d="M32 26L22 36H46V26H32Z" fill="#60A5FA" fillOpacity="0.6" />
    <Path d="M49 26V36H72L63 26H49Z" fill="#60A5FA" fillOpacity="0.6" />
    {/* Front light */}
    <Polygon points="88,42 92,44 88,48" fill="#FACC15" />
    {/* Wheels */}
    <Circle cx="24" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="24" cy="54" r="4" fill="#E2E8F0" />
    <Circle cx="76" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="76" cy="54" r="4" fill="#E2E8F0" />
  </Svg>
);

// 6. 7 Seater Car (Ertiga / Innova)
export const SevenSeaterIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* MPV long body */}
    <Path d="M10 42L16 28C18 24 23 22 28 22H72L86 38L90 44V54H10V42Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
    {/* 3 side windows */}
    <Path d="M22 25L18 35H36V25H22Z" fill="#93C5FD" fillOpacity="0.7" />
    <Rect x="39" y="25" width="20" height="10" fill="#93C5FD" fillOpacity="0.7" />
    <Path d="M62 25H71L80 35H62V25Z" fill="#93C5FD" fillOpacity="0.7" />
    {/* Wheels */}
    <Circle cx="24" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="24" cy="54" r="4" fill="#CBD5E1" />
    <Circle cx="76" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="76" cy="54" r="4" fill="#CBD5E1" />
  </Svg>
);

// 7. Bolero Pickup Truck
export const BoleroPickupIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Front Cabin */}
    <Path d="M12 42L16 26C17 23 20 22 24 22H46V54H12V42Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
    <Rect x="22" y="25" width="20" height="12" fill="#93C5FD" fillOpacity="0.7" />
    {/* Cargo Bed Flatbed */}
    <Rect x="48" y="32" width="44" height="22" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
    {/* Metal railing */}
    <Path d="M48 26H92" stroke="#64748B" strokeWidth="2.5" />
    <Path d="M60 26V32M74 26V32M88 26V32" stroke="#64748B" strokeWidth="2" />
    {/* Wheels */}
    <Circle cx="26" cy="54" r="9" fill="#1E293B" />
    <Circle cx="26" cy="54" r="4" fill="#94A3B8" />
    <Circle cx="78" cy="54" r="9" fill="#1E293B" />
    <Circle cx="78" cy="54" r="4" fill="#94A3B8" />
  </Svg>
);

// 8. Mini Loader (Tata Ace / Chhota Hathi)
export const MiniLoaderIllustration: React.FC<{ size?: number }> = ({ size = 70 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none">
    {/* Curved Front Cabin */}
    <Path d="M12 46C12 36 16 24 26 22H42V54H12V46Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
    <Path d="M16 38C16 30 20 26 26 25H38V38H16Z" fill="#93C5FD" fillOpacity="0.7" />
    {/* Headlight */}
    <Circle cx="15" cy="44" r="2.5" fill="#FACC15" />
    {/* Cargo back */}
    <Rect x="44" y="32" width="46" height="22" rx="1.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
    <Rect x="48" y="35" width="38" height="4" fill="#E2E8F0" />
    {/* Wheels */}
    <Circle cx="24" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="24" cy="54" r="4" fill="#94A3B8" />
    <Circle cx="76" cy="54" r="8.5" fill="#1E293B" />
    <Circle cx="76" cy="54" r="4" fill="#94A3B8" />
  </Svg>
);

// -------------------------------------------------------------------
// 5. HERO ILLUSTRATION FOR SCREEN 02 (Driver with Vehicles)
// -------------------------------------------------------------------
export const DriverHeroIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 340,
  height = 190,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 340 190" fill="none">
      {/* Background Soft Glow & Road */}
      <Ellipse cx="170" cy="165" rx="150" ry="20" fill="#EFF6FF" />
      <Path d="M20 165C60 163 280 163 320 165" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 6" />

      {/* Left Vehicle: White Modern Car */}
      <G transform="translate(25, 75) scale(0.95)">
        <Path d="M8 44L18 36L30 24H64L76 36L92 42V54H8V44Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.8" />
        <Path d="M32 26L22 36H46V26H32Z" fill="#93C5FD" fillOpacity="0.7" />
        <Path d="M49 26V36H72L63 26H49Z" fill="#93C5FD" fillOpacity="0.7" />
        <Circle cx="24" cy="54" r="8" fill="#1E293B" />
        <Circle cx="24" cy="54" r="3.5" fill="#E2E8F0" />
        <Circle cx="76" cy="54" r="8" fill="#1E293B" />
        <Circle cx="76" cy="54" r="3.5" fill="#E2E8F0" />
      </G>

      {/* Right Vehicle: Blue Auto / Rickshaw */}
      <G transform="translate(225, 68) scale(0.95)">
        <Path d="M20 54L15 36C14 30 18 20 28 18H62C72 18 78 26 78 35V54H20Z" fill="#0284C7" />
        <Path d="M18 18H75C78 18 80 16 80 13C80 10 77 8 72 8H22C17 8 15 10 15 13C15 16 16 18 18 18Z" fill="#0369A1" />
        <Path d="M26 22H46V36H20L26 22Z" fill="#BAE6FD" />
        <Path d="M50 22H70C72 22 74 24 74 27V36H50V22Z" fill="#E0F2FE" />
        <Circle cx="28" cy="56" r="9" fill="#1E293B" />
        <Circle cx="28" cy="56" r="4" fill="#94A3B8" />
        <Circle cx="68" cy="56" r="9" fill="#1E293B" />
        <Circle cx="68" cy="56" r="4" fill="#94A3B8" />
      </G>

      {/* Center Hero: Indian Driver Character standing with arms crossed */}
      <G transform="translate(135, 10)">
        {/* Head / Hair */}
        <Path d="M22 22C22 13 46 13 46 22C48 20 50 16 46 12C40 8 28 8 22 12C18 16 20 20 22 22Z" fill="#1E293B" />
        {/* Face */}
        <Ellipse cx="34" cy="27" rx="12" ry="14" fill="#D97706" fillOpacity="0.4" />
        <Ellipse cx="34" cy="27" rx="11" ry="13" fill="#FDBA74" />
        {/* Hair top */}
        <Path d="M23 20C24 14 44 14 45 20C42 16 26 16 23 20Z" fill="#0F172A" />
        {/* Mustache & Smile */}
        <Path d="M27 31C30 33 34 32 34 32C34 32 38 33 41 31C42 32.5 38 34.5 34 33.5C30 34.5 26 32.5 27 31Z" fill="#1E293B" />
        <Path d="M30 35C32 37 36 37 38 35" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" />
        {/* Eyes & Eyebrows */}
        <Circle cx="29" cy="24" r="1.8" fill="#1E293B" />
        <Circle cx="39" cy="24" r="1.8" fill="#1E293B" />
        <Path d="M26 21C28 19.5 31 20 31 20" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M37 20C37 20 40 19.5 42 21" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        {/* Ears */}
        <Ellipse cx="22" cy="28" rx="2.5" ry="4" fill="#FDBA74" />
        <Ellipse cx="46" cy="28" rx="2.5" ry="4" fill="#FDBA74" />

        {/* Blue Collared Shirt */}
        <Path d="M20 42C12 48 4 64 6 92H62C64 64 56 48 48 42L34 46L20 42Z" fill="#1D4ED8" />
        {/* Collar */}
        <Polygon points="34,46 25,40 28,48" fill="#1E40AF" />
        <Polygon points="34,46 43,40 40,48" fill="#1E40AF" />
        {/* Placket */}
        <Path d="M34 46V85" stroke="#1E3A8A" strokeWidth="2" />
        <Circle cx="34" cy="54" r="1.5" fill="#93C5FD" />
        <Circle cx="34" cy="64" r="1.5" fill="#93C5FD" />
        <Circle cx="34" cy="74" r="1.5" fill="#93C5FD" />

        {/* Crossed Arms */}
        <Path d="M8 68C10 82 24 88 34 88C44 88 58 82 60 68C58 60 48 64 34 65C20 64 10 60 8 68Z" fill="#1E40AF" stroke="#1D4ED8" strokeWidth="2" />
        {/* Hands */}
        <Ellipse cx="22" cy="76" rx="6" ry="4.5" fill="#FDBA74" />
        <Ellipse cx="46" cy="76" rx="6" ry="4.5" fill="#FDBA74" />

        {/* Dark Trousers / Waist */}
        <Path d="M12 92H56V155H12V92Z" fill="#1E293B" />
        <Path d="M34 105V155" stroke="#0F172A" strokeWidth="2.5" />
        {/* Belt */}
        <Rect x="12" y="92" width="44" height="6" fill="#0F172A" />
        <Rect x="30" y="92" width="8" height="6" fill="#E2E8F0" />
      </G>
    </Svg>
  );
};

// -------------------------------------------------------------------
// 6. SPLASH FLEET ILLUSTRATION (Screen 01 Bottom)
// -------------------------------------------------------------------
export const SplashFleetIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 330,
  height = 130,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 330 130" fill="none">
      {/* City Skyline Outline Backdrop */}
      <Path
        d="M20 90V60H35V45H50V60H65V90H80V35H100V90H120V55H140V90H170V30H195V90H220V65H240V90H265V45H285V90H310V90"
        stroke="#60A5FA"
        strokeWidth="1.2"
        strokeOpacity="0.4"
        fill="none"
      />
      {/* Ground horizon */}
      <Path d="M10 95H320" stroke="#93C5FD" strokeWidth="1.5" strokeOpacity="0.5" />

      {/* Left: White SUV */}
      <G transform="translate(15, 42) scale(0.95)">
        <Path d="M8 38L14 26C16 22 21 19 28 19H62C67 19 72 22 74 26L82 38V50H8V38Z" fill="#FFFFFF" />
        <Path d="M22 24L26 21H42V32H18L22 24Z" fill="#93C5FD" />
        <Path d="M45 21H62L68 32H45V21Z" fill="#93C5FD" />
        <Circle cx="22" cy="50" r="7.5" fill="#0F172A" />
        <Circle cx="22" cy="50" r="3.5" fill="#E2E8F0" />
        <Circle cx="68" cy="50" r="7.5" fill="#0F172A" />
        <Circle cx="68" cy="50" r="3.5" fill="#E2E8F0" />
      </G>

      {/* Center: Blue Auto Rickshaw */}
      <G transform="translate(115, 38) scale(0.98)">
        <Path d="M16 50L12 32C11 26 15 18 24 16H54C62 16 68 24 68 32V50H16Z" fill="#1D4ED8" stroke="#38BDF8" strokeWidth="1.2" />
        <Path d="M14 16H66C68 16 70 14 70 12C70 10 68 8 64 8H18C14 8 12 10 12 12C12 14 13 16 14 16Z" fill="#38BDF8" />
        <Path d="M20 20H38V32H16L20 20Z" fill="#E0F2FE" />
        <Path d="M42 20H60C62 20 64 22 64 25V32H42V20Z" fill="#BAE6FD" />
        <Circle cx="24" cy="52" r="8" fill="#0F172A" />
        <Circle cx="24" cy="52" r="3.5" fill="#94A3B8" />
        <Circle cx="58" cy="52" r="8" fill="#0F172A" />
        <Circle cx="58" cy="52" r="3.5" fill="#94A3B8" />
      </G>

      {/* Right: White Bolero Pickup / Mini Truck */}
      <G transform="translate(210, 40) scale(0.95)">
        <Path d="M10 38L14 24C15 21 18 20 22 20H42V50H10V38Z" fill="#FFFFFF" />
        <Rect x="18" y="23" width="18" height="10" fill="#93C5FD" />
        <Rect x="44" y="28" width="42" height="22" rx="1.5" fill="#E2E8F0" />
        <Path d="M44 23H86" stroke="#94A3B8" strokeWidth="2" />
        <Circle cx="24" cy="50" r="7.5" fill="#0F172A" />
        <Circle cx="24" cy="50" r="3.5" fill="#CBD5E1" />
        <Circle cx="72" cy="50" r="7.5" fill="#0F172A" />
        <Circle cx="72" cy="50" r="3.5" fill="#CBD5E1" />
      </G>
    </Svg>
  );
};

// -------------------------------------------------------------------
// 7. ADDITIONAL ICONS FOR SCREENS 07 - 12
// -------------------------------------------------------------------

// Green Verified Shield with Confetti (Screen 11)
export const VerifiedShieldConfetti: React.FC<{ size?: number }> = ({ size = 96 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Confetti Dots */}
      <Circle cx="20" cy="20" r="2.5" fill="#3B82F6" />
      <Circle cx="30" cy="12" r="2" fill="#F59E0B" />
      <Circle cx="70" cy="14" r="2.5" fill="#EF4444" />
      <Circle cx="82" cy="24" r="2" fill="#10B981" />
      <Circle cx="12" cy="45" r="2" fill="#8B5CF6" />
      <Circle cx="88" cy="48" r="2.5" fill="#3B82F6" />
      <Circle cx="22" cy="65" r="2" fill="#10B981" />
      <Circle cx="80" cy="68" r="2" fill="#F59E0B" />
      
      {/* Subtle outer glow */}
      <Circle cx="50" cy="50" r="38" fill="#ECFDF5" />
      <Circle cx="50" cy="50" r="32" fill="#D1FAE5" />
      
      {/* Green Shield */}
      <Path
        d="M50 22L30 31V48C30 62 38 73 50 78C62 73 70 62 70 48V31L50 22Z"
        fill="#10B981"
      />
      {/* Shield Highlight */}
      <Path
        d="M50 24L33 32V48C33 60.5 40.5 70.5 50 75.5V24Z"
        fill="#059669"
        fillOpacity="0.25"
      />
      {/* Checkmark */}
      <Path
        d="M42 50L47.5 55.5L58.5 44.5"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Verification Submitted Clip & Document Badge (Screen 10)
export const VerificationSubmittedBadge: React.FC<{ size?: number }> = ({ size = 76 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle cx="40" cy="40" r="40" fill="#EBF2FE" />
      {/* Document */}
      <Rect x="26" y="20" width="28" height="38" rx="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.2" />
      {/* Paperclip / Badge */}
      <Path d="M34 26H46" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <Path d="M34 32H46" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <Path d="M34 38H42" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      {/* Blue Checkmark Badge */}
      <Circle cx="54" cy="48" r="10" fill="#1350F2" />
      <Path d="M49.5 48L52.5 51L58.5 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// Membership Crown / Shield (Screen 12)
export const MembershipBadgeIcon: React.FC<{ size?: number }> = ({ size = 56 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="30" fill="#1350F2" />
      {/* Crown / Shield Icon */}
      <Path
        d="M20 38L24 24L32 30L40 24L44 38H20Z"
        fill="#FFFFFF"
      />
      <Circle cx="24" cy="22" r="2" fill="#FACC15" />
      <Circle cx="32" cy="27" r="2" fill="#FACC15" />
      <Circle cx="40" cy="22" r="2" fill="#FACC15" />
      <Rect x="20" y="39" width="24" height="4" rx="1.5" fill="#FACC15" />
    </Svg>
  );
};

// Spec Icons for Screen 07
export const CarModelIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17M5 17C5 18.5 6 20 7.5 20C9 20 10 18.5 10 17M19 17C19 18.5 18 20 16.5 20C15 20 14 18.5 14 17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const LicensePlateSpecIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2.5" stroke={color} strokeWidth="1.8" />
    <Circle cx="5.5" cy="12" r="1" fill={color} />
    <Circle cx="18.5" cy="12" r="1" fill={color} />
    <Path d="M9 10H15M9 14H15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const CalendarYearIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="17" rx="2.5" stroke={color} strokeWidth="1.8" />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const WeightLoadIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.8" />
    <Path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const AcFanIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="2.5" fill={color} />
    <Path d="M12 2C13.5 4 14.5 6 12 9.5M22 12C20 13.5 18 14.5 14.5 12M12 22C10.5 20 9.5 18 12 14.5M2 12C4 10.5 6 9.5 9.5 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const ColorPaletteIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <Circle cx="8" cy="10" r="1.5" fill={color} />
    <Circle cx="12" cy="8" r="1.5" fill={color} />
    <Circle cx="16" cy="10" r="1.5" fill={color} />
  </Svg>
);

// Document / Legal Icons for Screen 09
export const LicenseDocIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.8" />
    <Circle cx="8" cy="11" r="2.5" stroke={color} strokeWidth="1.5" />
    <Path d="M14 9H18M14 13H18M7 16H18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const RcDocIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" />
    <Path d="M14 2V8H20M8 13H16M8 17H13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const InsuranceDocIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PermitDocIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke={color} strokeWidth="1.8" />
    <Path d="M9 13L11 15L15 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const IdCardIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="2.5" stroke={color} strokeWidth="1.8" />
    <Circle cx="8" cy="11" r="2" stroke={color} strokeWidth="1.5" />
    <Path d="M13 10H18M13 14H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

// Green Uploaded Check Badge
export const UploadedBadge: React.FC = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0' }}>
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
      <Circle cx="12" cy="12" r="10" fill="#10B981" />
      <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
    <Text style={{ fontSize: 11, fontWeight: '700', color: '#047857' }}>Uploaded</Text>
  </View>
);

// Yellow Pending Badge
export const PendingBadge: React.FC = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A' }}>
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ marginRight: 4 }}>
      <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
      <Path d="M12 7V12L15 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </Svg>
    <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>Pending</Text>
  </View>
);

// Driver Bottom Tab Bar (4 tabs: Home, Enquiries, Rides, Profile)
export const DriverBottomTabBar: React.FC<{ activeTab?: 'Home' | 'Enquiries' | 'Rides' | 'Profile'; onTabPress?: (tab: string) => void }> = ({
  activeTab = 'Home',
  onTabPress,
}) => {
  const tabs = [
    {
      id: 'Home',
      label: 'Home',
      icon: (active: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M3 9.5L12 2.5L21 9.5V20.5C21 21.05 20.55 21.5 20 21.5H4C3.45 21.5 3 21.05 3 20.5V9.5Z" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? '#EFF6FF' : 'none'} />
          <Path d="M9 21.5V12.5H15V21.5" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ),
    },
    {
      id: 'Enquiries',
      label: 'Enquiries',
      icon: (active: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? '#EFF6FF' : 'none'} />
        </Svg>
      ),
    },
    {
      id: 'Rides',
      label: 'Rides',
      icon: (active: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M5 17H19M5 17C3.5 17 2 15.5 2 14V11L4 6C4.5 4.5 6 4 7 4H17C18 4 19.5 4.5 20 6L22 11V14C22 15.5 20.5 17 19 17M5 17C5 18.5 6 20 7.5 20C9 20 10 18.5 10 17M19 17C19 18.5 18 20 16.5 20C15 20 14 18.5 14 17" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
    },
    {
      id: 'Profile',
      label: 'Profile',
      icon: (active: boolean) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="7" r="4" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" />
          <Path d="M4 21C4 17.5 7.5 15.5 12 15.5C16.5 15.5 20 17.5 20 21" stroke={active ? '#1350F2' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      ),
    },
  ];

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingVertical: 8, paddingBottom: 6 }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => onTabPress && onTabPress(tab.id)}
            style={{ alignItems: 'center', minWidth: 60 }}
          >
            {tab.icon(isActive)}
            <Text style={{ fontSize: 10, fontWeight: isActive ? '700' : '500', color: isActive ? '#1350F2' : '#94A3B8', marginTop: 2 }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MailInputIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.8" />
    <Path d="M2 7L12 13L22 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const GenderInputIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" />
    <Path d="M12 17V22M9.5 19.5H14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M15.5 8.5L20 4M20 4H16M20 4V8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

