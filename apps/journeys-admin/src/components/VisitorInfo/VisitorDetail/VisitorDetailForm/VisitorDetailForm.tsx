import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import pick from 'lodash/pick'
import { ReactElement } from 'react'
import { Formik, Form } from 'formik'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { GetVisitor } from '../../../../../__generated__/GetVisitor'
import {
  MessagePlatform,
  VisitorStatus
} from '../../../../../__generated__/globalTypes'
import { VisitorUpdate } from '../../../../../__generated__/VisitorUpdate'
import { messagePlatformToLabel } from '../../messagePlatformToLabel'

export const GET_VISITOR = gql`
  query GetVisitor($id: ID!) {
    visitor(id: $id) {
      countryCode
      id
      lastChatStartedAt
      messagePlatformId
      messagePlatform
      name
      notes
      status
    }
  }
`

export const VISITOR_UPDATE = gql`
  mutation VisitorUpdate($id: ID!, $input: VisitorUpdateInput!) {
    visitorUpdate(id: $id, input: $input) {
      id
      messagePlatformId
      messagePlatform
      name
      notes
      status
    }
  }
`

interface Props {
  id: string
}

export function VisitorDetailForm({ id }: Props): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [visitorUpdate] = useMutation<VisitorUpdate>(VISITOR_UPDATE)
  // 529 (english) should be changed when adding internalization
  const { data } = useQuery<GetVisitor>(GET_VISITOR, {
    variables: { id }
  })

  async function handleSubmit(values): Promise<void> {
    const formattedValues = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key] === '' ? null : values[key]
      return acc
    }, {})
    await visitorUpdate({
      variables: {
        id,
        input: formattedValues
      }
    })
  }

  return (
    <Box sx={{ p: 4 }}>
      {data?.visitor != null && (
        <Formik
          initialValues={pick(data.visitor, [
            'messagePlatformId',
            'messagePlatform',
            'name',
            'notes',
            'status'
          ])}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Stack spacing={4}>
                <Stack spacing={4} direction="row" alignItems="center">
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
                  {data?.visitor?.lastChatStartedAt != null && (
                    <Box>
                      <Typography variant="body2">{t('Last Chat')}</Typography>
                      <Typography>
                        {format(
                          parseISO(data.visitor.lastChatStartedAt),
                          'PPp'
                        )}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <Stack spacing={4} direction="row">
                  <TextField
                    id="messagePlatformId"
                    name="messagePlatformId"
                    variant="filled"
                    label={
                      values.messagePlatform != null &&
                      values.messagePlatform !== ''
                        ? messagePlatformToLabel(values.messagePlatform, t)
                        : t('Contact')
                    }
                    fullWidth
                    value={values.messagePlatformId ?? ''}
                    error={
                      touched.messagePlatformId === true &&
                      Boolean(errors.messagePlatformId)
                    }
                    helperText={
                      touched.messagePlatformId === true &&
                      errors.messagePlatformId
                    }
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <FormControl sx={{ width: 200 }}>
                    <InputLabel id="message-platform-label">
                      {t('Platform')}
                    </InputLabel>
                    <Select
                      labelId="message-platform-label"
                      id="messagePlatform"
                      name="messagePlatform"
                      value={values.messagePlatform ?? ''}
                      label={t('Platform')}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        '.MuiSelect-select': {
                          height: 23
                        }
                      }}
                    >
                      <MenuItem value="">{t('None')}</MenuItem>
                      {Object.values(MessagePlatform).map((value) => (
                        <MenuItem key={value} value={value}>
                          {messagePlatformToLabel(value, t)}
                        </MenuItem>
                      ))}
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
      )}
    </Box>
  )
}
