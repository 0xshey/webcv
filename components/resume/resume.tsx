"use client";

import dynamic from "next/dynamic";
import { Pencil, Save, Download } from "lucide-react";
import { useResume } from "@/components/providers/resume-provider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section/header";
import { BasicsEditor } from "./basics/editor";
import { SortableSection } from "./section/sortable";
import {
	WorkBlock,
	EducationBlock,
	SkillBlock,
	ProjectBlock,
	VolunteerBlock,
	AwardBlock,
	PublicationBlock,
	LanguageBlock,
	InterestBlock,
	ReferenceBlock,
	CertificateBlock,
	LinkCapsule,
	EmailCapsule,
	PhoneCapsule,
} from "./block/view";
import { RichTextDisplay } from "./rich-text/display";
import type {
	SectionKey,
	ResumeWorkItem,
	ResumeEducationItem,
	ResumeSkillItem,
	ResumeProjectItem,
	ResumeVolunteerItem,
	ResumeAwardItem,
	ResumePublicationItem,
	ResumeLanguageItem,
	ResumeInterestItem,
	ResumeReferenceItem,
	ResumeCertificateItem,
} from "@/lib/types";

const PdfLink = dynamic(() => import("./pdf/pdf-link").then((m) => m.PdfLink), {
	ssr: false,
	loading: () => null,
});

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

	return (
		<div className="flex flex-col gap-5">
			{sectionKey === "work" &&
				(items as unknown as ResumeWorkItem[]).map((item) => (
					<WorkBlock key={item.id} item={item} />
				))}
			{sectionKey === "education" &&
				(items as unknown as ResumeEducationItem[]).map((item) => (
					<EducationBlock key={item.id} item={item} />
				))}
			{sectionKey === "skills" &&
				(items as unknown as ResumeSkillItem[]).map((item) => (
					<SkillBlock key={item.id} item={item} />
				))}
			{sectionKey === "projects" &&
				(items as unknown as ResumeProjectItem[]).map((item) => (
					<ProjectBlock key={item.id} item={item} />
				))}
			{sectionKey === "volunteer" &&
				(items as unknown as ResumeVolunteerItem[]).map((item) => (
					<VolunteerBlock key={item.id} item={item} />
				))}
			{sectionKey === "awards" &&
				(items as unknown as ResumeAwardItem[]).map((item) => (
					<AwardBlock key={item.id} item={item} />
				))}
			{sectionKey === "publications" &&
				(items as unknown as ResumePublicationItem[]).map((item) => (
					<PublicationBlock key={item.id} item={item} />
				))}
			{sectionKey === "languages" &&
				(items as unknown as ResumeLanguageItem[]).map((item) => (
					<LanguageBlock key={item.id} item={item} />
				))}
			{sectionKey === "interests" &&
				(items as unknown as ResumeInterestItem[]).map((item) => (
					<InterestBlock key={item.id} item={item} />
				))}
			{sectionKey === "references" &&
				(items as unknown as ResumeReferenceItem[]).map((item) => (
					<ReferenceBlock key={item.id} item={item} />
				))}
			{sectionKey === "certificates" &&
				(items as unknown as ResumeCertificateItem[]).map((item) => (
					<CertificateBlock key={item.id} item={item} />
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

	return (
		<div className="flex flex-col gap-8">
			{/* Actions bar */}
			<div className="flex items-center justify-between">
				<div>
					{!isEditMode && (
						<PdfLink content={content} structure={structure}>
							{({ loading }) => (
								<Button variant="secondary" disabled={loading}>
									<Download />
									{loading ? "Preparing…" : "Download"}
								</Button>
							)}
						</PdfLink>
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
