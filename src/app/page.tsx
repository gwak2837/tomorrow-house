import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-screen-md p-4">
      <Link href="/image/upload">이미지</Link>
    </main>
  )
}
