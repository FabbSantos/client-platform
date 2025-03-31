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
  title: 'Plataforma de Envio SMS',
  description: 'Uma plataforma para envio de SMS em massa',
  icons: {
    icon: '/vercel.svg',
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
