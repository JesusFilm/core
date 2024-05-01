import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { FC, useEffect, useState } from 'react'

import { CreateShortLinkModal } from '../../src/components/CreateShortLinkModal'
import { DeleteModal } from '../../src/components/DeleteModal'
import { PageWrapper } from '../../src/components/PageWrapper'
import { ShortLinksTable } from '../../src/components/ShortLinksTable'

export const GET_LINKS = gql`
  query getLinksWithFilters(
    $limit: Int
    $offset: Int
    $orderBy: [links_order_by!]
    $where: links_bool_exp!
  ) {
    links(limit: $limit, offset: $offset, where: $where) {
      id
      createdDate
      title
      description
      extraOptionsGeolocations
      url
      domain
    }
  }
`

const ShortLinksPage: FC = () => {
  const [openCreateLinkModal, setOpenCreateLinkModal] = useState<boolean>(false)
  const [deleteLinkModal, setDeleteLinkModal] = useState<boolean>(false)
  const [links, setLinks] = useState([])
  const { t } = useTranslation()

  const { data, loading, refetch } = useQuery(GET_LINKS, {
    context: {
      clientName: 'switchy'
    },
    variables: {
      orderBy: { createdDate: 'desc' },
      where: {
        folderId: {
          _eq: process.env.NEXT_PUBLIC_SWITCHY_FOLDER_ID ?? 65091
        }
      }
    }
  })

  useEffect(() => {
    if (data !== undefined) {
      setLinks(data?.links)
    }
  }, [data])

  return (
    <PageWrapper title="Short Links">
      <Stack spacing={14}>
        <Stack
          alignItems="flex-start"
          sx={{
            pt: 4
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenCreateLinkModal(true)}
          >
            {t('Create short link')}
          </Button>
        </Stack>
        <ShortLinksTable
          loading={loading}
          data={links}
          onDelete={() => {
            setDeleteLinkModal(true)
          }}
        />
      </Stack>
      <CreateShortLinkModal
        open={openCreateLinkModal}
        onClose={() => setOpenCreateLinkModal(false)}
        refetch={refetch}
      />
      <DeleteModal
        open={deleteLinkModal}
        onClose={() => setDeleteLinkModal(false)}
        content="Are you sure you would like to delete this link?"
        onDelete={() => {
          // TODO: integrate delete mutation
          console.log(`Delete link here`)
        }}
      />
    </PageWrapper>
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
})(ShortLinksPage)
