import React from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,

} from 'react-native-svg';

export const SplashIllustration: React.FC<{ width?: number; height?: number }> = ({
  width = 320,
  height = 140,
}) => {
  return (
    <View className="items-center justify-center">
      <Svg width={width} height={height} viewBox="0 0 320 140" fill="none">
        {/* City Skyline / Bridge Silhouette in subtle transparent white */}
        <G opacity="0.3">
          {/* Bridge Cables */}
          <Path d="M10 100L40 30L70 100" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
          <Path d="M40 30V100" stroke="#FFFFFF" strokeWidth="2" />
          <Path d="M70 100L100 40L130 100" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
          <Path d="M100 40V100" stroke="#FFFFFF" strokeWidth="2" />

          {/* Skyscrapers Outline */}
          <Rect x="140" y="55" width="22" height="45" stroke="#FFFFFF" strokeWidth="1.5" />
          <Rect x="170" y="35" width="28" height="65" stroke="#FFFFFF" strokeWidth="1.5" />
          <Path d="M184 18L184 35" stroke="#FFFFFF" strokeWidth="1.5" />
          <Rect x="206" y="50" width="24" height="50" stroke="#FFFFFF" strokeWidth="1.5" />
          <Rect x="238" y="65" width="20" height="35" stroke="#FFFFFF" strokeWidth="1.5" />
          <Rect x="266" y="42" width="26" height="58" stroke="#FFFFFF" strokeWidth="1.5" />
          <Path d="M279 25L279 42" stroke="#FFFFFF" strokeWidth="1.5" />
        </G>

        {/* Road Surface Line */}
        <Path d="M0 100H320" stroke="#93C5FD" strokeWidth="2" opacity="0.6" />
        <Path d="M0 108H320" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />

        {/* White Car Driving on the Road */}
        <G transform="translate(140, 72)">
          {/* Car Body */}
          <Path
            d="M8 22L16 11C18 8 21 7 25 7H52C56 7 59 9 61 12L69 19H77C79 19 80 20 80 22V26C80 28 79 29 77 29H72C72 25 68 23 65 23C62 23 58 25 58 29H28C28 25 24 23 21 23C18 23 14 25 14 29H3C2 29 1 28 1 26V24C1 22 2 22 8 22Z"
            fill="#FFFFFF"
          />
          {/* Tinted Windows */}
          <Path d="M25 9L18 19H38V9H25Z" fill="#1D4ED8" opacity="0.75" />
          <Path d="M41 9V19H58L52 9H41Z" fill="#1D4ED8" opacity="0.75" />
          {/* Headlight & Taillight */}
          <Path d="M78 21L80 22V24L78 23V21Z" fill="#FEF08A" />
          <Path d="M2 22L1 23V25L2 24V22Z" fill="#EF4444" />
          {/* Wheels */}
          <Circle cx="21" cy="29" r="6" fill="#1E293B" />
          <Circle cx="21" cy="29" r="3" fill="#E2E8F0" />
          <Circle cx="65" cy="29" r="6" fill="#1E293B" />
          <Circle cx="65" cy="29" r="3" fill="#E2E8F0" />
        </G>
      </Svg>
    </View>
  );
};
