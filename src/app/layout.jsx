import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
export const metadata = { title: "Mohammed Vasi Khan | Machine Learning Engineer", description: "Machine learning experiments, data systems, and real-world AI work by Mohammed Vasi Khan." };
export default function RootLayout({ children }) { return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>; }
