import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://skills.911fund.io'),
  title: {
    default: 'Skill of Skills - Claude Code Directory',
    template: '%s | Skill of Skills',
  },
  description:
    'Discover 100+ tools for Claude Code: skills, plugins, MCP servers, and more. The autonomous discovery engine for the Claude Code ecosystem.',
  keywords: [
    'Claude Code',
    'MCP servers',
    'AI tools',
    'skills',
    'plugins',
    'Anthropic',
    'Claude',
    'AI development',
    'developer tools',
  ],
  authors: [{ name: '911fund' }],
  openGraph: {
    title: 'Skill of Skills - Claude Code Directory',
    description:
      'Discover tools for Claude Code: skills, plugins, MCP servers',
    url: 'https://skills.911fund.io',
    siteName: 'Skill of Skills',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Skill of Skills - Claude Code Directory',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill of Skills - Claude Code Directory',
    description:
      'Discover tools for Claude Code: skills, plugins, MCP servers',
    images: ['/og-image.png'],
    creator: '@911fund',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
