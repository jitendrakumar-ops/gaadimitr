import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';

export const LocationIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 260,
  height = 200,
}) => {
  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 260 200" fill="none">
        <Defs>
          <LinearGradient id="locBgGrad" x1="130" y1="10" x2="130" y2="190" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#EFF6FF" />
            <Stop offset="1" stopColor="#DBEAFE" />
          </LinearGradient>
        </Defs>

        {/* Circular Soft Map Ground */}
        <Circle cx="130" cy="100" r="85" fill="url(#locBgGrad)" />

        {/* 3D Map Grid Lines & Roads */}
        <G opacity="0.7">
          {/* Map Base Polygon */}
          <Path
            d="M70 115L130 85L190 115L130 145L70 115Z"
            fill="#BFDBFE"
            stroke="#93C5FD"
            strokeWidth="1.5"
          />
          {/* Curvy Road */}
          <Path
            d="M85 110C105 100 115 125 140 110C155 100 170 120 178 120"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <Path
            d="M85 110C105 100 115 125 140 110C155 100 170 120 178 120"
            stroke="#93C5FD"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
        </G>

        {/* Soft Landscape Trees */}
        <G transform="translate(68, 80)">
          <Circle cx="12" cy="12" r="10" fill="#86EFAC" />
          <Circle cx="8" cy="10" r="7" fill="#4ADE80" />
          <Rect x="10.5" y="18" width="3" height="8" rx="1.5" fill="#92400E" />
        </G>

        <G transform="translate(170, 78)">
          <Circle cx="12" cy="12" r="11" fill="#86EFAC" />
          <Circle cx="15" cy="9" r="8" fill="#4ADE80" />
          <Rect x="10.5" y="19" width="3" height="8" rx="1.5" fill="#92400E" />
        </G>

        {/* Radar / Location Pulse Ripple */}
        <Circle cx="130" cy="85" r="32" stroke="#3B82F6" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
        <Circle cx="130" cy="85" r="48" stroke="#3B82F6" strokeWidth="0.8" opacity="0.2" />

        {/* Big Blue Map Pin in the Center */}
        <G transform="translate(112, 38)">
          {/* Shadow */}
          <Ellipse cx="18" cy="46" rx="14" ry="4" fill="#64748B" opacity="0.3" />

          {/* Map Pin Body */}
          <Path
            d="M18 42C28 30 36 22 36 15C36 6.71573 27.9411 0 18 0C8.05887 0 0 6.71573 0 15C0 22 8 30 18 42Z"
            fill="#2563EB"
          />
          {/* Pin Center White Dot */}
          <Circle cx="18" cy="15" r="6.5" fill="#FFFFFF" />
        </G>
      </Svg>
    </View>
  );
};
