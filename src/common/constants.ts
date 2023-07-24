// 자동
export const NODE_ENV = process.env.NODE_ENV as string
const NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL as string
const NEXT_PUBLIC_VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV as string

// 공통
export const PROJECT_ENV = process.env.PROJECT_ENV as string
export const REVALIDATION_KEY = process.env.REVALIDATION_KEY as string

export const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string

export const NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY = process.env
  .NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY as string

// 개별
export const NEXT_PUBLIC_GA_ID = process.env.NEXT_PUBLIC_GA_ID as string
