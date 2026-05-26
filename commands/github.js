<<<<<<< HEAD
const moment = require("moment-timezone");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function githubCommand(sock, chatId, message, args) {

try {

let username = "aura7822";

if (args && args.length > 0) {
username = args[0].replace("@", "");
}

/* LOADING MESSAGE */

const loading = await sock.sendMessage(chatId,{
text:
`┏━━━━━━━━━━━━━━━━━━━┓
┃  🔍 GITHUB SCAN   ┃
┗━━━━━━━━━━━━━━━━━━━┛
⏳ Analyzing developer profile...`
},{quoted:message})

/* USER DATA */

const userRes = await fetch(`https://api.github.com/users/${username}`);
if(!userRes.ok) throw new Error("User not found");

const user = await userRes.json();

/* REPOSITORIES */

const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=50`);
const repos = await repoRes.json();

/* LANGUAGE STATS */

const languageStats = {};
let stars = 0;
let forks = 0;

for(const repo of repos){

stars += repo.stargazers_count;
forks += repo.forks_count;

if(repo.language){

if(!languageStats[repo.language])
languageStats[repo.language] = 0;

languageStats[repo.language]++;

}

}

/* SORT LANGUAGES */

const languages = Object.entries(languageStats)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)
.map(([lang,count])=>`┃ ${lang} : ${count} repos`)
.join("\n");

/* TOP REPOS */

const topRepos = repos
.sort((a,b)=>b.stargazers_count-a.stargazers_count)
.slice(0,3)
.map(r=>
`┃ 📦 ${r.name}
┃ ⭐ ${r.stargazers_count} 🍴 ${r.forks_count}`
).join("\n");

/* DATES */

const joined = moment(user.created_at).format("DD MMM YYYY");

/* CONTRIBUTION GRAPH */

const graphURL =
`https://camo.githubusercontent.com/d0f21e91ca7e0a660a22f36be445f8e9940617ba78cfcaaa74e4c3719109d765/68747470733a2f2f6769746875622d726561646d652d61637469766974792d67726170682e76657263656c2e6170702f67726170683f757365726e616d653d6175726137383232267468656d653d6d61747269782662675f636f6c6f723d30303030303026636f6c6f723d303066663030266c696e653d30306666303026706f696e743d30306666303026686964655f626f726465723d74727565/`;

/* DOWNLOAD GRAPH */

let graphBuffer;

try{

const graphRes = await fetch(graphURL);

if(graphRes.ok){
graphBuffer = await graphRes.buffer();
}

}catch{}

/* PROFILE CARD */

const text =
`╭━━━〔 🐙 GITHUB INTEL 〕━━━╮

👤 USER
┃ Name : ${user.name || "N/A"}
┃ Username : @${user.login}
┃ Bio : ${user.bio || "None"}
┃ Joined : ${joined}

📊 STATS
┃ Repos : ${user.public_repos}
┃ Followers : ${user.followers}
┃ Following : ${user.following}
┃ Stars : ${stars}
┃ Forks : ${forks}

💻 LANGUAGES
${languages || "┃ No language data"}

🔥 TOP REPOS
${topRepos || "┃ No repositories"}

🌐 PROFILE
${user.html_url}

╰━━━━━━━━━━━━━━━━━━━━╯`;

/* AVATAR */

let avatar;

try{

const avatarRes = await fetch(user.avatar_url);

if(avatarRes.ok)
avatar = await avatarRes.buffer();

}catch{}

if(!avatar){

const fallback = path.join(__dirname,"../assets/bot_image.jpg");
avatar = fs.readFileSync(fallback);

}

/* DELETE LOADING */

await sock.sendMessage(chatId,{delete:loading.key});

/* SEND PROFILE */

await sock.sendMessage(chatId,{
image: avatar,
caption: text,
contextInfo:{
externalAdReply:{
title:`🐙 ${user.login}`,
body:user.bio || "GitHub Developer",
thumbnail:avatar,
mediaType:1,
renderLargerThumbnail:true,
sourceUrl:user.html_url
}
}
},{quoted:message})

/* SEND CONTRIBUTION GRAPH */

if(graphBuffer){

await sock.sendMessage(chatId,{
image:graphBuffer,
caption:`📈 Contribution Graph for *${username}*`
},{quoted:message})

}

}catch(err){

console.error("GitHub command error:",err);

await sock.sendMessage(chatId,{
text:
`❗ GitHub lookup failed

Possible causes
• username not found
• GitHub API limit
• network issue

Usage
.github username

Example
.github aura7822`
},{quoted:message})

}

}

