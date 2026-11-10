import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppearanceProvider from "@/components/AppearanceProvider";
import ConfirmationProvider from "@/components/ConfirmationProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Learning Tracker",
    description: "A personal workspace for everything you learn.",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            data-theme="dark"
            data-theme-preset="black"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full w-full"><AppearanceProvider><ConfirmationProvider>{children}</ConfirmationProvider></AppearanceProvider></body>
        </html>
    );
}
