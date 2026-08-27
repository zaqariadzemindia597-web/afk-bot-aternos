const mineflayer = require('mineflayer');
const settings = require('./settings.json');

const botState = {
  connected: false,
  lastActivity: Date.now()
};

function createBot() {
  console.log('[*] Connecting to server...');
  
  const bot = mineflayer.createBot({
    host: settings.server.ip,
    port: settings.server.port,
    username: settings['bot-account'].username,
    version: settings.server.version === "false" || !settings.server.version ? false : settings.server.version,
    checkTimeoutInterval: 60 * 1000,
    hideErrors: false
  });

  bot.on('spawn', () => {
    console.log(`[+] ${bot.username} successfully joined!`);
    botState.connected = true;

    // Anti-AFK მოქმედებები
    setInterval(() => {
      if (!bot || !botState.connected) return;
      try {
        bot.setControlState('jump', true);
        setTimeout(() => { if (bot) bot.setControlState('jump', false); }, 300);
      } catch (e) {}
    }, 15000);
  });

  bot.on('end', (reason) => {
    console.log(`[-] Disconnected (${reason}). Reconnecting in 15s...`);
    botState.connected = false;
    setTimeout(createBot, 15000); // 15 წამიანი პაუზა ბლოკის ასარიდებლად
  });

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
      console.log('[!] Connection reset by Aternos. Retrying in 15s...');
    } else {
      console.log('[!] Bot error:', err.message);
    }
  });
}

createBot();
