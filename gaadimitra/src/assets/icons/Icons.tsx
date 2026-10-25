import React from 'react';
import { View, Image } from 'react-native';
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

// ----------------------------------------------------
// 1. BRAND LOGO EMBLEM (Deep Blue / White Stylized G)
// ----------------------------------------------------
export const GaadimitraEmblem: React.FC<{ size?: number; variant?: 'white' | 'blue' }> = ({
  size = 56,
  variant = 'white',
}) => {
  const isWhite = variant === 'white';
  const bgColor = isWhite ? '#FFFFFF' : '#2563EB';
  const gColor = isWhite ? '#2563EB' : '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="30" fill={bgColor} />
      <Circle cx="32" cy="32" r="28" stroke={isWhite ? '#E0E7FF' : '#3B82F6'} strokeWidth="1.5" />
      <Path
        d="M43 28C41.8 23 37.5 19.5 32 19.5C24.544 19.5 18.5 25.544 18.5 33C18.5 40.456 24.544 46.5 32 46.5C38.2 46.5 43.4 42.3 45 36.5H32V30.5H49.5C49.8 31.6 50 32.8 50 34C50 43.941 41.941 52 32 52C21.507 52 13 43.493 13 33C13 22.507 21.507 14 32 14C39.5 14 45.8 18.5 48.5 25L43 28Z"
        fill={gColor}
      />
      <Path
        d="M32 23L38 32H26L32 23Z"
        fill={isWhite ? '#1D4ED8' : '#DBEAFE'}
      />
    </Svg>
  );
};

