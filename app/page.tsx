import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
			<div className="text-center">
				<h1 className="font-semibold text-xl">webcv</h1>
				<p className="mt-3 text-muted-foreground">
					Create and share your resume in minutes
				</p>
			</div>
			<div className="flex gap-4">
				<Button asChild>
					<Link href="/signup">Sign Up</Link>
				</Button>
				<Button variant="ghost" asChild>
					<Link href="/login">Log In</Link>
				</Button>
			</div>
		</main>
	);
}
