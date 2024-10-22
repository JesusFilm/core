'use client'

import { gql, useMutation } from '@apollo/client'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material'
import { graphql } from 'gql.tada'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

import { ChildrenView } from './_ChildrenView'
import { Editions } from './Editions'
import { StudyQuestions } from './StudyQuestions'
import { Subtitles } from './Subtitles'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { UpdateableField } from './UpdateableField'
import { Variants } from './Variants'

function useUpdateMutation(mutation) {
  const [updateMutation] = useMutation(mutation)

  return (input) => {
    void updateMutation({
      variables: { input }
    })
  }
}

const VIDEO_TITLE_UPDATE = gql`
  mutation UpdateVideoTitle($input: VideoTranslationUpdateInput!) {
    videoTitleUpdate(input: $input) {
      id
    }
  }
`

const VIDEO_DESCRIPTION_UPDATE = gql`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
    }
  }
`

const VIDEO_SNIPPET_UPDATE = gql`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
    }
  }
`

const VIDEO_UPDATE = gql`
  mutation UpdateVideo($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      label
      published
      noIndex
    }
  }
`

const VIDEO_IMAGE_ALT_UPDATE = graphql(`
  mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
    videoImageAltUpdate(input: $input) {
      id
      value
    }
  }
`)

const videoLabels = [
  { label: 'Collection', value: 'collection' },
  { label: 'Episode', value: 'episode' },
  { label: 'Feature Film', value: 'featureFilm' },
  { label: 'Segment', value: 'segment' },
  { label: 'Series', value: 'series' },
  { label: 'Short Film', value: 'shortFilm' },
  { label: 'Trailer', value: 'trailer' },
  { label: 'Behind The Scenes', value: 'behindTheScenes' }
]

const videoStatuses = [
  { label: 'Published', value: 'published' },
  { label: 'Unpublished', value: 'unpublished' }
]

export default function EditPage(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()
  const updateTitle = useUpdateMutation(VIDEO_TITLE_UPDATE)
  const updateDescription = useUpdateMutation(VIDEO_DESCRIPTION_UPDATE)
  const updateSnippet = useUpdateMutation(VIDEO_SNIPPET_UPDATE)
  const [updateVideo] = useMutation(VIDEO_UPDATE)
  const updateAlt = useUpdateMutation(VIDEO_IMAGE_ALT_UPDATE)

  const [tabValue, setTabValue] = useState(0)
  const handleTabChange = (e: SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  const video = data?.adminVideo

  const handleLabelChange = (e: SelectChangeEvent): void => {
    void updateVideo({
      variables: {
        input: {
          id: video?.id,
          label: e.target.value
        }
      }
    })
  }

  const handleStatusChange = (e: SelectChangeEvent): void => {
    void updateVideo({
      variables: {
        input: {
          id: video?.id,
          published: e.target.value === 'published'
        }
      }
    })
  }

  const updateNoIndex = (e): void => {
    void updateVideo({
      variables: {
        input: {
          id: video?.id,
          noIndex: e.target.checked
        }
      }
    })
  }

  console.log(video)

  return (
    <div>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="video edit tabs"
          >
            <Tab label={<TabLabel label="Metadata" />} />
            <Tab
              label={
                <TabLabel label="Children" count={video?.children?.length} />
              }
            />
            <Tab
              label={
                <TabLabel label="Variants" count={video?.variants?.length} />
              }
            />
            <Tab label={<TabLabel label="Editions" />} />
          </Tabs>
          <TabContainer value={tabValue} index={0}>
            <Stack gap={2}>
              <Stack gap={1} direction="row">
                <UpdateableField
                  label="Title"
                  {...video?.title?.[0]}
                  handleUpdate={updateTitle}
                  fullWidth
                />
                <UpdateableField
                  value={video?.slug ?? ''}
                  label="Slug"
                  disabled
                  fullWidth
                />
                <FormControl>
                  <FormLabel>{t('Status')}</FormLabel>
                  <Select
                    defaultValue={
                      video?.published === true ? 'published' : 'unpublished'
                    }
                    onChange={handleStatusChange}
                  >
                    {videoStatuses.map(({ label, value }) => (
                      <MenuItem key={label} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>{t('Label')}</FormLabel>
                  <Select value={video?.label} onChange={handleLabelChange}>
                    {videoLabels.map(({ label, value }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Box
                sx={{
                  position: 'relative',
                  height: 225,
                  width: { xs: 'auto', sm: 400 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <Image
                  src={video?.images[0].mobileCinematicHigh as string}
                  alt={video?.imageAlt[0].value}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </Box>
              <UpdateableField
                label="Alt"
                {...video?.imageAlt?.[0]}
                handleUpdate={updateAlt}
              />
              <FormControlLabel
                label="No Index"
                control={
                  <Checkbox
                    defaultChecked={video?.noIndex === true}
                    onChange={updateNoIndex}
                  />
                }
              />

              <UpdateableField
                label="Snippet"
                {...video?.snippet?.[0]}
                handleUpdate={updateSnippet}
                variant="textarea"
              />
              <UpdateableField
                label="Description"
                {...video?.description?.[0]}
                handleUpdate={updateDescription}
                variant="textarea"
              />

              <StudyQuestions studyQuestions={video?.studyQuestions} />
            </Stack>
          </TabContainer>
          <TabContainer value={tabValue} index={1}>
            <ChildrenView childVideos={video?.children} />
          </TabContainer>
          <TabContainer value={tabValue} index={2}>
            <Variants variants={video?.variants} />
          </TabContainer>
          <TabContainer value={tabValue} index={3}>
            <Editions editions={[]} />
            <Subtitles subtitles={video?.subtitles} videoId={video.id} />
          </TabContainer>
        </>
      )}
    </div>
  )
}
