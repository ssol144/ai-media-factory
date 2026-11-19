import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = { title: "AI Media Factory", description: "AI 기반 멀티채널 콘텐츠 운영 스튜디오" };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
