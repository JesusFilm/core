import Image from 'next/image'
import { ReactElement } from 'react'

export default function Index(): ReactElement {
  return (
    <div className="m-x-auto m-y-0 h-full max-w-864">
      <Image
        src="/arclight.png"
        alt="logo"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