// ----------------------------------------------------
// 2. NAVIGATION & HEADER ICONS
// ----------------------------------------------------
export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 24, color = '#0F172A' }) => (
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

export const BellNotificationIcon: React.FC<IconProps & { hasUnread?: boolean }> = ({
  size = 22,
  color = '#0F172A',
  hasUnread = true,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21S18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21A2 2 0 0110.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {hasUnread && <Circle cx="19" cy="5" r="3.5" fill="#EF4444" />}
  </Svg>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 20, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ThreeDotsIcon: React.FC<IconProps> = ({ size = 20, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="1.8" fill={color} />
    <Circle cx="19" cy="12" r="1.8" fill={color} />
    <Circle cx="5" cy="12" r="1.8" fill={color} />
  </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M16 16L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 16, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
  </Svg>
);

export const SnowflakeIcon: React.FC<IconProps> = ({ size = 16, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M23 21V19C22.99 17.18 21.7 15.62 20 15.13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 3.13C17.7 3.63 19 5.18 19 7C19 8.82 17.7 10.37 16 10.87" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const LicensePlateIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="12" rx="2" stroke={color} strokeWidth="2" />
    <Circle cx="5" cy="12" r="1" fill={color} />
    <Circle cx="19" cy="12" r="1" fill={color} />
    <Path d="M9 10H15M9 14H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const FlagIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke={color} strokeWidth="2" />
  </Svg>
);

export const ShieldAlertIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 8V12M12 16H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ----------------------------------------------------
// 3. BADGE ICONS & PORTRAITS
// ----------------------------------------------------
export const PhoneDeviceIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="30" fill="#EFF6FF" />
    <Rect x="22" y="14" width="20" height="36" rx="4" stroke="#2563EB" strokeWidth="2.2" fill="#FFFFFF" />
    <Circle cx="32" cy="44" r="1.5" fill="#2563EB" />
    <Path d="M29 18H35" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const ShieldCheckBadgeIcon: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="30" fill="#EFF6FF" />
    <Path d="M32 16L44 21V33C44 40.5 38.8 46.8 32 49C25.2 46.8 20 40.5 20 33V21L32 16Z" stroke="#2563EB" strokeWidth="2.2" fill="#FFFFFF" strokeLinejoin="round" />
    <Path d="M27 33L30.5 36.5L37 29.5" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LocationMarkerIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21C16 16.5 19 13.5 19 9.5C19 5.35786 15.866 2 12 2C8.13401 2 5 5.35786 5 9.5C5 13.5 8 16.5 12 21Z" fill={color} />
    <Circle cx="12" cy="9.5" r="3" fill="#FFFFFF" />
  </Svg>
);

export interface DriverAvatarPortraitProps {
  size?: number;
  seed?: string;
  bg?: string;
  showVerified?: boolean;
  imageUrl?: string | null;
  image?: string | null;
  uri?: string | null;
}

export const DriverAvatarPortrait: React.FC<DriverAvatarPortraitProps> = ({
  size = 56,
  seed = '1',
  bg = '#EFF6FF',
  showVerified = true,
  imageUrl,
  image,
  uri,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const resolvedUri = imageUrl || image || uri;

  if (resolvedUri && !imageError) {
    const badgeSize = Math.max(14, Math.round(size * 0.32));
    const checkSize = Math.max(8, Math.round(size * 0.18));

    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
            backgroundColor: bg,
            borderWidth: 1.5,
            borderColor: '#DBEAFE',
          }}
        >
          <Image
            source={{ uri: resolvedUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>
        {showVerified && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: '#10B981',
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={checkSize} height={checkSize} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}
      </View>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Avatar Background Circle */}
      <Circle cx="32" cy="32" r="30" fill={bg} stroke="#DBEAFE" strokeWidth="1.5" />
      {/* Head / Face */}
      <Circle cx="32" cy="24" r="11" fill="#FDBA74" />
      {/* Hair & Mustache/Beard */}
      <Path d="M22 20C22 14 27 12 32 12C37 12 42 14 42 20C40 20 38 18 32 18C26 18 24 20 22 20Z" fill="#1E293B" />
      <Path d="M27 27C29 29 35 29 37 27C37 28 35 30 32 30C29 30 27 28 27 27Z" fill="#0F172A" />
      {/* Shoulders / Shirt */}
      <Path d="M15 54C15 44 22 40 32 40C42 40 49 44 49 54V60H15V54Z" fill="#2563EB" />
      {/* Collar */}
      <Path d="M28 40L32 46L36 40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      {/* Verified Badge */}
      {showVerified && (
        <G transform="translate(42, 42)">
          <Circle cx="9" cy="9" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
          <Path d="M6 9L8 11L12 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
};

// ----------------------------------------------------
// 4. SCREEN 07 VEHICLE CATEGORY GRAPHICS (8 Categories)
// ----------------------------------------------------

// 1. E-Rickshaw (3 Seats)
export const ERickshawGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path d="M15 42L18 16C19 14 22 13 25 13H75C78 13 80 15 82 18L88 34H92V44H15V42Z" fill="#15803D" />
    <Path d="M25 13H75C78 13 80 15 82 18L86 28H16L18 16C19 14 22 13 25 13Z" fill="#EAB308" />
    <Path d="M72 18L83 32H62V18H72Z" fill="#7DD3FC" opacity="0.85" />
    <Rect x="22" y="24" width="34" height="18" rx="2" fill="#FEF08A" />
    <Circle cx="88" cy="38" r="3" fill="#FDE047" stroke="#CA8A04" />
    <Circle cx="82" cy="48" r="7.5" fill="#0F172A" />
    <Circle cx="82" cy="48" r="4" fill="#CBD5E1" />
    <Circle cx="28" cy="48" r="7.5" fill="#0F172A" />
    <Circle cx="28" cy="48" r="4" fill="#CBD5E1" />
  </Svg>
);

// 2. E-Rickshaw Loader (500 kg)
export const ERickshawLoaderGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path d="M54 44V22C54 18 57 15 61 15H76C79 15 81 17 83 20L88 32H92V44H54Z" fill="#0284C7" />
    <Path d="M66 18L78 30H60V18H66Z" fill="#BAE6FD" opacity="0.85" />
    <Rect x="10" y="26" width="42" height="18" rx="2" fill="#0369A1" stroke="#075985" strokeWidth="1" />
    <Path d="M10 32H52" stroke="#38BDF8" strokeWidth="1.5" />
    <Circle cx="82" cy="48" r="7.5" fill="#0F172A" />
    <Circle cx="82" cy="48" r="4" fill="#CBD5E1" />
    <Circle cx="26" cy="48" r="7.5" fill="#0F172A" />
    <Circle cx="26" cy="48" r="4" fill="#CBD5E1" />
  </Svg>
);

// 3. Scorpio (6-7 Seats SUV)
export const ScorpioGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path
      d="M12 36L18 18C19 15 22 14 25 14H70C73 14 76 16 78 20L86 30H94C96 30 98 32 98 35V42C98 44 96 46 94 46H88C88 41 83 38 78 38C73 38 68 41 68 46H36C36 41 31 38 26 38C21 38 16 41 16 46H8C6 46 4 44 4 42V38C4 36 6 36 12 36Z"
      fill="#FFFFFF"
      stroke="#64748B"
      strokeWidth="1.5"
    />
    <Path d="M26 17L20 29H42V17H26Z" fill="#1E293B" opacity="0.8" />
    <Path d="M46 17V29H65V17H46Z" fill="#1E293B" opacity="0.8" />
    <Path d="M68 17V29H80L74 17H68Z" fill="#1E293B" opacity="0.8" />
    <Path d="M26 11H74" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <Rect x="86" y="34" width="8" height="6" fill="#0F172A" rx="1" />
    <Circle cx="26" cy="46" r="8.5" fill="#0F172A" />
    <Circle cx="26" cy="46" r="5" fill="#CBD5E1" />
    <Circle cx="78" cy="46" r="8.5" fill="#0F172A" />
    <Circle cx="78" cy="46" r="5" fill="#CBD5E1" />
  </Svg>
);

// 4. Bolero (6-7 Seats)
export const BoleroGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path
      d="M8 38L10 16C10 14 12 13 15 13H72C75 13 77 15 79 18L87 28H95C97 28 99 30 99 33V42C99 44 97 46 95 46H87C87 41 82 38 77 38C72 38 67 41 67 46H35C35 41 30 38 25 38C20 38 15 41 15 46H6C4 46 2 44 2 42V39C2 38 4 38 8 38Z"
      fill="#F8FAFC"
      stroke="#475569"
      strokeWidth="1.5"
    />
    <Path d="M15 16H36V28H15V16Z" fill="#38BDF8" opacity="0.75" />
    <Path d="M40 16H62V28H40V16Z" fill="#38BDF8" opacity="0.75" />
    <Path d="M66 16H76L82 28H66V16Z" fill="#38BDF8" opacity="0.75" />
    <Rect x="88" y="32" width="7" height="6" rx="1" fill="#334155" />
    <Circle cx="25" cy="46" r="8.5" fill="#0F172A" />
    <Circle cx="25" cy="46" r="4.5" fill="#94A3B8" />
    <Circle cx="77" cy="46" r="8.5" fill="#0F172A" />
    <Circle cx="77" cy="46" r="4.5" fill="#94A3B8" />
  </Svg>
);

// 5. 5 Seater Car (Sedan / Maruti Dzire)
export const Car5SeaterGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path
      d="M14 36L22 22C24 18 28 16 33 16H64C69 16 73 19 76 23L86 32H94C96 32 98 34 98 36V40C98 42 96 44 94 44H88C88 40 84 37 80 37C76 37 72 40 72 44H36C36 40 32 37 28 37C24 37 20 40 20 44H8C6 44 4 42 4 40V37C4 35 6 35 14 36Z"
      fill="#FFFFFF"
      stroke="#64748B"
      strokeWidth="1.5"
    />
    <Path d="M33 19L25 31H48V19H33Z" fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
    <Path d="M52 19V31H72L63 19H52Z" fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
    <Circle cx="28" cy="44" r="8" fill="#1E293B" />
    <Circle cx="28" cy="44" r="4.5" fill="#CBD5E1" />
    <Circle cx="80" cy="44" r="8" fill="#1E293B" />
    <Circle cx="80" cy="44" r="4.5" fill="#CBD5E1" />
  </Svg>
);

// 6. 7 Seater Car (Ertiga / Innova)
export const Car7SeaterGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path
      d="M8 36L15 18C17 15 20 14 24 14H75C78 14 81 16 83 20L91 30H96C98 30 100 32 100 34V40C100 42 98 44 96 44H89C89 39 84 36 79 36C74 36 69 39 69 44H37C37 39 32 36 27 36C22 36 17 39 17 44H6C4 44 2 42 2 40V37C2 35 4 35 8 36Z"
      fill="#FFFFFF"
      stroke="#64748B"
      strokeWidth="1.5"
    />
    <Path d="M24 17L17 29H42V17H24Z" fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
    <Path d="M46 17V29H65V17H46Z" fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
    <Path d="M69 17V29H85L80 17H69Z" fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
    <Circle cx="27" cy="44" r="8" fill="#1E293B" />
    <Circle cx="27" cy="44" r="4.5" fill="#CBD5E1" />
    <Circle cx="79" cy="44" r="8" fill="#1E293B" />
    <Circle cx="79" cy="44" r="4.5" fill="#CBD5E1" />
  </Svg>
);

// 7. Bolero Pickup (1 Ton)
export const BoleroPickupGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path d="M52 44V20C52 17 55 15 58 15H78C81 15 83 17 85 20L91 32H96C98 32 99 34 99 36V44H52Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2" />
    <Path d="M66 18L78 30H58V18H66Z" fill="#7DD3FC" opacity="0.85" />
    <Rect x="8" y="24" width="44" height="20" rx="1" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.2" />
    <Path d="M8 30H52M8 36H52" stroke="#94A3B8" strokeWidth="1" />
    <Circle cx="82" cy="46" r="8" fill="#0F172A" />
    <Circle cx="82" cy="46" r="4.5" fill="#CBD5E1" />
    <Circle cx="26" cy="46" r="8" fill="#0F172A" />
    <Circle cx="26" cy="46" r="4.5" fill="#CBD5E1" />
  </Svg>
);

