import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'be-the-boss',
  brand: {
    displayName: '사장 될 결심',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/icons/png/4x/icon-toss-logo.png',
  },
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
