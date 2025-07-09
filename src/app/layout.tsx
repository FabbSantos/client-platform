import './globals.css'
import type { Metadata } from 'next'
import { Comfortaa } from 'next/font/google'
import { AnimatePresence } from 'framer-motion'

// Configuração da fonte Comfortaa
const comfortaa = Comfortaa({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-comfortaa'
});

export const metadata: Metadata = {
  title: 'Tauro Digital - Plataforma SMS',
  description: 'A sua plataforma completa para envio de SMS em massa',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={comfortaa.className}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </body>
    </html>
  )
}
