'use client'

import { usePathname } from 'next/navigation'

export default function ShowAll() {
  const pathname = usePathname()

  return pathname === '/image/all' ? null : <div className="text-stone-400">전체 보기</div>
}
