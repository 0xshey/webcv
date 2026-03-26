"use client";

import { Eye, EyeOff } from "lucide-react";
import { useResume } from "@/components/providers/resume-provider";
import { Button } from "@/components/ui/button";
import type { SectionKey } from "@/lib/types";

const SECTION_LABELS: Record<SectionKey, string> = {
	basics: "Basics",
	work: "Work Experience",
	education: "Education",
	skills: "Skills",
	projects: "Projects",
	volunteer: "Volunteer",
	awards: "Awards",
	publications: "Publications",
	languages: "Languages",
	interests: "Interests",
	references: "References",
	certificates: "Certificates",
};

interface SectionHeaderProps {
	sectionKey: SectionKey;
	visible: boolean;
}

export function SectionHeader({ sectionKey, visible }: SectionHeaderProps) {
	const { dispatch, isEditMode } = useResume();

	return (
		<div className="flex items-center gap-2 group/header">
			<h2 className="font-medium">{SECTION_LABELS[sectionKey]}</h2>
			{isEditMode && sectionKey !== "basics" && (
				<Button
					variant="ghost"
					className="opacity-0 group-hover/header:opacity-100 transition-opacity"
					onClick={() =>
						dispatch({ type: "TOGGLE_SECTION", key: sectionKey })
					}
					title={visible ? "Hide section" : "Show section"}
				>
					{visible ? <Eye size={11} /> : <EyeOff size={11} />}
				</Button>
			)}
		</div>
	);
}
