"use client";

import { useState } from "react";
import { Globe, Mail, Phone, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatDateShort } from "@/lib/resume";
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
import { RichTextDisplay } from "../rich-text/display";

const capsuleClass = "group inline-flex items-center gap-1.5 bg-muted/50 hover:bg-muted/90 rounded-full px-2.5 py-1 transition-colors text-xs text-muted-foreground";

export function LinkCapsule({ href }: { href: string }) {
	const display = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
	const [hovered, setHovered] = useState(false);
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={capsuleClass}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<span className="relative size-[10px] shrink-0">
				<AnimatePresence initial={false} mode="wait">
					{hovered ? (
						<motion.span
							key="arrow"
							className="absolute inset-0 flex items-center justify-center"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.12 }}
						>
							<ArrowUpRight size={10} />
						</motion.span>
					) : (
						<motion.span
							key="globe"
							className="absolute inset-0 flex items-center justify-center text-muted-foreground/50"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.12 }}
						>
							<Globe size={10} />
						</motion.span>
					)}
				</AnimatePresence>
			</span>
			<span>{display}</span>
		</a>
	);
}

export function EmailCapsule({ email }: { email: string }) {
	return (
		<a href={`mailto:${email}`} className={capsuleClass}>
			<Mail size={10} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
			<span>{email}</span>
		</a>
	);
}

export function PhoneCapsule({ phone }: { phone: string }) {
	return (
		<a href={`tel:${phone}`} className={capsuleClass}>
			<Phone size={10} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
			<span>{phone}</span>
		</a>
	);
}

function DateRange({ start, end }: { start?: string; end?: string }) {
	if (!start && !end) return null;
	const endLabel = end ? formatDate(end) : "Present";
	const endShortLabel = end ? formatDateShort(end) : "Present";
	return (
		<span className="text-muted-foreground text-[0.85em] shrink-0">
			{/* Mobile: stacked short format */}
			<span className="flex flex-col items-end sm:hidden">
				<span>{formatDateShort(start)}</span>
				<span>– {endShortLabel}</span>
			</span>
			{/* Desktop: inline long format */}
			<span className="hidden sm:inline">{formatDate(start)} – {endLabel}</span>
		</span>
	);
}

function ShortDate({ date }: { date?: string }) {
	if (!date) return null;
	return (
		<span className="text-muted-foreground text-[0.85em] shrink-0">
			<span className="sm:hidden">{formatDateShort(date)}</span>
			<span className="hidden sm:inline">{formatDate(date)}</span>
		</span>
	);
}

export function WorkBlock({ item }: { item: ResumeWorkItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1">
					<p className="">{item.position}</p>
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-muted-foreground">{item.name}</p>
						{item.url && <LinkCapsule href={item.url} />}
					</div>
				</div>
				<DateRange start={item.startDate} end={item.endDate} />
			</div>
			{item.summary && <RichTextDisplay html={item.summary} />}
		</div>
	);
}

export function EducationBlock({ item }: { item: ResumeEducationItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1">
					<p className="">{item.studyType} in {item.area}</p>
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-muted-foreground">{item.institution}</p>
						{item.url && <LinkCapsule href={item.url} />}
					</div>
				</div>
				<DateRange start={item.startDate} end={item.endDate} />
			</div>
			{item.score && (
				<p className="text-muted-foreground">GPA: {item.score}</p>
			)}
		</div>
	);
}

export function SkillBlock({ item }: { item: ResumeSkillItem }) {
	const keywords = Array.isArray(item.keywords)
		? item.keywords
		: typeof item.keywords === "string" && item.keywords
			? (item.keywords as string)
					.split(",")
					.map((k) => k.trim())
					.filter(Boolean)
			: [];

	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-center gap-2">
				<span className="">{item.name}</span>
				{item.level && (
					<span className="text-muted-foreground">· {item.level}</span>
				)}
			</div>
			{keywords.length > 0 && (
				<p className="text-muted-foreground">{keywords.join(", ")}</p>
			)}
		</div>
	);
}

