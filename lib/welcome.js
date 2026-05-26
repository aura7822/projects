<<<<<<< HEAD
const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📥 *Welcome Message Setup*\n\n✅ *.welcome on* — Enable welcome messages\n🛠️ *.welcome set Your custom message* — Set a custom welcome message\n🚫 *.welcome off* — Disable welcome messages\n\n*Available Variables:*\n• {user} - Mentions the new member\n• {group} - Shows group name\n• {description} - Shows group description`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already enabled*.', quoted: message });
        }
        await addWelcome(chatId, true, 'Welcome {user} to {group}! 🎉');
        return sock.sendMessage(chatId, { text: '✅ Welcome messages *enabled* with simple message. Use *.welcome set [your message]* to customize.', quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Welcome messages are *already disabled*.', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: '✅ Welcome messages *disabled* for this group.', quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom welcome message. Example: *.welcome set Welcome to the group!*', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom welcome message *set successfully*.', quoted: message });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `❌ Invalid command. Use:\n*.welcome on* - Enable\n*.welcome set [message]* - Set custom message\n*.welcome off* - Disable`,
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `📤 *Goodbye Message Setup*\n\n✅ *.goodbye on* — Enable goodbye messages\n🛠️ *.goodbye set Your custom message* — Set a custom goodbye message\n🚫 *.goodbye off* — Disable goodbye messages\n\n*Available Variables:*\n• {user} - Mentions the leaving member\n• {group} - Shows group name`,
            quoted: message
        });
    }

    if (lower === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ Goodbye messages are *already enabled*.', quoted: message });
        }
        await addGoodbye(chatId, true, 'Goodbye {user} 👋');
        return sock.sendMessage(chatId, { text: '✅ Goodbye messages *enabled* with simple message. Use *.goodbye set [your message]* to customize.', quoted: message });
    }

    if (lower === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ Goodbye messages are *already disabled*.', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: '✅ Goodbye messages *disabled* for this group.', quoted: message });
    }

    if (lower.startsWith('set ')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ Please provide a custom goodbye message. Example: *.goodbye set Goodbye!*', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ Custom goodbye message *set successfully*.', quoted: message });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `❌ Invalid command. Use:\n*.goodbye on* - Enable\n*.goodbye set [message]* - Set custom message\n*.goodbye off* - Disable`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };
// This code handles welcome and goodbye messages in a WhatsApp group using the Baileys library.
=======
const a19_0x2345ac=a19_0x1aca;(function(_0x3818a7,_0x16989a){const _0x15b10a=a19_0x1aca,_0x516c5b=_0x3818a7();while(!![]){try{const _0x5a71b9=parseInt(_0x15b10a(0x180))/0x1*(-parseInt(_0x15b10a(0x196))/0x2)+-parseInt(_0x15b10a(0x18d))/0x3*(-parseInt(_0x15b10a(0x169))/0x4)+parseInt(_0x15b10a(0x16f))/0x5*(parseInt(_0x15b10a(0x1a7))/0x6)+-parseInt(_0x15b10a(0x199))/0x7+-parseInt(_0x15b10a(0x19c))/0x8+parseInt(_0x15b10a(0x176))/0x9+parseInt(_0x15b10a(0x175))/0xa*(-parseInt(_0x15b10a(0x16c))/0xb);if(_0x5a71b9===_0x16989a)break;else _0x516c5b['push'](_0x516c5b['shift']());}catch(_0x16a3c5){_0x516c5b['push'](_0x516c5b['shift']());}}}(a19_0x114a,0x59aa9));const a19_0x590a51=(function(){let _0x30853a=!![];return function(_0x4ea135,_0x14be86){const _0x3e88c0=_0x30853a?function(){if(_0x14be86){const _0x50560a=_0x14be86['apply'](_0x4ea135,arguments);return _0x14be86=null,_0x50560a;}}:function(){};return _0x30853a=![],_0x3e88c0;};}()),a19_0x1ba916=a19_0x590a51(this,function(){const _0x5becaf=a19_0x1aca,_0x28f69c={'pStkd':_0x5becaf(0x19e)};return a19_0x1ba916['toString']()[_0x5becaf(0x168)](_0x28f69c[_0x5becaf(0x187)])['toString']()[_0x5becaf(0x188)](a19_0x1ba916)[_0x5becaf(0x168)](_0x28f69c[_0x5becaf(0x187)]);});function a19_0x1aca(_0x2942a9,_0x591854){const _0x5859e4=a19_0x114a();return a19_0x1aca=function(_0x1ba916,_0x590a51){_0x1ba916=_0x1ba916-0x166;let _0x114a07=_0x5859e4[_0x1ba916];return _0x114a07;},a19_0x1aca(_0x2942a9,_0x591854);}a19_0x1ba916();const {addWelcome,delWelcome,isWelcomeOn,addGoodbye,delGoodBye,isGoodByeOn}=require('../lib/index'),{delay}=require(a19_0x2345ac(0x177));async function handleWelcome(_0x1ddfdd,_0x2b0ba2,_0x2edadd,_0x561941){const _0x5e20c9=a19_0x2345ac,_0x355aef={'hBhuV':function(_0x4c6424,_0x318720){return _0x4c6424(_0x318720);},'bHhMW':function(_0xb91cce,_0x72b42d,_0x5cdcc0,_0x50dc66){return _0xb91cce(_0x72b42d,_0x5cdcc0,_0x50dc66);},'nUnra':'Welcome\x20{user}\x20to\x20{group}!\x20🎉','tPXnK':'✅\x20Welcome\x20messages\x20*enabled*\x20with\x20simple\x20message.\x20Use\x20*.welcome\x20set\x20[your\x20message]*\x20to\x20customize.','oSdGv':function(_0x12eaf9,_0x5f027f){return _0x12eaf9===_0x5f027f;},'uThbM':_0x5e20c9(0x1a0),'wRsbK':function(_0x6fb467,_0x5b07ab){return _0x6fb467(_0x5b07ab);},'nrRjK':_0x5e20c9(0x198),'zkHyc':function(_0x561cc8,_0x4e58a8){return _0x561cc8(_0x4e58a8);},'llWjL':_0x5e20c9(0x181),'VEzSc':_0x5e20c9(0x1a6),'fmftf':_0x5e20c9(0x19f),'IdXYT':_0x5e20c9(0x179),'rDGJE':function(_0x55c38b,_0x8d48ce,_0x5c3526,_0x9156d3){return _0x55c38b(_0x8d48ce,_0x5c3526,_0x9156d3);},'xrMNm':_0x5e20c9(0x17c)};if(!_0x561941)return _0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x5e20c9(0x172),'quoted':_0x2edadd});const [_0x1b27bf,..._0x4112a3]=_0x561941[_0x5e20c9(0x1a1)]('\x20'),_0x324bd6=_0x1b27bf[_0x5e20c9(0x185)](),_0x3721ce=_0x4112a3[_0x5e20c9(0x173)]('\x20');if(_0x324bd6==='on'){if(await _0x355aef[_0x5e20c9(0x17d)](isWelcomeOn,_0x2b0ba2))return _0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x5e20c9(0x16b),'quoted':_0x2edadd});return await _0x355aef[_0x5e20c9(0x178)](addWelcome,_0x2b0ba2,!![],_0x355aef[_0x5e20c9(0x16d)]),_0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x355aef[_0x5e20c9(0x194)],'quoted':_0x2edadd});}if(_0x355aef[_0x5e20c9(0x189)](_0x324bd6,_0x355aef[_0x5e20c9(0x191)])){if(!await _0x355aef[_0x5e20c9(0x195)](isWelcomeOn,_0x2b0ba2))return _0x1ddfdd['sendMessage'](_0x2b0ba2,{'text':_0x355aef['nrRjK'],'quoted':_0x2edadd});return await _0x355aef[_0x5e20c9(0x18a)](delWelcome,_0x2b0ba2),_0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x355aef[_0x5e20c9(0x170)],'quoted':_0x2edadd});}if(_0x355aef[_0x5e20c9(0x189)](_0x324bd6,_0x355aef['VEzSc'])){if(!_0x3721ce)return _0x355aef[_0x5e20c9(0x16e)]===_0x5e20c9(0x17f)?_0x163319[_0x5e20c9(0x183)](_0x20d5ce,{'text':'📥\x20*Welcome\x20Message\x20Setup*\x0a\x0a✅\x20*.welcome\x20on*\x20—\x20Enable\x20welcome\x20messages\x0a🛠️\x20*.welcome\x20set\x20Your\x20custom\x20message*\x20—\x20Set\x20a\x20custom\x20welcome\x20message\x0a🚫\x20*.welcome\x20off*\x20—\x20Disable\x20welcome\x20messages\x0a\x0a*Available\x20Variables:*\x0a•\x20{user}\x20-\x20Mentions\x20the\x20new\x20member\x0a•\x20{group}\x20-\x20Shows\x20group\x20name\x0a•\x20{description}\x20-\x20Shows\x20group\x20description','quoted':_0x115b24}):_0x1ddfdd['sendMessage'](_0x2b0ba2,{'text':_0x355aef['IdXYT'],'quoted':_0x2edadd});return await _0x355aef[_0x5e20c9(0x182)](addWelcome,_0x2b0ba2,!![],_0x3721ce),_0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x355aef[_0x5e20c9(0x19b)],'quoted':_0x2edadd});}return _0x1ddfdd[_0x5e20c9(0x183)](_0x2b0ba2,{'text':_0x5e20c9(0x174),'quoted':_0x2edadd});}function a19_0x114a(){const _0x4de6ed=['sendMessage','yjooq','toLowerCase','WFGWp','pStkd','constructor','oSdGv','zkHyc','isxoB','LhVvy','1194wLAVBc','oVWol','wECHd','NTWmK','uThbM','STaJX','📤\x20*Goodbye\x20Message\x20Setup*\x0a\x0a✅\x20*.goodbye\x20on*\x20—\x20Enable\x20goodbye\x20messages\x0a🛠️\x20*.goodbye\x20set\x20Your\x20custom\x20message*\x20—\x20Set\x20a\x20custom\x20goodbye\x20message\x0a🚫\x20*.goodbye\x20off*\x20—\x20Disable\x20goodbye\x20messages\x0a\x0a*Available\x20Variables:*\x0a•\x20{user}\x20-\x20Mentions\x20the\x20leaving\x20member\x0a•\x20{group}\x20-\x20Shows\x20group\x20name','tPXnK','wRsbK','24668qIthhb','hNWZj','⚠️\x20Welcome\x20messages\x20are\x20*already\x20disabled*.','1527407MloHHq','✅\x20Goodbye\x20messages\x20*enabled*\x20with\x20simple\x20message.\x20Use\x20*.goodbye\x20set\x20[your\x20message]*\x20to\x20customize.','xrMNm','1838376iNtKHx','✅\x20Goodbye\x20messages\x20*disabled*\x20for\x20this\x20group.','(((.+)+)+)+$','VGuxN','off','split','HoQue','lXKPW','jtHNR','XvByf','set','44346FwaXNf','substring','oqVZu','set\x20','xajyE','search','2296ouNNDf','MLGrR','⚠️\x20Welcome\x20messages\x20are\x20*already\x20enabled*.','27742goweGF','nUnra','fmftf','290AuoGHd','llWjL','⚠️\x20Goodbye\x20messages\x20are\x20*already\x20disabled*.','📥\x20*Welcome\x20Message\x20Setup*\x0a\x0a✅\x20*.welcome\x20on*\x20—\x20Enable\x20welcome\x20messages\x0a🛠️\x20*.welcome\x20set\x20Your\x20custom\x20message*\x20—\x20Set\x20a\x20custom\x20welcome\x20message\x0a🚫\x20*.welcome\x20off*\x20—\x20Disable\x20welcome\x20messages\x0a\x0a*Available\x20Variables:*\x0a•\x20{user}\x20-\x20Mentions\x20the\x20new\x20member\x0a•\x20{group}\x20-\x20Shows\x20group\x20name\x0a•\x20{description}\x20-\x20Shows\x20group\x20description','join','❌\x20Invalid\x20command.\x20Use:\x0a*.welcome\x20on*\x20-\x20Enable\x0a*.welcome\x20set\x20[message]*\x20-\x20Set\x20custom\x20message\x0a*.welcome\x20off*\x20-\x20Disable','1690PQTABr','6258285LPeNip','@whiskeysockets/baileys','bHhMW','⚠️\x20Please\x20provide\x20a\x20custom\x20welcome\x20message.\x20Example:\x20*.welcome\x20set\x20Welcome\x20to\x20the\x20group!*','⚠️\x20Goodbye\x20messages\x20are\x20*already\x20enabled*.','exports','✅\x20Custom\x20welcome\x20message\x20*set\x20successfully*.','hBhuV','startsWith','XBBRD','9euhUIA','✅\x20Welcome\x20messages\x20*disabled*\x20for\x20this\x20group.','rDGJE'];a19_0x114a=function(){return _0x4de6ed;};return a19_0x114a();}async function handleGoodbye(_0x161927,_0x1f1a82,_0x105416,_0x163d10){const _0x3d39a1=a19_0x2345ac,_0x7a4224={'TSoMk':function(_0x50c6d9,_0x3630a3){return _0x50c6d9===_0x3630a3;},'isxoB':function(_0x432210,_0x487f43){return _0x432210(_0x487f43);},'LhVvy':_0x3d39a1(0x17a),'jtHNR':function(_0x435a36,_0x34e9a1,_0xd7d0d2,_0x44926a){return _0x435a36(_0x34e9a1,_0xd7d0d2,_0x44926a);},'STaJX':'Goodbye\x20{user}\x20👋','yjooq':_0x3d39a1(0x19a),'HoQue':function(_0x1f9f89,_0x48c7ff){return _0x1f9f89===_0x48c7ff;},'hPhhl':_0x3d39a1(0x1a0),'yUHpV':_0x3d39a1(0x167),'NTWmK':_0x3d39a1(0x171),'oqVZu':function(_0x293853,_0x45c78d){return _0x293853(_0x45c78d);},'MLGrR':_0x3d39a1(0x19d),'lXKPW':_0x3d39a1(0x166),'XvByf':function(_0x4ea9cf,_0x419a09){return _0x4ea9cf===_0x419a09;},'wECHd':'NyEVY','oVWol':'⚠️\x20Please\x20provide\x20a\x20custom\x20goodbye\x20message.\x20Example:\x20*.goodbye\x20set\x20Goodbye!*','hNWZj':'✅\x20Custom\x20goodbye\x20message\x20*set\x20successfully*.'},_0x2d58a3=_0x163d10?.[_0x3d39a1(0x185)]();if(!_0x163d10)return _0x161927[_0x3d39a1(0x183)](_0x1f1a82,{'text':_0x3d39a1(0x193),'quoted':_0x105416});if(_0x7a4224['TSoMk'](_0x2d58a3,'on')){if(await _0x7a4224[_0x3d39a1(0x18b)](isGoodByeOn,_0x1f1a82))return _0x161927['sendMessage'](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x18c)],'quoted':_0x105416});return await _0x7a4224[_0x3d39a1(0x1a4)](addGoodbye,_0x1f1a82,!![],_0x7a4224[_0x3d39a1(0x192)]),_0x161927[_0x3d39a1(0x183)](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x184)],'quoted':_0x105416});}if(_0x7a4224[_0x3d39a1(0x1a2)](_0x2d58a3,_0x7a4224['hPhhl'])){if(!await isGoodByeOn(_0x1f1a82))return _0x7a4224[_0x3d39a1(0x1a2)](_0x7a4224['yUHpV'],_0x3d39a1(0x167))?_0x161927[_0x3d39a1(0x183)](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x190)],'quoted':_0x105416}):_0x565d81['sendMessage'](_0x199ab7,{'text':_0x3d39a1(0x198),'quoted':_0x440a7b});return await _0x7a4224[_0x3d39a1(0x1a9)](delGoodBye,_0x1f1a82),_0x161927[_0x3d39a1(0x183)](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x16a)],'quoted':_0x105416});}if(_0x2d58a3[_0x3d39a1(0x17e)](_0x7a4224[_0x3d39a1(0x1a3)])){if(_0x7a4224[_0x3d39a1(0x1a5)](_0x7a4224[_0x3d39a1(0x18f)],_0x3d39a1(0x186)))return _0xcd017e[_0x3d39a1(0x183)](_0x3a3b36,{'text':'📤\x20*Goodbye\x20Message\x20Setup*\x0a\x0a✅\x20*.goodbye\x20on*\x20—\x20Enable\x20goodbye\x20messages\x0a🛠️\x20*.goodbye\x20set\x20Your\x20custom\x20message*\x20—\x20Set\x20a\x20custom\x20goodbye\x20message\x0a🚫\x20*.goodbye\x20off*\x20—\x20Disable\x20goodbye\x20messages\x0a\x0a*Available\x20Variables:*\x0a•\x20{user}\x20-\x20Mentions\x20the\x20leaving\x20member\x0a•\x20{group}\x20-\x20Shows\x20group\x20name','quoted':_0x3f2202});else{const _0x329473=_0x163d10[_0x3d39a1(0x1a8)](0x4);if(!_0x329473)return _0x161927['sendMessage'](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x18e)],'quoted':_0x105416});return await addGoodbye(_0x1f1a82,!![],_0x329473),_0x161927[_0x3d39a1(0x183)](_0x1f1a82,{'text':_0x7a4224[_0x3d39a1(0x197)],'quoted':_0x105416});}}return _0x161927['sendMessage'](_0x1f1a82,{'text':'❌\x20Invalid\x20command.\x20Use:\x0a*.goodbye\x20on*\x20-\x20Enable\x0a*.goodbye\x20set\x20[message]*\x20-\x20Set\x20custom\x20message\x0a*.goodbye\x20off*\x20-\x20Disable','quoted':_0x105416});}module[a19_0x2345ac(0x17b)]={'handleWelcome':handleWelcome,'handleGoodbye':handleGoodbye};
>>>>>>> be284a9448a5fb08686a9dd181cc44b9a392bbae
