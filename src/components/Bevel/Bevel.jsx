import React from "react";
import { twMerge } from "tailwind-merge";

function Bevel({ children, as, ...props }) {
	const className = twMerge(
		"relative z-0 before:content-[''] before:absolute before:inset-0 before:bg-white before:clip-bevel-before before:z-[-1] after:content-[''] after:absolute after:-inset-[2px] after:bg-yellow-950 after:clip-bevel-after after:z-[-2]",
		props.className,
	);
	const Tag = typeof as === "string" ? as : "div";
	return (
		<Tag {...props} className={className}>
			{children}
		</Tag>
	);
}

export default Bevel;
