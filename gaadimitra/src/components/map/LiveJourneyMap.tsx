import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { CrosshairGpsIcon, CarTopViewGraphic } from '../../assets/icons/Icons';

interface LiveJourneyMapProps {
  mode?: 'pickup_pin' | 'driver_enroute' | 'ride_in_progress';
  etaMinutes?: number;
  latitude?: number;
  longitude?: number;
  onRecenter?: () => void;
  height?: number;
}

// Convert GPS Lat/Lon to OpenStreetMap Tile Coordinates
const latLonToTile = (lat: number, lon: number, zoom: number) => {
  const n = Math.pow(2, zoom);
  const rad = (lat * Math.PI) / 180;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  );
  return { x, y };
};

export const LiveJourneyMap: React.FC<LiveJourneyMapProps> = ({
  mode = 'driver_enroute',
  etaMinutes = 8,
  latitude = 25.6022,
  longitude = 85.1376,
  onRecenter,
  height = 380,
}) => {
  const [zoom, setZoom] = useState(15);
  const [, setTileError] = useState(false);

  // Generate 3x3 Real OpenStreetMap / CartoDB Street Tile Matrix
  const tiles = useMemo(() => {
    const center = latLonToTile(latitude, longitude, zoom);
    const tileList: { key: string; uri: string; col: number; row: number }[] = [];
    const subdomains = ['a', 'b', 'c', 'd'];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = center.x + dx;
        const ty = center.y + dy;
        const sub = subdomains[Math.abs(tx + ty) % subdomains.length];
        
        // CartoDB Voyager Raster Tiles (100% Free OpenStreetMap Data - Clean & Sharp)
        const uri = `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}@2x.png`;
        tileList.push({
          key: `${zoom}-${tx}-${ty}`,
          uri,
          col: dx + 1,
          row: dy + 1,
        });
      }
    }
    return tileList;
  }, [latitude, longitude, zoom]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 12));
  };

  return (
    <View
      style={{ height }}
      className="w-full bg-[#E5EEF4] relative overflow-hidden"
    >
      {/* 1. Real Free OpenStreetMap Tile Layer */}
      <View className="absolute inset-0 w-[768px] h-[768px]">
        {tiles.map(tile => (
          <Image
            key={tile.key}
            source={{ uri: tile.uri }}
            style={{
              position: 'absolute',
              width: 256,
              height: 256,
              left: tile.col * 256 - 192,
              top: tile.row * 256 - (384 - height / 2),
            }}
            resizeMode="cover"
            onError={() => setTileError(true)}
          />
        ))}
      </View>

      {/* 2. Interactive SVG Navigation Overlay Layer */}
      <View className="absolute inset-0" pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 380 380">
          <Defs>
            <LinearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1D4ED8" />
            </LinearGradient>
          </Defs>

          {/* Mode: Pickup Pin (Screen 20) - Real Radar Beacon */}
          {mode === 'pickup_pin' && (
            <G>
              {/* Outer Radar Glow Rings */}
              <Circle cx="190" cy={height / 2} r="65" fill="#2563EB" fillOpacity="0.12" />
              <Circle cx="190" cy={height / 2} r="42" fill="#2563EB" fillOpacity="0.2" />
              <Circle cx="190" cy={height / 2} r="24" fill="#2563EB" fillOpacity="0.28" />

              {/* Pin Center Beacon */}
              <Circle cx="190" cy={height / 2} r="10" fill="#FFFFFF" />
              <Circle cx="190" cy={height / 2} r="6.5" fill="#2563EB" />
            </G>
          )}

          {/* Mode: Driver En Route & Ride In Progress */}
          {(mode === 'driver_enroute' || mode === 'ride_in_progress') && (
            <G>
              {/* Clean Single Navigation Polyline (Royal Blue) */}
              <Path
                d="M 105 250 L 135 225 L 185 225 L 225 180 L 265 180 L 290 135 L 295 85"
                stroke="#1D61E7"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Pickup Pin Halo & Core */}
              <Circle cx="105" cy="250" r="16" fill="#2563EB" fillOpacity="0.2" />
              <Circle cx="105" cy="250" r="8" fill="#FFFFFF" />
              <Circle cx="105" cy="250" r="5" fill="#2563EB" />

              {/* Destination Pin Target (if in progress) */}
              {mode === 'ride_in_progress' && (
                <G>
                  <Circle cx="295" cy="85" r="16" fill="#EF4444" fillOpacity="0.2" />
                  <Circle cx="295" cy="85" r="8" fill="#FFFFFF" />
                  <Circle cx="295" cy="85" r="5" fill="#EF4444" />
                </G>
              )}
            </G>
          )}
        </Svg>
      </View>

      {/* Floating Top-Down Vehicle Icon on Map (Driver En Route / In Progress) */}
      {(mode === 'driver_enroute' || mode === 'ride_in_progress') && (
        <View
          style={{
            position: 'absolute',
            top: mode === 'driver_enroute' ? 62 : 140,
            right: mode === 'driver_enroute' ? 68 : 96,
            transform: [{ rotate: mode === 'driver_enroute' ? '-15deg' : '-48deg' }],
          }}
          className="items-center justify-center"
        >
          <CarTopViewGraphic size={32} />
        </View>
      )}

      {/* Floating ETA Badge (Top Right) */}
      {mode === 'driver_enroute' && (
        <View className="absolute top-4 right-4 bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200/80 items-center justify-center shadow-sm">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ETA
          </Text>
          <Text className="text-base font-black text-slate-900 leading-tight">
            {etaMinutes} <Text className="text-xs font-semibold text-slate-500">min</Text>
          </Text>
        </View>
      )}

      {/* Map Interactive Floating Controls (Zoom + Recenter) */}
      <View className="absolute bottom-4 right-4 items-center space-y-2">
        {/* Zoom In & Zoom Out Buttons */}
        <View className="bg-white rounded-xl border border-slate-200/90 overflow-hidden mb-2 shadow-sm">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleZoomIn}
            className="w-10 h-10 items-center justify-center border-b border-slate-100"
          >
            <Text className="text-slate-800 text-lg font-bold">+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleZoomOut}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-slate-800 text-lg font-bold">−</Text>
          </TouchableOpacity>
        </View>

        {/* Recenter GPS FAB Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRecenter}
          className="w-11 h-11 rounded-full bg-white items-center justify-center border border-slate-200/90 shadow-sm"
        >
          <CrosshairGpsIcon size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Real OpenStreetMap Attribution watermark */}
      <View className="absolute bottom-1 left-3 bg-white/80 px-2 py-0.5 rounded-md">
        <Text className="text-[9px] font-semibold text-slate-500">
          © OpenStreetMap contributors
        </Text>
      </View>
    </View>
  );
};
