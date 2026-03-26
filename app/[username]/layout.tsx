export default function UserLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen px-6 py-8 max-w-2xl mx-auto">
			{children}
		</div>
	);
}
