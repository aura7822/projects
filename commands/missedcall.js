// commands/missedcall.js
const axios = require("axios");
const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Store missed calls with more details
let missedCalls = [];
let autoReplyEnabled = false; // default OFF
const MAX_STORED_CALLS = 20; // Maximum number of missed calls to store

// Owner(s) JIDs - load from config or environment
const owners = ["254119750041@s.whatsapp.net"];

// Normalize JID so it matches owner correctly
function normalizeJid(jid) {
  if (!jid) return "";
  return jid.split(":")[0]; // remove device/session part if present
}

// Format phone number for display
function formatPhoneNumber(jid) {
  const number = jid.split('@')[0];
  if (number.length >= 10) {
    return `+${number.slice(0,3)} ${number.slice(3,6)} ${number.slice(6,10)} ${number.slice(10)}`;
  }
  return number;
}

// Get call type emoji
function getCallTypeEmoji(type) {
  const types = {
    'video': '📹',
    'voice': '🎤',
    'unknown': '📞'
  };
  return types[type?.toLowerCase()] || '📞';
}

// Format timestamp nicely
function formatTimestamp(timestamp) {
  const now = moment();
  const callTime = moment(timestamp);
  const diffMinutes = now.diff(callTime, 'minutes');
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hour${Math.floor(diffMinutes / 60) > 1 ? 's' : ''} ago`;
  return callTime.format('DD/MM/YYYY HH:mm');
}

// Save missed calls to file (persistence)
const dataDir = path.join(__dirname, '../data');
const callsFilePath = path.join(dataDir, 'missedcalls.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load saved missed calls
function loadMissedCalls() {
  try {
    if (fs.existsSync(callsFilePath)) {
      const data = fs.readFileSync(callsFilePath, 'utf8');
      missedCalls = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading missed calls:', err);
  }
}

// Save missed calls to file
function saveMissedCalls() {
  try {
    fs.writeFileSync(callsFilePath, JSON.stringify(missedCalls, null, 2));
  } catch (err) {
    console.error('Error saving missed calls:', err);
  }
}

// Load existing calls on startup
loadMissedCalls();

module.exports = {
  name: "missedcall",
  description: "Check missed calls and manage auto-reply settings",
  category: "utility",
  usage: ".missedcall [on/off/clear/all/last]",
  example: ".missedcall on",

  async execute(sock, chatId, userMessage, sender) {
    try {
      const cleanSender = normalizeJid(sender);
      const args = userMessage.trim().split(" ");
      const isOwner = owners.includes(cleanSender);

      // Help command
      if (args.length === 1 || args[1] === 'help') {
        const helpText = `📞 *MISSED CALL COMMANDS*
━━━━━━━━━━━━━━━━━━━━━

🔰 *Usage:*
• \`.missedcall\` - Show last missed call
• \`.missedcall all\` - Show all missed calls
• \`.missedcall last\` - Show last missed call
• \`.missedcall count\` - Show total missed calls
• \`.missedcall clear\` - Clear all missed calls (owner only)
• \`.missedcall on\` - Enable auto-reply (owner only)
• \`.missedcall off\` - Disable auto-reply (owner only)
• \`.missedcall status\` - Show current status

📊 *Auto-Reply Status:* ${autoReplyEnabled ? '✅ ON' : '❌ OFF'}

━━━━━━━━━━━━━━━━━━━━━`;
        await sock.sendMessage(chatId, { text: helpText });
        return;
      }

      // Show status
      if (args[1] === 'status') {
        const statusText = `📊 *MISSED CALL STATUS*
━━━━━━━━━━━━━━━━━━━━━

🤖 *Auto-Reply:* ${autoReplyEnabled ? '✅ ENABLED' : '❌ DISABLED'}
📞 *Total Missed:* ${missedCalls.length}
🕐 *Last Call:* ${missedCalls.length > 0 ? formatTimestamp(missedCalls[0].time) : 'No calls yet'}

━━━━━━━━━━━━━━━━━━━━━`;
        await sock.sendMessage(chatId, { text: statusText });
        return;
      }

      // Show count
      if (args[1] === 'count') {
        await sock.sendMessage(chatId, { 
          text: `📊 *Total Missed Calls:* ${missedCalls.length}` 
        });
        return;
      }

      // Toggle ON/OFF (owner only)
      if (args[1] === "on" || args[1] === "off") {
        if (!isOwner) {
          await sock.sendMessage(chatId, { 
            text: "❌ *Access Denied*\nOnly the bot owner can toggle missed call auto-reply." 
          });
          return;
        }

        autoReplyEnabled = args[1] === "on";
        const status = autoReplyEnabled ? "ENABLED ✅" : "DISABLED ❌";
        
        await sock.sendMessage(chatId, { 
          text: `📞 *Missed Call Auto-Reply*\n━━━━━━━━━━━━━━━━━━━━━\n\nAuto-reply has been *${status}*\n\n${
            autoReplyEnabled ? '✅ I will now automatically respond to missed calls.' : '❌ Auto-reply is now turned off.'
          }`
        });
        return;
      }

      // Clear all missed calls (owner only)
      if (args[1] === "clear") {
        if (!isOwner) {
          await sock.sendMessage(chatId, { 
            text: "❌ *Access Denied*\nOnly the bot owner can clear missed calls." 
          });
          return;
        }

        missedCalls = [];
        saveMissedCalls();
        await sock.sendMessage(chatId, { 
          text: "🗑️ *Missed Calls Cleared*\nAll missed call records have been deleted." 
        });
        return;
      }

      // Show all missed calls
      if (args[1] === "all") {
        if (missedCalls.length === 0) {
          await sock.sendMessage(chatId, { 
            text: "📞 No missed calls recorded yet." 
          });
          return;
        }

        let msg = `📞 *MISSED CALL HISTORY*\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        missedCalls.slice(0, 10).forEach((call, index) => {
          const emoji = getCallTypeEmoji(call.callType);
          const timeAgo = formatTimestamp(call.time);
          const caller = formatPhoneNumber(call.from);
          
          msg += `${index + 1}. ${emoji} *${call.callType || 'Unknown'}*\n`;
          msg += `   ┣ 📞 From: ${caller}\n`;
          msg += `   ┗ 🕐 ${timeAgo}\n\n`;
        });

        if (missedCalls.length > 10) {
          msg += `*...and ${missedCalls.length - 10} more calls*\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━\n📊 *Total: ${missedCalls.length} calls*`;

        await sock.sendMessage(chatId, { text: msg });
        return;
      }

      // Show last missed call (default behavior)
      if (missedCalls.length === 0) {
        await sock.sendMessage(chatId, { 
          text: "📞 No missed calls recorded yet." 
        });
        return;
      }

      const lastCall = missedCalls[0];
      const callEmoji = getCallTypeEmoji(lastCall.callType);
      const callerFormatted = formatPhoneNumber(lastCall.from);
      const timeFormatted = moment(lastCall.time).format("DD/MM/YYYY - HH:mm:ss");
      const timeAgo = formatTimestamp(lastCall.time);

      // Create a nice aesthetic message
      const msg = `┏━━━━━━━━━━━━━━━━━━━━┓
┃   📞 *MISSED CALL*   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

${callEmoji} *Call Details*
┣ 📱 Type: ${lastCall.callType || 'Unknown'}
┣ 👤 From: ${callerFormatted}
┣ 🆔 JID: \`${lastCall.from.split('@')[0]}\`
┣ 🕐 Time: ${timeFormatted}
┗ ⏱️ ${timeAgo}

📊 *Statistics*
┣ 📞 Total Missed: ${missedCalls.length}
┗ 🤖 Auto-Reply: ${autoReplyEnabled ? '✅ ON' : '❌ OFF'}

━━━━━━━━━━━━━━━━━━━━━
💡 *Use .missedcall help for more options*`;

      await sock.sendMessage(chatId, { text: msg });

    } catch (err) {
      console.error("❌ MissedCall command error:", err);
      await sock.sendMessage(chatId, { 
        text: "❌ *Error*\nFailed to fetch missed call details. Please try again." 
      });
    }
  },

  updateMissedCall: async (sock, info) => {
    try {
      // Add timestamp if not present
      const callInfo = {
        ...info,
        time: info.time || new Date().toISOString()
      };

      // Add to beginning of array (most recent first)
      missedCalls.unshift(callInfo);
      
      // Keep only last MAX_STORED_CALLS
      if (missedCalls.length > MAX_STORED_CALLS) {
        missedCalls = missedCalls.slice(0, MAX_STORED_CALLS);
      }

      // Save to file
      saveMissedCalls();

      console.log(`📞 Missed call from ${info.from} (${info.callType || 'unknown'})`);

      // If auto-reply is disabled, just log and return
      if (!autoReplyEnabled) {
        return;
      }

      // Prepare auto-reply message
      const callerFormatted = formatPhoneNumber(info.from);
      const callEmoji = getCallTypeEmoji(info.callType);
      const timeFormatted = moment().format("DD/MM/YYYY - HH:mm:ss");

      // Try to send video first, fallback to text
      const videoPath = path.join(__dirname, "../assets/phone.mp4");
      const gifPath = path.join(__dirname, "../assets/call.gif");

      let mediaSent = false;

      // Try video
      if (fs.existsSync(videoPath)) {
        try {
          const videoBuffer = fs.readFileSync(videoPath);
          
          await sock.sendMessage(info.from, {
            video: videoBuffer,
            gifPlayback: true,
            caption: `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ☎️ *MISSED CALL*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

${callEmoji} *Incoming Call*
┣ 👤 From: ${callerFormatted}
┣ 📱 Type: ${info.callType || 'Voice Call'}
┗ 🕐 Time: ${timeFormatted}

📝 *Message:*
Your call was received but the owner is currently unavailable. 
They will get back to you as soon as possible.

━━━━━━━━━━━━━━━━━━━━━
⏱️ *Auto-Reply Sent*`
          });
          mediaSent = true;
        } catch (err) {
          console.error("Error sending video:", err);
        }
      }

      // Try GIF if video failed
      if (!mediaSent && fs.existsSync(gifPath)) {
        try {
          const gifBuffer = fs.readFileSync(gifPath);
          
          await sock.sendMessage(info.from, {
            video: gifBuffer,
            gifPlayback: true,
            caption: `☎️ *MISSED CALL NOTIFICATION*\n\n📞 From: ${callerFormatted}\n📱 Type: ${info.callType || 'Voice Call'}\n🕐 Time: ${timeFormatted}\n\nYour call was received but the owner is currently unavailable. They will respond shortly.`
          });
          mediaSent = true;
        } catch (err) {
          console.error("Error sending GIF:", err);
        }
      }

      // Fallback to text message
      if (!mediaSent) {
        await sock.sendMessage(info.from, {
          text: `┏━━━━━━━━━━━━━━━━━━━━┓
┃  ☎️ *MISSED CALL*  ┃
┗━━━━━━━━━━━━━━━━━━━━┛

${callEmoji} *Call Information*
┣ 👤 Caller: ${callerFormatted}
┣ 📱 Type: ${info.callType || 'Voice Call'}
┗ 🕐 Time: ${timeFormatted}

📝 *Message:*
Your call was received but the owner is currently unavailable. 
Please wait patiently and they will get back to you soon.

━━━━━━━━━━━━━━━━━━━━━
⏱️ *Auto-Reply Sent*`
        });
      }

    } catch (err) {
      console.error("❌ Auto reply (missed call) error:", err);
    }
  },

  getStatus: () => autoReplyEnabled,
  
  // Get all missed calls
  getAllMissedCalls: () => missedCalls,
  
  // Get missed calls count
  getMissedCallsCount: () => missedCalls.length,
  
  // Clear all missed calls
  clearMissedCalls: () => {
    missedCalls = [];
    saveMissedCalls();
  }
};