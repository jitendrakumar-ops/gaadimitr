const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { exec } = require('child_process');

// Automatically reverse ports for backend server (5001) and metro (8081) on connected Android devices
const reversePorts = () => {
  exec('adb reverse tcp:5001 tcp:5001', (err) => {
    if (!err) {
      console.log('\x1b[32m%s\x1b[0m', '⚡ [GaadiMitra] ADB reverse tcp:5001 -> tcp:5001 (Backend API)');
    }
  });
  exec('adb reverse tcp:8081 tcp:8081', (err) => {
    if (!err) {
      console.log('\x1b[32m%s\x1b[0m', '⚡ [GaadiMitra] ADB reverse tcp:8081 -> tcp:8081 (Metro Bundler)');
    }
  });
};

reversePorts();

const config = mergeConfig(getDefaultConfig(__dirname), {});

module.exports = withNativeWind(config, { input: './global.css' });
