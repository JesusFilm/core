import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import ListItemIcon from '@mui/material/ListItemIcon'
import pick from 'lodash/pick'
import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { GetCountry } from '../../../__generated__/GetCountry'
import { GetVisitor_visitor as Visitor } from '../../../__generated__/GetVisitor'
import { VisitorStatus } from '../../../__generated__/globalTypes'
import { VisitorUpdate } from '../../../__generated__/VisitorUpdate'

export const VISITOR_UPDATE = gql`
  mutation VisitorUpdate($id: ID!, $input: VisitorUpdateInput!) {
    visitorUpdate(id: $id, input: $input) {
      id
      messengerId
      messengerNetwork
      name
      notes
      status
    }
  }
`

export const GET_COUNTRY = gql`
  query GetCountry($id: ID!, $languageId: ID!) {
    country(id: $id, idType: slug) {
      id
      name(languageId: $languageId) {
        value
      }
    }
  }
`

interface VisitorDetailProps {
  visitor: Visitor
}

export function VisitorDetail({ visitor }: VisitorDetailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [visitorUpdate] = useMutation<VisitorUpdate>(VISITOR_UPDATE)
  // 529 (english) should be changed when adding internalization
  const { data } = useQuery<GetCountry>(GET_COUNTRY, {
    variables: { id: visitor.countryCode, languageId: 529 }
  })

  async function handleSubmit(values): Promise<void> {
    const formattedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key] === '' ? null : values[key]
      return acc
    }, {})
    await visitorUpdate({
      variables: {
        id: visitor.id,
        input: formattedValues
      }
    })
  }

  return (
    <Container maxWidth="xs" sx={{ p: 4 }}>
      <Formik
        initialValues={pick(visitor, [
          'messengerId',
          'messengerNetwork',
          'name',
          'notes',
          'status'
        ])}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <Stack spacing={4}>
              <Stack spacing={4} direction="row">
                <FormControl sx={{ width: 80 }}>
                  <InputLabel id="status-label">{t('Status')}</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={values.status ?? ''}
                    label={t('Status')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="">⚪️</MenuItem>
                    <MenuItem value={VisitorStatus.star}>⭐</MenuItem>
                    <MenuItem value={VisitorStatus.prohibited}>🚫</MenuItem>
                    <MenuItem value={VisitorStatus.checkMarkSymbol}>
                      ✅
                    </MenuItem>
                    <MenuItem value={VisitorStatus.thumbsUp}>👍</MenuItem>
                    <MenuItem value={VisitorStatus.thumbsDown}>👎</MenuItem>
                    <MenuItem value={VisitorStatus.partyPopper}>🎉</MenuItem>
                    <MenuItem value={VisitorStatus.warning}>⚠</MenuItem>
                    <MenuItem value={VisitorStatus.robotFace}>🤖</MenuItem>
                    <MenuItem value={VisitorStatus.redExclamationMark}>
                      ❗
                    </MenuItem>
                    <MenuItem value={VisitorStatus.redQuestionMark}>
                      ❓
                    </MenuItem>
                  </Select>
                </FormControl>
                {visitor.lastChatStartedAt !== null && (
                  <Box>
                    {t('Last Chat')}{' '}
                    {format(parseISO(visitor.lastChatStartedAt), 'PPpp')}
                  </Box>
                )}
              </Stack>
              <Stack spacing={4} direction="row">
                <TextField
                  id="messengerId"
                  name="messengerId"
                  variant="filled"
                  label={values.messengerNetwork}
                  fullWidth
                  value={values.messengerId ?? ''}
                  error={
                    touched.messengerId === true && Boolean(errors.messengerId)
                  }
                  helperText={
                    touched.messengerId === true && errors.messengerId
                  }
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <FormControl sx={{ width: 145 }}>
                  <InputLabel id="messenger-network-label">
                    {t('Network')}
                  </InputLabel>
                  <Select
                    labelId="messenger-network-label"
                    id="messengerNetwork"
                    name="messengerNetwork"
                    value={values.messengerNetwork ?? ''}
                    label={t('Network')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={{
                      '.MuiSelect-select': {
                        height: 23
                      }
                    }}
                  >
                    <MenuItem value="">{t('None')}</MenuItem>
                    <MenuItem value="WhatsApp">
                      <ListItemIcon>
                        <WhatsAppIcon />
                      </ListItemIcon>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <TextField
                id="name"
                name="name"
                variant="filled"
                label={t('Name')}
                fullWidth
                value={values.name ?? ''}
                error={touched.name === true && Boolean(errors.name)}
                helperText={touched.name === true && errors.name}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <TextField
                id="countryCode"
                name="countryCode"
                variant="filled"
                label={t('Location')}
                fullWidth
                value={data?.country.name[0].value}
                InputProps={{
                  readOnly: true
                }}
              />
              <TextField
                id="notes"
                name="notes"
                variant="filled"
                label={t('Notes')}
                fullWidth
                value={values.notes ?? ''}
                error={touched.notes === true && Boolean(errors.notes)}
                helperText={touched.notes === true && errors.notes}
                onBlur={handleBlur}
                onChange={handleChange}
                multiline
                minRows={2}
              />
            </Stack>
            <SubmitListener />
          </Form>
        )}
      </Formik>
    </Container>
  )
}
