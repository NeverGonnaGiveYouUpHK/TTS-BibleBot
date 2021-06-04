const Discord = require("discord.js");
const googleTTS = require("google-tts-api");
const https = require("https");
const Readable = require("stream").Readable;
const fs = require("fs");
const abbreviations = require("./abbreviations");
const abbreviationsTogether = require("./abbreviationsTogether");

const booklistMessage = require("./staticMessages/booklist");
const helpMessage = require("./staticMessages/help");
const parseNotation = require("./notationParser");

const ttsOptions = {
	lang: "en-UK",
	slow: false,
	host: "https://translate.google.com",
};

let googleSelfUpdatingCookie = {
	"_ga": {content: "GA1.3.1528343603.1580047254", expiration: Infinity},
	"HSID": {content: "A4bjk19RTw56nNfiX", expiration: Infinity},
	"SSID": {content: "AYXxaei-9MYjJqvOI", expiration: Infinity},
	"APISID": {content: "ZvJ8kmDc_oChwrHa/Ajjl03uEapIMSMixL", expiration: Infinity},
	"SAPISID": {content: "slnl62tqDoExHfrX/ATT360-aZ3XxDZnuq", expiration: Infinity},
	"__Secure-3PAPISID": {content: "slnl62tqDoExHfrX/ATT360-aZ3XxDZnuq", expiration: Infinity},
	"ANID": {content: "AHWqTUniJItM90vuvz6XpeevfJGPWFzOldf9RF7dihKesIYAXsfcRIuIUdZIy5SQ", expiration: Infinity},
	"SEARCH_SAMESITE": {content: "CgQI9pEB", expiration: Infinity},
	"OGPC": {content: "19022622-1:", expiration: Infinity},
	"SID": {content: "9wdFfTf4dg4TbIUF4FLp7lXxs2lYZmcsmtQYK7ajO9xzlnpY06kGZRRH7pKhoBSmngXeQw.", expiration: Infinity},
	"__Secure-3PSID": {content: "9wdFfTf4dg4TbIUF4FLp7lXxs2lYZmcsmtQYK7ajO9xzlnpYNzHAbhuo1_7vhg-rxsY5ig.", expiration: Infinity},
	"CONSENT": {content: "YES+cb.20210518-05-p0.sk+FX; 1P_JAR=2021-05-26-11", expiration: Infinity},
	"NID": {content: "216=TDrAxIXtpLepbljMCY-JQaAvHsDckz7lB-ra76a-Nyndi_0kIo3kAxP0xglnh-MKMs5a2qXGVMfXY_OfV3aG6je23rGOy54ussShevgYBrJAUmzfzGZmCNznd922U-Xj8O40Bj334pVgqyjUAdl-HdbLo3cQVls3Kfp-QyNLs1xAR858UmPhBWYZe_779jMcWL5_fgttQSKQmtCH482PHjwB0612oZAYmUQJyeILaqEjZYYG0Te5IJaTRFQzV4c2gMNyEjJD1BQOova4qnM89gyjoHl1-pCEKiIdFqDiQDz8XoIj5C99kQ2xeNQePbsZw9W5A5MvN0hMbtFJ0guW4Q0Vk94DjaKe9B_lst5A_TfFdORzhWTlsYlGqOklp6p3_Q", expiration: Infinity},
	"GOOGLE_ABUSE_EXEMPTION": {content: "ID=e9125a40e6d46f2f:TM=1622108016:C=r:IP=78.99.239.48-:S=y9QTuy6jJCKNB9B39_mVIJ8", expiration: Infinity},
	"_gid": {content: "GA1.3.913647364.1622108420", expiration: Infinity},
	"OTZ": {content: "5996740_48_52_123900_48_436380", expiration: Infinity},
	"SIDCC": {content: "AJi4QfFmfTDayNWuFSJcyGKvEa3iVvd7f4yu4rfgmgTNRnhBy77UTLc09EFH_JIKNynHmT4CmVI", expiration: Infinity},
	"__Secure-3PSIDCC": {content: "AJi4QfFRznVRQWzrCnULPuFGq5Nf_4VSqMGjQDvkH_P3k6Y1BwAoiVfAofdQ0cRmAvgsm710L6qp", expiration: Infinity}
};

