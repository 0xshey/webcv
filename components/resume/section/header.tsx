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
	itemCount?: number;
}

export function SectionHeader({ sectionKey, visible, itemCount = 0 }: SectionHeaderProps) {
	const { dispatch, isEditMode } = useResume();
	const showToggle = isEditMode && sectionKey !== "basics" && (visible || itemCount > 0);

	return (
		<div className="flex items-center gap-2">
			<h2 className="font-medium">{SECTION_LABELS[sectionKey]}</h2>
			{showToggle && (
				<Button
					variant="ghost"
					className=""
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
