'use client'

import { usePathname } from 'next/navigation'
import Header from './header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't render header on upload page since it has its own header
  if (pathname.startsWith('/upload')) {
    return null
  }
  
  return <Header />
} 