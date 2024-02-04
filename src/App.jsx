import React from "react";
import StoryCard from "./components/StoryCard";
import prepopulate from "./helpers/prepopulate";
import {
	generateCSVFromKeywordsAndKanji,
	parseStoriesCSV,
	mapKeywordsToKanji,
	mapFrameNumbersToKanji,
} from "./helpers/stories";
import KK from "./helpers/keywords";

function App() {
	const [searchTerm, setSearchTerm] = React.useState("search 777 漢字");
	const [stories, setStories] = React.useState({});
	const [keywordsToKanji, setKeywordsToKanji] = React.useState({});
	const [frameNumbersToKanji, setFrameNumbersToKanji] = React.useState({});

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
		const preprocessed = prepopulate(searchTerm, keywordsToKanji);
		return preprocessed;
	}

	function handleFileChange(event) {
		const file = event.target.files[0];

		const reader = new FileReader();
		reader.onload = (event) => {
			console.log(event.target.result);
			// Save result to local storage
			localStorage.setItem("userStoriesCSV", event.target.result);
			const userStories = parseStoriesCSV(event.target.result);
			const userKeywordsToKanji = mapKeywordsToKanji(userStories);
			const userFrameNumbersToKanji = mapFrameNumbersToKanji(userStories);
			setStories({ ...stories, ...userStories });
			setKeywordsToKanji({ ...keywordsToKanji, ...userKeywordsToKanji });
			setFrameNumbersToKanji({
				...frameNumbersToKanji,
				...userFrameNumbersToKanji,
			});
		};
		reader.readAsText(file);
	}

	function processSearchTerms(output) {
		const processedSearchTerms = [];
		const results = output.results;
		for (const result of results) {
			if (result.type === "kanji") {
				const currentStory = stories[result.value];
				if (currentStory) {
					processedSearchTerms.push(currentStory);
				}
			}
			if (result.type === "number") {
				const currentStory = stories[frameNumbersToKanji[Number(result.value)]];
				if (currentStory) {
					processedSearchTerms.push(currentStory);
				}
			}
			if (result.type === "keyword") {
				const currentMatches = getKeywordMatches(result.value);
				if (currentMatches.length > 0) {
					const currentStory = stories[keywordsToKanji[currentMatches[0]]];
					processedSearchTerms.push(currentStory);
				}
			}
		}
		return processedSearchTerms;
	}

	React.useEffect(() => {
		setStories(
			parseStoriesCSV(
				generateCSVFromKeywordsAndKanji(KK.SEQ_KEYWORDS, KK.SEQ_KANJIS),
			),
		);
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
				<input type="file" onChange={handleFileChange} />
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