class AudioPiece {
	constructor (url){
		this.url = url;

		this.stream = new Readable();
		this.stream._read = () => {};

		this.unreadyPromise = new Promise((resolve, reject) => {
			const now = Date.now();
			let cookieForThisRequest = "";
			for (const entry of Object.entries(googleSelfUpdatingCookie)){
				const name = entry[0];
				const content = entry[1].content;
				const expiration = entry[1].expiration;

				if (expiration > now){
					cookieForThisRequest += `${name}=${content};`;
				} else {
					delete googleSelfUpdatingCookie[name];
				}
			}
			console.log(cookieForThisRequest);
			https.get(this.url, {
				headers: {
					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en,en-GB;q=0.9,en-US;q=0.8,sk;q=0.7,cs;q=0.6",
					"cache-control": "no-cache",
					"cookie": cookieForThisRequest,
					"pragma": "no-cache",
					"sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
					"sec-ch-ua-mobile": "?0",
					"sec-fetch-dest": "document",
					"sec-fetch-mode": "navigate",
					"sec-fetch-site": "none",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1",
					"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
					"x-client-data": "CJC2yQEIorbJAQjBtskBCKmdygEI+MfKAQjz98oBCNGaywEIqZ3LAQigoMsBCL+gywEI3fLLAQio88sBCJT1ywE="
				}
			}, (res) => {
				let data = [];
	
				res.on("data", (chunk) => {
					data.push(chunk);
				});
	
				res.on("end", async () => {
					const audio = Buffer.concat(data);
	
					this.stream.push(audio);
					this.stream.push(null);
					
					if (Array.isArray(res.headers["set-cookie"])){
						for (const cookie of res.headers["set-cookie"]){
							const split = cookie.split(";");
							
							const data = split[0].split("=");
							const expiration = split[1].split("=");
							googleSelfUpdatingCookie[data[0]] = {
								content: data.slice(1, data.length).join("="),
								expiration: Date.parse(expiration[1])
							};
						}
					}
					

					resolve();

					//console.log("request resolved", this.url);
				});
			}).on("error", (err) => {
				console.log("Error asd: ", err.message);
				reject(err);
			});
		});
	}

	async getStream(){
		await this.unreadyPromise;
		return this.stream;
	}
}

module.exports = {
	help: function help(msg){
		msg.channel.send(helpMessage);
	},

	count: function count(msg){
		const split = msg.content.split(" ");

		const wordInput = split[1];
		let word;
		if (typeof wordInput !== "undefined"){
			word = wordInput.toLowerCase();
		} else {
			return msg.channel.send(
				new Discord.MessageEmbed()
				.addField("Error", "I'm sorry, but I think that you haven't entered a word for me to count.")
				.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
				.setColor("#fcac34")
			);
		}
			
		const start = process.hrtime();
		let count = 0;

		if (fulltextMap.has(word)){
			count = fulltextMap.get(word).length;
		}

		const end = process.hrtime();
		const time = (end[0] - start[0]) / 1000 + (end[1] - start[1]) / 1000000;

		msg.channel.send(
			new Discord.MessageEmbed()
			.setTitle("Count results")
			.addField(`I've searched the Holy Bible in ${time} ms...`, `...and found the word "${word}" exactly ${count} ${count === 1 ? "time" : "times"}.`)
			.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
			.setColor("#fcac34")
		);
	},

	search: function (msg, page){
		const split = msg.content.split(" ");

		let word = split[1];
		if (typeof word !== "string"){
			return msg.channel.send(
				new Discord.MessageEmbed()
				.addField("Error", "I'm sorry, but I think that you haven't entered a word for me to search for.")
				.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
				.setColor("#fcac34")
			);
		}
		word = word.toLowerCase();

		if (fulltextMap.has(word)){
			const occurences = fulltextMap.get(word);

			msg.channel.send(generateSearchResults(occurences, page))
			.then((message) => {
				message.react("◀")
				.then(() => {
					message.react("▶")
					.then(() => {
						processPageMoves(message, occurences, page)
					});
				});
			});
		} else {
			return msg.channel.send(
				new Discord.MessageEmbed()
				.addField("Error", `I couldn't find the word "${word}" in the Holy Bible.`)
				.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
				.setColor("#fcac34")
			);
		}
	},

	listbooks: function (msg){
		msg.channel.send(booklistMessage);
	},

	recite: async function recite(msg, printText){
		const split = msg.content.split(" ");
		const bookCode = split[1].toUpperCase();

		const book = codeToNumber.get(bookCode);
		
		if (typeof book === "undefined"){
			return msg.channel.send(
				new Discord.MessageEmbed()
				.addField("Error", "I think that you haven't specified a book you wish to recite from. For a full list of known books try using +listbooks.")
				.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
				.setColor("#fcac34")
			);
		}
		
		const input = split.slice(2, split.length).join("");
		
		try {
			var parsed = parseNotation(bookCode, book, input);
		} catch (error){
			return msg.channel.send(
				new Discord.MessageEmbed()
				.addField("Error", error.message)
				.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
				.setColor("#fcac34")
			);
		}
		
		//console.log(parsed);

		let urls = [];

		for (const part of parsed){
			const urlsTitle = googleTTS.getAllAudioUrls(part.citationVoice, ttsOptions);
			const urlsVerses = googleTTS.getAllAudioUrls(part.verses.join(""), ttsOptions);

			urls = urls.concat(urlsTitle, urlsVerses);
		}

		if (printText){
			let messageString = "";
			
			for (const part of parsed){
				messageString += `**${part.citationText}**\n`;

				for (const verse of part.verses){
					if (messageString.length + verse.length < 1999){
						messageString += `${verse}\n`;
					} else {
						msg.channel.send(messageString);
						messageString = `${verse}\n`;
					}
				}

				msg.channel.send(messageString);
				messageString = "";
			}
		}



		const voiceChannel = msg.member.voice.channel;
		if (!voiceChannel) return msg.channel.send("You need to be in a voice channel for me to join you.");
		
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
			return msg.channel.send("I need the permissions to join and speak in your voice channel.");
		}

		if (typeof voiceChannel.audioQueue === "undefined"){
			voiceChannel.audioQueue = [];
		}
		let startPlay = false;
		if (voiceChannel.audioQueue.length === 0){
			startPlay = true;
		}
		for (const url of urls){
			//console.log(url.url);
			voiceChannel.audioQueue.push(new AudioPiece(url.url));
		}
		if (startPlay){
			playQueue(voiceChannel);
		}
	}
}

