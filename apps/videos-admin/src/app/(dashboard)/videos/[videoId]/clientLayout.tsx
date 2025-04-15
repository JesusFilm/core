'use client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { Section } from '../../../../components/Section'

import { VideoDescription } from './_description/VideoDescription'
import { VideoImageAlt } from './_imageAlt/VideoImageAlt'
import { VideoInformation } from './_information/VideoInformation'
import { VideoSnippet } from './_snippet/VideoSnippet'

export default function ClientLayout({
  children,
  currentTab,
  videoId,
  images,
  studyQuestions
}: {
  children: React.ReactNode
  currentTab: string
  videoId: string
  images: React.ReactNode
  studyQuestions: React.ReactNode
}) {
  return <></>
}
