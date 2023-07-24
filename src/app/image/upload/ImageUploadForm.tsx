'use client'

import Image from 'next/image'
import { ChangeEvent, FormEvent, MouseEvent, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { sleep } from 'src/common/utils'
import Arrow from 'src/svgs/Arrow'
import LoadingIcon from 'src/svgs/LoadingIcon'
import SearchIcon from 'src/svgs/SearchIcon'
import SianIcon from 'src/svgs/SianIcon'
import UploadIcon from 'src/svgs/UploadIcon'

enum Loading {
  loading,
  loading1,
  loading2,
  loading3,
  loading4,
}

export default function ImageUploadForm() {
  const formData = useRef(globalThis.FormData ? new FormData() : null)
  const [imagePreviewURL, setImagePreviewURL] = useState('')
  const [loading, setLoading] = useState(Loading.loading)

  async function createPreviewImages(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || !formData.current) return

    setImagePreviewURL(URL.createObjectURL(file))
    formData.current.append('image', file)

    setLoading(1)

    await sleep(3000) // setImagePreviewURL('google storage url')

    setLoading(2)
  }

  const [objectAreas, setObjectAreas] = useState<Record<string, any>[]>([])

  async function getObjectArea(e: MouseEvent<HTMLImageElement>) {
    e.stopPropagation()
    e.preventDefault()

    toast.success(`${e.nativeEvent.offsetX}, ${e.nativeEvent.offsetY}`)

    // await fetch('/getPosition')

    setObjectAreas((prev) => [...prev, { x1: 1, y1: 1, x2: 2, y2: 2 }])
  }

  const [isOpen, setIsOpen] = useState(false)

  const [placeType, setPlaceType] = useState('')

  const [images, setImages] = useState<string[]>([])

  async function getImagesFromAI(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(3)

    await sleep(3000) // fetch('/asdf', { body: { objectAreas, imageURL: imagePreviewURL } })
    setImages([
      '/images/ai-1.png',
      '/images/ai-2.png',
      '/images/ai-3.png',
      '/images/ai-4.png',
      '/images/ai-5.png',
    ])

    setLoading(4)
  }

  return (
    <>
      {loading < 2 ? (
        <h3 className="text-lg my-4">1. 방 사진을 업로드해주세요</h3>
      ) : loading === 2 ? (
        <h3 className="text-lg my-4">
          2.사진에서 <u>변경할 부분을 선택</u> 해주세요
        </h3>
      ) : (
        <h3 className="text-lg my-4 flex gap-2 items-center">
          <SianIcon /> 추천 시안 리스트
        </h3>
      )}

      <form
        encType="multipart/form-data"
        onSubmit={getImagesFromAI}
        className={loading >= 3 ? 'hidden' : ''}
      >
        <label>
          <div className="relative bg-stone-900 rounded-xl h-60 my-4 hover:cursor-pointer overflow-hidden">
            {imagePreviewURL && (
              <Image
                src={imagePreviewURL}
                alt={imagePreviewURL}
                width={768}
                height={280}
                className="absolute inset-2/4	-translate-x-2/4 -translate-y-2/4 object-cover z-10"
                onClick={getObjectArea}
              />
            )}
            {loading === 1 && (
              <div className="absolute inset-0 bg-white/50 z-10">
                <div className="absolute inset-2/4 -translate-x-2/4 -translate-y-2/4 w-fit h-fit text-center break-keep	whitespace-nowrap text-black">
                  <div>Loading</div>
                  <div>AI가 방의 구조를 인식하는 중이에요</div>
                </div>
              </div>
            )}
            <UploadIcon className="absolute inset-2/4	-translate-x-2/4 -translate-y-2/4	" />
            <h3 className="w-fit h-fit break-keep	whitespace-nowrap	absolute inset-2/4	-translate-x-2/4 -translate-y-2/4 text-stone-400">
              이미지 업로드
            </h3>
          </div>
          <input
            accept="image/*"
            disabled={loading > 0}
            // id="images"
            className="hidden"
            onChange={createPreviewImages}
            type="file"
          />
        </label>

        {loading === 2 && (
          <>
            <h3 className="text-lg mt-8 mb-4">3. 공간 유형을 선택해주세요</h3>
            {isOpen ? (
              <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-stone-800 border-2 p-4 border-indigo-500 rounded-2xl">
                <SearchIcon />
                <input
                  className="focus:outline-none"
                  onChange={(e) => setPlaceType(e.target.value)}
                  placeholder="공간 유형 선택"
                  value={placeType}
                />
                <Arrow
                  hasColor
                  onClick={() => {
                    setIsOpen(false)
                    setPlaceType('')
                  }}
                />
              </div>
            ) : (
              <div
                className="grid grid-cols-[auto_1fr_auto] gap-3 bg-stone-800 border-2 p-4 border-stone-700 rounded-2xl"
                onClick={() => setIsOpen(true)}
              >
                <div className="w-[24px]" />
                <input
                  className="focus:outline-none"
                  placeholder="공간 유형 선택"
                  value={placeType}
                />
                <Arrow isDown />
              </div>
            )}

            {isOpen && (
              <ol className="my-2 grid gap-3 bg-stone-800 border-2 p-4 border-indigo-500 rounded-2xl max-h-[20vh] overflow-y-auto">
                <li
                  className="cursor-pointer"
                  onClick={(e) => setPlaceType(e.currentTarget.textContent ?? '')}
                >
                  거실
                </li>
                <li
                  className="cursor-pointer"
                  onClick={(e) => setPlaceType(e.currentTarget.textContent ?? '')}
                >
                  주방
                </li>
                <li
                  className="cursor-pointer"
                  onClick={(e) => setPlaceType(e.currentTarget.textContent ?? '')}
                >
                  침실
                </li>
                <li
                  className="cursor-pointer"
                  onClick={(e) => setPlaceType(e.currentTarget.textContent ?? '')}
                >
                  화장실
                </li>
                <li
                  className="cursor-pointer"
                  onClick={(e) => setPlaceType(e.currentTarget.textContent ?? '')}
                >
                  클래식
                </li>
              </ol>
            )}
          </>
        )}

        <button
          className="w-full text-lg p-2 my-8 rounded-lg bg-indigo-500 disabled:bg-gray-500"
          disabled={loading < 2 || !placeType}
        >
          시안 만들기
        </button>
      </form>

      {loading === 3 && (
        <div className="w-full my-8 bg-white rounded-lg relative aspect-video">
          <div className="absolute inset-2/4	-translate-x-2/4 -translate-y-2/4	w-fit h-fit break-keep	whitespace-nowrap">
            <LoadingIcon className="mx-auto" />
            <h3 className=" text-stone-700">새로운 시안을 생성하는 중입니다</h3>
          </div>
        </div>
      )}

      {loading === 4 && (
        <ul className="grid gap-8">
          {images.map((image, i) => (
            <li key={i}>
              <Image src={image} alt={image} width="768" height="400" className="rounded-lg" />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
