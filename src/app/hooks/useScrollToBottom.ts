import { useEffect, useState } from "react";

export default function useScrollToBottom(threshold = 10) {
	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } =
				document.documentElement;
			const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;
			setIsAtBottom(isBottom);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [threshold]);

	return isAtBottom;
}
