const mineflayer = require('mineflayer');
const settings = require('./settings.json');

const botState = {
  connected: false,
  lastActivity: Date.now(),
  errors: []
};

function createBot() {
  const bot = mineflayer.createBot({
    host: settings.server.ip,
    port: settings.server.port,
    username: settings['bot-account'].username,
    version: settings.server.version || false
  });

  bot.on('spawn', () => {
    console.log(`[+] ${bot.username} successfully joined ${settings.server.ip}!`);
    botState.connected = true;

    if (settings.movement && settings.movement.enabled) {
      if (settings.movement['random-jump'] && settings.movement['random-jump'].enabled) {
        startRandomJump(bot);
      }
      if (settings.movement['look-around'] && settings.movement['look-around'].enabled) {
        startLookAround(bot);
      }
    }

    if (settings.modules && settings.modules.avoidMobs) {
      avoidMobs(bot);
    }
  });

  bot.on('end', () => {
    console.log('[-] Bot disconnected. Reconnecting in 5 seconds...');
    botState.connected = false;
    const delay = settings.utils && settings.utils['auto-reconnect-delay'] ? settings.utils['auto-reconnect-delay'] : 5000;
    setTimeout(createBot, delay);
  });

  bot.on('error', (err) => {
    console.log('[!] Bot error:', err.message);
  });
}

function addInterval(callback, interval) {
  setInterval(callback, interval);
}

function startRandomJump(bot) {
  const interval = (settings.movement && settings.movement['random-jump'] && settings.movement['random-jump'].interval) || 10000;
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, 300);
      botState.lastActivity = Date.now();
    } catch (e) {
      console.log('[RandomJump] Error:', e.message);
    }
  }, interval);
}

function startLookAround(bot) {
  const interval = (settings.movement && settings.movement['look-around'] && settings.movement['look-around'].interval) || 5000;
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI / 4;
      bot.look(yaw, pitch, true);
      botState.lastActivity = Date.now();
    } catch (e) {
      console.log('[LookAround] Error:', e.message);
    }
  }, interval);
}

function avoidMobs(bot) {
  const safeDistance = 5;
  addInterval(() => {
    if (!bot || !botState.connected) return;
    try {
      if (!bot.entities) return;
      const entities = Object.values(bot.entities).filter(e =>
        e.type === 'mob' || (e.type === 'player' && e.username !== bot.username)
      );
      for (const e of entities) {
        if (!e.position || !bot.entity) continue;
        const distance = bot.entity.position.distanceTo(e.position);
        if (distance < safeDistance) {
          bot.setControlState('back', true);
          setTimeout(() => {
            if (bot) bot.setControlState('back', false);
          }, 500);
          break;
        }
      }
    } catch (e) {
      console.log('[AvoidMobs] Error:', e.message);
    }
  }, 2000);
}

// ბოტის გაშვება
createBot();
                                                          
