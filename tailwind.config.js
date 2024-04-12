/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				serif: [
					"Hiragino Mincho Pro",
					"ヒラギノ明朝 Pro W3",
					"ＭＳ 明朝",
					"ＭＳ Ｐ明朝",
					"serif",
				],
			},
			colors: {
				orange: {
					100: "#FFEDD6",
					200: "#FCD5A6",
					300: "#F7B773",
					400: "#F3963F",
					500: "#F1780E",
					600: "#D86B13",
					700: "#A85A1A",
					800: "#774013",
					900: "#4D290F",
					950: "#2C1504",
				},
			},
			dropShadow: {
				"border-container": [
					"0.5px 0px 0px #4D290F",
					"-0.5px 0px 0px #4D290F",
					"0px 0.5px 0px #4D290F",
					"0px -0.5px 0px #4D290F",
					"0.5px 0.5px 0px #4D290F",
					"-0.5px -0.5px 0px #4D290F",
					"-0.5px 0.5px 0px #4D290F",
					"0.5px -0.5px 0px #4D290F",
				],
				"search-container": [
					"0px 4px 0px #4D290F",
					"0px 0px 250px rgba(168, 90, 26, 0.5)",
				],
			},
		},
	},
	plugins: [],
};
