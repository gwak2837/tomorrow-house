'use client'

import { useSetRecoilState } from 'recoil'

import { userAtom } from './image/LoginInfo'

export default function Authentication() {
  const setUser = useSetRecoilState(userAtom)

  return <></>
}
