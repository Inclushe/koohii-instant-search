import React from "react";
import { twMerge } from "tailwind-merge";
import Logo from "./../../assets/logo.svg?react";
import Sokutou from "./../../assets/sokutou.svg?react";
import Exclamation from "./../../assets/exclamation.svg?react";
import IconLock from "./../../assets/icon-lock.svg?react";
import Bevel from "../Bevel";

function HomePage({ handleFileChange, homepageRendered }) {
	const [showAnimation, setShowAnimation] = React.useState(false);

	React.useEffect(() => {
		if (homepageRendered.current === false) {
			setShowAnimation(true);
			homepageRendered.current = true;
		}
	});

	return (
		<>
			<div className="flex flex-col justify-start items-start mt-8 mb-4 gap-4 flex-wrap transition-[opacity,transform] animate-fade-in">
				<h1 className="sr-only">Koohii Instant Search</h1>
				<div className="flex gap-0">
					<Sokutou />
					<Exclamation
						className={`transition-[opacity,transform] origin-left ${
							showAnimation ? "animate-stretch" : false
						}`}
					/>
				</div>
				<Logo />
				<p>Search using kanji, keywords, frame numbers, or all of the above.</p>
				<Bevel className={"before:bg-orange-200 w-full"}>
					<div className="p-6 flex flex-col gap-4">
						<h2 className="text-xl font-bold">Import your Koohii stories.</h2>
						<ol className="list-decimal pl-5">
							<li>Log into your Koohii account.</li>
							<li>
								Under Study &gt; My Stories, click the green Export to CSV
								button.
							</li>
							<li>
								Choose <pre className="inline">my_stories.csv</pre> from the
								file picker below.
							</li>
						</ol>
						<p>
							<IconLock className="inline-block align-top mr-2" />
							Your stories are processed locally and never leave your device.
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
	);
}

export default HomePage;
