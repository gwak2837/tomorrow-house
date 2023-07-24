import Image from 'next/image'
import Link from 'next/link'

import ImageUploadForm from './ImageUploadForm'

export default async function Page() {
  return (
    <div>
      <ImageUploadForm />

      <div className="w-full h-1 my-8 bg-stone-800 rounded" />
    </div>
  )
}
