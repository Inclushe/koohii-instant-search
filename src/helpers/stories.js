export function parseStoriesCSV(csv) {
	let stories = csv;
	// Add space in front of all stories
	stories = stories.replace(
		/,(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},")/gm,
		",$1 ",
	);
	// Replace all "" with {quote}
	stories = stories.replace(/("")/gm, "{quote}");
	// Break all lines
	const lines = stories.split(/"[\r\n|\r|\n]/gm);
	const entries = {};
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (!line || line.trim().length === 0) {
			continue;
		}
		let [framenr, kanji, keyword, public_status, last_edited, ...storyParts] =
			line.split(",");

		const quotesRegex = /^"(.*)"$/gm;
		const quoteStoryRegex = /^" (.*)$/gm;
		const quoteEscapeRegex = /\{quote\}/gm;
		const boldRegex = /#(.*?)#/gm;
		const italicRegex = /\*(.*?)\*/gm;
		const newLineRegex = /(\r\n|\r|\n)/gm;
		keyword = keyword.replace(quotesRegex, "$1");
		let story = storyParts.join(",");
		if (story) {
			story = story.trim();
			story = story.replace(quoteStoryRegex, "$1");
			story = story.replace(quoteEscapeRegex, '"');
			story = story.replace(boldRegex, "<b>$1</b>");
			story = story.replace(keyword, `<b>${keyword}</b>`);
			story = story.replace(italicRegex, "<i>$1</i>");
			story = story.replace(newLineRegex, "<br>");
		}
		entries[kanji] = [
			framenr,
			kanji,
			keyword,
			public_status,
			last_edited,
			story,
		];
	}
	return entries;
}

export function mapKeywordsToKanji(stories) {
	// for each stories, make key pair with key of keyword and value of kanji
	const keywordToKanjiObject = {};
	for (const kanji of Object.keys(stories)) {
		keywordToKanjiObject[stories[kanji][2].trim()] = kanji;
	}
	return keywordToKanjiObject;
}

export function mapFrameNumbersToKanji(stories) {
	// for each stories, make key pair with key of keyword and value of kanji
	const frameNumbersObject = {};
	for (const kanji of Object.keys(stories)) {
		frameNumbersObject[stories[kanji][0].trim()] = kanji;
	}
	return frameNumbersObject;
}
