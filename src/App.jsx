import React from "react";
import myStoriesCSV from "./assets/my_stories.csv?raw";
import StoryCard from "./components/StoryCard";

function App() {
	const [searchTerm, setSearchTerm] = React.useState("search 777 漢字");
	const [stories, setStories] = React.useState({});
	const [keywordsToKanji, setKeywordsToKanji] = React.useState({});
	const [frameNumbersToKanji, setFrameNumbersToKanji] = React.useState({});

	// replace all newlines inside quotes with a placeholder <br>
	function replaceNewlinesInsideQuotes(str) {
		const regex = /("[\s|\S]*?")/gm;
		return str.replace(regex, (match) => {
			return match.replace(/(\r\n|\r|\n)/gm, "<br>");
		});
	}

	function parseStoriesCSV(csv) {
		const lines = csv.split("\n");
		const entries = {};
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];
			if (!line) {
				continue;
			}
			let [framenr, kanji, keyword, public_status, last_edited, ...storyParts] =
				line.split(",");

			const quotesRegex = /^"(.*)"$/gm;
			const quoteEscapeRegex = /""/gm;
			const boldRegex = /#(.*?)#/gm;
			const italicRegex = /\*(.*?)\*/gm;
			keyword = keyword.replace(quotesRegex, "$1");
			let story = storyParts.join(",");
			if (story) {
				story = story.replace(quotesRegex, "$1");
				story = story.replace(quoteEscapeRegex, '"');
				story = story.replace(boldRegex, "<b>$1</b>");
				story = story.replace(keyword, `<b>${keyword}</b>`);
				story = story.replace(italicRegex, "<i>$1</i>");
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

	function mapKeywordsToKanji() {
		// for each stories, make key pair with key of keyword and value of kanji
		const keywordToKanjiObject = {};
		for (const kanji of Object.keys(stories)) {
			keywordToKanjiObject[stories[kanji][2]] = kanji;
		}
		return keywordToKanjiObject;
	}

	function mapFrameNumbersToKanji() {
		// for each stories, make key pair with key of keyword and value of kanji
		const frameNumbersObject = {};
		for (const kanji of Object.keys(stories)) {
			frameNumbersObject[stories[kanji][0]] = kanji;
		}
		return frameNumbersObject;
	}

	function getKeywordMatches(term) {
		const matches = [];
		for (const keyword of Object.keys(keywordsToKanji)) {
			if (String(keyword).toLowerCase().startsWith(term.toLowerCase())) {
				matches.push(keyword);
			}
		}
		return matches;
	}

	function preprocessSearchTerm() {
		// split by word
		// check each word if any characters are in the CJK range (4E00–9FFF)
		// this will catch hiragana and katakana but it doesn't matter
		// if in range, split
		// if split word matches more than one keyword, look ahead and see if next word completes
		// if word is numbers, check if in range
		// split if is numbers
		// 吸血鬼
		// 吸test2
		// 3test
		//
		const splitSearchTerm = searchTerm.split(/[\s,]/g);
		const processedSearchTerms = [];
		for (let i = 0; i < splitSearchTerm.length; i++) {
			const termKanji = [];
			let termContainsNumbers = false;
			let termContainsLetters = false;

			for (const char of splitSearchTerm[i]) {
				if (char.match(/[\u4E00-\u9FFF]/)) {
					termKanji.push(char);
					continue;
				}
				if (char.match(/[0-9]/)) {
					termContainsNumbers = true;
					continue;
				}
				if (char.match(/[a-zA-Z]/)) {
					termContainsLetters = true;
				}
			}

			if (termKanji.length > 0) {
				for (const kanji of termKanji) {
					processedSearchTerms.push(kanji);
				}
				continue;
			}
			if (
				termKanji.length === 0 &&
				termContainsNumbers &&
				!termContainsLetters
			) {
				processedSearchTerms.push(splitSearchTerm[i]);
				continue;
			}
			if (
				termKanji.length === 0 &&
				termContainsNumbers &&
				termContainsLetters
			) {
				continue;
			}
			if (splitSearchTerm[i].length === 0) {
				continue;
			}
			// If contains only letters
			const keywordMatches = getKeywordMatches(
				splitSearchTerm[i].replace(/,/g, ""),
			);
			if (keywordMatches.length === 0) {
				continue;
			}
			if (keywordMatches.length === 1) {
				processedSearchTerms.push(splitSearchTerm[i]);
				continue;
			}
			if (splitSearchTerm[i][splitSearchTerm[i].length - 1] === ",") {
				processedSearchTerms.push(splitSearchTerm[i]);
				continue;
			}
			if (i === splitSearchTerm.length - 1) {
				processedSearchTerms.push(splitSearchTerm[i]);
				continue;
			}
			// If multiple keyword matches
			// Check if next word completes
			let fullString = `${splitSearchTerm[i]} ${splitSearchTerm[i + 1]}`;
			let words = 2;
			let isFinished = false;
			while (!isFinished && i + (words - 1) < splitSearchTerm.length) {
				const potentialMatches = getKeywordMatches(
					fullString.replace(/,/g, ""),
				);
				const isExactMatch = keywordsToKanji[fullString] !== undefined;
				if (potentialMatches.length > 1) {
					fullString = `${fullString} ${splitSearchTerm[i + words]}`;
					words++;
					continue;
				}
				if (potentialMatches.length === 1 || isExactMatch) {
					processedSearchTerms.push(fullString);
					isFinished = true;
					i += words - 1;
					continue;
				}
				if (fullString[fullString.length - 1] === ",") {
					processedSearchTerms.push(fullString);
					isFinished = true;
					i += words - 1;
					continue;
				}
				// No matches found
				isFinished = true;
				processedSearchTerms.push(splitSearchTerm[i]);
			}
			if (isFinished) {
				continue;
			}
			// Multiple keyword matches but didn't finish
			processedSearchTerms.push(splitSearchTerm[i]);
		}
		return processedSearchTerms;
	}

	function processSearchTerms(searchTerms) {
		const processedSearchTerms = [];
		for (const term of searchTerms) {
			if (term[0].match(/[\u4E00-\u9FFF]/)) {
				let currentStory = stories[term[0]];
				if (currentStory === undefined) {
					continue;
				}
				if (
					processedSearchTerms[processedSearchTerms.length - 1] &&
					currentStory[0] ===
						processedSearchTerms[processedSearchTerms.length - 1][0]
				) {
					continue;
				}
				processedSearchTerms.push(currentStory);
			}
			if (term[0].match(/[0-9]/)) {
				let currentStory = stories[frameNumbersToKanji[Number(term)]];
				if (currentStory === undefined) {
					continue;
				}
				processedSearchTerms.push(currentStory);
			}
			if (term[0].match(/[a-zA-Z]/)) {
				const currentMatches = getKeywordMatches(term);
				if (currentMatches.length === 0) {
					continue;
				}
				const currentStory = stories[keywordsToKanji[currentMatches[0]]];
				if (
					processedSearchTerms[processedSearchTerms.length - 1] &&
					currentStory[0] ===
						processedSearchTerms[processedSearchTerms.length - 1][0]
				) {
					continue;
				}
				processedSearchTerms.push(currentStory);
			}
		}
		return processedSearchTerms;
	}

	React.useEffect(() => {
		setStories(parseStoriesCSV(replaceNewlinesInsideQuotes(myStoriesCSV)));
		return () => {};
	}, []);

	React.useEffect(() => {
		setKeywordsToKanji(mapKeywordsToKanji(stories));
		setFrameNumbersToKanji(mapFrameNumbersToKanji(stories));
		return () => {};
	}, [stories]);

	return (
		<>
			<div className="w-full h-1 bg-orange-950" />
			<div className="p-4 mx-auto max-w-2xl text-orange-950">
				<h1 className="text-xl mb-4 font-bold">Koohii Instant Search</h1>
				<input
					className="border border-orange-950 rounded mb-4 p-2 w-full"
					type="text"
					name="searchTerm"
					value={searchTerm}
					autoFocus
					onChange={(event) => {
						setSearchTerm(event.target.value);
					}}
				/>
				<div>
					{processSearchTerms(preprocessSearchTerm()).map((story, index) => {
						if (story === undefined) return;
						const frameNumber = story[0];
						const kanjiCharacter = story[1];
						const keyword = story[2];
						const storyString = story[5];
						return (
							<StoryCard
								key={`${frameNumber}-${index}`}
								frameNumber={frameNumber}
								kanjiCharacter={kanjiCharacter}
								keyword={keyword}
								story={storyString}
							/>
						);
					})}
				</div>
			</div>
		</>
	);
}

export default App;