// 8. Mini Loader (700-900 kg Tata Ace)
export const MiniLoaderGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 55,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 60" fill="none">
    <Path d="M56 44V16C56 14 58 13 60 13H82C85 13 87 15 89 18L95 32H97C98 32 99 33 99 35V44H56Z" fill="#FFFFFF" stroke="#475569" strokeWidth="1.2" />
    <Path d="M64 16L78 30H62V16H64Z" fill="#38BDF8" opacity="0.8" />
    <Rect x="8" y="22" width="48" height="22" rx="1" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
    <Path d="M8 29H56" stroke="#64748B" strokeWidth="1.5" />
    <Circle cx="80" cy="46" r="8" fill="#0F172A" />
    <Circle cx="80" cy="46" r="4.5" fill="#CBD5E1" />
    <Circle cx="25" cy="46" r="8" fill="#0F172A" />
    <Circle cx="25" cy="46" r="4.5" fill="#CBD5E1" />
  </Svg>
);

// Legacy aliases for existing home screen grid
export const SedanCarGraphic = Car5SeaterGraphic;
export const SuvGraphic = ScorpioGraphic;
export const Mpv7SeaterGraphic = Car7SeaterGraphic;
export const TravellerGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 90,
  height = 50,
}) => (
  <Svg width={width} height={height} viewBox="0 0 100 55" fill="none">
    <Path d="M6 36L8 15C8 13 10 11 12 11H84C87 11 89 13 91 16L97 29V40C97 42 95 44 93 44H87C87 39 82 36 77 36C72 36 67 39 67 44H37C37 39 32 36 27 36C22 36 17 39 17 44H6C4 44 2 42 2 40V38C2 36 4 36 6 36Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
    <Path d="M12 15H25V26H12V15Z" fill="#38BDF8" opacity="0.85" />
    <Path d="M28 15H42V26H28V15Z" fill="#38BDF8" opacity="0.85" />
    <Path d="M45 15H59V26H45V15Z" fill="#38BDF8" opacity="0.85" />
    <Path d="M62 15H76V26H62V15Z" fill="#38BDF8" opacity="0.85" />
    <Path d="M79 15H89L94 26H79V15Z" fill="#38BDF8" opacity="0.85" />
    <Path d="M4 31H95" stroke="#2563EB" strokeWidth="2.5" />
    <Circle cx="27" cy="44" r="8.5" fill="#0F172A" />
    <Circle cx="27" cy="44" r="5" fill="#E2E8F0" />
    <Circle cx="77" cy="44" r="8.5" fill="#0F172A" />
    <Circle cx="77" cy="44" r="5" fill="#E2E8F0" />
  </Svg>
);

