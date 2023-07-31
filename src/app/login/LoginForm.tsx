'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSetRecoilState } from 'recoil'
import { NEXT_PUBLIC_SERVER_API_URL } from 'src/common/constants'
import LoadingSpinner from 'src/svgs/LoadingSpinner'

import { userAtom } from '../image/LoginInfo'

export default function LoginForm() {
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const [isEmailError, setIsEmailError] = useState(false)

  const [loading, setLoading] = useState(false)

  const setUser = useSetRecoilState(userAtom)

  const router = useRouter()

  async function login(e: FormEvent) {
    e.preventDefault()

    if (!emailInputRef.current || !passwordInputRef.current) return

    const email = emailInputRef.current.value

    if (!validateEmail(email)) {
      setIsEmailError(true)
      return toast.error('Please enter a valid email')
    } else {
      setIsEmailError(false)
    }

    setLoading(true)

    const response = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: passwordInputRef.current.value,
      }),
    })

    if (!response.ok) return toast.error(await response.text())

    const result = await response.json()

    localStorage.setItem('accessToken', result.accessToken)
    localStorage.setItem('refreshToken', result.refreshToken)

    setUser(result.user)

    toast.success('로그인 성공')

    router.replace(sessionStorage.getItem('redirectionAfterLogin') ?? '/')
  }

  return (
    <form onSubmit={login}>
      <label className="my-4 block text-base text-stone-50">
        이메일
        <input
          autoFocus
          className={
            'mt-2 w-full rounded-2xl border bg-stone-800 px-4 py-3 ' +
            (isEmailError ? 'border-red-500' : 'border-stone-700')
          }
          name="email"
          placeholder="이메일을 입력해주세요."
          ref={emailInputRef}
          type="email"
        />
      </label>
      <label className="my-4 block text-base text-stone-50">
        비밀번호
        <input
          className="mt-2 w-full rounded-2xl border bg-stone-800 px-4 py-3 border-stone-700"
          name="password"
          placeholder="비밀번호를 입력해주세요."
          ref={passwordInputRef}
          type="password"
        />
      </label>
      <button
        className="flex gap-2 justify-center items-center rounded-lg bg-indigo-500 px-6 font-semibold text-white transition-colors duration-300 w-full py-4 text-xl mt-8 hover:bg-indigo-700 disabled:bg-slate-400"
        disabled={loading}
        type="submit"
      >
        {loading && <LoadingSpinner />}
        로그인
      </button>
    </form>
  )
}

function validateEmail(email: string) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}
