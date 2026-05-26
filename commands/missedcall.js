<<<<<<< HEAD
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
=======
function a50_0x1d2d(_0x52a808,_0x291dda){const _0x5b904b=a50_0x5b90();return a50_0x1d2d=function(_0x1d2db7,_0x28e740){_0x1d2db7=_0x1d2db7-0xf4;let _0x12512f=_0x5b904b[_0x1d2db7];return _0x12512f;},a50_0x1d2d(_0x52a808,_0x291dda);}const a50_0x4c99d4=a50_0x1d2d;(function(_0x45711e,_0x2204b2){const _0x318419=a50_0x1d2d,_0x5d1aae=_0x45711e();while(!![]){try{const _0x488d5a=-parseInt(_0x318419(0x115))/0x1+-parseInt(_0x318419(0x112))/0x2*(parseInt(_0x318419(0xfb))/0x3)+-parseInt(_0x318419(0x11e))/0x4+parseInt(_0x318419(0xf6))/0x5*(parseInt(_0x318419(0x122))/0x6)+parseInt(_0x318419(0x116))/0x7+-parseInt(_0x318419(0xf9))/0x8*(-parseInt(_0x318419(0x107))/0x9)+parseInt(_0x318419(0xfc))/0xa*(parseInt(_0x318419(0x101))/0xb);if(_0x488d5a===_0x2204b2)break;else _0x5d1aae['push'](_0x5d1aae['shift']());}catch(_0x3ecab9){_0x5d1aae['push'](_0x5d1aae['shift']());}}}(a50_0x5b90,0x2645e));const axios=require(a50_0x4c99d4(0x11d)),moment=require(a50_0x4c99d4(0x104)),path=require(a50_0x4c99d4(0x10f)),fs=require('fs');let lastMissedCall=null,autoReplyEnabled=![];const owners=[a50_0x4c99d4(0xff)];function normalizeJid(_0x27850b){const _0xdcd766=a50_0x4c99d4;if(!_0x27850b)return'';return _0x27850b[_0xdcd766(0x119)](':')[0x0];}function a50_0x5b90(){const _0x4012a5=['error','nvtAG','☎️\x20*MISSEDCALL\x20NOTIFIER*:\x0aYour\x20call\x20was\x20received\x20but\x20the\x20owner\x20is\x20currently\x20unavailable.\x20Please\x20wait\x20until\x20they\x20get\x20back\x20to\x20you.','axios','1135944raGOcK','📵\x20Missed\x20call\x20auto-reply\x20has\x20been\x20*','missedcall','eWfwb','147090cgKAXB','Auto\x20reply\x20(missed\x20call)\x20error:','OjDGL','60DKYlsa','SIQdH','❌\x20Failed\x20to\x20fetch\x20missed\x20call\x20details.','207856ddRBEJ','\x0a📱\x20Type:\x20','1029CbNBfb','40dhGyhW','DISABLED\x20❌','utility','254113334497@s.whatsapp.net','DD/MM/YYYY\x20-\x20HH:mm:ss','156739ryOwAc','trim','../assets/phone.mp4','moment-timezone','gDqpn','format','90qIrfDn','\x0a🕒\x20Time:\x20','existsSync','pTjex','ENABLED\x20✅','sendMessage','off','❌\x20Only\x20the\x20bot\x20owner\x20can\x20toggle\x20missed\x20call\x20auto-reply.','path','from','ULYYm','1266HLOedF','exports','join','204842XhFHiz','1762019DwPYTJ','includes','📵\x20*Missed\x20Call\x20Alert*\x20📵\x0a\x0a👤\x20From:\x20','split'];a50_0x5b90=function(){return _0x4012a5;};return a50_0x5b90();}module[a50_0x4c99d4(0x113)]={'name':a50_0x4c99d4(0x120),'description':'Check\x20or\x20toggle\x20missed\x20call\x20auto-reply','category':a50_0x4c99d4(0xfe),async 'execute'(_0x59f27a,_0x1f84ed,_0x34de79,_0x1fc873){const _0x232d3e=a50_0x4c99d4,_0x399f1f={'nvtAG':function(_0x182531,_0x434f1a){return _0x182531===_0x434f1a;},'OjDGL':_0x232d3e(0x10e),'gDqpn':function(_0xf7f679,_0x43ee44){return _0xf7f679===_0x43ee44;},'eWfwb':_0x232d3e(0xfd),'ULYYm':'📞\x20No\x20missed\x20calls\x20recorded\x20yet.','pTjex':function(_0x209d9e,_0x56c837){return _0x209d9e(_0x56c837);},'lppMO':'MissedCall\x20command\x20error:'};try{const _0x4f2a4f=normalizeJid(_0x1fc873),_0xc291ce=_0x34de79[_0x232d3e(0x102)]()[_0x232d3e(0x119)]('\x20');if(_0x399f1f[_0x232d3e(0x11b)](_0xc291ce[0x1],'on')||_0x399f1f[_0x232d3e(0x11b)](_0xc291ce[0x1],_0x232d3e(0x10d))){if(!owners[_0x232d3e(0x117)](_0x4f2a4f)){await _0x59f27a[_0x232d3e(0x10c)](_0x1f84ed,{'text':_0x399f1f[_0x232d3e(0xf5)]});return;}autoReplyEnabled=_0x399f1f[_0x232d3e(0x105)](_0xc291ce[0x1],'on'),await _0x59f27a[_0x232d3e(0x10c)](_0x1f84ed,{'text':_0x232d3e(0x11f)+(autoReplyEnabled?_0x232d3e(0x10b):_0x399f1f[_0x232d3e(0x121)])+'*.'});return;}if(!lastMissedCall){await _0x59f27a[_0x232d3e(0x10c)](_0x1f84ed,{'text':_0x399f1f[_0x232d3e(0x111)]});return;}const {from:_0x38f12b,callType:_0x5bb066,time:_0x783ff0}=lastMissedCall,_0x56d720=_0x232d3e(0x118)+_0x38f12b+_0x232d3e(0xfa)+_0x5bb066+_0x232d3e(0x108)+_0x399f1f[_0x232d3e(0x10a)](moment,_0x783ff0)[_0x232d3e(0x106)](_0x232d3e(0x100));await _0x59f27a[_0x232d3e(0x10c)](_0x1f84ed,{'text':_0x56d720});}catch(_0x13caae){console[_0x232d3e(0x11a)](_0x399f1f['lppMO'],_0x13caae),await _0x59f27a[_0x232d3e(0x10c)](_0x1f84ed,{'text':_0x232d3e(0xf8)});}},'updateMissedCall':async(_0x4c2657,_0x172612)=>{const _0x245c1f=a50_0x4c99d4,_0x508b3a={'SIQdH':_0x245c1f(0x11c),'YuLye':_0x245c1f(0xf4)};lastMissedCall=_0x172612;if(!autoReplyEnabled)return;try{const _0x221a99=path[_0x245c1f(0x114)](__dirname,_0x245c1f(0x103));if(fs[_0x245c1f(0x109)](_0x221a99)){const _0x1bd865=fs['readFileSync'](_0x221a99);await _0x4c2657[_0x245c1f(0x10c)](_0x172612[_0x245c1f(0x110)],{'video':_0x1bd865,'gifPlayback':!![],'caption':_0x508b3a['SIQdH']});}else await _0x4c2657[_0x245c1f(0x10c)](_0x172612[_0x245c1f(0x110)],{'text':_0x508b3a[_0x245c1f(0xf7)]});}catch(_0x360ef4){console[_0x245c1f(0x11a)](_0x508b3a['YuLye'],_0x360ef4);}},'getStatus':()=>autoReplyEnabled};
>>>>>>> be284a9448a5fb08686a9dd181cc44b9a392bbae
