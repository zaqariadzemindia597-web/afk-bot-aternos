const mineflayer = require('mineflayer');
const settings = require('./settings.json');

const botState = {
  connected: false,
  lastActivity: Date.now()
};

function createBot() {
  console.log('[*] Connecting to server...');
  
  const bot = mineflayer.createBot({
    host: settings.server.ip.trim(),
    port: parseInt(settings.server.port) || 25565,
    username: settings['bot-account'].username || 'AFK_Bot',
    version: '1.21',
    checkTimeoutInterval: 90 * 1000,
    keepAlive: true,
    hideErrors: false
  });

  bot.on('spawn', () => {
    console.log(`[+] ${bot.username} successfully joined!`);
    botState.connected = true;

    setInterval(() => {
      if (!bot || !botState.connected) return;
      try {
        bot.setControlState('jump', true);
        setTimeout(() => { if (bot) bot.setControlState('jump', false); }, 300);
      } catch (e) {}
    }, 15000);
  });

  bot.on('end', (reason) => {
    console.log(`[-] Disconnected (${reason}). Reconnecting in 10s...`);
    botState.connected = false;
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => {
    console.log('[!] Bot error:', err.message);
  });
}

createBot();
