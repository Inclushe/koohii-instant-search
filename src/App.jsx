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
	const [searchTerm, setSearchTerm] = React.useState("");
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

	function replaceCurlyBracesWithLinks(story) {
		const curlyBraceRegex = /\{([\u4E00-\u9FFF])\}/gm;
		let newStory = story;
		newStory[5] = newStory[5].replace(curlyBraceRegex, (match) => {
			const kanji = match.replace(/{|}/g, "");
			return `<a class="text-blue-700 hover:underline" href="?query=${kanji}">${kanji}</a> (<span class="text-green-700">#${stories[
				kanji
			][0].trim()}</span>)`;
		});
		return newStory;
	}

	function processSearchTerms(output) {
		const processedSearchTerms = [];
		const results = output.results;
		for (const result of results) {
			if (result.type === "kanji") {
				const currentStory = stories[result.value];
				if (currentStory) {
					processedSearchTerms.push(replaceCurlyBracesWithLinks(currentStory));
				} else {
					// Show Unicode number for kanji instead
					processedSearchTerms.push([
						result.value.charCodeAt(0),
						result.value,
						`Unicode #${result.value.charCodeAt(0)}`,
						"0",
						"0000-00-00 00:00:00",
						"",
					]);
				}
			}
			if (result.type === "number") {
				const currentStory = stories[frameNumbersToKanji[Number(result.value)]];
				if (currentStory) {
					processedSearchTerms.push(replaceCurlyBracesWithLinks(currentStory));
				}
			}
			if (result.type === "keyword") {
				const currentMatches = getKeywordMatches(result.value);
				if (currentMatches.length > 0) {
					let currentStory = stories[keywordsToKanji[currentMatches[0]]];
					// if there is an exact match, use that as currentStory
					if (currentMatches.includes(result.value)) {
						currentStory = stories[keywordsToKanji[result.value]];
					}
					processedSearchTerms.push(replaceCurlyBracesWithLinks(currentStory));
				}
			}
		}
		return processedSearchTerms;
	}

	function handleCardClick(event) {
		event.preventDefault();
		const target = event.target;
		if (!target.href) return;
		if (target.href.includes("?query=")) {
			const query = decodeURIComponent(target.href.split("?query=")[1]);
			setSearchTerm(query);

			// Set history state
			const url = new URL(window.location);
			url.searchParams.set("query", query);
			window.history.pushState({}, "", url);
		} else {
			// If the link is not a query, open in new tab
			window.open(target.href, "_blank");
		}
	}

	React.useEffect(() => {
		// If there is a query param in the URL, set it as the search term
		const url = new URL(window.location);
		const query = url.searchParams.get("query");
		if (query) {
			setSearchTerm(decodeURIComponent(query));
		}

		// If history state changes, set search term to query param, set eventListener to variable
		const handlePopState = (event) => {
			const url = new URL(window.location);
			const query = url.searchParams.get("query");
			if (query) {
				setSearchTerm(decodeURIComponent(query));
			}
		};
		window.addEventListener("popstate", handlePopState);

		let currentStories = parseStoriesCSV(
			generateCSVFromKeywordsAndKanji(KK.SEQ_KEYWORDS, KK.SEQ_KANJIS),
		);
		let currentKeywordsToKanji = mapKeywordsToKanji(currentStories);
		let currentFrameNumbersToKanji = mapFrameNumbersToKanji(currentStories);

		const userStoriesCSV = localStorage.getItem("userStoriesCSV");
		if (userStoriesCSV) {
			try {
				const userStories = parseStoriesCSV(userStoriesCSV);
				const userKeywordsToKanji = mapKeywordsToKanji(userStories);
				const userFrameNumbersToKanji = mapFrameNumbersToKanji(userStories);
				currentStories = { ...currentStories, ...userStories };
				currentKeywordsToKanji = {
					...currentKeywordsToKanji,
					...userKeywordsToKanji,
				};
				currentFrameNumbersToKanji = {
					...currentFrameNumbersToKanji,
					...userFrameNumbersToKanji,
				};
			} catch (error) {
				console.error(error);
			}
		}

		setStories(currentStories);
		setKeywordsToKanji(currentKeywordsToKanji);
		setFrameNumbersToKanji(currentFrameNumbersToKanji);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, []);

	React.useEffect(() => {
		// Add `query` query param to URL, don't add to history
		if (searchTerm.trim().length === 0) {
			// remore query param from URL
			const url = new URL(window.location);
			url.searchParams.delete("query");
			window.history.replaceState({}, "", url);
		}
		const url = new URL(window.location);
		url.searchParams.set("query", encodeURIComponent(searchTerm));
		window.history.replaceState({}, "", url);
	}, [searchTerm]);

	return (
		<>
			<div className="w-full h-1 bg-orange-950" />
			<div className="p-4 mx-auto max-w-2xl text-orange-950">
				<div className="flex justify-between mb-4 gap-1 flex-wrap">
					<h1 className="text-xl font-bold">Koohii Instant Search</h1>
					<label htmlFor="upload" className="flex flex-col gap-2">
						<div>Upload your stories.</div>
						<input
							className="text-transparent max-w-[100px]"
							type="file"
							id="upload"
							onChange={handleFileChange}
						/>
					</label>
				</div>
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
				<ul onClick={handleCardClick}>
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
				</ul>
			</div>
		</>
	);
}

export default App;
