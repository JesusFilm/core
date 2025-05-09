import { useCallback, useEffect, useState } from 'react'

import { Profile, SlideDefinition } from '../types'

interface Q1Props {
  addTags: (tags: string[]) => void
  goTo: (slide: string) => void
  t: (key: string) => string
  profile: Profile
}

interface OptionButtonProps {
  index: number
  label: string
  imageUrl: string
  isSelected: boolean
  onClick: (idx: number, tags: string[]) => void
  onHover: (idx: number | null) => void
  t: (key: string) => string
}

const OptionButton = ({
  index,
  label,
  imageUrl,
  isSelected,
  onClick,
  onHover,
  t
}: OptionButtonProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(index, ['spiritual', 'seeker'])
      }
    },
    [index, onClick]
  )

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`group animate-fade-in-delay-${2000 + index * 500} flex items-end justify-center w-80 h-80 rounded-2xl shadow-lg transition-all duration-150 text-xl font-bold relative overflow-hidden hover:scale-105 hover:shadow-2xl hover:outline hover:outline-3 hover:outline-white focus:scale-105 focus:shadow-2xl focus:outline focus:outline-3 focus:outline-white data-[selected=true]:scale-105 data-[selected=true]:shadow-2xl cursor-pointer`}
      onClick={() => onClick(index, ['spiritual', 'seeker'])}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      aria-label={t(label)}
      data-selected={isSelected}
    >
      <div
        role="presentation"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <span className="relative z-10 text-center p-4 text-white">
        {t(label)}
      </span>
    </div>
  )
}

const Q1Component = ({ addTags, goTo, t, profile }: Q1Props) => {
  const options = [
    {
      label: 'Only a body, nothing more',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ'
    },
    {
      label: 'Body and soul / spirit',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/W2mVSI'
    },
    {
      label: 'Not sure, but open to exploring',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/LKyyc4'
    }
  ] as const

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string>(
    options[0].imageUrl
  )

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hoveredIdx !== null) {
      setBackgroundImage(options[hoveredIdx].imageUrl)
    }
  }, [hoveredIdx])

  const handleOptionClick = useCallback(
    (idx: number, tags: string[]) => {
      setSelectedIdx(idx)
      addTags(tags)
      goTo('q2')
    },
    [addTags, goTo]
  )

  const handleHover = useCallback((idx: number | null) => {
    setHoveredIdx(idx)
  }, [])

  return (
    <div
      role="region"
      aria-label={t('Question 1: What do you believe a human being is?')}
      className="min-h-screen flex flex-col items-center justify-center px-4 font-sans text-black relative"
    >
      <div
        role="presentation"
        aria-hidden="true"
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-100 delay-600`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: hoveredIdx === null ? 0 : 1
        }}
      />
      {showOverlay && (
        <div
          role="presentation"
          aria-hidden="true"
          className="absolute inset-0 z-50 transition-opacity duration-500"
          style={{ opacity: showOverlay ? 1 : 0 }}
        />
      )}
      <div className="flex flex-col items-center w-full max-w-3xl">
        <div className="flex flex-col items-center">
          <h1
            className={`text-4xl font-bold text-center mb-4 transition-all duration-2000 ${hoveredIdx !== null ? 'mix-blend-difference text-white' : 'text-black'}`}
          >
            {profile.name && (
              <span className="animate-fade-in block mb-2 capitalize">
                {profile.name},
              </span>
            )}
            <span className="animate-fade-in-delay-500">
              {t('what do you believe a human being is?')}
            </span>
          </h1>
          <p
            className={`text-center mb-8 transition-all duration-300 animate-fade-in-delay-1500 ${hoveredIdx !== null ? 'mix-blend-difference text-white' : 'text-black'}`}
          >
            {t('Choose one')}
          </p>
        </div>
        <div
          role="listbox"
          aria-label={t('Answer options')}
          className="flex flex-row justify-center gap-8 w-full max-w-4xl"
        >
          {options.map((option, idx) => (
            <OptionButton
              key={idx}
              index={idx}
              label={option.label}
              imageUrl={option.imageUrl}
              isSelected={selectedIdx === idx}
              onClick={handleOptionClick}
              onHover={handleHover}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const Q1: SlideDefinition = {
  id: 'q1',
  render: (props) => <Q1Component {...props} />
}