export function ProjectBlock({ item }: { item: ResumeProjectItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="">{item.name}</p>
					{item.url && <LinkCapsule href={item.url} />}
				</div>
				{(item.startDate ?? item.endDate) && (
					<DateRange start={item.startDate} end={item.endDate} />
				)}
			</div>
			{item.description && <RichTextDisplay html={item.description} />}
		</div>
	);
}

export function VolunteerBlock({ item }: { item: ResumeVolunteerItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1">
					<p className="">{item.position}</p>
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-muted-foreground">{item.organization}</p>
						{item.url && <LinkCapsule href={item.url} />}
					</div>
				</div>
				<DateRange start={item.startDate} end={item.endDate} />
			</div>
			{item.summary && <RichTextDisplay html={item.summary} />}
		</div>
	);
}

export function AwardBlock({ item }: { item: ResumeAwardItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<p className="">{item.title}</p>
				<ShortDate date={item.date} />
			</div>
			<p className="text-muted-foreground">{item.awarder}</p>
			{item.summary && <p>{item.summary}</p>}
		</div>
	);
}

export function PublicationBlock({ item }: { item: ResumePublicationItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="">{item.name}</p>
					{item.url && <LinkCapsule href={item.url} />}
				</div>
				<ShortDate date={item.releaseDate} />
			</div>
			<p className="text-muted-foreground">{item.publisher}</p>
			{item.summary && <p>{item.summary}</p>}
		</div>
	);
}

const FLUENCY_DESCRIPTIONS: Record<string, string> = {
	Basic: "A1-A2 (Basic User): Elementary understanding, simple phrases, basic daily interaction.",
	Independent: "B1-B2 (Independent User): Can handle everyday situations, express opinions, and work in the language with reasonable fluency.",
	Proficient: "C1-C2 (Proficient User): Highly skilled, fluent, spontaneous, and able to understand complex texts and nuances (C2 is near-native mastery).",
};

export function LanguageBlock({ item }: { item: ResumeLanguageItem }) {
	return (
		<div className="flex items-center gap-2 sm:pl-2">
			<span className="">{item.language}</span>
			<span
				className="text-muted-foreground"
				title={FLUENCY_DESCRIPTIONS[item.fluency ?? ""] ?? undefined}
			>
				· {item.fluency}
			</span>
		</div>
	);
}

export function InterestBlock({ item }: { item: ResumeInterestItem }) {
	const keywords = Array.isArray(item.keywords)
		? item.keywords
		: typeof item.keywords === "string" && item.keywords
			? (item.keywords as string)
					.split(",")
					.map((k) => k.trim())
					.filter(Boolean)
			: [];

	return (
		<div className="flex flex-col gap-1 sm:pl-2">
			<span className="">{item.name}</span>
			{keywords.length > 0 && (
				<p className="text-muted-foreground">{keywords.join(", ")}</p>
			)}
		</div>
	);
}

export function ReferenceBlock({ item }: { item: ResumeReferenceItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<p className="">{item.name}</p>
			<p>{item.reference}</p>
		</div>
	);
}

export function CertificateBlock({ item }: { item: ResumeCertificateItem }) {
	return (
		<div className="flex flex-col gap-2 sm:pl-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="">{item.name}</p>
					{item.url && <LinkCapsule href={item.url} />}
				</div>
				{item.date && <ShortDate date={item.date} />}
			</div>
			<p className="text-muted-foreground">{item.issuer}</p>
		</div>
	);
}

// Registry mapping section keys to their view components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_COMPONENTS: Record<Exclude<SectionKey, "basics">, React.ComponentType<{ item: any }>> = {
	work: WorkBlock,
	education: EducationBlock,
	skills: SkillBlock,
	projects: ProjectBlock,
	volunteer: VolunteerBlock,
	awards: AwardBlock,
	publications: PublicationBlock,
	languages: LanguageBlock,
	interests: InterestBlock,
	references: ReferenceBlock,
	certificates: CertificateBlock,
}