async function playQueue(voiceChannel){
	const connection = await voiceChannel.join();
	connection.removeAllListeners("disconnect");
	connection.on("disconnect", () => {
		voiceChannel.audioQueue = [];
	});

	const stream = await voiceChannel.audioQueue[0].getStream();
	const dispatcher = await connection.play(stream);

	dispatcher.on('start', () => {
		console.log('audio is now playing!');
	});
	
	dispatcher.on('finish', async (reason) => {
		console.log("shift");
		voiceChannel.audioQueue.shift();
		if (voiceChannel.audioQueue.length !== 0){
			playQueue(voiceChannel);
		} else {
			voiceChannel.leave();
			console.log('audio has finished playing!');
		}
	});

	dispatcher.on('debug', console.log);

	dispatcher.on('error', console.log);
}

function generateSearchResults(occurences, page){
	const reply = new Discord.MessageEmbed()
	.setTitle("Search results")
	.setFooter(`Powered by Kotol   •   Page ${page + 1}/${Math.ceil(occurences.length / 10)}`, "https://kotol.cloud/static/biblebot-small.png")
	.setColor("#fcac34");
	
	for (var i = page * 10; i < (page + 1) * 10 && i < occurences.length; i++){
		const occurence = occurences[i];

		reply.addField(`${abbreviationsTogether[occurence.bookCode]} ${occurence.chapter}:${occurence.verse}`, bible[codeToNumber.get(occurence.bookCode)][occurence.chapter - 1][occurence.verse - 1]);
	}

	return reply;
}

function processPageMoves(message, occurences, page){
	let outerUser;
	const filter = (reaction, user) => {
		if (["◀", "▶"].includes(reaction.emoji.name) && !user.bot){
			outerUser = user;
			return true;
		} else {
			return false;
		}
	};

	message.awaitReactions(filter, {max: 1, time: 3 * 60 * 1000, errors: ["time"]})
	.then((collected) => {
		const reaction = collected.first();

		if (reaction.emoji.name === "◀") {
			if (page > 0){
				message.edit(generateSearchResults(occurences, page - 1));
				processPageMoves(message, occurences, page - 1);
			} else {
				processPageMoves(message, occurences, page);
			}
		} else if (reaction.emoji.name === "▶"){
			if (page < Math.ceil(occurences.length / 10) - 1){
				message.edit(generateSearchResults(occurences, page + 1));
				processPageMoves(message, occurences, page + 1);
			} else {
				processPageMoves(message, occurences, page);
			}
		}

		reaction.users.remove(outerUser);
	})
	.catch(() => {
		message.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
	});
}