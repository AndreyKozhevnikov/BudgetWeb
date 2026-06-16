module.exports = {
  apps: [{
    name: 'budgetweb',
    script: './bin/www',
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' },
    max_memory_restart: '200M',
    autorestart: true
  }]
}
