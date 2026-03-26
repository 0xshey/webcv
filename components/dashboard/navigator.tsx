"use client";

import { SettingsMenu } from "./settings-menu";

export function Navigator() {
	return (
		<header className="flex items-center justify-between mb-24">
			<span className="font-semibold">webcv</span>
			<SettingsMenu />
		</header>
	);
}
