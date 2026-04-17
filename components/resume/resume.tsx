"use client";

import { useState } from "react";
import { Pencil, Save, Download } from "lucide-react";
import { useResume } from "@/components/providers/resume-provider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section/header";
import { BasicsEditor } from "./basics/editor";
import { SortableSection } from "./section/sortable";
import { PdfSettingsDialog } from "./pdf/pdf-settings-dialog";
import {
	BLOCK_COMPONENTS,
	LinkCapsule,
	EmailCapsule,
	PhoneCapsule,
} from "./block/view";
import { RichTextDisplay } from "./rich-text/display";
import type { SectionKey } from "@/lib/types";

function BasicsView() {
	const { content } = useResume();
	const { basics } = content;
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl">
					{basics.name || "Your Name"}
				</h1>
				{basics.label && (
					<p className="text-muted-foreground">{basics.label}</p>
				)}
			</div>
			<div className="flex flex-wrap gap-2 mt-1">
				{basics.email && <EmailCapsule email={basics.email} />}
				{basics.phone && <PhoneCapsule phone={basics.phone} />}
				{basics.url && <LinkCapsule href={basics.url} />}
			</div>
			{basics.summary && (
				<div className="mt-4">
					<RichTextDisplay html={basics.summary} />
				</div>
			)}
		</div>
	);
}

function SectionContent({
	sectionKey,
}: {
	sectionKey: Exclude<SectionKey, "basics">;
}) {
	const { content, isEditMode } = useResume();

	type BlockItem = { id: string } & Record<string, unknown>;
	const items = ((content[sectionKey] as BlockItem[] | undefined) ??
		[]) as BlockItem[];

	if (isEditMode) {
		return <SortableSection section={sectionKey} items={items} />;
	}

	if (items.length === 0) return null;

	const BlockComponent = BLOCK_COMPONENTS[sectionKey];
	return (
		<div className="flex flex-col gap-5">
			{items.map((item) => (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				<BlockComponent key={item.id} item={item as any} />
			))}
		</div>
	);
}

export function Resume() {
	const {
		content,
		structure,
		isEditMode,
		isSaving,
		toggleEditMode,
		saveAndExit,
	} = useResume();

	const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

	return (
		<div className="flex flex-col gap-8">
			{/* Actions bar */}
			<div className="flex items-center justify-between">
				<div>
					{!isEditMode && (
						<Button
							variant="secondary"
							onClick={() => setPdfDialogOpen(true)}
						>
							<Download />
							Download
						</Button>
					)}
				</div>

				<div className="flex items-center gap-4">
					{isEditMode ? (
						<Button
							variant="default"
							onClick={saveAndExit}
							disabled={isSaving}
						>
							<Save />
							{isSaving ? "Saving…" : "Save"}
						</Button>
					) : (
						<Button variant="default" onClick={toggleEditMode}>
							<Pencil />
							Edit
						</Button>
					)}
				</div>
			</div>

			<PdfSettingsDialog
				open={pdfDialogOpen}
				onOpenChange={setPdfDialogOpen}
				content={content}
				structure={structure}
			/>

			{/* Resume content */}
			<div
				className={`flex flex-col ${isEditMode ? "gap-12" : "gap-10"}`}
			>
				<div className="flex flex-col gap-3">
					{isEditMode && (
						<SectionHeader sectionKey="basics" visible />
					)}
					{isEditMode ? <BasicsEditor /> : <BasicsView />}
				</div>

				{structure.sections
					.filter((s) => s.key !== "basics")
					.map((s) => {
						const sectionKey = s.key as Exclude<
							SectionKey,
							"basics"
						>;
						const items =
							(content[sectionKey] as unknown[] | undefined) ??
							[];

						if (!isEditMode && (!s.visible || items.length === 0))
							return null;

						return (
							<div
								key={s.key}
								className={`flex flex-col gap-4 ${!s.visible && isEditMode ? "opacity-35" : ""}`}
							>
								<SectionHeader
									sectionKey={s.key}
									visible={s.visible}
									itemCount={items.length}
								/>
								<SectionContent sectionKey={sectionKey} />
							</div>
						);
					})}
			</div>
		</div>
	);
}
