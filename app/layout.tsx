import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'OPC · 你来领航，AI 机组协同完成',
  description: 'Orange Pilot Crew AI 工作空间。从一个想法到一份成果，让研究、创作与执行协同起来。你来领航，我们来执行。',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
