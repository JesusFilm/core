import { useMutation } from '@apollo/client'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack
} from '@mui/material'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { Textarea } from '../../../../../../../components/Textarea'
import { useUpdateVideoVariantMutation } from '../../../../../../../libs/useUpdateVideoVariantMutation'
import { Section } from '../Section'
import { UpdateableField } from '../UpdateableField'

import { StudyQuestions } from './StudyQuestions'
import { VideoImage } from './VideoImage'

function useUpdateMutation(mutation) {
  const [updateMutation] = useMutation(mutation)

  return (input) => {
    void updateMutation({
      variables: { input }
    })
  }
}

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

const VIDEO_TITLE_UPDATE = graphql(`
  mutation UpdateVideoTitle($input: VideoTranslationUpdateInput!) {
    videoTitleUpdate(input: $input) {
      id
    }
  }
`)

const VIDEO_DESCRIPTION_UPDATE = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
    }
  }
`)

const VIDEO_SNIPPET_UPDATE = graphql(`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
    }
  }
`)

const VIDEO_UPDATE = graphql(`
  mutation UpdateVideo($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      label
      published
      noIndex
    }
  }
`)

const VIDEO_IMAGE_ALT_UPDATE = graphql(`
  mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
    videoImageAltUpdate(input: $input) {
      id
      value
    }
  }
`)

interface MetadataProps {
  video: any
  loading: boolean
}

export function Metadata({ video, loading }: MetadataProps): ReactElement {
  const t = useTranslations()

  const updateTitle = useUpdateVideoVariantMutation(VIDEO_TITLE_UPDATE)
  const updateDescription = useUpdateMutation(VIDEO_DESCRIPTION_UPDATE)
  const updateSnippet = useUpdateMutation(VIDEO_SNIPPET_UPDATE)
  const [updateVideo] = useMutation(VIDEO_UPDATE)
  const updateAlt = useUpdateMutation(VIDEO_IMAGE_ALT_UPDATE)

  const handleLabelChange = (e: SelectChangeEvent<any>): void => {
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

  return (
    <Stack gap={2}>
      <Section title={t('Information')}>
        <Stack gap={2}>
          <Stack direction="row" gap={2}>
            <UpdateableField
              label="Title"
              {...video?.title?.[0]}
              handleUpdate={updateTitle}
              fullWidth
            />
            <UpdateableField
              id="none"
              handleUpdate={() => null}
              value={video?.slug ?? ''}
              label="Slug"
              disabled
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={2}>
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

          <FormControlLabel
            label="No Index"
            control={
              <Checkbox
                defaultChecked={video?.noIndex === true}
                onChange={updateNoIndex}
              />
            }
          />
        </Stack>
      </Section>

      <Section title={t('Image')}>
        <Stack direction="row" gap={2}>
          <VideoImage video={video} />
          <UpdateableField
            label="Alt"
            {...video?.imageAlt?.[0]}
            handleUpdate={updateAlt}
          />
        </Stack>
      </Section>

      <Section title={t('Snippet')}>
        <Textarea
          defaultValue={video?.snippet?.[0].value}
          onBlur={(e) =>
            updateSnippet({
              id: video?.snippet?.[0].id,
              value: e.target.value
            })
          }
          minRows={6}
          maxRows={6}
          sx={{ minWidth: '100%', maxWidth: '100%' }}
        />
      </Section>

      <Section title={t('Description')}>
        <Textarea
          defaultValue={video?.description?.[0].value}
          onBlur={(e) =>
            updateDescription({
              id: video?.description?.[0].id,
              value: e.target.value
            })
          }
          minRows={8}
          maxRows={8}
          sx={{ minWidth: '100%', maxWidth: '100%' }}
        />
      </Section>

      <Section
        title={t('Study Questions')}
        action={{
          label: t('Add Question'),
          startIcon: <Plus2 />,
          onClick: () => alert('Create new Question')
        }}
      >
        <StudyQuestions studyQuestions={video?.studyQuestions} />
      </Section>
    </Stack>
  )
}
