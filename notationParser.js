const abbreviationsTogether = require("./abbreviationsTogether");

module.exports = function parse(bookCode, book, input){
	const independentParts = input.split(";");

	let returnArray = [];

	for (const part of independentParts){
		const parsed = parsePart(bookCode, book, part);
		if (Array.isArray(parsed)){
			returnArray = returnArray.concat(parsed);
		} else {
			returnArray.push(parsed);
		}
	}

	return returnArray;
};

function parsePart(bookCode, book, part){
	if (part.includes(":")){
		//verses
		const split = part.split(":");
		
		const chapterDescriptor = split[0];
		const verseDescriptor = split[1];

		const chapter = Number(chapterDescriptor);

		if (Number.isNaN(chapter)){
			throw new TypeError(`I was unable to parse chapter number "${chapterDescriptor}".`)
		}
		if (chapter < 1 || chapter > bible[book].length){
			throw new RangeError(`Chapter is out of range, book ${abbreviationsTogether[bookCode]} has ${bible[book].length} ${bible[book].length === 1 ? "chapter" : "chapters"}.`);
		}

		if (verseDescriptor.includes("-")){
			//range of verses
			const verseSplit = verseDescriptor.split("-");
			
			const verseFirst = Number(verseSplit[0]);
			const verseLast = Number(verseSplit[1]);

			if (Number.isNaN(verseFirst) || Number.isNaN(verseLast)){
				throw new TypeError(`I was unable to parse verse range "${verseDescriptor}".`)
			}
			if (verseFirst < 1 || verseLast > bible[book][chapter - 1].length){
				throw new RangeError(`Verse range is out of range, book ${abbreviationsTogether[bookCode]}, chapter ${chapter} only has ${bible[book][chapter - 1].length} ${bible[book][chapter - 1].length === 1 ? "verse" : "verses"}.`);
			}
			if (verseFirst > verseLast){
				throw new RangeError(`Last verse was specified before the first one "${verseDescriptor}"`);
			}
			
			return {
				citationText: `${abbreviationsTogether[bookCode]} ${chapter}:${verseFirst}-${verseLast}`,
				citationVoice: `${abbreviationsTogether[bookCode]}: chapter ${chapter}, verses ${verseFirst} to ${verseLast}`,
				verses: bible[book][chapter - 1].slice(verseFirst - 1, verseLast)
			};
		} else {
			//one verse
			const verse = Number(verseDescriptor);

			if (Number.isNaN(verse)){
				throw new TypeError(`I was unable to parse verse number "${verseDescriptor}".`)
			}
			if (verse < 1 || verse > bible[book][chapter - 1].length){
				throw new RangeError(`Verse number is out of range, book ${abbreviationsTogether[bookCode]}, chapter ${chapter} only has ${bible[book][chapter - 1].length} ${bible[book][chapter - 1].length === 1 ? "verse" : "verses"}.`);
			}

			return {
				citationText: `${abbreviationsTogether[bookCode]} ${chapter}:${verse}`,
				citationVoice: `${abbreviationsTogether[bookCode]}: chapter ${chapter}, verse ${verse}`,
				verses: [bible[book][chapter - 1][verse - 1]]
			};
		}
	} else {
		//full chapter/range no verses
		if (part.includes("-")){
			//range of chapters
			const split = part.split("-");

			const first = Number(split[0]);
			const last = Number(split[1]);

			if (Number.isNaN(first) || Number.isNaN(last)){
				throw new TypeError(`I was unable to parse chapter range "${part}".`)
			}
			if (first < 1 || last > bible[book].length){
				throw new RangeError(`Chapter range is out of range, book ${abbreviationsTogether[bookCode]} only has ${bible[book].length} ${bible[book].length === 1 ? "chapter" : "chapters"}.`);
			}
			if (first > last){
				throw new RangeError(`Last chapter was specified before the first one "${part}"`);
			}

			const returnArray = [];

			for (var i = first - 1; i < last; i++){
				returnArray.push({
					citationText: `${abbreviationsTogether[bookCode]} ${i + 1}`,
					citationVoice: `${abbreviationsTogether[bookCode]}: chapter ${i + 1}`,
					verses: bible[book][i]
				});
			}

			return returnArray;
		} else {
			//one chapter
			const chapter = Number(part);

			if (Number.isNaN(chapter)){
				throw new TypeError(`I was unable to parse chapter number "${part}".`)
			}
			if (chapter < 1 || chapter > bible[book].length){
				throw new RangeError(`Chapter number is out of range, book ${abbreviationsTogether[bookCode]}, only has ${bible[book].length} ${bible[book].length === 1 ? "chapter" : "chapters"}.`);
			}

			return {
				citationText: `${abbreviationsTogether[bookCode]} ${chapter}`,
				citationVoice: `${abbreviationsTogether[bookCode]}: chapter ${chapter}`,
				verses: bible[book][chapter - 1]
			};
		}
	}
}