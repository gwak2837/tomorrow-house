'use client'

import Image from 'next/image'
import { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { atom, useRecoilState, useSetRecoilState } from 'recoil'
import { NEXT_PUBLIC_SERVER_API_URL } from 'src/common/constants'
import { getUniqueId, swap } from 'src/common/utils'
import Arrow from 'src/svgs/Arrow'
import SearchIcon from 'src/svgs/SearchIcon'
import UploadIcon from 'src/svgs/UploadIcon'

import { TImage, imagesAtom } from '../Gallery'

enum Status {
  idle,
  uploadingImage,
  uploadedImage,
  renderingImage,
  renderedImage,
}

export const selectedImageAtom = atom<TImage | null>({
  key: 'selectedImageAtom',
  default: null,
  // default: {
  //   id: 'lku95uwnzq97gdj43pd',
  //   url: 'https://storage.googleapis.com/tomorrow-house/KakaoTalk_Photo_2023-08-03-00-00-28.jpeg',
  // },
})

export default function ImageUploadForm() {
  // Gallery
  const [selectedImage, setSelectedImage] = useRecoilState(selectedImageAtom)
  const setImages = useSetRecoilState(imagesAtom)

  // EventSource: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
  const eventSource = useRef<EventSource>()
  const sseClientId = useRef<string>()

  const connectSSE = useCallback(() => {
    eventSource.current = new EventSource(`${NEXT_PUBLIC_SERVER_API_URL}/image`)

    eventSource.current.onerror = () => {
      formData.current = null
      toast.error('EventSource disconnected. Please refresh page.')
    }

    eventSource.current.addEventListener('sse-client-id', (e) => {
      sseClientId.current = e.data
    })

    eventSource.current.addEventListener('image', (e) => {
      if (e.lastEventId !== 'i2i' && e.lastEventId !== 'inpaint') return

      const newImages = JSON.parse(e.data) as TImage[]

      setSelectedImage(newImages[0])
      setImages((prev) => [...newImages, ...prev])
      setStatus(Status.renderedImage)
    })

    eventSource.current.addEventListener('segmentation', (e) => {
      setSelectedImage((prev) =>
        prev?.id === e.lastEventId ? { ...prev, segmentation: e.data } : prev
      )

      setImages((prev) => {
        const image = prev.find((image) => image.id === e.lastEventId)
        if (!image) return prev

        return [
          { id: image.id, url: image.url, segmentation: e.data },
          ...prev.filter((image) => image.id !== e.lastEventId),
        ]
      })
    })
  }, [setImages, setSelectedImage])

  function disconnect() {
    if (!eventSource.current) return

    eventSource.current.close()
  }

  useEffect(() => {
    connectSSE()

    return () => disconnect()
  }, [connectSSE])

  // Image upload
  const formData = useRef(globalThis.FormData ? new FormData() : null)
  const [status, setStatus] = useState(Status.idle)

  async function uploadImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/') || !formData.current) return

    formData.current.append('image', file)

    setSelectedImage({ id: getUniqueId(), url: URL.createObjectURL(file) })
    setStatus(Status.uploadingImage)

    let response
    try {
      response = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/image/upload`, {
        method: 'POST',
        body: formData.current,
      })
    } catch (error: any) {
      toast.error(error.message)
    }

    if (!response?.ok) {
      setSelectedImage(null)
      setStatus(Status.idle)
      formData.current = new FormData()
      return response && toast.error(await response.text())
    }

    setSelectedImage({ id: getUniqueId(), url: await response.text() })
    setStatus(Status.uploadedImage)
  }

  // Image to image
  const [isOpen, setIsOpen] = useState(false)
  const [spaceCategory, setSpaceCategory] = useState('')

  async function generateImageFromImage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedImage) return

    setStatus(Status.renderingImage)

    let response
    try {
      response = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/image/ai/i2i`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: sseClientId.current,
          imageURL: selectedImage.url,
          spaceCategory: decodeSpaceCategory(spaceCategory),
        }),
      })
    } catch (error: any) {
      toast.error(error.message)
    }

    if (!response?.ok) {
      setStatus(Status.uploadedImage)
      return response && toast.error(await response.text())
    }
  }

  // Image inpaint
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasMaskImage, setHasMaskImage] = useState(false)
  const segmentationsRef = useRef<Record<string, any>>({})

  async function getObjectArea(e: any) {
    if (!selectedImage) return

    toast.success(`${e.nativeEvent.offsetX}:${e.nativeEvent.offsetY}`) //

    if (!selectedImage?.segmentation) return toast.error('Segmentation info is loading')

    if (!segmentationsRef.current[selectedImage.id]) {
      console.log('👀 ~ selectedImage:', selectedImage)
      const response = await fetch(selectedImage?.segmentation.slice(0, -1))
      const result = await response.json()
      segmentationsRef.current[selectedImage.id] = {
        coords2class: result,
        class2coords: swap(result),
      }
    }

    const seg = segmentationsRef.current[selectedImage.id]

    const _class = seg.coords2class[`${e.nativeEvent.offsetX}:${e.nativeEvent.offsetY}`]
    if (!_class) return

    drawSegmentation(seg.class2coords[_class])
  }

  function drawSegmentation(data: string[]) {
    setHasMaskImage(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return toast.error('Cannot draw image segmentation')

    for (let i = 0; i < data.length; i++) {
      const [x, y] = data[i].split(':')

      ctx.fillStyle = 'rgba(255,0,255,0.3)'
      ctx.fillRect(+x, +y, 2, 2)
    }
  }

  async function generateImageFromInpaint(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    // Upload masking image
    const formData = new FormData()

    try {
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) throw Error('Could not create blob')

          formData.append('mask-image', blob, 'filename.png')
          resolve('')
        })
      })
    } catch (error) {
      return
    }

    let response2
    try {
      response2 = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/image/upload`, {
        method: 'POST',
        body: formData,
      })
    } catch (error: any) {
      return toast.error(error.message)
    }

    if (!response2?.ok) {
      return response2 && toast.error(await response2.text())
    }

    // Inpaint image
    setStatus(Status.renderingImage)

    let response
    try {
      response = await fetch(`${NEXT_PUBLIC_SERVER_API_URL}/image/ai/inpaint`, {
        method: 'POST',
        body: JSON.stringify({
          clientId: sseClientId.current,
          targetImageURL: selectedImage,
          maskImageURL: await response2.text(),
        }),
      })
    } catch (error: any) {
      toast.error(error.message)
    }

    if (!response?.ok) {
      setStatus(Status.uploadedImage)
      return response && toast.error(await response.text())
    }

    setHasMaskImage(false)
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <>
      {selectedImage?.segmentation ? (
        <h3 className="text-lg my-4">
          사진에서 <u>변경할 부분을 선택</u> 해주세요
        </h3>
      ) : status === Status.idle ? (
        <h3 className="text-lg my-4">방 사진을 업로드해주세요</h3>
      ) : (
        <h3 className="text-lg my-4">멋진 공간이네요</h3>
      )}

      <form
        encType="multipart/form-data"
        onSubmit={hasMaskImage ? generateImageFromInpaint : generateImageFromImage}
      >
        <label>
          <div
            className={
              'relative bg-stone-900 rounded-xl my-4 hover:cursor-pointer overflow-hidden ' +
              (selectedImage ? '' : 'aspect-video')
            }
          >
            <canvas
              className="absolute w-full h-full z-20"
              ref={canvasRef}
              onMouseDown={getObjectArea}
            />
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.url}
                width="2000"
                height="2000"
                className="w-full h-full relative z-10"
              />
            )}
            {(status === Status.uploadingImage || status === Status.renderingImage) && (
              <div className="absolute inset-0 bg-white/50 z-10">
                <div className="absolute inset-2/4 -translate-x-2/4 -translate-y-2/4 w-fit h-fit text-center break-keep	whitespace-nowrap text-black">
                  <div>Loading</div>
                  <div>
                    {status === Status.uploadingImage
                      ? '사진을 업로드하고 있어요'
                      : status === Status.renderingImage
                      ? 'AI가 인테리어를 바꾸는 중이에요'
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
            disabled={!!selectedImage}
            className="hidden"
            onChange={uploadImage}
            type="file"
          />
        </label>

        <h3 className="text-lg mt-8 mb-4">공간 유형을 선택해주세요</h3>
        {isOpen ? (
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 bg-stone-800 border-2 p-4 border-indigo-500 rounded-2xl">
            <SearchIcon />
            <input
              className="w-full focus:outline-none"
              onChange={(e) => setSpaceCategory(e.target.value)}
              placeholder="공간 유형 선택"
              value={spaceCategory}
            />
            <Arrow className="cursor-pointer" hasColor onClick={() => setIsOpen(false)} />
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
              value={spaceCategory}
            />
            <Arrow className="cursor-pointer" isDown />
          </div>
        )}

        {isOpen && (
          <ol className="my-2 grid gap-3 bg-stone-800 border-2 p-4 border-indigo-500 rounded-2xl max-h-[20vh] overflow-y-auto">
            <li className="cursor-pointer" onClick={() => setSpaceCategory('거실')}>
              거실
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('침실')}>
              침실
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('주방')}>
              주방
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('베란다')}>
              베란다
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('화장실')}>
              화장실
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('아이방')}>
              아이방
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('홈 오피스')}>
              홈 오피스
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('오피스')}>
              오피스
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('카페')}>
              카페
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('회의실')}>
              회의실
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('휴게공간')}>
              휴게공간
            </li>
            <li className="cursor-pointer" onClick={() => setSpaceCategory('식당')}>
              식당
            </li>
          </ol>
        )}

        <button
          className="w-full text-lg p-2 my-8 rounded-lg bg-indigo-500 disabled:bg-gray-500"
          disabled={
            !spaceCategory ||
            !selectedImage?.url ||
            status === Status.uploadingImage ||
            status === Status.renderingImage
          }
        >
          시안 만들기
        </button>
      </form>
    </>
  )
}

function decodeSpaceCategory(spaceCategory: string) {
  switch (spaceCategory) {
    case '거실':
      return 'Living Room'
    case '침실':
      return 'Bedroom'
    case '주방':
      return 'Kitchen'
    case '베란다':
      return 'Balcony'
    case '홈 오피스':
      return 'Home Office'
    case '오피스':
      return 'Office'
    case '화장실':
      return 'Bathroom'
    case '아이방':
      return "Children's Room"
    case '카페':
      return 'Cafe'
    case '회의실':
      return 'Conference Room'
    case '휴게공간':
      return 'Lounge'
    case '식당':
      return 'Restaurant'
    default:
      return ''
  }
}
