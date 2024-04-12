import React from "react";
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
		const separatorRegex = /([.,\"'])/gm;
		const searchTermSeparated = searchTerm.replace(separatorRegex, " $1 ");
		const preprocessed = prepopulate(searchTermSeparated, keywordsToKanji);
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
					<img
						className="absolute top-1/2 -translate-y-1/2 right-4"
						src="/icon-search.svg"
						height="24"
						width="24"
						alt=""
					/>
				</div>
				{searchTerm.trim().length === 0 ? (
					<>
						<div className="flex flex-col justify-start items-start mt-8 mb-4 gap-4 flex-wrap">
							<h1 className="sr-only">Koohii Instant Search</h1>
							<img src="/logo.svg" width="389" height="289" alt="即答！" />
							<p>
								Search using kanji, keywords, frame numbers, or all of the
								above.
							</p>
							<Bevel className={"before:bg-orange-200 w-full"}>
								<div className="p-6 flex flex-col gap-4">
									<h2 className="text-xl font-bold">
										Import your Koohii stories.
									</h2>
									<ol className="list-decimal pl-5">
										<li>Log into your Koohii account.</li>
										<li>
											Under Study &gt; My Stories, click the green Export to CSV
											button.
										</li>
										<li>
											Choose <pre class="inline">my_stories.csv</pre> from the
											file picker below.
										</li>
									</ol>
									<p>
										<img
											className="inline-block align-top mr-2"
											src="/icon-lock.svg"
											height="24"
											width="24"
											alt=""
										/>
										Your stories are processed locally and never leave your
										device.
									</p>
									<label htmlFor="upload" className="flex flex-col gap-2">
										<div>Upload your stories.</div>
										<input
											className="text-transparent"
											type="file"
											id="upload"
											onChange={handleFileChange}
										/>
									</label>
								</div>
							</Bevel>
						</div>
					</>
				) : (
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
				)}
			</div>
		</>
	);
}

export default App;
