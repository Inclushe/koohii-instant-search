import { createActor, createMachine } from "xstate";

// https://stately.ai/registry/editor/3dff0b0d-9ad3-45c9-942a-a9e286e189b6?machineId=63edce10-3f32-4565-aeb5-4f90a3f283f3&mode=Design
export const machine = createMachine(
	{
		id: "preprocess",
		initial: "blank",
		states: {
			blank: {
				on: {
					kanji: {
						target: "return/kanji",
					},
					termination: {
						target: "return/skip",
					},
					number: {
						target: "waiting/frameNumber",
					},
					letter: {
						target: "waiting/keyword",
					},
					eol: {
						target: "return/skip",
					},
				},
			},
			"return/kanji": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			"return/skip": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			"waiting/frameNumber": {
				on: {
					number: {
						target: "waiting/frameNumber",
					},
					kanji: {
						target: "return/skipBackOne",
					},
					letter: {
						target: "return/skipBackOne",
					},
					termination: {
						target: "return/frameNumber",
					},
					eol: {
						target: "return/frameNumber",
					},
				},
			},
			"waiting/keyword": {
				on: {
					kanji: {
						target: "return/skipBackOne",
					},
					number: {
						target: "return/skipBackOne",
					},
					termination: {
						target: "checkIfCompleted",
					},
					letter: {
						target: "waiting/keyword",
					},
					eol: {
						target: "checkIfCompletedEOL",
					},
				},
			},
			"return/skipBackOne": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			"return/frameNumber": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			checkIfCompleted: {
				on: {
					noResults: {
						target: "return/skip",
					},
					exactResult: {
						target: "return/keyword",
					},
					oneOrMultipleResults: {
						target: "waiting/multiword",
					},
				},
			},
			checkIfCompletedEOL: {
				on: {
					noResults: {
						target: "return/skip",
					},
					exactResult: {
						target: "return/keyword",
					},
					oneOrMultipleResults: {
						target: "return/keyword",
					},
				},
			},
			"return/keyword": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			"waiting/multiword": {
				on: {
					kanji: {
						target: "return/keywordWithoutNewWordAndSkipOne",
					},
					number: {
						target: "return/keywordWithoutNewWordAndSkipOne",
					},
					letter: {
						target: "waiting/multiword",
					},
					termination: {
						target: "checkIfCompletedMulti",
					},
					eol: {
						target: "checkIfCompletedMultiEOL",
					},
				},
			},
			"return/keywordWithoutNewWordAndSkipOne": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
			checkIfCompletedMulti: {
				on: {
					noResults: {
						target: "return/keywordWithoutNewWord",
					},
					exactResult: {
						target: "return/keyword",
					},
					oneOrMultipleResults: {
						target: "waiting/multiword",
					},
				},
			},
			checkIfCompletedMultiEOL: {
				on: {
					exactResult: {
						target: "return/keyword",
					},
					noResults: {
						target: "return/keywordWithoutNewWord",
					},
					oneOrMultipleResults: {
						target: "return/keyword",
					},
				},
			},
			"return/keywordWithoutNewWord": {
				on: {
					RESTART: {
						target: "blank",
					},
				},
			},
		},
	},
	{
		actions: {},
		actors: {},
		guards: {},
		delays: {},
	},
);

function detectType(character) {
	if (character === undefined) {
		return "eol";
	}
	if (character.match(/[\u4E00-\u9FFF]/)) {
		return "kanji";
	}
	if (character.match(/[0-9]/)) {
		return "number";
	}
	if (character.match(/[\s]/)) {
		return "termination";
	}
	return "letter";
}

function getResult(slicedSearchValue, state) {
	// console.log(state);
	switch (state) {
		case "return/kanji":
			return {
				value: slicedSearchValue,
				type: "kanji",
			};
		case "return/frameNumber":
			// console.log(slicedSearchValue);
			return {
				value: slicedSearchValue,
				type: "number",
			};
		case "return/keyword": {
			const keyword = slicedSearchValue.trim().split(/[\s]/).join(" ").trim();
			return {
				value: keyword,
				type: "keyword",
			};
		}
		case "return/keywordWithoutNewWord":
		case "return/keywordWithoutNewWordAndSkipOne": {
			const keyword = slicedSearchValue.slice(0, -1);
			const keywordArray = keyword.split(/[\s]/);
			const keywordWithoutNewWord = keywordArray.slice(0, -1).join(" ");
			return {
				value: keywordWithoutNewWord,
				type: "keyword",
			};
		}
		case "return/skip":
		case "return/skipBackOne":
			return;
	}
}

export default function prepopulate(searchTerms, keywordsToKanji) {
	const searchValue = searchTerms;
	const actor = createActor(machine);

	const output = {
		results: [],
	};

	if (typeof searchValue !== "string") {
		console.warn("searchValue is not a string");
		return output;
	}

	actor.start();
	let startPoint = 0;
	for (let curPoint = 0; curPoint <= searchValue.length + 1; curPoint++) {
		const preSnapshot = actor.getSnapshot();
		// console.log("pre:", curPoint, searchValue[curPoint], preSnapshot.value);
		if (preSnapshot.value.startsWith("return/")) {
			const slicedSearchValue = searchValue.slice(startPoint, curPoint);
			const state = preSnapshot.value;
			const result = getResult(slicedSearchValue, state);
			if (typeof result === "object") {
				output.results.push(result);
				if (state === "return/keywordWithoutNewWord") {
					// console.log("--NEW");
					// console.log(slicedSearchValue, result.value);
					// console.log("NEW--");
					curPoint =
						curPoint - (slicedSearchValue.length - result.value.length);
				}
			}
			if (
				state === "return/skipBackOne" ||
				state === "return/keywordWithoutNewWordAndSkipOne"
			) {
				// console.log("--SKIP");
				// console.log(slicedSearchValue);
				// console.log("SKIP--");
				curPoint--;
			}
			startPoint = curPoint;
			// console.log(
			// 	preSnapshot.value,
			// 	searchValue,
			// 	curPoint,
			// 	searchValue[curPoint],
			// );
			actor.send({ type: "RESTART" });
		}

		const type = detectType(searchValue[curPoint]);
		actor.send({ type });

		const postSnapshot = actor.getSnapshot();
		// console.log("post:", curPoint, searchValue[curPoint], postSnapshot.value);
		const isOnIntermediateState =
			postSnapshot.value.startsWith("checkIfCompleted");

		if (isOnIntermediateState) {
			const slicedSearchValue = searchValue.slice(startPoint, curPoint);
			const keywordMatches = getKeywordMatches(slicedSearchValue);
			// console.log("isOnIntermediateState, matches:", keywordMatches.length);
			if (keywordMatches.length === 0) {
				// console.log("noResults");
				actor.send({ type: "noResults" });
				continue;
			}
			if (
				(keywordMatches.length === 1 &&
					keywordMatches[0] === slicedSearchValue) ||
				(keywordMatches.length !== 0 &&
					keywordMatches[0] === slicedSearchValue &&
					type === "eol")
			) {
				// console.log("exactResult");
				actor.send({ type: "exactResult" });
				continue;
			}
			if (keywordMatches.length !== 0) {
				// console.log("oneOrMultipleResults");
				actor.send({ type: "oneOrMultipleResults" });
				continue;
			}
		}
	}
	// console.log(output);
	return output;

	function getKeywordMatches(term) {
		const matches = [];
		for (const keyword of Object.keys(keywordsToKanji)) {
			if (String(keyword).toLowerCase().startsWith(term.toLowerCase())) {
				matches.push(keyword);
			}
		}
		return matches;
	}
}
