const Discord = require("discord.js");

const helpMessage = new Discord.MessageEmbed()
.setTitle("List of supported commands")
.setColor("#fcac34")
.setFooter("Powered by Kotol", "https://kotol.cloud/static/biblebot-small.png")
.addField("+help", "Displays this page.")
.addField("+count word", "Counts how many times a word can be found in the Holy Bible.")
.addField("+search word", "Searches the Holy Bible for the chosen word and displays a neat search result that you can navigate with reaction arrows (if found enough occurences to create multiple pages).")
.addField("+recite book citation", "Joins your voice channel and uses Google TTS to recite the selected citation from the selected book.")
.addField("+recitewithtext book citation", "Same as +recite, but also writes the text being read to the chat.")
.addField("Citation examples",
`1 ==> Entire chapter 1
3-5 ==> Chapters 3, 4, 5
1:3 ==> Third verse from the 1st chapter
2:1-4 ==> First 4 verses of the 2nd chapter
5:1-4; 6:17-20 ==> Verses from 1 to 4 from chapter 5, then verses 17-20 from chapter 6
Any of these can be freely combined, when delimited with a semicolon ";".`
)
.addField("A more technical specification",
`(chapter)[-end of range chapter][:verse][-end of range verse]
The only limitation is that when a range of chapters is specified, no verse or range of verses may be specified.
() - mandatory, [] - optional`
)
.addField("+listbooks", "Lists all available books with their 3-letter abbreviations you need to give to the +recite command.");

module.exports = helpMessage;