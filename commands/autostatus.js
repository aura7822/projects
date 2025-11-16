<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/autoStatus.json');
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
        enabled: false,
        reactOn: false
    }));
}

// --- Small helper for random human-like delays ---
function randomDelay(min = 1500, max = 4000) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!' });
            return;
        }

        let config = JSON.parse(fs.readFileSync(configPath));

        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            const reactStatus = config.reactOn ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, {
                text: `🔄 *Auto Status Settings*\n\n📱 *Auto Status View:* ${status}\n💫 *Status Reactions:* ${reactStatus}\n\n*Commands:*\n.autostatus on - Enable auto status view\n.autostatus off - Disable auto status view\n.autostatus react on - Enable status reactions\n.autostatus react off - Disable status reactions`
            });
            return;
        }

        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '✅ Auto status view has been enabled!' });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '❌ Auto status view has been disabled!' });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: '❌ Please specify on/off for reactions!\nUse: .autostatus react on/off' });
                return;
            }
            const reactCmd = args[1].toLowerCase();
            config.reactOn = reactCmd === 'on';
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, {
                text: config.reactOn
                    ? '💫 Status reactions have been enabled!'
                    : '❌ Status reactions have been disabled!'
            });
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command! Use:\n.autostatus on/off\n.autostatus react on/off'
            });
        }
    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error occurred while managing auto status!\n' + error.message });
    }
}

function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch {
        return false;
    }
}

async function reactToStatus(sock, statusKey) {
    if (!isStatusReactionEnabled()) return;
    try {
        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: statusKey.id,
                    participant: statusKey.participant || statusKey.remoteJid,
                    fromMe: false
                },
                text: '🇰🇪'
            }
        }, { messageId: statusKey.id });
    } catch (err) {
        console.error('❌ Error reacting to status:', err.message);
    }
}

// --- Queued status handler ---
let statusQueue = [];
let processingQueue = false;

async function processQueue(sock) {
    if (processingQueue) return;
    processingQueue = true;

    while (statusQueue.length > 0) {
        const statusKey = statusQueue.shift();
        let success = false;
        for (let attempt = 1; attempt <= 3 && !success; attempt++) {
            try {
                await sock.readMessages([statusKey]);
                await reactToStatus(sock, statusKey);
                success = true;
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, retrying after 2s...');
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    console.error('❌ Failed reading status:', err.message);
                    break;
                }
            }
        }
        await randomDelay(); // Wait between statuses
    }

    processingQueue = false;
}

async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) return;

        let keys = [];

        if (status.messages?.length > 0) {
            keys = status.messages
                .filter(m => m.key?.remoteJid === 'status@broadcast')
                .map(m => m.key);
        } else if (status.key?.remoteJid === 'status@broadcast') {
            keys = [status.key];
        } else if (status.reaction?.key?.remoteJid === 'status@broadcast') {
            keys = [status.reaction.key];
        }

        if (keys.length > 0) {
            statusQueue.push(...keys);
            processQueue(sock); // process asynchronously
        }

    } catch (error) {
        console.error('❌ Error in auto status view:', error.message);
    }
}

