import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./brand.css";
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const title = "Mohammed Vasi Khan | Machine Learning Engineer";
const description = "Explore the neural district: machine learning experiments, data systems, and real-world AI work by Mohammed Vasi Khan.";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
export const metadata = {
  metadataBase: new URL(siteOrigin), title, description,
  openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1731, height: 909, alt: "Mohammed Vasi Khan — Machine Learning Engineer, a connected neural world" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};
export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body></html>;
}
