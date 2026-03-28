import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'be-the-boss',
  brand: {
    displayName: '사장 될 결심',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/25433/630ee2ef-972a-4d26-acaa-7292bffebbbd.png',
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
