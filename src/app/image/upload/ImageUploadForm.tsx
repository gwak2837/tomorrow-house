'use client'

import Image from 'next/image'
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { NEXT_PUBLIC_SERVER_API_URL } from 'src/common/constants'
import { sleep } from 'src/common/utils'
import Arrow from 'src/svgs/Arrow'
import LoadingIcon from 'src/svgs/LoadingIcon'
import SearchIcon from 'src/svgs/SearchIcon'
import SianIcon from 'src/svgs/SianIcon'
import UploadIcon from 'src/svgs/UploadIcon'

enum Status {
  idle,
  uploadingImage,
  renderingImage,
  identifyingObjects,
  identifiedObjects,
  renderingObjects,
  renderedObjects,
}

export default function ImageUploadForm() {
  // Image upload
  const formData = useRef(globalThis.FormData ? new FormData() : null)
  const [imagePreviewURL, setImagePreviewURL] = useState('')
  const [status, setStatus] = useState(Status.idle)

  const sseClientId = useRef<string>()

  async function uploadImage(e: ChangeEvent<HTMLInputElement>) {
    if (!sseClientId.current) return

    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || !formData.current) return

    setImagePreviewURL(URL.createObjectURL(file))
    formData.current.append(sseClientId.current, file)

    setStatus(Status.uploadingImage)

    const response = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/upload/image/ai`, {
      method: 'POST',
      body: formData.current,
    })

    if (!response.ok) {
      setImagePreviewURL('')
      setStatus(Status.idle)
      formData.current = null
      return toast.error(await response.text())
    }
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

    setStatus(Status.renderingObjects)

    await sleep(3000) // fetch('/asdf', { body: { objectAreas, imageURL: imagePreviewURL } })
    setImages([
      '/images/ai-1.png',
      '/images/ai-2.png',
      '/images/ai-3.png',
      '/images/ai-4.png',
      '/images/ai-5.png',
    ])
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/EventSource
  const eventSource = useRef<EventSource>()

  function connectSSE() {
    eventSource.current = new EventSource(`${NEXT_PUBLIC_SERVER_API_URL}/upload/image/ai`)

    eventSource.current.onerror = () => {
      setImagePreviewURL('')
      setStatus(Status.idle)
      formData.current = null
      toast.error('EventSource error')
    }

    eventSource.current.addEventListener('sse-client-id', (e) => {
      sseClientId.current = e.data
    })

    eventSource.current.addEventListener('images', (e) => {
      if (e.lastEventId === 'gcp') setStatus(Status.renderingImage)
      else if (e.lastEventId === 'ai') setStatus(Status.identifyingObjects)
      else if (e.lastEventId === 'ai2') setStatus(Status.renderedObjects)

      setImagePreviewURL(JSON.parse(e.data)[0].url)
    })

    eventSource.current.addEventListener('coords', (e) => {
      setStatus(Status.identifiedObjects)

      console.log('👀 ~ e.data:', e.data)
    })
  }

  function disconnect() {
    if (!eventSource.current) return

    eventSource.current.close()
  }

  useEffect(() => {
    connectSSE()

    return () => disconnect()
  }, [])

  return (
    <>
      {status <= Status.identifyingObjects ? (
        <h3 className="text-lg my-4">1. 방 사진을 업로드해주세요</h3>
      ) : status === Status.identifiedObjects || status === Status.renderingObjects ? (
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
        className={status >= Status.renderedObjects ? 'hidden' : ''}
      >
        <label>
          <div className="relative aspect-video bg-stone-900 rounded-xl my-4 hover:cursor-pointer overflow-hidden">
            {imagePreviewURL && (
              <Image
                src={imagePreviewURL}
                alt={imagePreviewURL}
                width="732"
                height="556"
                className="w-full h-full relative object-cover z-10"
                onClick={getObjectArea}
              />
            )}
            {status >= Status.uploadingImage && status <= Status.identifyingObjects && (
              <div className="absolute inset-0 bg-white/50 z-10">
                <div className="absolute inset-2/4 -translate-x-2/4 -translate-y-2/4 w-fit h-fit text-center break-keep	whitespace-nowrap text-black">
                  <div>Loading</div>
                  <div>
                    {status === Status.uploadingImage
                      ? '사진을 업로드하고 있어요'
                      : status === Status.renderingImage
                      ? 'AI가 인테리어를 바꾸는 중이에요'
                      : status === Status.identifyingObjects
                      ? 'AI가 방의 구조를 인식하는 중이에요'
                      : ''}
                  </div>
                </div>
              </div>
            )}
            <UploadIcon className="absolute inset-2/4	-translate-x-2/4 -translate-y-2/4	z-0" />
            <h3 className="w-fit h-fit break-keep	whitespace-nowrap	absolute inset-2/4	-translate-x-2/4 -translate-y-2/4 z-0 text-stone-400">
              이미지 업로드
            </h3>
          </div>
          <input
            accept="image/*"
            disabled={status > Status.idle}
            // id="images"
            className="hidden"
            onChange={uploadImage}
            type="file"
          />
        </label>

        {status === Status.identifiedObjects && (
          <>
            <h3 className="text-lg mt-8 mb-4">3. 공간 유형을 선택해주세요</h3>
            {isOpen ? (
              <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-stone-800 border-2 p-4 border-indigo-500 rounded-2xl">
                <SearchIcon />
                <input
                  className="w-full focus:outline-none"
                  onChange={(e) => setPlaceType(e.target.value)}
                  placeholder="공간 유형 선택"
                  value={placeType}
                />
                <Arrow
                  className="cursor-pointer"
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
                  className="w-full min-w-[100px] focus:outline-none"
                  readOnly
                  placeholder="공간 유형 선택"
                  value={placeType}
                />
                <Arrow className="cursor-pointer" isDown />
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
          disabled={status < Status.identifiedObjects || !placeType}
        >
          시안 만들기
        </button>
      </form>

      {status === Status.renderingObjects && (
        <div className="w-full my-8 bg-white rounded-lg relative aspect-video">
          <div className="absolute inset-2/4	-translate-x-2/4 -translate-y-2/4	w-fit h-fit break-keep	whitespace-nowrap">
            <LoadingIcon className="mx-auto" />
            <h3 className=" text-stone-700">새로운 시안을 생성하는 중입니다</h3>
          </div>
        </div>
      )}

      {status === Status.renderedObjects && (
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
