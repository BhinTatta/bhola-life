"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { motion } from "framer-motion";
import FallingBackground from "./components/FallingBackground";
import AnaglyphEffectComponent from "./components/BackGround3D/AnaglyphEffectComponent";
import TwoFaceComponent from "./components/BackGround3D/TwoFace";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TwoFaceComponent />
        <FallingBackground />

        <AnaglyphEffectComponent />
        <motion.div
          animate={{
            x: [0, 20, -30, 0], // Moves left and right
            y: [0, -10, 10, 0], // Moves up and down
            rotate: [0, 10, -10, 0], // Rotates back and forth
            scale: [1, 1.05, 0.95, 1], // Slight zoom in and out
          }}
          transition={{
            duration: 12, // Duration of one full loop
            repeat: Infinity, // Repeat the animation indefinitely
            ease: "easeInOut", // Smooth transition for all animations
          }}
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          {children}
        </motion.div>
      </body>
    </html>
  );
}
