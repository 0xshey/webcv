import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { FontProvider, fontVariableClasses } from "@/components/providers/font-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
	title: "Resume Builder",
	description: "Build and share your resume online",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${fontVariableClasses} font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<FontProvider>
						<Providers>{children}</Providers>
					</FontProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
