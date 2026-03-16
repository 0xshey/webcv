"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useResume } from "@/components/providers/resume-provider";
import { useSizeMode } from "@/components/providers/size-mode-provider";
import { Button } from "@/components/ui/button";
import { SettingsMenu } from "./settings-menu";

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
	const { mode } = useSizeMode();
	const router = useRouter();
	const btnSize: "xs" | "sm" = mode === "compact" ? "xs" : "sm";
	const iconSize: "icon-xs" | "icon-sm" =
		mode === "compact" ? "icon-xs" : "icon-sm";

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	return (
		<div className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
			<header className="flex items-center justify-between mb-12">
				{/* Left — identity */}
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground/30">webcv</span>
					{username && (
						<Button
							asChild
							variant="ghost"
							size={btnSize}
							className="text-muted-foreground/60 gap-1"
						>
							<Link href={`/${username}`} target="_blank">
								/{username}
							</Link>
						</Button>
					)}
				</div>

				{/* Right — controls */}
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground/40 tabular-nums px-2">
						{isSaving ? "Saving…" : isDirty ? "Unsaved" : "Saved"}
					</span>

					<SettingsMenu />

					<Button
						variant="ghost"
						size={btnSize}
						onClick={toggleEditMode}
						className={
							isEditMode ? "font-medium" : "text-muted-foreground"
						}
					>
						{isEditMode ? "Done" : "Edit"}
					</Button>

					<PDFDownloadButton />

					<Button
						variant="ghost"
						size={iconSize}
						onClick={handleSignOut}
						title="Sign out"
						className="text-muted-foreground"
					>
						<LogOut size={13} />
					</Button>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
}
