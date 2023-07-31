'use client'

import Link from 'next/link'
import { atom, useRecoilValue } from 'recoil'
import SettingIcon from 'src/svgs/SettingIcon'

// async function

export default function LoginInfo() {
  const user = useRecoilValue(userAtom)

  return (
    <>
      {user ? (
        <>
          <div>{user.name}</div>
          <SettingIcon />
        </>
      ) : (
        <>
          <Link href="/login">로그인</Link>
        </>
      )}
    </>
  )
}

type User = Record<string, any>

export const userAtom = atom<User | null>({
  key: 'userAtom',
  default: null,
})