module.exports = { autoStatusCommand, handleStatusUpdate };
=======
const a11_0x280023=a11_0x20de;function a11_0x20de(_0x15b06d,_0x27215a){const _0x21fa29=a11_0x25ad();return a11_0x20de=function(_0x3be43a,_0x34834f){_0x3be43a=_0x3be43a-0xc2;let _0x25ad90=_0x21fa29[_0x3be43a];return _0x25ad90;},a11_0x20de(_0x15b06d,_0x27215a);}(function(_0x2d44f6,_0x388497){const _0x13c15d=a11_0x20de,_0x5b3161=_0x2d44f6();while(!![]){try{const _0x4db705=parseInt(_0x13c15d(0xca))/0x1*(parseInt(_0x13c15d(0xfb))/0x2)+-parseInt(_0x13c15d(0x116))/0x3+parseInt(_0x13c15d(0xe7))/0x4+-parseInt(_0x13c15d(0xe8))/0x5+parseInt(_0x13c15d(0xc9))/0x6+-parseInt(_0x13c15d(0x10b))/0x7*(-parseInt(_0x13c15d(0x10c))/0x8)+-parseInt(_0x13c15d(0xcf))/0x9;if(_0x4db705===_0x388497)break;else _0x5b3161['push'](_0x5b3161['shift']());}catch(_0x3d1392){_0x5b3161['push'](_0x5b3161['shift']());}}}(a11_0x25ad,0x2c500));const a11_0x34834f=(function(){let _0x1bb7ae=!![];return function(_0x4161fd,_0x577292){const _0x24dbb2=_0x1bb7ae?function(){const _0x28995c=a11_0x20de;if(_0x577292){const _0x514b9f=_0x577292[_0x28995c(0xed)](_0x4161fd,arguments);return _0x577292=null,_0x514b9f;}}:function(){};return _0x1bb7ae=![],_0x24dbb2;};}()),a11_0x3be43a=a11_0x34834f(this,function(){const _0x521cc2=a11_0x20de,_0x5b2e3f={'Zdbyv':_0x521cc2(0x100)};return a11_0x3be43a[_0x521cc2(0xf0)]()[_0x521cc2(0xcb)](_0x5b2e3f['Zdbyv'])[_0x521cc2(0xf0)]()['constructor'](a11_0x3be43a)[_0x521cc2(0xcb)](_0x5b2e3f[_0x521cc2(0xd4)]);});a11_0x3be43a();const fs=require('fs'),path=require(a11_0x280023(0xe4)),isOwnerOrSudo=require(a11_0x280023(0xf9)),configPath=path['join'](__dirname,a11_0x280023(0xfe));!fs[a11_0x280023(0xd5)](configPath)&&fs[a11_0x280023(0xd6)](configPath,JSON[a11_0x280023(0x105)]({'enabled':!![],'reactOn':!![]}));const reactionOptions=['🦋',a11_0x280023(0xea),'🧃'];function randomReaction(){const _0x51c68d=a11_0x280023;return reactionOptions[Math[_0x51c68d(0xc7)](Math[_0x51c68d(0x101)]()*reactionOptions[_0x51c68d(0xf4)])];}function a11_0x25ad(){const _0x18ef82=['reactOn','path','IdkXX','fromMe','391404MZQNai','849880ucXEqc','abGyc','🇰🇪','readMessages','QbHph','apply','delete','aplTZ','toString','QOjue','onlOV','eonFW','length','key','participant','❌\x20Error!\x0a','exports','../lib/isOwner','McEva','2sgHtwH','parse','BjJll','../data/autoStatus.json','gyNHy','(((.+)+)+)+$','random','QuNGx','CIxUY','pxnOp','stringify','status@broadcast','React\x20error:','ZRIsi','error','TOKHM','148281hljEkJ','128ClssjO','add','WqdTW','🟢\x20enabled','cZrIw','OOtkq','bWuwA','messages','WXuJW','foMQq','631743WRELoL','iXOhA','🔴\x20disabled','constructor','toLowerCase','readFileSync','MYsom','❌\x20This\x20command\x20can\x20only\x20be\x20used\x20by\x20the\x20owner!','floor','❌\x20Invalid\x20command!\x20Use\x20.autostatus\x20on/off\x0a.autostatus\x20react\x20on/off','588942BewxAb','140735UlhnXb','search','LZBmX','remoteJid','enabled','1022490ayLQhP','Error\x20in\x20autostatus\x20command:','GfyqJ','relayMessage','EPLFD','Zdbyv','existsSync','writeFileSync','\x0a\x0aCommands:\x0a.autostatus\x20on/off\x0a.autostatus\x20react\x20on/off','message','off','log','PTUZH','BKCCJ','YKPrv','PjijU','✅\x20Settings\x20updated\x20successfully.','has','sendMessage','lwDzk'];a11_0x25ad=function(){return _0x18ef82;};return a11_0x25ad();}let retryQueue=new Set();async function autoStatusCommand(_0x3283b3,_0x3b5981,_0x34607a,_0xb4f812){const _0x225073=a11_0x280023,_0x17c658={'EPLFD':function(_0x224b0d,_0x5b74e9){return _0x224b0d*_0x5b74e9;},'OoIjA':_0x225073(0xf1),'HahRJ':function(_0xacbc4,_0x45a088,_0x5dfbf7,_0x5df1a9){return _0xacbc4(_0x45a088,_0x5dfbf7,_0x5df1a9);},'WXuJW':function(_0x30921a,_0x4842b4){return _0x30921a!==_0x4842b4;},'bWuwA':'uQwQn','KwEsg':_0x225073(0xde),'YKPrv':_0x225073(0xc6),'foMQq':function(_0x241692,_0x7ab81e){return _0x241692===_0x7ab81e;},'cZrIw':_0x225073(0x10f),'lwDzk':function(_0x108f22,_0x75d2cc){return _0x108f22===_0x75d2cc;},'LZBmX':_0x225073(0xd9),'gyNHy':'iOjam','GfyqJ':'VSOMr','MYsom':'react','kItJh':'❌\x20Use:\x20.autostatus\x20react\x20on/off','GcyZY':_0x225073(0xf3),'Crvdq':_0x225073(0xc8),'TOKHM':_0x225073(0xdf),'BjJll':_0x225073(0xd0)};try{if(_0x17c658['OoIjA']!==_0x225073(0xdb)){const _0x4fc7a5=_0x34607a[_0x225073(0xf5)]['participant']||_0x34607a[_0x225073(0xf5)][_0x225073(0xcd)],_0x3d38dc=await _0x17c658['HahRJ'](isOwnerOrSudo,_0x4fc7a5,_0x3283b3,_0x3b5981);if(!_0x34607a[_0x225073(0xf5)][_0x225073(0xe6)]&&!_0x3d38dc){if(_0x17c658[_0x225073(0x114)](_0x17c658[_0x225073(0x112)],_0x17c658['KwEsg']))return await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':_0x17c658[_0x225073(0xdd)]});else _0xb66de3['enabled']=!![];}let _0x15258a=JSON['parse'](fs[_0x225073(0xc4)](configPath));if(!_0xb4f812||_0x17c658[_0x225073(0x115)](_0xb4f812[_0x225073(0xf4)],0x0))return await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':'🔄\x20*Auto\x20Status\x20Settings*\x0a\x0a📱\x20Auto\x20View:\x20'+(_0x15258a[_0x225073(0xce)]?_0x17c658[_0x225073(0x110)]:_0x225073(0x118))+'\x0a💫\x20Auto\x20React:\x20'+(_0x15258a[_0x225073(0xe3)]?_0x17c658[_0x225073(0x110)]:_0x225073(0x118))+_0x225073(0xd7)});const _0x333803=_0xb4f812[0x0]['toLowerCase']();if(_0x17c658[_0x225073(0x115)](_0x333803,'on'))_0x15258a[_0x225073(0xce)]=!![];else{if(_0x17c658[_0x225073(0xe2)](_0x333803,_0x17c658[_0x225073(0xcc)]))_0x17c658[_0x225073(0xff)]!==_0x17c658[_0x225073(0xd1)]?_0x15258a[_0x225073(0xce)]=![]:_0x34601b[_0x225073(0xce)]=![];else{if(_0x17c658['foMQq'](_0x333803,_0x17c658[_0x225073(0xc5)])){if(!_0xb4f812[0x1])return await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':_0x17c658['kItJh']});_0x15258a[_0x225073(0xe3)]=_0xb4f812[0x1][_0x225073(0xc3)]()==='on';}else{if(_0x17c658[_0x225073(0x114)](_0x17c658['GcyZY'],_0x225073(0xef)))return await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':_0x17c658['Crvdq']});else _0x291357[_0x225073(0xd6)](_0x4b6e0d,_0x997f65[_0x225073(0x105)]({'enabled':!![],'reactOn':!![]}));}}}return fs['writeFileSync'](configPath,JSON['stringify'](_0x15258a)),await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':_0x17c658[_0x225073(0x10a)]});}else return _0x2b397c[_0x31dc31[_0x225073(0xc7)](_0x17c658[_0x225073(0xd3)](_0x316677[_0x225073(0x101)](),_0x2da51c['length']))];}catch(_0x9822d4){return console[_0x225073(0x109)](_0x17c658[_0x225073(0xfd)],_0x9822d4),await _0x3283b3[_0x225073(0xe1)](_0x3b5981,{'text':_0x225073(0xf7)+_0x9822d4[_0x225073(0xd8)]});}}function isAutoStatusEnabled(){const _0x48345f=a11_0x280023;return JSON[_0x48345f(0xfc)](fs['readFileSync'](configPath))[_0x48345f(0xce)];}function isStatusReactionEnabled(){const _0x39921d=a11_0x280023;return JSON[_0x39921d(0xfc)](fs[_0x39921d(0xc4)](configPath))[_0x39921d(0xe3)];}async function reactToStatus(_0x148984,_0x4ec142){const _0xc4d8d4=a11_0x280023,_0x1d225e={'onlOV':_0xc4d8d4(0x106),'CIxUY':function(_0x1d1622){return _0x1d1622();},'OOtkq':'TXQwx','yGxpG':_0xc4d8d4(0x107)};if(!isStatusReactionEnabled())return;try{await _0x148984[_0xc4d8d4(0xd2)](_0x1d225e[_0xc4d8d4(0xf2)],{'reactionMessage':{'key':{'remoteJid':_0x1d225e['onlOV'],'id':_0x4ec142['id'],'participant':_0x4ec142[_0xc4d8d4(0xf6)]||_0x4ec142[_0xc4d8d4(0xcd)],'fromMe':![]},'text':_0x1d225e[_0xc4d8d4(0x103)](randomReaction)}},{'messageId':_0x4ec142['id'],'statusJidList':[_0x4ec142[_0xc4d8d4(0xcd)],_0x4ec142[_0xc4d8d4(0xf6)]||_0x4ec142[_0xc4d8d4(0xcd)]]});}catch(_0x2c54d5){if(_0x1d225e[_0xc4d8d4(0x111)]==='TXQwx')console[_0xc4d8d4(0x109)](_0x1d225e['yGxpG'],_0x2c54d5[_0xc4d8d4(0xd8)]);else{const _0x256f26=_0x165b67['apply'](_0x1e05e8,arguments);return _0x20a0cd=null,_0x256f26;}}}async function handleStatusUpdate(_0x16cccb,_0x658c30){const _0x294c81=a11_0x280023,_0x19ac22={'abGyc':function(_0x5a837a,_0x3f0f37,_0x53a95a){return _0x5a837a(_0x3f0f37,_0x53a95a);},'IdkXX':_0x294c81(0x100),'BKCCJ':function(_0x3d0609){return _0x3d0609();},'Iqbtk':function(_0x543778,_0x483b4b){return _0x543778!==_0x483b4b;},'iXOhA':_0x294c81(0x106),'pxnOp':function(_0x2cb161,_0x312fe3){return _0x2cb161===_0x312fe3;},'McEva':'LssQg','sCwpu':_0x294c81(0x108),'QbHph':_0x294c81(0x10e),'QuNGx':'tpCYs','zbXYN':'❌\x20Status\x20view/react\x20error:'};if(!_0x19ac22[_0x294c81(0xdc)](isAutoStatusEnabled))return;let _0x1c40eb=_0x658c30?.[_0x294c81(0x113)]?.[0x0]?.[_0x294c81(0xf5)]||_0x658c30?.[_0x294c81(0xf5)]||_0x658c30?.['reaction']?.[_0x294c81(0xf5)];if(!_0x1c40eb||_0x19ac22['Iqbtk'](_0x1c40eb[_0x294c81(0xcd)],_0x19ac22[_0x294c81(0x117)]))return;try{if(_0x19ac22[_0x294c81(0x104)](_0x19ac22[_0x294c81(0xfa)],_0x19ac22['sCwpu'])){const _0x18718f=_0x1197ac?function(){const _0x52c357=_0x294c81;if(_0x1a877e){const _0x25944a=_0x1d1c15[_0x52c357(0xed)](_0xfd7176,arguments);return _0x381af2=null,_0x25944a;}}:function(){};return _0x47526b=![],_0x18718f;}else await _0x16cccb[_0x294c81(0xeb)]([_0x1c40eb]),await _0x19ac22[_0x294c81(0xe9)](reactToStatus,_0x16cccb,_0x1c40eb),retryQueue[_0x294c81(0xee)](_0x1c40eb['id']);}catch(_0x5aca6c){if(_0x19ac22[_0x294c81(0xec)]!==_0x19ac22[_0x294c81(0x102)])console[_0x294c81(0x109)](_0x19ac22['zbXYN'],_0x5aca6c['message']),retryQueue[_0x294c81(0x10d)](_0x1c40eb['id']),setTimeout(async()=>{const _0xdfc16a=_0x294c81;if(retryQueue[_0xdfc16a(0xe0)](_0x1c40eb['id'])){console[_0xdfc16a(0xda)]('🔁\x20Retrying\x20status\x20'+_0x1c40eb['id']);try{await _0x16cccb[_0xdfc16a(0xeb)]([_0x1c40eb]),await _0x19ac22['abGyc'](reactToStatus,_0x16cccb,_0x1c40eb),retryQueue[_0xdfc16a(0xee)](_0x1c40eb['id']);}catch{}}},0x5dc);else return _0xfb66c6[_0x294c81(0xf0)]()[_0x294c81(0xcb)](_0x294c81(0x100))[_0x294c81(0xf0)]()[_0x294c81(0xc2)](_0x1a6d83)[_0x294c81(0xcb)](Cmssts[_0x294c81(0xe5)]);}}module[a11_0x280023(0xf8)]={'autoStatusCommand':autoStatusCommand,'handleStatusUpdate':handleStatusUpdate};
>>>>>>> 3e555862 (updated version)
