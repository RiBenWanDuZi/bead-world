import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ydt.beadworld',
  appName: 'YDT的拼豆小世界',
  webDir: 'dist',
  ios: {
    bundleId: 'com.ydt.beadworld',
    minimumVersion: '13.0'
  }
};

export default config;
