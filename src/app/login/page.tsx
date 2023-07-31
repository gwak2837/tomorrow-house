import Image from 'next/image'
import Link from 'next/link'
import KakaoButton from 'src/components/atom/KakaoButton'
import Logo from 'src/svgs/Logo'

import LoginForm from './LoginForm'

export default async function Page() {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4"
      id="modal-setter"
    >
      <div className="w-full max-w-md flex-col">
        <div className="flex flex-col items-center justify-center">
          <Link href="/">
            <Logo width={168} />
          </Link>
          <h2 className="mt-2 translate-y-px text-lg font-medium text-stone-300">로그인</h2>
        </div>

        <LoginForm />

        <p className="mt-4 text-center text-sm text-stone-400">
          HOMI AI가 처음이신가요?{' '}
          <a
            href="https://app.planby.us/signup"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-stone-200"
          >
            회원가입
          </a>
        </p>
      </div>
      <div className="mt-4 h-0.5 w-full max-w-md bg-stone-700"></div>
      <p className="mt-4 text-center text-lg font-medium text-stone-300">소셜 로그인</p>
      <div className="mt-4 flex justify-around">
        <a
          href={`https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URI}&response_type=code`}
        >
          <button className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-400 bg-[#FEE500]">
            <div className="scale-75">
              <svg width="30" height="33.765" viewBox="30 29.97 36 33.765">
                <path
                  d="M48 29.97c-9.942 0-18 6.256-18 13.973 0 4.798 3.117 9.03 7.863 11.546l-1.997 7.33c-.177.65.56 1.165 1.127.79l8.754-5.806c.738.071 1.49.113 2.253.113 9.941 0 18-6.257 18-13.973 0-7.717-8.059-13.973-18-13.973"
                  fill="#000000"
                  fillRule="evenodd"
                  data-name="Shape 2"
                />
              </svg>
            </div>
          </button>
        </a>
      </div>
    </div>
  )
}
