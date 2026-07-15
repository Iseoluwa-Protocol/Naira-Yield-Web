import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Naira-Yield - Stellar Stablecoin Yield Protocol',
  description: 'Maximize yield on your Naira-stablecoins (NGNC) with automated on-chain Soroban vaults. Governed by Iseoluwa-Protocol.',
  authors: [{ name: 'AlAfiz' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
