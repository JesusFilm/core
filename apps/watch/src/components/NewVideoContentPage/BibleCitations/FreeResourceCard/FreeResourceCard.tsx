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
      className="relative h-[400px] w-[400px] flex flex-col justify-end rounded-lg overflow-hidden border border-white/10"
      style={{ backgroundColor: `rgba(0, 0, 0, 0.1)` }}
    >
      <Image
        fill
        src={
          imageUrl ??
          'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60'
        }
        alt="Bible Citation"
        className="absolute top-0 object-cover overflow-hidden rounded-lg"
      />
      <div className="p-8 z-10">
        <span className="text-xs font-medium tracking-wider uppercase text-white/80">
          {heading}
        </span>
        <p className="text-xl font-normal text-white mt-2 mb-4">{text}</p>
        {cta != null && (
          <button
            role="link"
            onClick={cta.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white/80 transition-colors duration-200"
          >
            {CtaIcon && <CtaIcon />}
            {cta.label}
          </button>
        )}
      </div>
    </div>
  )
}
