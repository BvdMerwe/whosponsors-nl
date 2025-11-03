import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.css";
import type { ReactElement } from "react";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Who Sponsors - NL",
    description: "Find companies that sponsor highly skilled migrant visas in The Netherlands.",
};

export default function RootLayout(
    { children }: Readonly<{ children: React.ReactNode }>,
): ReactElement {
    return (
        <html lang="en">
            <head>
                <script defer src="https://overarch.bernardus.dev/overarch" data-website-id="6486239e-c986-4126-8bb9-587492d237c6"></script>
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
