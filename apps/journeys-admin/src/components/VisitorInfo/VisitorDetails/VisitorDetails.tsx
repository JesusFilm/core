import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import FmdGoodRoundedIcon from '@mui/icons-material/FmdGoodRounded'
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import { GetVisitorForDetails } from '../../../../__generated__/GetVisitorForDetails'

export const GET_VISITOR_FOR_DETAILS = gql`
  query GetVisitorForDetails($id: ID!) {
    visitor(id: $id) {
      id
      lastChatStartedAt
      countryCode
      userAgent {
        os {
          name
        }
      }
    }
  }
`

interface Props {
  id: string
}

export function VisitorDetails({ id }: Props): ReactElement {
  const { data } = useQuery<GetVisitorForDetails>(GET_VISITOR_FOR_DETAILS, {
    variables: { id }
  })
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="flex-end"
      alignItems="center"
      spacing={8}
      sx={{ pb: 4, px: 6 }}
    >
      {data?.visitor.lastChatStartedAt != null && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mr: 'auto' }}
        >
          <ChatRoundedIcon />
          <Typography>
            {`
              ${new Intl.DateTimeFormat([], { timeStyle: 'short' }).format(
                new Date(data?.visitor.lastChatStartedAt)
              )}
              ,\xa0
              ${new Intl.DateTimeFormat([], {
                dateStyle: 'medium'
              }).format(new Date(data?.visitor.lastChatStartedAt))}
            `}
          </Typography>
        </Stack>
      )}

      {data?.visitor.countryCode != null && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <FmdGoodRoundedIcon />
          <Typography>{data?.visitor.countryCode}</Typography>
        </Stack>
      )}

      {data?.visitor.userAgent?.os.name != null && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneAndroidRoundedIcon />
          <Typography>{data?.visitor.userAgent?.os.name}</Typography>
        </Stack>
      )}

      {data?.visitor.id != null && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <PersonRoundedIcon />
          <Typography>{`#${data?.visitor.id}`}</Typography>
        </Stack>
      )}
    </Stack>
  )
}
