interface RichTextDisplayProps {
	html: string;
	className?: string;
}

export function RichTextDisplay({ html, className }: RichTextDisplayProps) {
	return (
		<div
			className={`[&_ul]:list-disc [&_ul]:pl-4 [&_ul_li::marker]:text-[0.6em] [&_p+p]:mt-[0.8em] ${className ?? ""}`}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
