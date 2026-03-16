import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const fontVariableClasses = `${geistSans.variable} ${geistMono.variable}`;

export function FontProvider({ children }: { children: ReactNode }) {
	return <>{children}</>;
}
