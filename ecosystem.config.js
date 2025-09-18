module.exports = {
  apps: [
    {
      name: 'assessforge',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1, // Adjust based on server capabilities
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Restart on specific conditions
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      // Health check
      health_check: {
        url: 'http://localhost:3000/api/health',
        interval: 30000,
        timeout: 5000,
        max_failures: 3
      }
    }
  ]
};