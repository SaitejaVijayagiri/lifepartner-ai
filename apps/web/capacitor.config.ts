import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifepartner.ai',
  appName: 'LifePartner',
  webDir: 'out',
  server: {
    url: 'https://lifepartner-ai-web.vercel.app',
    cleartext: false
  }
};

export default config;
