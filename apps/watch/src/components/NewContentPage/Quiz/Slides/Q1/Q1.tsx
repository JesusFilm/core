import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import { useQuiz } from '../../QuizProvider'
import { Options } from '../../Templates/Options'

export function Q1() {
  const { t } = useTranslation('apps-watch')
  const { addTags, goTo, profile } = useQuiz()
  const headings = [
    {
      content: t('Question 1: What do you believe a human being is?'),
      variant: 'h2'
    },
    { content: t('Choose one'), variant: 'h4' }
  ]

  const actions = [
    {
      label: 'Only a body, nothing more',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
      tags: ['spiritual', 'seeker'],
      id: 'q1-1',
      next: 'q2'
    },
    {
      label: 'Body and soul / spirit',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/W2mVSI',
      tags: ['spiritual', 'seeker'],
      id: 'q1-2',
      next: 'q2'
    },
    {
      label: 'Only a body, nothing more',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/MiVmxZ',
      tags: ['spiritual', 'seeker'],
      id: 'q1-1',
      next: 'q2'
    },
    {
      label: 'Body and soul / spirit',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/W2mVSI',
      tags: ['spiritual', 'seeker'],
      id: 'q1-2',
      next: 'q2'
    },
    {
      label: 'Not sure, but open to exploring',
      imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/LKyyc4',
      tags: ['spiritual', 'seeker'],
      id: 'q1-3',
      next: 'q2'
    }
  ]

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string>(
    actions[0].imageUrl
  )

  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hoveredIdx !== null) {
      setBackgroundImage(actions[hoveredIdx].imageUrl)
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
    <Stack sx={{ height: '100%', alignItems: 'center', gap: 10 }} role="region">
      <Box
        role="presentation"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 100ms',
          transitionDelay: '600ms'
        }}
      />
      <Stack
        sx={{ alignItems: 'center', width: '100%', pt: 32, maxWidth: '48rem' }}
      >
        {headings.map((heading, i) => (
          <Typography
            key={i}
            variant={heading.variant}
            sx={{ textAlign: 'center' }}
          >
            {heading.content}
          </Typography>
        ))}
      </Stack>
      <Options actions={actions} />
    </Stack>
  )

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
