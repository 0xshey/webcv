import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ResumeProvider } from "@/components/providers/resume-provider";
import { Navigator } from "@/components/dashboard/navigator";
import { Resume } from "@/components/resume/resume";
import { PublicResume } from "@/components/resume/public-resume";
import type { ResumeContent, ResumeStructure } from "@/lib/types";

const DEFAULT_CONTENT: ResumeContent = {
	basics: { name: "", email: "", summary: "" },
};

const DEFAULT_STRUCTURE: ResumeStructure = {
	sections: [
		{ key: "basics", visible: true },
		{ key: "work", visible: true },
		{ key: "education", visible: true },
		{ key: "skills", visible: true },
		{ key: "projects", visible: false },
		{ key: "volunteer", visible: false },
		{ key: "awards", visible: false },
		{ key: "certificates", visible: false },
		{ key: "publications", visible: false },
		{ key: "languages", visible: false },
		{ key: "interests", visible: false },
		{ key: "references", visible: false },
	],
	layout: { columns: 1 },
};

interface PageProps {
	params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { username } = await params;
	const supabase = await createClient();

	const { data: profile } = await supabase
		.from("profiles")
		.select("user_id")
		.eq("username", username)
		.single();

	if (!profile) return { title: "Not Found" };

	const { data: resume } = await supabase
		.from("resumes")
		.select("content")
		.eq("user_id", profile.user_id)
		.single();

	const content = resume?.content as ResumeContent | undefined;
	const name = content?.basics?.name ?? username;
	const summary = content?.basics?.summary
		? content.basics.summary.replace(/<[^>]+>/g, "").slice(0, 160)
		: undefined;

	return {
		title: `${name} — Resume`,
		description: summary,
	};
}

export default async function UserResumePage({ params }: PageProps) {
	const { username } = await params;
	const supabase = await createClient();

	const [{ data: { user } }, { data: profile }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.from("profiles").select("user_id").eq("username", username).single(),
	]);

	if (!profile) notFound();

	const { data: resume } = await supabase
		.from("resumes")
		.select("*")
		.eq("user_id", profile.user_id)
		.single();

	if (!resume) notFound();

	const content = (resume.content as ResumeContent) ?? DEFAULT_CONTENT;
	const structure = (resume.structure as ResumeStructure) ?? DEFAULT_STRUCTURE;
	const isOwner = !!user && user.id === profile.user_id;

	if (isOwner) {
		return (
			<Suspense>
				<ResumeProvider
					initialContent={content}
					initialStructure={structure}
					resumeId={resume.id as string}
				>
					<Navigator />
					<Resume />
				</ResumeProvider>
			</Suspense>
		);
	}

	return <PublicResume content={content} structure={structure} />;
}
