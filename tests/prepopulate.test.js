import { expect, test } from "bun:test";
import prepopulate from "../src/helpers/prepopulate";
import storiesExampleCSV from "./storiesExampleCSV";
import {
	parseStoriesCSV,
	mapKeywordsToKanji,
	mapFrameNumbersToKanji,
} from "../src/helpers/stories";

const stories = parseStoriesCSV(storiesExampleCSV);
const keywordsToKanji = mapKeywordsToKanji(stories);
const frameNumbersToKanji = mapFrameNumbersToKanji(stories);

const val = prepopulate(
	"波波波地震 1233 222 2222 test hair of the hea bird 333",
	keywordsToKanji,
);

const val2 = prepopulate("字 four hair of 666", keywordsToKanji);
// const val3 = prepopulate("666", keywordsToKanji);
// const val4 = prepopulate("technique (old)", keywordsToKanji);
const val5 = prepopulate("technique 678", keywordsToKanji);

// test("prepopulate with no arguments", () => {
// 	const val = prepopulate(null, keywordsToKanji);
// 	expect(val.results.length).toBe(0);
// });

// test("prepopulate with empty string", () => {
// 	const val = prepopulate("", keywordsToKanji);
// 	expect(val.results.length).toBe(0);
// });

// test("prepopulate with 1 kanji", () => {
// 	const val = prepopulate(
// 		"波波波地震 1233 222 2222 test hair of the hea bird",
// 		keywordsToKanji,
// 	);
// 	expect(val).toBe(0);
// });
