"use client";

import Link from "next/link";
import { SettingsMenu } from "./settings-menu";

export function Navigator() {
	return (
		<header className="flex items-center justify-between mb-24">
			<Link href="/" className="font-semibold">webcv</Link>
			<SettingsMenu />
		</header>
	);
}
