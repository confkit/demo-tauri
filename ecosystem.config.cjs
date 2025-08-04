module.exports = {
  apps: [
    {
      name: 'demo-tauri:web-app',
      script: 'cd client/web-app && pnpm dev',
      env: {
        GROUP: 'demo-tauri',
      },
    },
  ],
};
