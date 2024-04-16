import Bevel from "../Bevel/";

function StoryCard({ frameNumber, kanjiCharacter, keyword, story }) {
	return (
		<Bevel as="li" className={"mb-4 group"} key={frameNumber}>
			<div className="px-6 py-4 flex gap-4 sm:gap-6 bg-white text-orange-900 clip-bevel">
				<div className="flex flex-col justify-start items-stretch gap-0 py-1 text-center">
					<a
						href={`https://kanji.koohii.com/study/kanji/${frameNumber}`}
						target="_blank"
						rel="noreferrer"
						className="text-orange-900/60 text-sm group-hover:underline z-10"
					>
						{frameNumber}
					</a>
					<div className="text-4xl md:text-6xl font-serif">
						{kanjiCharacter}
					</div>
				</div>
				<div className="flex-grow">
					<h2 className="text-base md:text-xl font-bold mb-1">{keyword}</h2>
					<div
						className="text-sm md:text-base"
						dangerouslySetInnerHTML={{ __html: story }}
					/>
				</div>
			</div>
		</Bevel>
	);
}

export default StoryCard;
