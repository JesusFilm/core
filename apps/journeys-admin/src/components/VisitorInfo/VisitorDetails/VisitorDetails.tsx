import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
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
      alignItems={{ xs: 'flex-start', sm: 'center' }}
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
          <ChatBubbleOutlineRoundedIcon />
          <Typography>
            {`
              ${new Intl.DateTimeFormat([], { timeStyle: 'short' }).format(
                new Date(data?.visitor.lastChatStartedAt)
              )},\xa0${new Intl.DateTimeFormat([], {
              dateStyle: 'medium'
            }).format(new Date(data?.visitor.lastChatStartedAt))}
            `}
          </Typography>
        </Stack>
      )}

      {data?.visitor.countryCode != null && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocationOnOutlinedIcon />
          <Typography>{data?.visitor.countryCode}</Typography>
        </Stack>
      )}

      {data?.visitor.userAgent?.os.name != null && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneIphoneOutlinedIcon />
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
          <PersonOutlinedIcon />
          <Typography>{`#${data?.visitor.id}`}</Typography>
        </Stack>
      )}
    </Stack>
  )
}
