import { Globe } from "lucide-react";
import { formatDate } from "@/lib/resume";
import type {
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

export function LinkCapsule({ href }: { href: string }) {
	const display = href.replace(/^https?:\/\//, "").replace(/\/$/, "");
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center gap-1 bg-muted/70 hover:bg-muted rounded-full px-2 py-0.5 transition-colors leading-none"
		>
			<Globe
				size={9}
				className="shrink-0 text-muted-foreground/60 translate-y-px"
			/>
			<span className="text-muted-foreground">{display}</span>
		</a>
	);
}

function DateRange({ start, end }: { start?: string; end?: string }) {
	if (!start && !end) return null;
	return (
		<span className="text-muted-foreground shrink-0">
			{formatDate(start)} – {end ? formatDate(end) : "Present"}
		</span>
	);
}

export function WorkBlock({ item }: { item: ResumeWorkItem }) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1 pl-2">
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
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1 pl-2">
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
		<div className="flex flex-col gap-2 pl-2">
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
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap pl-2">
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
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex flex-col gap-1 pl-2">
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
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<p className="pl-2">{item.title}</p>
				<span className="text-muted-foreground shrink-0">
					{formatDate(item.date)}
				</span>
			</div>
			<p className="text-muted-foreground pl-2">{item.awarder}</p>
			{item.summary && <p className="pl-2">{item.summary}</p>}
		</div>
	);
}

export function PublicationBlock({ item }: { item: ResumePublicationItem }) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap pl-2">
					<p className="">{item.name}</p>
					{item.url && <LinkCapsule href={item.url} />}
				</div>
				<span className="text-muted-foreground shrink-0">
					{formatDate(item.releaseDate)}
				</span>
			</div>
			<p className="text-muted-foreground pl-2">{item.publisher}</p>
			{item.summary && <p className="pl-2">{item.summary}</p>}
		</div>
	);
}

export function LanguageBlock({ item }: { item: ResumeLanguageItem }) {
	return (
		<div className="flex items-center gap-2 pl-2">
			<span className="">{item.language}</span>
			<span className="text-muted-foreground">· {item.fluency}</span>
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
		<div className="flex flex-col gap-1 pl-2">
			<span className="">{item.name}</span>
			{keywords.length > 0 && (
				<p className="text-muted-foreground">{keywords.join(", ")}</p>
			)}
		</div>
	);
}

export function ReferenceBlock({ item }: { item: ResumeReferenceItem }) {
	return (
		<div className="flex flex-col gap-2 pl-2">
			<p className="">{item.name}</p>
			<p>{item.reference}</p>
		</div>
	);
}

export function CertificateBlock({ item }: { item: ResumeCertificateItem }) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 flex-wrap pl-2">
					<p className="">{item.name}</p>
					{item.url && <LinkCapsule href={item.url} />}
				</div>
				{item.date && (
					<span className="text-muted-foreground shrink-0">
						{formatDate(item.date)}
					</span>
				)}
			</div>
			<p className="text-muted-foreground pl-2">{item.issuer}</p>
		</div>
	);
}
