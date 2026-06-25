import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "DataForge — Universal Dataset Converter",
  description: "Convert between 13+ dataset formats instantly. CSV, JSON, Parquet, Excel, XML, YAML, SQLite, and more — all in your browser.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="bg-grid"></div>
        <div className="bg-glow bg-glow--1"></div>
        <div className="bg-glow bg-glow--2"></div>
        <div className="bg-glow bg-glow--3"></div>
        <div className="toast-container" id="toastContainer"></div>
        {children}
      </body>
    </html>
  );
}
