import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { intlFormat, parseISO } from 'date-fns'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields_tags as Tag } from '../../../../__generated__/JourneyFields'
import { SocialImage } from '../../JourneyView/SocialImage'
import { CreateJourneyButton } from '../CreateJourneyButton'

import { PreviewTemplateButton } from './PreviewTemplateButton'
import { TemplateCollectionsButton } from './TemplateCollectionsButton'
import { TemplateEditButton } from './TemplateEditButton/TemplateEditButton'

interface TemplateViewHeaderProps {
  isPublisher: boolean | undefined
  authUser: User
}

export function TemplateViewHeader({
  isPublisher,
  authUser
}: TemplateViewHeaderProps): ReactElement {
  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  let collectionTags: Tag[] | undefined
  const collectionsId = journey?.tags.find(
    (item) => item.name[0].value === 'Collections'
  )?.id
  if (collectionsId != null) {
    collectionTags = journey?.tags.filter(
      (tag) => tag.parentId === collectionsId
    )
  }

  return (
    <Stack>
      {journey?.createdAt != null && (
        <>
          <Typography
            data-testId="featuredAtTemplatePreviewPage"
            variant="overline"
            sx={{
              color: 'secondary.light',
              display: { xs: 'block', sm: 'none' },
              pb: 6
            }}
            noWrap
          >
            {intlFormat(parseISO(journey?.createdAt), {
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        </>
      )}
      <Stack direction="row" sx={{ gap: { xs: 4, sm: 6 } }}>
        <Box
          sx={{
            flexShrink: 0
          }}
        >
          <SocialImage height={smUp ? 244 : 107} width={smUp ? 244 : 107} />
        </Box>
        <Stack
          direction="column"
          sx={{
            flexShrink: 1,
            height: { xs: 107, sm: 244 }
          }}
        >
          {journey?.createdAt != null && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                mt: collectionTags != null ? -2 : 0,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'secondary.light',
                  pr: '5px'
                }}
                data-testId="featuredAtTemplatePreviewPage"
                noWrap
              >
                {intlFormat(parseISO(journey?.createdAt), {
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
              {collectionTags != null && collectionTags.length > 0 && (
                <>
                  {collectionTags.map((tag) => (
                    <TemplateCollectionsButton tag={tag} key={tag.id} />
                  ))}
                </>
              )}
            </Stack>
          )}
          <Stack>
            {collectionTags != null && collectionTags.length > 0 && (
              <Stack
                direction="row"
                sx={{
                  display: {
                    xs: 'flex',
                    sm: 'none',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }
                }}
              >
                {collectionTags.map((tag) => (
                  <TemplateCollectionsButton tag={tag} key={tag.id} />
                ))}
              </Stack>
            )}
            <Typography variant={smUp ? 'h1' : 'h6'} sx={{ pb: 4, mt: 'auto' }}>
              {journey?.title}
            </Typography>
          </Stack>
          <Box
            sx={{
              maxHeight: '144px',
              overflow: 'auto'
            }}
          >
            <Typography
              variant="body1"
              sx={{
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {journey?.description}
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              gap: 4,
              pt: 4,
              mt: 'auto'
            }}
          >
            <CreateJourneyButton signedIn={authUser?.id != null} />
            <PreviewTemplateButton slug={journey?.slug} />
            {isPublisher === true && <TemplateEditButton />}
          </Box>
        </Stack>
      </Stack>
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, pt: 6 }} gap={2}>
        <CreateJourneyButton signedIn={authUser?.id != null} />
        <PreviewTemplateButton slug={journey?.slug} />
        {isPublisher === true && authUser.id != null && <TemplateEditButton />}
      </Box>
    </Stack>
  )
}
