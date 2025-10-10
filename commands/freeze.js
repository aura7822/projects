// freeze.js
// Simple presence "freezer" for Baileys-based bots.
// Usage: const freezer = require('./freeze')(sock);
// freezer.freeze(); // start freezing
// freezer.unfreeze(); // stop
const fs = require('fs');
const path = require('path');
module.exports = function attachFreezer(sock, opts = {}) {
  // options (override if needed)
  const intervalMs = opts.intervalMs ?? 30_000; // how often to repeat unavailable
  let frozen = false;
  let keepInterval = null;

  // helper to safely send presence updates
  async function safeSendPresence(type = 'unavailable', to = '') {
    try {
      // Baileys API: sendPresenceUpdate(type, jid?) where type = 'available'|'unavailable'
      // passing no 'to' generally sets global presence for the account
      if (to) await sock.sendPresenceUpdate(type, to);
      else await sock.sendPresenceUpdate(type);
    } catch (err) {
      // ignore failures (connection may be restarting)
      // console.debug('presence send err', err?.message ?? err);
    }
  }

  function startKeepAlive() {
    if (keepInterval) clearInterval(keepInterval);
    keepInterval = setInterval(() => {
      safeSendPresence('unavailable');
    }, intervalMs);
  }

  function stopKeepAlive() {
    if (keepInterval) {
      clearInterval(keepInterval);
      keepInterval = null;
    }
  }

  // public API
  async function freeze() {
    frozen = true;
    // Immediately set unavailable and start repeating it so the server keeps you offline
    await safeSendPresence('unavailable');
    startKeepAlive();
  }

  async function unfreeze() {
    frozen = false;
    stopKeepAlive();
    // tell server you're available again
    await safeSendPresence('available');
  }

  function isFrozen() { return frozen; }

  // Hook into connection updates so we can re-apply unavailable if connection reconnects
  try {
    sock.ev.on('connection.update', (update) => {
      // When connection opens, re-assert unavailable if frozen
      if (update.connection === 'open' && frozen) {
        safeSendPresence('unavailable');
        // re-start interval in case it was cleared by reconnection
        startKeepAlive();
      }
      // If disconnected, we simply stop repeating; will re-apply when reconnected
      if (update.connection === 'close') {
        // keepInterval will be cleared by reconne ctor or left — no harm
      }
    });
  } catch (e) {
    // If ev isn't available or other error, ignore — user can still call freeze/unfreeze
  }

  // Also optionally intercept presence updates from server (informational)
  try {
    // presence.update events contain presence changes from contacts. We don't alter them here,
    // but we listen in case you want to log or react.
    sock.ev.on('presence.update', (pres) => {
      // optional: console.log('presence.update', pres);
    });
  } catch (e) {}

module.exports = { 
  // Return objects to control freezer from elsewhere
  
    freeze,
    unfreeze,
    isFrozen
  };
};
