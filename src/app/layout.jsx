import dynamic from "next/dynamic";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import Spotlight from "@/components/Spotlight";
import "./globals.css";

// Dynamic import for heavy 3D component
const Background3DScene = dynamic(() => import("@/components/Background3DScene"), {
  ssr: false,
  loading: () => null
});

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

export const metadata = {
  title: "Mohammed Vasi Khan | Machine Learning Engineer",
  description: "Portfolio of Mohammed Vasi Khan, focused on real-world AI systems and intelligent applications."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${body.variable} bg-hero-noise text-slate-100`}>
        <Background3DScene />
        <Spotlight />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
