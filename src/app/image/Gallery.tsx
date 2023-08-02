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
})

export default function Gallery() {
  // 서버에서 가져오기
  // const { data } = useQuery({ key: 'gallery', fetch: () => fetch('/kljkljdsfas')})

  const [selectedImage, setSelectedImage] = useRecoilState(selectedImageAtom)
  const [images, setImages] = useRecoilState(imagesAtom)

  function selectImage(image: TImage) {
    if (!selectedImage) return
    setSelectedImage(image)
    setImages((prev) => [selectedImage, ...prev.filter((i) => i.id !== image.id)])
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-8">
      {images
        ?.filter((image) => image.id !== selectedImage?.id)
        .map((image) => (
          <li key={image.id} onClick={() => selectImage(image)}>
            <Image
              src={image.url}
              alt={image.url}
              width="768"
              height="400"
              className="rounded-lg"
            />
          </li>
        ))}
    </ul>
  )
}