// ----------------------------------------------------
// 5. BOTTOM TAB BAR ICONS
// ----------------------------------------------------
export const RideTabIcon: React.FC<IconProps> = ({ size = 22, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 16L3 16C2.45 16 2 15.55 2 15L2 11C2 10.45 2.45 10 3 10L4.5 10L6.75 4.75C7.03 4.1 7.66 3.67 8.36 3.67L15.64 3.67C16.34 3.67 16.97 4.1 17.25 4.75L19.5 10L21 10C21.55 10 22 10.45 22 11L22 15C22 15.55 21.55 16 21 16L19 16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="16" r="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="17" cy="16" r="2" stroke={color} strokeWidth="1.8" />
    <Path d="M5 10H19" stroke={color} strokeWidth="1.8" />
  </Svg>
);

export const MyRidesTabIcon: React.FC<IconProps> = ({ size = 22, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 8H16M8 12H16M8 16H12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const ContactedTabIcon: React.FC<IconProps> = ({ size = 22, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4 20 8.9 19.6 7.6 18.9L3 20L4.3 16.2C3.5 14.8 3 13.2 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="11.5" r="1" fill={color} />
    <Circle cx="12" cy="11.5" r="1" fill={color} />
    <Circle cx="15.5" cy="11.5" r="1" fill={color} />
  </Svg>
);

export const ProfileTabIcon: React.FC<IconProps> = ({ size = 22, color = '#94A3B8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// ----------------------------------------------------
// 6. UTILITY / COMMONS
// ----------------------------------------------------
export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 16, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ size = 16, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const AlertCircleIcon: React.FC<IconProps> = ({ size = 16, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 8V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1" fill={color} />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5902 20.9046 21.7335 20.6407 21.8228C20.3769 21.912 20.0974 21.9452 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.85C8.77382 17.3148 6.72533 15.2663 5.19 12.85C3.49997 10.2412 2.44824 7.27104 2.12 4.18C2.095 3.90357 2.12787 3.62486 2.21652 3.36173C2.30517 3.0986 2.44766 2.85686 2.63499 2.65215C2.82233 2.44744 3.05036 2.28434 3.30436 2.17333C3.55836 2.06232 3.83262 2.00588 4.11 2.00781H7.11C7.5953 1.99524 8.06579 2.16708 8.42512 2.48834C8.78445 2.80959 9.00624 3.25697 9.04 3.74C9.1027 4.64619 9.32439 5.53677 9.698 6.38C9.84504 6.70829 9.89069 7.07223 9.82902 7.42571C9.76735 7.77919 9.60117 8.10626 9.352 8.365L8.08 9.637C9.51355 12.1583 11.5817 14.2265 14.103 15.66L15.375 14.388C15.6337 14.1388 15.9608 13.9726 16.3143 13.911C16.6678 13.8493 17.0317 13.895 17.36 14.042C18.2032 14.4156 19.0938 14.6373 20 14.7C20.4884 14.7342 20.9404 14.9602 21.2638 15.3262C21.5872 15.6923 21.7578 16.1699 21.74 16.66L22 16.92Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CarBadgeIcon: React.FC<IconProps> = ({ size = 36, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 16L3 16C2.44772 16 2 15.5523 2 15L2 11C2 10.4477 2.44772 10 3 10L4.5 10L6.75 4.75C7.03 4.1 7.66 3.67 8.36 3.67L15.64 3.67C16.34 3.67 16.97 4.1 17.25 4.75L19.5 10L21 10C21.5523 10 22 10.4477 22 11L22 15C22 15.5523 21.5523 16 21 16L19 16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="16" r="2.5" stroke={color} strokeWidth="2" fill="#FFFFFF" />
    <Circle cx="17" cy="16" r="2.5" stroke={color} strokeWidth="2" fill="#FFFFFF" />
    <Path d="M5 10L19 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46C9.4 2.53 10.67 2 12 2C13.33 2 14.6 2.53 15.54 3.46C16.47 4.4 17 5.67 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="16" r="1.2" fill={color} />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 6.06 6.06L17.94 17.94Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </Svg>
);

export const AppleIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.65-1.24z" />
  </Svg>
);

export const LogOutIcon: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17L21 12L16 7M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ----------------------------------------------------
// 7. BOOKING & CONFIRMATION FLOW ICONS (Screens 13-18)
// ----------------------------------------------------

export const InfoCircleOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#1E293B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <Path d="M12 16V12M12 8H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CrossCircleIcon: React.FC<IconProps> = ({ size = 20, color = '#F97316' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <Path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PaperPlaneIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CalendarOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

export const ClockOutlineIcon: React.FC<IconProps & { strokeWidth?: number }> = ({
  size = 20,
  color = '#64748B',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HourglassIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 22H19M5 2H19M17 2V6.5C17 8.5 15.5 10.5 13.5 11.5L12 12L10.5 11.5C8.5 10.5 7 8.5 7 6.5V2M17 22V17.5C17 15.5 15.5 13.5 13.5 12.5L12 12L10.5 12.5C8.5 13.5 7 15.5 7 17.5V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PinMarkerOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 16.5 19 13.5 19 9.5C19 5.35786 15.866 2 12 2C8.13401 2 5 5.35786 5 9.5C5 13.5 8 16.5 12 21Z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9.5" r="2.5" stroke={color} strokeWidth="1.8" />
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

export const LockFilledIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="10" width="16" height="12" rx="2" fill={color} />
    <Path
      d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="16" r="1.5" fill="#2563EB" />
  </Svg>
);

export const CelebrationCheckGraphic: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <Svg width={size} height={size * 0.85} viewBox="0 0 160 136" fill="none">
    {/* Confetti Dots & Shapes */}
    <Circle cx="24" cy="22" r="3" fill="#3B82F6" />
    <Circle cx="38" cy="14" r="2.5" fill="#EF4444" />
    <Circle cx="52" cy="30" r="2" fill="#EAB308" />
    <Circle cx="20" cy="50" r="2.5" fill="#10B981" />
    <Circle cx="35" cy="74" r="3" fill="#6366F1" />
    <Circle cx="48" cy="98" r="2" fill="#EC4899" />
    <Circle cx="136" cy="24" r="3" fill="#F97316" />
    <Circle cx="120" cy="16" r="2.5" fill="#10B981" />
    <Circle cx="146" cy="46" r="2" fill="#3B82F6" />
    <Circle cx="130" cy="70" r="3" fill="#EAB308" />
    <Circle cx="140" cy="92" r="2.5" fill="#8B5CF6" />
    <Circle cx="118" cy="104" r="2" fill="#EF4444" />
    <Rect x="28" y="38" width="5" height="3" rx="1" fill="#F59E0B" transform="rotate(25 28 38)" />
    <Rect x="126" y="36" width="5" height="3" rx="1" fill="#3B82F6" transform="rotate(-30 126 36)" />
    <Rect x="134" y="80" width="4" height="2.5" rx="1" fill="#10B981" transform="rotate(45 134 80)" />
    <Rect x="22" y="82" width="4" height="2.5" rx="1" fill="#EF4444" transform="rotate(-15 22 82)" />

    {/* Central Green Success Circle */}
    <Circle cx="80" cy="68" r="34" fill="#22C55E" />
    <Circle cx="80" cy="68" r="38" stroke="#DCFCE7" strokeWidth="3" opacity="0.6" />

    {/* White Checkmark */}
    <Path
      d="M66 68L75 77L94 58"
      stroke="#FFFFFF"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ----------------------------------------------------
// 8. ACTION MENU & FEEDBACK ICONS
// ----------------------------------------------------
export const ShareIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const HeartOutlineIcon: React.FC<IconProps> = ({ size = 20, color = '#E11D48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeartFilledIcon: React.FC<IconProps> = ({ size = 20, color = '#E11D48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    />
  </Svg>
);

export const CopyClipboardIcon: React.FC<IconProps> = ({ size = 20, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BanIcon: React.FC<IconProps> = ({ size = 20, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const XCloseIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LifeBuoyIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
    <Path d="M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SpeedometerIcon: React.FC<IconProps> = ({ size = 16, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 15.36 3.66 18.33 6.22 20.12C6.54 20.35 6.99 20.25 7.18 19.91C7.38 19.57 7.25 19.13 6.92 18.9C4.81 17.43 3.5 14.88 3.5 12C3.5 7.31 7.31 3.5 12 3.5C16.69 3.5 20.5 7.31 20.5 12C20.5 14.88 19.19 17.43 17.08 18.9C16.75 19.13 16.62 19.57 16.82 19.91C17.01 20.25 17.46 20.35 17.78 20.12C20.34 18.33 22 15.36 22 12C22 6.48 17.52 2 12 2Z"
      fill={color}
    />
    <Path
      d="M12 11C11.45 11 11 11.45 11 12C11 12.35 11.18 12.66 11.46 12.84L14.71 16.09C14.9 16.28 15.22 16.28 15.41 16.09C15.6 15.9 15.6 15.58 15.41 15.39L12.74 12.72C12.9 12.52 13 12.27 13 12C13 11.45 12.55 11 12 11Z"
      fill={color}
    />
  </Svg>
);

export const ShieldCheckmarkIcon: React.FC<IconProps> = ({ size = 16, color = '#10B981' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      fill={color}
    />
    <Path
      d="M9 12L11 14L15 9.5"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SparkleCleanIcon: React.FC<IconProps> = ({ size = 16, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L13.8 7.2L19 9L13.8 10.8L12 16L10.2 10.8L5 9L10.2 7.2L12 2Z"
      fill={color}
    />
    <Path
      d="M19 14L19.8 16.2L22 17L19.8 17.8L19 20L18.2 17.8L16 17L18.2 16.2L19 14Z"
      fill={color}
    />
  </Svg>
);

export const DriverAvatarHeroPortrait: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
    {/* Outer Ring */}
    <Circle cx="48" cy="48" r="46" stroke="#BFDBFE" strokeWidth="2.5" />
    <Circle cx="48" cy="48" r="43" fill="#EFF6FF" stroke="#FFFFFF" strokeWidth="2.5" />

    {/* Head & Neck */}
    <Circle cx="48" cy="36" r="16" fill="#FBBF24" />

    {/* Hair & Beard */}
    <Path
      d="M32 30C32 20 40 16 48 16C56 16 64 20 64 30C62 30 58 26 48 26C38 26 34 30 32 30Z"
      fill="#1E293B"
    />
    <Path
      d="M40 40C42 43 54 43 56 40C56 42 53 45 48 45C43 45 40 42 40 40Z"
      fill="#0F172A"
    />
    {/* Smile */}
    <Path
      d="M43 38C45 40 51 40 53 38"
      stroke="#78350F"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Shoulders / Shirt */}
    <Path
      d="M22 80C22 64 33 58 48 58C63 58 74 64 74 80V86H22V80Z"
      fill="#60A5FA"
    />
    {/* Collar */}
    <Path
      d="M42 58L48 68L54 58"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M34 62L43 72"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M62 62L53 72"
      stroke="#3B82F6"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Verified Blue Shield Tick at Bottom Right */}
    <G transform="translate(62, 62)">
      <Circle cx="12" cy="12" r="11" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
      <Path
        d="M8 12L11 15L16 9"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  </Svg>
);

export const MarutiDzireAngledGraphic: React.FC<{ width?: number; height?: number }> = ({
  width = 175,
  height = 95,
}) => (
  <Svg width={width} height={height} viewBox="0 0 200 110" fill="none">
    {/* Ground Shadow */}
    <Ellipse cx="102" cy="98" rx="88" ry="8" fill="#CBD5E1" opacity={0.6} />

    {/* Car Main Body (White metallic) */}
    <Path
      d="M14 74C13 70 16 66 22 64L44 60L72 38C76 34 82 32 88 32H144C152 32 158 35 162 40L178 54L190 62C194 64 196 68 196 72V82C196 85 194 87 190 87H170C170 78 162 72 152 72C142 72 134 78 134 87H66C66 78 58 72 48 72C38 72 30 78 30 87H18C15 87 14 85 14 82V74Z"
      fill="#FFFFFF"
      stroke="#94A3B8"
      strokeWidth="1.5"
    />

    {/* Front Bumper & Chrome Grille */}
    <Path
      d="M188 64C194 66 196 70 196 74V80C196 84 192 86 186 86H170C168 86 166 84 166 82C166 80 168 78 170 78H186V72L178 58L188 64Z"
      fill="#F1F5F9"
    />

    {/* Grille Hexagon pattern */}
    <Rect x="174" y="64" width="18" height="12" rx="3" fill="#1E293B" />
    <Path d="M176 67H190M176 70H190M176 73H190" stroke="#64748B" strokeWidth="0.8" />
    {/* Suzuki S Emblem in Chrome */}
    <Path d="M182 67L184 66H185L183 71H184L182 72" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Crystal Headlights */}
    <Path
      d="M166 56L182 60C184 60 185 62 184 64L172 65C170 65 168 64 167 62L164 58C164 56 165 56 166 56Z"
      fill="#BAE6FD"
      stroke="#0284C7"
      strokeWidth="1"
    />
    <Path d="M174 58L180 62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Fog Lamp & Chrome Accent */}
    <Rect x="178" y="78" width="8" height="5" rx="1.5" fill="#0F172A" />
    <Circle cx="182" cy="80.5" r="1.5" fill="#FEF08A" />

    {/* Windshield & Windows (Tinted glass) */}
    <Path
      d="M76 39L94 36H138L156 52H70L76 39Z"
      fill="#38BDF8"
      opacity={0.85}
      stroke="#0284C7"
      strokeWidth="1"
    />
    {/* Window Separator Pillar */}
    <Path d="M112 36V52" stroke="#1E293B" strokeWidth="3" />
    <Path d="M138 36L148 52" stroke="#1E293B" strokeWidth="2.5" />

    {/* Side Mirror */}
    <Path d="M152 50L158 48C160 48 162 50 161 52L156 55H151L152 50Z" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
    <Path d="M153 51H158" stroke="#38BDF8" strokeWidth="1" />

    {/* Door Handles & Body Contour Line */}
    <Path d="M48 62C80 60 120 62 168 58" stroke="#E2E8F0" strokeWidth="1.5" />
    <Rect x="92" y="58" width="8" height="2.5" rx="1" fill="#94A3B8" />
    <Rect x="126" y="58" width="8" height="2.5" rx="1" fill="#94A3B8" />

    {/* Rear Wheel */}
    <Circle cx="48" cy="87" r="15" fill="#0F172A" />
    <Circle cx="48" cy="87" r="10" fill="#64748B" />
    <Circle cx="48" cy="87" r="6" fill="#F8FAFC" />
    {/* Alloy Spokes */}
    <Path d="M48 77V97M38 87H58M41 80L55 94M55 80L41 94" stroke="#CBD5E1" strokeWidth="1.5" />

    {/* Front Wheel */}
    <Circle cx="152" cy="87" r="15" fill="#0F172A" />
    <Circle cx="152" cy="87" r="10" fill="#64748B" />
    <Circle cx="152" cy="87" r="6" fill="#F8FAFC" />
    {/* Alloy Spokes */}
    <Path d="M152 77V97M142 87H162M145 80L159 94M159 80L145 94" stroke="#CBD5E1" strokeWidth="1.5" />
  </Svg>
);

export const IndiaFlagIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <Svg width={size} height={(size * 3) / 4} viewBox="0 0 24 18" fill="none">
    <Rect width="24" height="18" rx="3" fill="#FFFFFF" />
    <Path d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V6H0V3Z" fill="#FF9933" />
    <Rect y="6" width="24" height="6" fill="#FFFFFF" />
    <Path d="M0 12H24V15C24 16.6569 22.6569 18 21 18H3C1.34315 18 0 16.6569 0 15V12Z" fill="#138808" />
    {/* Ashoka Chakra */}
    <Circle cx="12" cy="9" r="2.2" stroke="#000080" strokeWidth="0.7" fill="none" />
    <Circle cx="12" cy="9" r="0.6" fill="#000080" />
    <Path d="M12 6.8V11.2M9.8 9H14.2M10.4 7.4L13.6 10.6M10.4 10.6L13.6 7.4" stroke="#000080" strokeWidth="0.4" />
    <Rect x="0.5" y="0.5" width="23" height="17" rx="2.5" stroke="#E2E8F0" strokeWidth="0.8" />
  </Svg>
);

export const NavigationSendIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShareNodesIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
    <Path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CrosshairGpsIcon: React.FC<IconProps> = ({ size = 24, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="3" fill={color} />
    <Path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const HamburgerMenuIcon: React.FC<IconProps> = ({ size = 24, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H21M3 12H21M3 18H21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

export const ShieldSafetyIcon: React.FC<IconProps> = ({ size = 22, color = '#0F172A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CarTopViewGraphic: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={(size * 48) / 36} viewBox="0 0 36 48" fill="none">
    <Rect x="4" y="6" width="28" height="36" rx="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
    <Path d="M8 16H28L25 22H11L8 16Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
    <Path d="M10 36H26L24 32H12L10 36Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
    <Rect x="10" y="21" width="16" height="11" rx="2" fill="#F1F5F9" />
    <Rect x="6" y="6" width="5" height="3" rx="1" fill="#FEF08A" />
    <Rect x="25" y="6" width="5" height="3" rx="1" fill="#FEF08A" />
    <Rect x="6" y="39" width="5" height="2" rx="0.5" fill="#EF4444" />
    <Rect x="25" y="39" width="5" height="2" rx="0.5" fill="#EF4444" />
  </Svg>
);

export const EditPencilIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3A2.828 2.828 0 1 1 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 9V5A3 3 0 0 0 11 2L7 11V22H18.28A2 2 0 0 0 20.24 20.38L21.74 13.38A2 2 0 0 0 19.78 11H14Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M7 22H4A2 2 0 0 1 2 20V13A2 2 0 0 1 4 11H7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ClockTimeIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const SmileyFaceIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="9" cy="9" r="1.2" fill={color} />
    <Circle cx="15" cy="9" r="1.2" fill={color} />
  </Svg>
);

export const CarFrontIcon: React.FC<IconProps> = ({ size = 18, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 11L7 5H17L19 11M5 11H19M5 11V18H7V16H17V18H19V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="7.5" cy="13.5" r="1.2" fill={color} />
    <Circle cx="16.5" cy="13.5" r="1.2" fill={color} />
  </Svg>
);

export const StarFilledGraphic: React.FC<{ size?: number; color?: string }> = ({
  size = 38,
  color = '#1D61E7',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </Svg>
);

export const ProhibitedBanIcon: React.FC<IconProps> = ({ size = 18, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CalendarDateIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
    <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const QuestionCircleIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

export const WarningTriangleIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9v4M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShieldCheckAltIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const RupeeCircleIcon: React.FC<IconProps> = ({ size = 26, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 7h8M8 10h8M8 10a3 3 0 0 0 3 3h1l4 5M11 13H8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PhoneCallWaveIcon: React.FC<IconProps> = ({ size = 26, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 12h.01M12 12h.01M16 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const CameraBadgeIcon: React.FC<IconProps> = ({ size = 14, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

export const UserSingleIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ size = 26, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M18 20a6 6 0 0 0-12 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

export const HeartOutlineSimpleIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 20, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 20, color = '#818CF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SystemThemeIcon: React.FC<IconProps> = ({ size = 20, color = '#3B82F6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BrandThemeIcon: React.FC<IconProps> = ({ size = 20, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsGearIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

