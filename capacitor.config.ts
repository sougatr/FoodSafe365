import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodsafe365.app',
  appName: 'FoodSafe365',
  webDir: 'public',
  server: {
    // Points directly to your production Vercel cloud app
    // Any update pushed to GitHub/Vercel will be live in the mobile app instantly!
    url: 'https://food-safe365.vercel.app',
    cleartext: false,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#059669',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#059669'
    }
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'FoodSafe365'
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
