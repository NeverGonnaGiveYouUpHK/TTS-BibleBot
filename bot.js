const start = Date.now();

const fs = require("fs");

const bibleDir = fs.readdirSync("./bible/eng-web_readaloud");

const bibleFiles = [];

for (const file of bibleDir){
	if (file.endsWith(".txt")){
		bibleFiles.push(file);
	}
}

global.bible = [];
global.fulltextMap = new Map();
global.codeToNumber = new Map();

let wordCount = 0;
let charCount = 0;

let book = null;
let prevBookNumber = null;
let bookIndex = 0;

for (const file of bibleFiles){
	const bookNumber = Number(file.substring(8, 11));
	const bookCode = file.substring(12, 15);

	

	if (bookNumber !== prevBookNumber){
		if (book !== null){
			bible.push(book);
		}
		
		book = [];
		
		prevBookNumber = bookNumber;

		codeToNumber.set(bookCode, bookIndex);

		console.log(bookCode, bookIndex);

		bookIndex++;
	}

	let chapter = [];

	const content = fs.readFileSync(`./bible/eng-web_readaloud/${file}`, "utf8");

	const lines = content.trim().split(/\r?\n/);

	const chapterDesc = lines[1];
	const chapterNumber = Number(chapterDesc.substring(8, chapterDesc.length - 1));

	for (var i = 2; i < lines.length; i++){
		const verseNumber = i - 1;
		const verse = lines[i];
		chapter.push(verse);

		const clearedVerse = verse.trim().replace(/[^\w\s]/g, "").toLowerCase();
		
		const words = clearedVerse.split(" ");

		for (const word of words){
			const location = {
				bookCode: bookCode,
				chapter: chapterNumber,
				verse: verseNumber
			}
			if (fulltextMap.has(word)){
				fulltextMap.get(word).push(location);
			} else {
				fulltextMap.set(word, [location]);
			}

			wordCount++;
			charCount += word.length;
		}
	}

	book.push(chapter);
}
bible.push(book);

console.log(bible[80][5][8]);

console.log(fulltextMap.size, wordCount, charCount, wordCount / fulltextMap.size);

console.log((Date.now() - start) + " ms");



const Discord = require("discord.js");
const handles = require("./handles");
global.bot = new Discord.Client();
const TOKEN = "ODE1MjU1NjIwOTQ4OTgzODQ4.YDpv9g.gEnjhiFrLOwpcashOkmy64r3LFE";

bot.login(TOKEN);

bot.on("ready", () => {
	console.log(`Logged in as ${bot.user.tag}!`);

	bot.user.setActivity("+help", {type: "LISTENING"})	
	.then(presence => console.log(`Activity set to ${presence.activities[0].name}`))	
	.catch(console.error);
});

bot.on("message", async (msg) => {
	if (msg.author.bot) return;

	if (msg.channel.type !== "text") return;

	if (!msg.content.startsWith("+")) return;

	const split = msg.content.split(" ");

	const command = split[0];

	switch (command){
		case "+help":
			handles.help(msg);
			break;
		case "+count":
			handles.count(msg);
			break;
		case "+search":
			handles.search(msg, 0);
			break;
		case "+recite":
			handles.recite(msg, false);
			break;
		case "+recitewithtext":
			handles.recite(msg, true);
			break;
		case "+listbooks":
			handles.listbooks(msg);
			break;
	}
});

bot.on("guildCreate", async (guild) => {
	let channel = guild.channels.cache.get(guild.systemChannelID);
	
	channel.send(
		new Discord.MessageEmbed()
		.setTitle("Fast TTS Bible Bot (developed by Kotol)")
		.addField("Want to know more about me?", "Then try typing '+help'!")
		.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
		.setColor("#fcac34")
	);
});