import './globals.css'

import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ReactNode } from 'react'
import GoogleAnalytics from 'src/components/GoogleAnalytics'
import ReactHotToast from 'src/components/ReactHotToast'
import ReactQuery from 'src/components/ReactQuery'
import Recoil from 'src/components/Recoil'

export const metadata: Metadata = {
  title: '내일의집',
  description: 'AI가 만드는 내일의 인테리어를 경험해보세요',
}

const myFont = localFont({
  src: './PretendardVariable.woff2',
  fallback: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Malgun Gothic',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'sans-serif',
  ],
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko-KR">
      <body className={myFont.className}>
        <Recoil>
          <ReactQuery>{children}</ReactQuery>
        </Recoil>
        <ReactHotToast />
      </body>
      <Analytics />
      <GoogleAnalytics />
    </html>
  )
}