module.exports = githubCommand;
=======
function a35_0x5a8e(_0xb98ba5,_0x2e4bf7){const _0x29d182=a35_0x33d4();return a35_0x5a8e=function(_0x5ab05c,_0x3611c5){_0x5ab05c=_0x5ab05c-0x194;let _0x33d42c=_0x29d182[_0x5ab05c];return _0x33d42c;},a35_0x5a8e(_0xb98ba5,_0x2e4bf7);}function a35_0x33d4(){const _0x4f64d9=['6498epdhkc','120363161513685998@newsletter','EfZZn','UVJbc','iGYhe','zRofJ','qDNxY','xuAND','TPjQk','rbofi','lrduz','43yqNbFh','shift','Ebhll','UHPlU','1135vHwQIf','iUnQR','hAzso','search','BFcFc','OCIhN','toString','exports','apply','Vigmw','834NkHjSm','(((.+)+)+)+$','MBqAr','JyZkV','2303525gkrTTu','350231vyAiuU','SUpvv','kVTHc','VXhtr','kOeHn','dDZPi','jFHEE','165JQbotk','xjbxm','11eFYwoY','*🤖\x20IM\x20AURA*\x0a\x0a*📂\x20GitHub\x20Repository:*\x0ahttps://github.com/aura7822/projects\x0a\x0a\x0a_Star\x20⭐\x20the\x20repository\x20if\x20you\x20like\x20the\x20bot!_','yXMhX','gTqAM','4953654SAqVpB','mwiUm','56ReITtx','vHntF','RNinW','76640Wfmbyq','LTjtV','58670sdadbP','100062PcrvOr','XTXtb','PytnI','push','4131882VLtClr','EkBnO','5257BJKIrt','btMHY','❌\x20Error\x20fetching\x20repository\x20information.','3089940ZdeBxL','8146MBLbec','lnIUz','SoeBJ','6584wOGxSe','8loTdJd','im\x20aura','EQuSe','vbSnz','vWsZF','yxKUo','IqHqd'];a35_0x33d4=function(){return _0x4f64d9;};return a35_0x33d4();}(function(_0x39874f,_0x5983f7){const _0x3b6a24=a35_0x5a8e,_0x1a1418=_0x39874f();while(!![]){try{const _0x26ce00=parseInt(_0x3b6a24(0x1a8))/0x1+-parseInt(_0x3b6a24(0x19d))/0x2*(-parseInt(_0x3b6a24(0x1cd))/0x3)+-parseInt(_0x3b6a24(0x1a1))/0x4*(-parseInt(_0x3b6a24(0x1c5))/0x5)+-parseInt(_0x3b6a24(0x19c))/0x6+parseInt(_0x3b6a24(0x199))/0x7*(-parseInt(_0x3b6a24(0x1a0))/0x8)+parseInt(_0x3b6a24(0x1d3))/0x9+parseInt(_0x3b6a24(0x1d8))/0xa*(-parseInt(_0x3b6a24(0x1cf))/0xb);if(_0x26ce00===_0x5983f7)break;else _0x1a1418['push'](_0x1a1418['shift']());}catch(_0x3ef91a){_0x1a1418['push'](_0x1a1418['shift']());}}}(a35_0x33d4,0x891c2));function a32_0x7cb1(){const _0x3eda32=a35_0x5a8e,_0x3b0363={'jFHEE':_0x3eda32(0x1c1),'nzwWH':_0x3eda32(0x1d1),'xjbxm':_0x3eda32(0x1d0),'SUpvv':_0x3eda32(0x1b7),'bSOud':_0x3eda32(0x197),'dDZPi':_0x3eda32(0x19f),'DUvDm':'XnMWP','EQuSe':'583IWeDMm','gTqAM':'sendMessage','rbofi':'18674nevBCU','Hrdpr':'Error\x20in\x20github\x20command:','xuAND':_0x3eda32(0x1db),'IqHqd':_0x3eda32(0x19b),'PytnI':_0x3eda32(0x1d5),'EkBnO':_0x3eda32(0x1a2),'Ebhll':_0x3eda32(0x1a9)},_0x1b51a5=[_0x3b0363[_0x3eda32(0x1cc)],'1176088wtyNmf',_0x3b0363['nzwWH'],_0x3eda32(0x1da),_0x3eda32(0x1be),_0x3b0363[_0x3eda32(0x1ce)],_0x3b0363[_0x3eda32(0x1c7)],_0x3b0363['bSOud'],_0x3eda32(0x1c6),_0x3b0363[_0x3eda32(0x1cb)],_0x3eda32(0x1b3),_0x3b0363['DUvDm'],_0x3b0363[_0x3eda32(0x1a3)],_0x3eda32(0x1c8),_0x3b0363[_0x3eda32(0x1d2)],_0x3b0363[_0x3eda32(0x1b1)],_0x3b0363['Hrdpr'],_0x3b0363[_0x3eda32(0x1af)],_0x3b0363[_0x3eda32(0x1a7)],_0x3b0363[_0x3eda32(0x195)],_0x3b0363[_0x3eda32(0x198)],_0x3b0363[_0x3eda32(0x1b5)]];return a32_0x7cb1=function(){return _0x1b51a5;},a32_0x7cb1();}const a32_0x314261=a32_0x25a5;function a32_0x25a5(_0x443baa,_0x2b6bc2){const _0x12d266={'XTXtb':function(_0xe76172,_0x562191){return _0xe76172-_0x562191;}},_0x315d04=a32_0x7cb1();return a32_0x25a5=function(_0x1d3fa1,_0x11e8c0){const _0x218943=a35_0x5a8e;_0x1d3fa1=_0x12d266[_0x218943(0x194)](_0x1d3fa1,0x193);let _0x71a83d=_0x315d04[_0x1d3fa1];return _0x71a83d;},a32_0x25a5(_0x443baa,_0x2b6bc2);}(function(_0x2ee5b0,_0x16e3c0){const _0x20c2bf=a35_0x5a8e,_0x500eb={'UHPlU':function(_0x159887,_0x1f45e3){return _0x159887===_0x1f45e3;},'RNinW':_0x20c2bf(0x1b9),'UVJbc':_0x20c2bf(0x196),'btMHY':'shift','eOLOj':function(_0x25d984,_0x202807,_0xdb23a7){return _0x25d984(_0x202807,_0xdb23a7);},'iUnQR':function(_0x50e7ce){return _0x50e7ce();},'jfEtO':function(_0x4def1f){return _0x4def1f();},'BFcFc':function(_0x375934,_0x286423){return _0x375934+_0x286423;},'vbSnz':function(_0x7a2ed2,_0x329f6c){return _0x7a2ed2*_0x329f6c;},'qDNxY':function(_0x5f2c4e,_0xd4f565){return _0x5f2c4e/_0xd4f565;},'BgaLL':function(_0x3e937b,_0x3e8550){return _0x3e937b(_0x3e8550);},'MBqAr':function(_0x218d5f,_0x25aecb){return _0x218d5f(_0x25aecb);},'LTjtV':function(_0x420a27,_0x20705f){return _0x420a27(_0x20705f);},'Vigmw':function(_0x126e42,_0x32bdc5){return _0x126e42/_0x32bdc5;},'VXhtr':function(_0x394c8a,_0x349707){return _0x394c8a*_0x349707;},'OCIhN':function(_0x1db40e,_0xad4bb9){return _0x1db40e(_0xad4bb9);},'JyZkV':function(_0x2d3e60,_0xb66105){return _0x2d3e60(_0xb66105);},'mwiUm':function(_0x4ff656,_0x499a50){return _0x4ff656(_0x499a50);},'JcKWE':function(_0x2291b6,_0x5ee3c6){return _0x2291b6*_0x5ee3c6;},'zRofJ':function(_0x490113,_0x4c8248){return _0x490113/_0x4c8248;},'vWsZF':function(_0x5411ef,_0x1c49d9){return _0x5411ef(_0x1c49d9);}},_0x347ca3=(function(){let _0xc5a507=!![];return function(_0x32b11e,_0x1883f1){const _0x4f99d2=a35_0x5a8e,_0x1eb4d4={'vHntF':function(_0x4e15d4,_0x1f4436){return _0x4e15d4-_0x1f4436;}};if(_0x500eb[_0x4f99d2(0x1b6)](_0x500eb['RNinW'],_0x500eb[_0x4f99d2(0x1d7)])){const _0x1a43e0=_0xc5a507?function(){const _0x3a11d5=_0x4f99d2;if(_0x1883f1){const _0x955fb0=_0x1883f1[_0x3a11d5(0x1bf)](_0x32b11e,arguments);return _0x1883f1=null,_0x955fb0;}}:function(){};return _0xc5a507=![],_0x1a43e0;}else{_0x4fcf09=_0x1eb4d4[_0x4f99d2(0x1d6)](_0x30e723,0x193);let _0x4ff17f=_0x42a1b9[_0x567267];return _0x4ff17f;}};}()),_0x48e71f=_0x500eb['eOLOj'](_0x347ca3,this,function(){const _0x4e9c9c=_0x20c2bf;return _0x48e71f[_0x4e9c9c(0x1bd)]()[_0x4e9c9c(0x1ba)](_0x4e9c9c(0x1c2))['toString']()['constructor'](_0x48e71f)[_0x4e9c9c(0x1ba)](_0x4e9c9c(0x1c2));});_0x500eb[_0x20c2bf(0x1b8)](_0x48e71f);const _0x102762=a32_0x25a5,_0xd314e9=_0x500eb['jfEtO'](_0x2ee5b0);while(!![]){try{if(_0x500eb[_0x20c2bf(0x1b6)](_0x20c2bf(0x1b2),_0x20c2bf(0x1b2))){const _0x5b0b56=_0x500eb['BFcFc'](_0x500eb[_0x20c2bf(0x1bb)](_0x500eb[_0x20c2bf(0x1bb)](_0x500eb[_0x20c2bf(0x1a4)](_0x500eb[_0x20c2bf(0x1ae)](-parseInt(_0x500eb['BgaLL'](_0x102762,0x19e)),0x1),_0x500eb[_0x20c2bf(0x1ae)](-_0x500eb[_0x20c2bf(0x1c3)](parseInt,_0x500eb[_0x20c2bf(0x1d9)](_0x102762,0x1a3)),0x2)),-parseInt(_0x102762(0x1a5))/0x3)+_0x500eb[_0x20c2bf(0x1d9)](parseInt,_0x500eb[_0x20c2bf(0x1c3)](_0x102762,0x195))/0x4,_0x500eb[_0x20c2bf(0x1c0)](parseInt(_0x500eb['LTjtV'](_0x102762,0x19a)),0x5)*_0x500eb[_0x20c2bf(0x1c0)](_0x500eb[_0x20c2bf(0x1d9)](parseInt,_0x500eb[_0x20c2bf(0x1d9)](_0x102762,0x194)),0x6))+_0x500eb[_0x20c2bf(0x1c9)](-_0x500eb[_0x20c2bf(0x1d9)](parseInt,_0x500eb[_0x20c2bf(0x1bc)](_0x102762,0x19c))/0x7,-_0x500eb[_0x20c2bf(0x1c4)](parseInt,_0x500eb[_0x20c2bf(0x1d4)](_0x102762,0x1a7))/0x8),-_0x500eb[_0x20c2bf(0x1d4)](parseInt,_0x500eb[_0x20c2bf(0x1c3)](_0x102762,0x19b))/0x9)+_0x500eb['JcKWE'](_0x500eb[_0x20c2bf(0x1ad)](-_0x500eb[_0x20c2bf(0x1c3)](parseInt,_0x500eb[_0x20c2bf(0x1d4)](_0x102762,0x197)),0xa),_0x500eb['qDNxY'](parseInt(_0x500eb[_0x20c2bf(0x1a5)](_0x102762,0x1a0)),0xb));if(_0x500eb[_0x20c2bf(0x1b6)](_0x5b0b56,_0x16e3c0))break;else _0xd314e9[_0x500eb['UVJbc']](_0xd314e9[_0x20c2bf(0x1b4)]());}else _0x1a7359[_0x500eb['UVJbc']](_0x360da6[_0x500eb[_0x20c2bf(0x19a)]]());}catch(_0x24501e){_0xd314e9[_0x500eb[_0x20c2bf(0x1ab)]](_0xd314e9[_0x500eb['btMHY']]());}}}(a32_0x7cb1,0x42de6));async function githubCommand(_0xb6d9b5,_0x2ed837){const _0x5edfdf=a35_0x5a8e,_0x4569ff={'iGYhe':function(_0x4529f2,_0x45aa90){return _0x4529f2(_0x45aa90);},'kOeHn':function(_0x58a75f,_0x5d64d8){return _0x58a75f(_0x5d64d8);},'EfZZn':function(_0x24df71,_0xb0de1e){return _0x24df71(_0xb0de1e);},'yxKUo':function(_0x1b72b7,_0x486d5c){return _0x1b72b7!==_0x486d5c;},'DXEsX':'TPjQk','lnIUz':'sendMessage','ZxqTb':'error','fXaSU':function(_0x2410ef,_0x3905ba){return _0x2410ef(_0x3905ba);}},_0x150309=a32_0x25a5,_0x5653a0={'kVTHc':_0x4569ff[_0x5edfdf(0x1ac)](_0x150309,0x193),'XnMWP':_0x150309(0x1a8),'SoeBJ':_0x150309(0x1a4),'yXMhX':_0x4569ff[_0x5edfdf(0x1ca)](_0x150309,0x1a6)},_0x42aed5=_0x4569ff[_0x5edfdf(0x1aa)](_0x150309,0x199);try{if(_0x4569ff[_0x5edfdf(0x1a6)](_0x5edfdf(0x1b0),_0x4569ff['DXEsX'])){const _0x58212b=_0xcdcec7?function(){const _0x28d28d=_0x5edfdf;if(_0xa58a2f){const _0x44669d=_0x5c296b[_0x28d28d(0x1bf)](_0x5c2e07,arguments);return _0x4535d8=null,_0x44669d;}}:function(){};return _0xadbb8=![],_0x58212b;}else await _0xb6d9b5[_0x4569ff[_0x5edfdf(0x19e)]](_0x2ed837,{'text':_0x42aed5,'contextInfo':{'forwardingScore':0x1,'isForwarded':![],'forwardedNewsletterMessageInfo':{'newsletterJid':_0x5653a0[_0x150309(0x1a1)],'newsletterName':_0x5653a0[_0x150309(0x19f)],'serverMessageId':-0x1}}});}catch(_0x47f9ba){console[_0x4569ff['ZxqTb']](_0x5653a0[_0x150309(0x19d)],_0x47f9ba),await _0xb6d9b5[_0x150309(0x1a2)](_0x2ed837,{'text':_0x5653a0[_0x4569ff['fXaSU'](_0x150309,0x196)]});}}module[a32_0x314261(0x198)]=githubCommand;
>>>>>>> be284a9448a5fb08686a9dd181cc44b9a392bbae
