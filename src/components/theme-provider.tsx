"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	// Suppress "Encountered a script tag" warning from next-themes in React 19
	React.useEffect(() => {
		const originalConsoleError = console.error;
		console.error = (...args) => {
			if (
				typeof args[0] === "string" &&
				args[0].includes(
					"Encountered a script tag while rendering React component",
				)
			) {
				return;
			}
			originalConsoleError.apply(console, args);
		};
		return () => {
			console.error = originalConsoleError;
		};
	}, []);

	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
