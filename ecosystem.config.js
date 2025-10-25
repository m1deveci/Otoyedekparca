module.exports = {
  apps: [
    {
      name: 'otoridvan-backend',
      script: 'server.js',
      cwd: '/var/www/otoridvan.devkit.com.tr',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_HOST: 'localhost',
        DB_USER: 'otoridvan_user',
        DB_PASSWORD: 'DevkitDeveci1453',
        DB_NAME: 'otoridvan_db'
      },
      error_file: '/var/log/pm2/otoridvan-error.log',
      out_file: '/var/log/pm2/otoridvan-out.log',
      log_file: '/var/log/pm2/otoridvan-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
