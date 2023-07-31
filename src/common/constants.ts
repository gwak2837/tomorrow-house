// 자동
export const NODE_ENV = process.env.NODE_ENV as string
const NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL as string
const NEXT_PUBLIC_VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV as string

// 공통
export const NEXT_PUBLIC_SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL as string

// OAuth
export const KAKAO_OAUTH_REST_API_KEY = process.env.KAKAO_OAUTH_REST_API_KEY as string
export const KAKAO_OAUTH_CLIENT_ID = process.env.KAKAO_OAUTH_CLIENT_ID as string
export const KAKAO_OAUTH_REDIRECT_URI = process.env.KAKAO_OAUTH_REDIRECT_URI as string

//
export const PROJECT_ENV = process.env.PROJECT_ENV as string
export const REVALIDATION_KEY = process.env.REVALIDATION_KEY as string

export const NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY = process.env
  .NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY as string

// 개별
export const NEXT_PUBLIC_GA_ID = process.env.NEXT_PUBLIC_GA_ID as string
