function StoryCard({ frameNumber, kanjiCharacter, keyword, story }) {
	return (
		<div
			className="bg-white mb-4 rounded shadow-md px-6 py-4 flex gap-4 sm:gap-6 text-orange-950 group"
			key={frameNumber}
		>
			<div className="flex flex-col justify-start items-stretch gap-2 py-1 text-center">
				<a
					href={`https://kanji.koohii.com/study/kanji/${frameNumber}`}
					target="_blank"
					rel="noreferrer"
					className="text-orange-950/60 text-sm group-hover:underline"
				>
					{frameNumber}
				</a>
				<div className="text-4xl sm:text-6xl font-serif">{kanjiCharacter}</div>
			</div>
			<div className="flex-grow">
				<div className="text-2xl font-serif mb-2">{keyword}</div>
				<div dangerouslySetInnerHTML={{ __html: story }} />
			</div>
		</div>
	);
}

export default StoryCard;
