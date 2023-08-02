'use client'

import Image from 'next/image'
import { atom, useRecoilValue } from 'recoil'

export type TImage = {
  id: string
  url: string
  segmentation?: string
}

export const imagesAtom = atom<TImage[]>({
  key: 'imagesAtom',
  default: [],
})

export default function Gallery() {
  // 서버에서 가져오기
  // const { data } = useQuery({ key: 'gallery', fetch: () => fetch('/kljkljdsfas')})

  const images = useRecoilValue(imagesAtom)

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-8">
      {images?.map((image, i) => (
        <li key={i}>
          <Image src={image.url} alt={image.url} width="768" height="400" className="rounded-lg" />
        </li>
      ))}
    </ul>
  )
}
