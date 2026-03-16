"use client";

import { useState, useEffect } from "react";

export function FontSizeToggle() {
	const [isBase, setIsBase] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem("cv-text-size") === "base";
	});

	// Sync DOM class — pure side effect, no setState
	useEffect(() => {
		if (isBase) {
			document.body.classList.add("cv-text-base");
		} else {
			document.body.classList.remove("cv-text-base");
		}
	}, [isBase]);

	const toggle = () => {
		const next = !isBase;
		setIsBase(next);
		localStorage.setItem("cv-text-size", next ? "base" : "xs");
	};

	return (
		<button
			type="button"
			onClick={toggle}
			className="leading-none transition-colors"
			title={isBase ? "Switch to compact text" : "Switch to larger text"}
		>
			<span className={isBase ? "text-muted-foreground/30" : "text-foreground/50"} style={{ fontSize: "0.8em" }}>
				a
			</span>
			<span className={isBase ? "text-foreground/50" : "text-muted-foreground/30"}>
				A
			</span>
		</button>
	);
}
