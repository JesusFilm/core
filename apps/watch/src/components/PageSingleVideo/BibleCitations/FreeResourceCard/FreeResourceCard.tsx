import Image from 'next/image'
import { ReactElement } from 'react'

export interface FreeResourceProps {
  imageUrl?: string
  bgColor?: string
  heading: string
  text: string
  cta?: { label: string; onClick: () => void; icon?: React.ComponentType }
}

export function FreeResourceCard({
  imageUrl,
  heading,
  text,
  cta
}: FreeResourceProps): ReactElement {
  const CtaIcon = cta?.icon

  return (
    <div
      className="relative flex h-[400px] w-[400px] flex-col justify-end overflow-hidden rounded-lg border border-white/10"
      style={{ backgroundColor: `rgba(0, 0, 0, 0.1)` }}
    >
      <Image
        fill
        src={
          imageUrl ??
          'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60'
        }
        alt="Bible Citation"
        className="absolute top-0 overflow-hidden rounded-lg object-cover"
      />
      <div className="z-10 p-8">
        <span className="text-xs font-medium tracking-wider text-white/80 uppercase">
          {heading}
        </span>
        <p className="mt-2 mb-4 text-xl font-normal text-white">{text}</p>
        {cta != null && (
          <button
            role="link"
            onClick={cta.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-white/80"
          >
            {CtaIcon && <CtaIcon />}
            {cta.label}
          </button>
        )}
      </div>
    </div>
  )
}
