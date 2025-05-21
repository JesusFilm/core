import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'

const slideMap = {
  intro: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-intro" */ '../Intro').then(
        (mod) => mod.Intro
      ),
    { ssr: false }
  ),
  name: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-name" */ '../Name').then(
        (mod) => mod.Name
      ),
    { ssr: false }
  ),
  q1: dynamic(
    async () =>
      await import(/* webpackChunkName: "quiz-slide-q1" */ '../Q1').then(
        (mod) => mod.Q1
      ),
    { ssr: false }
  ),
  question_2: dynamic(
    async () =>
      await import(
        /* webpackChunkName: "quiz-slide-question-2" */ '../Q2'
      ).then((mod) => mod.Q2),
    { ssr: false }
  )
}

interface SlideLoaderProps {
  slideId: string
}

export function SlideLoader({ slideId }: SlideLoaderProps) {
  const SlideComponent = slideMap[slideId]

  useEffect(() => {
    console.log({ SlideComponent })
  }, [SlideComponent])

  if (!SlideComponent) {
    return null
  }

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <SlideComponent />
    </Suspense>
  )
}
