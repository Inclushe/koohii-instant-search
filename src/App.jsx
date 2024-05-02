import React from "react";
import { useDropzone } from "react-dropzone";
import StoryCard from "./components/StoryCard";
import Bevel from "./components/Bevel";
import prepopulate from "./helpers/prepopulate";
import {
	generateCSVFromKeywordsAndKanji,
	parseStoriesCSV,
	mapKeywordsToKanji,
	mapFrameNumbersToKanji,
} from "./helpers/stories";
import KK from "./helpers/keywords";
import iconSearch from "./assets/icon-search.svg";
import iconX from "./assets/icon-x.svg";
import HomePage from "./components/HomePage";

function App() {
	const [searchTerm, setSearchTerm] = React.useState("");
	const [stories, setStories] = React.useState({});
	const [keywordsToKanji, setKeywordsToKanji] = React.useState({});
	const [frameNumbersToKanji, setFrameNumbersToKanji] = React.useState({});
	const [showUploadBoxAnyway, setShowUploadBoxAnyway] = React.useState(false);
	const [userHasUploadedStories, setUserHasUploadedStories] =
		React.useState(false);
	const onDrop = (acceptedFiles) => {
		const file = acceptedFiles[0];

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
			setUserHasUploadedStories(true);
			setShowUploadBoxAnyway(false);
		};
		reader.readAsText(file);
	};
	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		multiple: false,
		accept: {
			"text/csv": [],
		},
	});
	const homepageRendered = React.useRef(false);

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
		const separatorRegex = /([.,\"'])/gm;
		const searchTermSeparated = searchTerm.replace(separatorRegex, " $1 ");
		const preprocessed = prepopulate(searchTermSeparated, keywordsToKanji);
		return preprocessed;
	}

	function replaceCurlyBracesWithLinks(story) {
		const curlyBraceRegex = /\{([\u4E00-\u9FFF])\}/gm;
		const newStory = story;
		newStory[5] = newStory[5].replace(curlyBraceRegex, (match) => {
			const kanji = match.replace(/{|}/g, "");
			const frameNumber = stories[kanji]
				? stories[kanji][0].trim()
				: kanji.charCodeAt(0);
			return `<a class="text-blue-700 hover:underline" href="?query=${kanji}">${kanji}</a> (<span class="text-green-700">#${frameNumber}</span>)`;
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
				} else if (Number(result.value) > 0 && Number(result.value) <= 40879) {
					// Show Unicode number for kanji instead
					processedSearchTerms.push([
						Number(result.value),
						String.fromCharCode(Number(result.value)),
						`Unicode #${Number(result.value)}`,
						"0",
						"0000-00-00 00:00:00",
						"",
					]);
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
		if (processedSearchTerms.length === 0) {
			processedSearchTerms.push({
				message: "No results found.",
			});
		}
		return processedSearchTerms;
	}

	function handleCardClick(event) {
		if (!target.href) return;
		event.preventDefault();
		const target = event.target;
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
		try {
			if (query) {
				setSearchTerm(decodeURIComponent(query));
			}
		} catch (error) {
			console.error(error);
		}

		// If history state changes, set search term to query param, set eventListener to variable
		const handlePopState = (event) => {
			const url = new URL(window.location);
			const query = url.searchParams.get("query");
			try {
				if (query) {
					setSearchTerm(decodeURIComponent(query));
				}
			} catch (error) {
				console.error(error);
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
				setUserHasUploadedStories(true);
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
		}
		const url = new URL(window.location);
		url.searchParams.set("query", encodeURIComponent(searchTerm));
		window.history.replaceState({}, "", url);
	}, [searchTerm]);

	return (
		<>
			<div className="p-4 mx-auto max-w-2xl text-orange-900">
				<div className="relative mb-4">
					<Bevel className={"drop-shadow-search-container"}>
						<input
							className="border-none outline-none pl-4 pr-12 py-3 w-full clip-bevel placeholder:text-orange-900/60"
							type="text"
							name="searchTerm"
							value={searchTerm}
							placeholder="Kanji, keyword or frame number"
							autoComplete="off"
							autoFocus
							onChange={(event) => {
								setSearchTerm(event.target.value);
							}}
						/>
					</Bevel>
					{searchTerm.trim().length === 0 ? (
						<img
							className="absolute top-1/2 -translate-y-1/2 right-3.5"
							src={iconSearch}
							height="24"
							width="24"
							alt=""
						/>
					) : (
						<button
							type="button"
							className="absolute top-1/2 -translate-y-1/2 right-3.5 p-2 translate-x-2"
							onClick={() => setSearchTerm("")}
						>
							<img className="" src={iconX} height="24" width="24" alt="" />
						</button>
					)}
				</div>
				{searchTerm.trim().length === 0 ? (
					<HomePage
						homepageRendered={homepageRendered}
						getRootProps={getRootProps}
						getInputProps={getInputProps}
						userHasUploadedStories={userHasUploadedStories}
						showUploadBoxAnyway={showUploadBoxAnyway}
						setShowUploadBoxAnyway={setShowUploadBoxAnyway}
					/>
				) : (
					<ul onClick={handleCardClick}>
						{processSearchTerms(preprocessSearchTerm()).map((story, index) => {
							if (story === undefined) return;
							if (story.message) {
								return <li key={index}>{story.message}</li>;
							}
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
				)}
			</div>
		</>
	);
}

export default App;
