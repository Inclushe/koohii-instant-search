import React from "react";
import myStoriesCSV from "./assets/my_stories.csv?raw";
import StoryCard from "./components/StoryCard";
import prepopulate from "./helpers/prepopulate";
import {
	parseStoriesCSV,
	mapKeywordsToKanji,
	mapFrameNumbersToKanji,
} from "./helpers/stories";

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
		console.log(matches);
		return matches;
	}

	function preprocessSearchTerm() {
		const preprocessed = prepopulate(searchTerm, keywordsToKanji);
		console.log(preprocessed);
		return preprocessed;
	}

	function processSearchTerms(output) {
		const processedSearchTerms = [];
		for (const result of output.results) {
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
		setStories(parseStoriesCSV(myStoriesCSV));
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
