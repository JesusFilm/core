import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Trans, useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { bodySx, bulletListSx, numberedListSx, subHeadingSx } from '../styles'

const codeBlockSx = {
  display: 'block',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 13,
  bgcolor: '#EFEFEF',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  px: 1,
  py: 1,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all'
}

const inlineCodeSx = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: 14,
  bgcolor: '#EFEFEF',
  px: 0.5,
  borderRadius: 0.5
}

/**
 * EmbeddingCanvaOrGoogleSlidesSection — Section 5 of TemplateInfoPanel
 * (NES-1538). No Figma — copy is taken verbatim from Siyang's 2026-05-11
 * ticket comment (`9277fdef-0200-44e4-b48c-0bfe37c0de0f`).
 *
 * Three sub-blocks:
 *   5a — Canva canonical-URL transformation (`/edit` → `/view`, strip utm)
 *   5b — Google Slides Publish-to-web → Embed flow
 *   5c — Troubleshooting checklist
 *
 * The warning callout about Canva short links uses MUI Alert (warning,
 * outlined) per the comment's ⚠️ marker. GIF candidates (`canva-canonical-
 * url-flow.gif`, `google-slides-publish-to-web-flow.gif`) are optional per
 * the comment and not rendered in this initial implementation.
 */
export function EmbeddingCanvaOrGoogleSlidesSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack gap={2} data-testid="EmbeddingCanvaOrGoogleSlidesSection">
      <Typography sx={bodySx}>
        <Trans
          t={t}
          i18nKey="The <0>New Collection → Add PDF/Video with instructions</0> field accepts an embed URL. Only <1>Canva</1> and <2>Google Slides</2> links can render. The link must be the canonical view URL, not a share-shortened URL."
          components={[
            <strong key="collection" />,
            <strong key="canva" />,
            <strong key="slides" />
          ]}
        />
      </Typography>

      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Canva')}</Typography>
        <Box
          data-testid="CanvaUrlShapesCheatSheet"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography sx={{ ...bodySx, fontWeight: 600 }}>
            {t('URL shapes you might see in Canva:')}
          </Typography>
          <Stack
            direction="row"
            gap={1}
            alignItems="flex-start"
            data-testid="CanvaUrlShape-shortLink"
          >
            <Box
              component="span"
              aria-label={t('Will not embed')}
              sx={{ flexShrink: 0, lineHeight: '24px' }}
            >
              ❌
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Box component="code" sx={inlineCodeSx}>
                canva.link/&lt;shortcode&gt;
              </Box>{' '}
              <Typography component="span" sx={bodySx}>
                <Trans
                  t={t}
                  i18nKey="— what Canva's <0>Copy link</0> button gives you. Redirects server-side to /edit and drops the embed parameter."
                  components={[<strong key="copy-link" />]}
                />
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            gap={1}
            alignItems="flex-start"
            data-testid="CanvaUrlShape-edit"
          >
            <Box
              component="span"
              aria-label={t('Will not embed')}
              sx={{ flexShrink: 0, lineHeight: '24px' }}
            >
              ❌
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Box component="code" sx={inlineCodeSx}>
                canva.com/design/&lt;id&gt;/edit
              </Box>{' '}
              <Typography component="span" sx={bodySx}>
                {t(
                  '— the URL in your address bar while editing. Canva blocks /edit URLs from rendering in an iframe.'
                )}
              </Typography>
            </Box>
          </Stack>
          <Stack
            direction="row"
            gap={1}
            alignItems="flex-start"
            data-testid="CanvaUrlShape-view"
          >
            <Box
              component="span"
              aria-label={t('Embeds correctly')}
              sx={{ flexShrink: 0, lineHeight: '24px' }}
            >
              ✅
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Box component="code" sx={inlineCodeSx}>
                canva.com/design/&lt;id&gt;/&lt;token&gt;/view
              </Box>{' '}
              <Typography component="span" sx={bodySx}>
                <Trans
                  t={t}
                  i18nKey="— what <0>Share → view-only link</0> (or Present mode) gives you. This is the shape the embed accepts."
                  components={[<strong key="share-view" />]}
                />
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Box component="ol" sx={numberedListSx}>
          <li>
            {t(
              'Open the design in Canva (web app — not the mobile share sheet).'
            )}
          </li>
          <li>
            {t("Look at your browser's address bar. It'll look like:")}
            <Box component="code" sx={codeBlockSx}>
              {
                'https://www.canva.com/design/DAHJB67vCNY/BcaCmy_lNO4OCntKWMooqA/edit?utm_content=…'
              }
            </Box>
          </li>
          <li>
            <Trans
              t={t}
              i18nKey="Change <0>/edit</0> to <1>/view</1> at the end of the path."
              components={[
                <Box component="code" key="edit" sx={inlineCodeSx} />,
                <Box component="code" key="view" sx={inlineCodeSx} />
              ]}
            />
          </li>
          <li>
            <Trans
              t={t}
              i18nKey="Delete everything after <0>/view</0> (the <1>?utm_content=…</1> query params)."
              components={[
                <Box component="code" key="view" sx={inlineCodeSx} />,
                <Box component="code" key="utm" sx={inlineCodeSx} />
              ]}
            />
          </li>
          <li>
            {t('Final URL to paste:')}
            <Box component="code" sx={codeBlockSx}>
              {
                'https://www.canva.com/design/DAHJB67vCNY/BcaCmy_lNO4OCntKWMooqA/view'
              }
            </Box>
          </li>
          <li>
            <Trans
              t={t}
              i18nKey='Open <0>Share</0> in Canva and confirm the design is set to <1>"Anyone with the link can view"</1>. Private designs won&apos;t embed.'
              components={[<strong key="share" />, <strong key="permission" />]}
            />
          </li>
        </Box>
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ alignItems: 'flex-start' }}
        >
          <Trans
            t={t}
            i18nKey='<0>Two URL shapes that look right but won&apos;t embed:</0> <1>canva.link/…</1> short links (redirect server-side and drop the embed parameter) and <2>/edit</2> URLs from the address bar (Canva blocks them in iframes). Both surface as "refused to connect."'
            components={[
              <strong key="warning" />,
              <Box component="code" key="short-link" sx={inlineCodeSx} />,
              <Box component="code" key="edit-url" sx={inlineCodeSx} />
            ]}
          />
        </Alert>
      </Stack>

      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Google Slides')}</Typography>
        <Box component="ol" sx={numberedListSx}>
          <li>{t('Open the presentation in Google Slides.')}</li>
          <li>
            <Trans
              t={t}
              i18nKey="<0>File → Share → Publish to web → Embed</0> tab."
              components={[<strong key="path" />]}
            />
          </li>
          <li>
            <Trans
              t={t}
              i18nKey='Copy the URL inside the iframe&apos;s <0>src=""</0> attribute. Shape:'
              components={[
                <Box component="code" key="src" sx={inlineCodeSx} />
              ]}
            />
            <Box component="code" sx={codeBlockSx}>
              {
                'https://docs.google.com/presentation/d/e/2PACX-1vS…/pub?start=false&loop=false&delayms=3000'
              }
            </Box>
          </li>
          <li>{t('Paste that URL.')}</li>
        </Box>
        <Typography sx={bodySx}>
          <Trans
            t={t}
            i18nKey='(File → Share → "Copy link" gives a different URL that can&apos;t embed — make sure you use <0>Publish to web</0>.)'
            components={[<strong key="publish" />]}
          />
        </Typography>
      </Stack>

      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Troubleshooting')}</Typography>
        <Typography sx={bodySx}>
          {t('If the preview shows "refused to connect":')}
        </Typography>
        <Box component="ul" sx={bulletListSx}>
          <li>
            {t(
              'Confirm the Canva design is publicly shareable (Share → "Anyone with the link can view").'
            )}
          </li>
          <li>
            <Trans
              t={t}
              i18nKey="Confirm the URL ends in <0>/view</0> for Canva, or <1>/pub?…</1> for Google Slides — not <2>/edit</2> or short links."
              components={[
                <Box component="code" key="view" sx={inlineCodeSx} />,
                <Box component="code" key="pub" sx={inlineCodeSx} />,
                <Box component="code" key="edit" sx={inlineCodeSx} />
              ]}
            />
          </li>
          <li>
            <Trans
              t={t}
              i18nKey="Strip any <0>?utm_content=…</0> or other query params after <1>/view</1>."
              components={[
                <Box component="code" key="utm" sx={inlineCodeSx} />,
                <Box component="code" key="view" sx={inlineCodeSx} />
              ]}
            />
          </li>
        </Box>
      </Stack>
    </Stack>
  )
}
