"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Pencil, Eye } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useResume } from "@/components/providers/resume-provider";

const PDFDownloadButton = dynamic(
	() =>
		import("@/components/resume/pdf/pdf-download-button").then(
			(m) => m.PDFDownloadButton,
		),
	{ ssr: false, loading: () => null },
);

export function DashboardShell({
	username,
	children,
}: {
	username: string;
	children: ReactNode;
}) {
	const { signOut } = useAuth();
	const { isSaving, isDirty, isEditMode, toggleEditMode } = useResume();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	return (
		<>
			<div className="w-full p-8 space-y-2">
				<header className="w-full max-w-2xl mx-auto flex justify-between items-center p-2 border rounded">
					<div className="flex items-center gap-3">
						<span className="font-medium text-sm">webcv</span>
						{username && (
							<Button asChild variant={"default"} size={"sm"}>
								<Link href={`/${username}`} target="_blank">
									<span>/{username}</span>
								</Link>
							</Button>
						)}
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">
							{isSaving
								? "Saving…"
								: isDirty
									? "Unsaved"
									: "Saved"}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleEditMode}
							className="gap-1"
						>
							{isEditMode ? (
								<Eye size={14} />
							) : (
								<Pencil size={14} />
							)}
							{isEditMode ? "Preview" : "Edit"}
						</Button>
						<PDFDownloadButton />
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={handleSignOut}
							title="Sign out"
						>
							<LogOut size={14} />
						</Button>
					</div>
				</header>
				<main className="flex-1 border max-w-2xl mx-auto p-4">
					{children}
				</main>
			</div>
		</>
	);
}
