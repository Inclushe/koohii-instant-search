import Bevel from "../Bevel/";

import IconKoohii from "./icon-koohii.svg?react";
import IconJisho from "./icon-jisho.svg?react";

function StoryCard({ frameNumber, kanjiCharacter, keyword, story }) {
	return (
		<Bevel as="li" className={"mb-4 group"} key={frameNumber}>
			<div className="px-6 py-4 flex gap-4 sm:gap-6 bg-white text-orange-900 clip-bevel">
				<div className="flex flex-col justify-start items-stretch gap-1 py-[1px] md:py-[5px] text-center">
					<p className="text-orange-900/60 text-sm z-10">{frameNumber}</p>
					<div className="text-4xl md:text-6xl font-serif">
						{kanjiCharacter}
					</div>
				</div>
				<div
					className={`flex flex-col flex-grow ${story ? "" : "justify-center"}`}
				>
					<div className="flex justify-between gap-2">
						<h2 className="text-base md:text-xl font-bold mb-1 leading-tight">
							{keyword}
						</h2>
						<div className="flex flex-row justify-center items-center gap-2">
							<a
								href={`https://kanji.koohii.com/study/kanji/${frameNumber}`}
								target="_blank"
								rel="noreferrer"
								className="text-orange-900/60 hover:text-orange-900/100 transition-colors"
							>
								<IconKoohii className="h-4 w-4 p-2 box-content -m-2 -translate-y-[2px]" />
							</a>
							<a
								href={`https://jisho.org/search/${kanjiCharacter}%20%23kanji`}
								target="_blank"
								rel="noreferrer"
								className="text-orange-900/60 hover:text-orange-900/100 transition-colors"
							>
								<IconJisho className="h-4 w-4 p-2 box-content -m-2 -translate-y-[2px]" />
							</a>
						</div>
					</div>
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
