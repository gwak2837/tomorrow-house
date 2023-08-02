'use client'

import Image from 'next/image'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'

import { selectedImageAtom } from './upload/ImageUploadForm'

export type TImage = {
  id: string
  url: string
  segmentation?: string
}

export const imagesAtom = atom<TImage[]>({
  key: 'imagesAtom',
  default: [],
  // default: [
  //   {
  //     id: '152623635',
  //     url: 'https://storage.googleapis.com/tomorrow-house/simli-8.png',
  //   },
  //   {
  //     id: '4124',
  //     url: 'https://storage.googleapis.com/tomorrow-house/sobok-0.png',
  //   },
  //   {
  //     id: '152236236',
  //     url: 'https://storage.googleapis.com/tomorrow-house/out-0.png',
  //   },
  // ],
})

export default function Gallery() {
  // 서버에서 가져오기
  // const { data } = useQuery({ key: 'gallery', fetch: () => fetch('/kljkljdsfas')})

  const [selectedImage, setSelectedImage] = useRecoilState(selectedImageAtom)
  const [images, setImages] = useRecoilState(imagesAtom)

  function selectImage(image: TImage, i: number) {
    if (!selectedImage) return
    setImages((prev) => {
      const a = prev.filter((i) => i.id !== image.id)
      a.splice(i, 0, selectedImage)
      return [...a]
    })
    setSelectedImage(image)
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-8">
      {images
        ?.filter((image) => image.id !== selectedImage?.id)
        .map((image, i) => (
          <li key={image.id} onClick={() => selectImage(image, i)}>
            <Image
              src={image.url}
              alt={image.url}
              width="768"
              height="400"
              className="rounded-lg object-cover aspect-video"
            />
          </li>
        ))}
    </ul>
  )
}
