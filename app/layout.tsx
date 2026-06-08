import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CategoryNav } from "@/components/category-nav";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Parcel",
	description: "A satisfying shopping and delivery simulator.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
			<body className="min-h-full bg-white text-[#211922]">
				<StoreProvider>
					<Header />
					<CategoryNav />
					{children}
					<footer className="mt-16 border-t border-[#e5e5e0] bg-[#fbfbf9] px-4 py-10 text-center text-sm text-[#62625b]">
						<p className="font-bold text-[#211922]">Parcel is a shopping simulator.</p>
						<p className="mt-1">Nothing here is sold, charged, shipped, or emailed. Enjoy responsibly.</p>
					</footer>
				</StoreProvider>
			</body>
		</html>
	);
}
