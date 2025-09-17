'use client'

import { usePathname } from 'next/navigation'
import Footer from './footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't render footer on upload page
  if (pathname.startsWith('/upload')) {
    return null
  }
  
  return <Footer />
} 