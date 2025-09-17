'use client'

import { usePathname } from 'next/navigation'
import ConditionalHeader from './conditional-header'
import ConditionalFooter from './conditional-footer'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isChatPage = pathname.startsWith('/chat')
  const isProcessingPage = pathname.startsWith('/processing')
  const isHistoryPage = pathname.startsWith('/history')
  const isManagePlanPage = pathname.startsWith('/mange-plan')
  return (
    <>
      {!isManagePlanPage && !isChatPage && !isHistoryPage && !isProcessingPage && <ConditionalHeader />}
      <main>
        {children}
      </main>
      {!isManagePlanPage && !isChatPage && !isHistoryPage && !isProcessingPage && <ConditionalFooter />}
    </>
  )
} 