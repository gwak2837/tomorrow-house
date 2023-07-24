'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Gallery() {
  // 서버에서 가져오기
  // const { data } = useQuery({ key: 'gallery', fetch: () => fetch('/kljkljdsfas')})
  const [images, setImages] = useState(['/images/1.png', '/images/2.png', '/images/3.png'])

  return (
    <ul className="grid gap-8">
      {images.map((image, i) => (
        <li key={i}>
          <Image src={image} alt={image} width="768" height="400" className="rounded-lg" />
        </li>
      ))}
    </ul>
  )
}
