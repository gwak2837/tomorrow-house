import Link from 'next/link'
import { ReactNode } from 'react'
import Logo from 'src/svgs/Logo'
import PictureLogo from 'src/svgs/PictureLogo'

import Gallery from './Gallery'
import LoginInfo from './LoginInfo'
import ShowAll from './ShowAll'

type Props = {
  children: ReactNode
}

export default function Layout(props: Props) {
  return (
    <main className="mx-auto max-w-screen-md p-4">
      <div className="flex justify-between items-center gap-2 my-8">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex gap-2">
          <LoginInfo />
        </div>
      </div>

      {props.children}

      <div className="flex justify-between items-center gap-2 my-4">
        <div className="flex items-center gap-2">
          <PictureLogo />
          <h3 className="text-lg">갤러리</h3>
        </div>
        <Link href="/image/all">
          <ShowAll />
        </Link>
      </div>

      <Gallery />
    </main>
  )
}
