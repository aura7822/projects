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