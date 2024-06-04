import { useQuery } from '@apollo/client'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { FC, SyntheticEvent, useEffect, useState } from 'react'

import { ChannelTable } from '../../src/components/ChannelTable'
import {
  Localization,
  LocalizationTable
} from '../../src/components/LocalizationTable/LocalizationTable'
import { MainLayout } from '../../src/components/MainLayout'

import { GET_RESOURCE } from '.'

const ResourceDetailsPage: FC = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const router = useRouter()
  const { resourceId } = router.query
  const [localizations, setLocalizations] = useState<Localization[]>([])
  const { t } = useTranslation()

  const { data, loading } = useQuery(GET_RESOURCE, {
    skip: String(resourceId) === '',
    variables: {
      resourceID: resourceId
    }
  })

  useEffect(() => {
    if (data !== undefined) {
      setLocalizations(data?.resource?.localizations as Localization[])
    }
  }, [data])

  const handleChangeTab = (
    event: SyntheticEvent,
    newTabIndex: number
  ): void => {
    setTabIndex(newTabIndex)
  }

  return (
    <MainLayout title="Video Details" hasBack>
      <Stack
        sx={{
          pt: 4
        }}
        spacing={6}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              width: '328px',
              height: '170px',
              borderRadius: '8px',
              backgroundImage: "url('https://fakeimg.pl/320x170')"
            }}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoOutlinedIcon />
            <Typography>{t('Thumbnail for Jesus Film')}</Typography>
          </Stack>
        </Stack>
        <Paper>
          <Stack
            alignItems="center"
            justifyContent="space-between"
            direction="row"
            sx={{
              p: 4
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5">{t('Video Details')}</Typography>
              <Typography variant="subtitle3">
                {t('Additional description if required')}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{
                width: '400px'
              }}
            >
              <TextField
                variant="filled"
                placeholder="Lorem ipsum"
                sx={{
                  flex: 1
                }}
              />
              <Button variant="contained">{t('Search')}</Button>
            </Stack>
          </Stack>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleChangeTab}>
              <Tab label="Localization" />
              <Tab label="Channel" />
            </Tabs>
          </Box>
          {tabIndex === 0 && (
            <LocalizationTable loading={loading} data={localizations} />
          )}
          {tabIndex === 1 && <ChannelTable loading={false} data={[]} />}
        </Paper>
      </Stack>
    </MainLayout>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  return {
    props: {
      token
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(ResourceDetailsPage)
