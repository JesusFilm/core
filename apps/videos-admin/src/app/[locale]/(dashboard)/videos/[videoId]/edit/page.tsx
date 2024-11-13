'use client'

import { useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import MuiTab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { Drawer } from '../../../../../../components/Drawer'
import { TabContainer } from '../../../../../../components/Tabs/TabContainer'
import { TabLabel } from '../../../../../../components/Tabs/TabLabel'
import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

import { Children } from './Children'
import { Editions } from './Editions'
import { Metadata } from './Metadata'
import { Variants } from './Variants'

export const GET_ADMIN_VIDEO_WITH_METADATA = graphql(`
  query GetAdminVideo($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
    }
  }
`)

export const GET_ADMIN_VIDEO_WITH_CHILDREN = graphql(`
  query GetAdminVideoWithChildren($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      children {
        id
        title {
          id
          value
        }
        images(aspectRatio: banner) {
          id
          mobileCinematicHigh
        }
        imageAlt {
          id
          value
        }
      }
    }
  }
`)

export const GET_ADMIN_VIDEO_WITH_VARIANTS = graphql(`
  query GetAdminVideoWithVariants($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      variants {
        id
        slug
        language {
          id
          name {
            value
          }
          slug
        }
        downloads {
          id
          quality
          size
          height
          width
          url
        }
      }
    }
  }
`)

const DRAWER_WIDTH = 500

const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'open'
})<{ open?: boolean }>(({ theme }) => ({
  width: '100%',
  maxWidth: 1700,
  flexGrow: 1,
  marginRight: -DRAWER_WIDTH,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }),
        marginRight: 0
      }
    }
  ]
}))

const Tab = styled(MuiTab)(({ theme }) => ({
  '&:hover': {},
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    border: '1px solid',
    borderColor: theme.palette.divider
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.action.hover
  }
}))

export default function EditPage(): ReactElement {
  const t = useTranslations()
  const params = useParams<{ videoId: string; locale: string }>()
  const [tabValue, setTabValue] = useState(0)

  const videoId = params?.videoId

  const { data, loading, refetch } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const [getChildren, { data: videoWithChildren, loading: loadingChildren }] =
    useLazyQuery(GET_ADMIN_VIDEO_WITH_CHILDREN)
  const [getVariants, { data: videoWithVariants, loading: loadingVariants }] =
    useLazyQuery(GET_ADMIN_VIDEO_WITH_VARIANTS)

  const handleTabChange = (e: SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  const prefetchChildren = (): void => {
    if (videoId == null || videoWithChildren != null) return

    void getChildren({ variables: { videoId } })
  }

  const prefetchVariants = (): void => {
    if (videoId == null || videoWithVariants != null) return

    void getVariants({ variables: { videoId } })
  }

  const video = data?.adminVideo

  return (
    <Container>
      <Container>
        <Typography variant="h4">{t('Edit Video')}</Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="video edit tabs"
          sx={{
            my: 4,
            borderbottom: 0,
            '& .MuiTabs-indicator': { backgroundColor: 'transparent' },
            '& .MuiTabs-flexContainer': {
              gap: 1
            }
          }}
        >
          <Tab label={<TabLabel label="Metadata" />} />
          <Tab
            label={
              <TabLabel
                label="Children"
                count={video?.childrenCount}
                loading={loading}
              />
            }
            onMouseEnter={prefetchChildren}
          />
          <Tab
            label={
              <TabLabel
                label="Variants"
                count={video?.variantLanguagesCount}
                loading={loading}
              />
            }
            onMouseEnter={prefetchVariants}
          />
          <Tab
            label={<TabLabel label="Editions" />}
            onMouseEnter={() => console.log('prefetching editions')}
          />
        </Tabs>
        <TabContainer value={tabValue} index={0}>
          <Metadata video={video} loading={loading} reload={refetch} />
        </TabContainer>
        <TabContainer value={tabValue} index={1}>
          <Children
            loading={loadingChildren}
            childVideos={videoWithChildren?.adminVideo?.children}
          />
        </TabContainer>
        <TabContainer value={tabValue} index={2}>
          <Variants
            loading={loadingVariants}
            variants={videoWithVariants?.adminVideo?.variants}
          />
        </TabContainer>
        <TabContainer value={tabValue} index={3}>
          <Editions loading editions={[]} />
        </TabContainer>
      </Container>

      <Drawer />
    </Container>
  )
}
