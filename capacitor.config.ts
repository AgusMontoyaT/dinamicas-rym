import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dinamicasrym.app',
  appName: 'Clones',
  webDir: 'dist/rickymorty/browser',

  plugins: {
    ScreenOrientation: {
      orientation: "landscape"
    }
  },

  android: {
    allowMixedContent: true
  }
};

export default config;
