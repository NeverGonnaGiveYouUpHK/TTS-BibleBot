const Discord = require("discord.js");
const abbreviations = require("../abbreviations");

const booklistMessage = new Discord.MessageEmbed()
.setTitle("List of available books")
.setColor("#fcac34")
.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png");

function getBookList(from, start){
	let text = "\`\`\`";
	const keys = Object.keys(from);
	for (var i = start; i < start + 15 && i < keys.length; i++){
		const key = keys[i];
		const chapters = bible[codeToNumber.get(key)].length;
		text += `${key}:\t${from[key]} (${chapters} ${chapters === 1 ? "chapter" : "chapters"})\n`;
	}
	text += "\`\`\`";
	return text;
}
booklistMessage.addField(`The Old Testament - The Hebrew Scriptures (${Object.keys(abbreviations.OT.THS).length} books)`, getBookList(abbreviations.OT.THS, 0));
booklistMessage.addField("...", getBookList(abbreviations.OT.THS, 15));
booklistMessage.addField("...", getBookList(abbreviations.OT.THS, 30));
booklistMessage.addField(`The Old Testament - The Apocrypha (${Object.keys(abbreviations.OT.APO).length} books)`, getBookList(abbreviations.OT.APO, 0));
//booklistMessage.addField("...", getBookList(abbreviations.OT.APO, 15));
booklistMessage.addField(`The New Testament (${Object.keys(abbreviations.NT).length} books)`, getBookList(abbreviations.NT, 0));
booklistMessage.addField("...", getBookList(abbreviations.NT, 15));
booklistMessage.addField("Other", getBookList(abbreviations.OTHER, 0));

module.exports = booklistMessage;