import React from "react";
import { twMerge } from "tailwind-merge";
import Logo from "./../../assets/logo.svg?react";
import Sokutou from "./../../assets/sokutou.svg?react";
import Exclamation from "./../../assets/exclamation.svg?react";
import IconLock from "./../../assets/icon-lock.svg?react";
import Bevel from "../Bevel";

function HomePage({
	homepageRendered,
	getRootProps,
	getInputProps,
	userHasUploadedStories,
	showUploadBoxAnyway,
	setShowUploadBoxAnyway,
}) {
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
				<div className="flex w-full gap-0 overflow-hidden">
					<Sokutou />
					<Exclamation
						className={`transition-[opacity,transform] origin-left ${
							showAnimation ? "animate-stretch" : false
						}`}
					/>
				</div>
				<Logo className="max-w-full h-auto" />
				<p>Search using kanji, keywords, frame numbers, or all of the above.</p>
				<Bevel className={"before:bg-orange-200 w-full"}>
					<div className="px-4 md:px-6 py-6 flex flex-col gap-4">
						<h2 className="text-xl font-bold">Import your Koohii stories.</h2>
						{userHasUploadedStories && !showUploadBoxAnyway ? (
							<>
								<b>Stories uploaded!</b>
								<Bevel
									className="text-left w-max px-3 py-2 before:bg-orange-900 font-bold text-orange-100"
									as="button"
									onClick={() => setShowUploadBoxAnyway(true)}
								>
									Upload new stories
								</Bevel>
							</>
						) : (
							<>
								<ol className="list-decimal pl-5">
									<li>
										Log into your{" "}
										<a
											className="text-orange-900 underline hover:text-orange-900/100 transition-colors"
											href="https://kanji.koohii.com/"
											target="_blank"
											rel="noreferrer"
										>
											Koohii account
										</a>
										.
									</li>
									<li>
										Under{" "}
										<a
											className="text-orange-900 underline hover:text-orange-900/100 transition-colors"
											href="https://kanji.koohii.com/study/mystories"
											target="_blank"
											rel="noreferrer"
										>
											Study &gt; My Stories
										</a>
										, click the green Export to CSV button.
									</li>
								</ol>
								<div
									{...getRootProps({
										className:
											"bg-orange-200 cursor-pointer border-orange-950 border-2 border-dashed px-4 py-8 sm:text-center",
									})}
								>
									<input {...getInputProps()} />
									<p>
										Drag and drop my_stories.csv or click here to upload your
										stories.
									</p>
								</div>
							</>
						)}
						<p className="text-xs">
							Your stories are processed locally and never leave your device.
						</p>
					</div>
				</Bevel>
			</div>
		</>
	);
}

export default HomePage;
