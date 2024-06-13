import Typography from '@mui/material/Typography'
import { Trans, useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface TermsOfUseDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {
  onSubmit: () => void
}

export function TermsOfUseDialog({
  open,
  onClose,
  onSubmit
}: TermsOfUseDialogProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: 'Terms of Use',
        closeButton: true
      }}
      dialogAction={{
        onSubmit,
        submitLabel: 'Accept',
        closeLabel: 'Cancel'
      }}
      divider
      testId="TermsOfUseDialog"
    >
      <Trans t={t}>
        <Typography>
          PLEASE CAREFULLY REVIEW THE TERMS OF USE OF THIS SITE. As your use of
          the site will indicate your acceptance of these terms, do not use the
          site if you do not agree to be bound by these terms. We may
          periodically change the terms, so please check them from time to time
          as your continued use of the site signifies your acceptance of any
          changed items.
          <br />
          <br />
          WHILE WE MAKE REASONABLE EFFORTS TO PROVIDE ACCURATE AND TIMELY
          INFORMATION, REPORTS AND PRAYER REQUESTS ON JESUSFILM.ORG /.COM /.NET,
          YOU SHOULD NOT ASSUME THAT THE INFORMATION PROVIDED IS ALWAYS UP TO
          DATE OR THAT THIS SITE CONTAINS ALL THE RELEVANT INFORMATION
          AVAILABLE. IN PARTICULAR, IF YOU ARE MAKING A CONTRIBUTION DECISION
          REGARDING JESUS FILM PROJECT, PLEASE CONSULT A NUMBER OF DIFFERENT
          SOURCES, INCLUDING THE CHARTER MEMBERSHIP INFORMATION AT THE
          EVANGELICAL COUNCIL FOR FINANCIAL ACCOUNTABILITY (ECFA).
          <br />
          <br />
          COPYRIGHT AND TRADEMARK. Unless otherwise noted, all materials on this
          site are protected as the copyrights, trademarks, service marks and/or
          other intellectual properties owned or controlled by Jesus Film
          Project. All rights not expressly granted are reserved. <br />
          <br />
          PERSONAL USE. Your use of the materials included on this site is for
          informational purposes only. You agree you will not distribute,
          publish, transmit, modify, display or create derivative works from or
          exploit the contents of this site in any way; except that you may
          print and distribute a page or pages in their entirety, providing the
          same have not been edited or modified by you in any way or form. You
          agree to indemnify, defend and hold harmless Jesus Film Project for
          any and all unauthorized uses you may make of any material on the
          site. You acknowledge the unauthorized use of the contents could cause
          irreparable harm to Jesus Film Project and/or individuals that may be
          associated with Jesus Film Project worldwide, and that in the event of
          an unauthorized use, Jesus Film Project shall be entitled to an
          injunction in addition to any other remedies available by law or in
          equity.
          <br />
          <br />
          FEEDBACK AND SUBMISSIONS. You agree you are and shall remain solely
          responsible for the contents of any submissions you make, and you will
          not submit material that is unlawful, defamatory, abusive or obscene.
          You agree that you will not submit anything to the site that will
          violate any right of any third party, including copyright, trademark,
          privacy or other personal or proprietary right(s). While we appreciate
          and encourage your interest in jesusfilm.org /.com /.net, we do not
          want and cannot accept any ideas you consider to be proprietary
          regarding designs, technology or other suggestions you may have
          developed. Consequently, any material you submit to this site will be
          deemed a grant of a royalty free non-exclusive right and license to
          use, reproduce, modify, display, transmit, adapt, publish, translate,
          create derivative works from and distribute these materials throughout
          the world in any medium and through any methods of distribution,
          transmission and display whether now known or hereafter devised.
          <br />
          <br />
          PRODUCT SALES AND AVAILABILITY. All products displayed on this site
          and from the jesusfilmstore.com, can be delivered outside the United
          States, for additional cost. All prices displayed on the
          jesusfilmstore.com site are quoted in U.S. Dollars and are valid and
          effective only in the United States. The JESUS Film Project reserves
          the right without prior notice, to discontinue or change information,
          availability and pricing on any product on the site without incurring
          any obligations. <br />
          <br />
          LINKS. From time to time, Jesus Film Project may provide links on the
          site that will allow you to connect with sites that are not under our
          control. Jesus Film Project is providing these links only as a
          convenience. The appearance of a link does not imply Jesus Film
          Project endorsement, nor is Jesus Film Project responsible for the
          contents of any linked site. You access them at your own risk.
          <br />
          <br />
          DISCLAIMER. EXCEPT AS OTHERWISE EXPRESSLY STATED WITH RESPECT TO OUR
          PRODUCTS, ALL CONTENTS OF THE SITE ARE OFFERED ON AN “AS IS” BASIS
          WITHOUT ANY WARRANTY WHATSOEVER EITHER EXPRESS OR IMPLIED. THE JESUS
          FILM PROJECT MAKES NO REPRESENTATIONS, EXPRESS OR IMPLIED, INCLUDING
          WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
          FOR A PARTICULAR PURPOSE. Jesus Film Project does not guarantee the
          functions contained in the site will be uninterrupted or error-free,
          that this site or its server will be free of viruses or other harmful
          components.
          <br />
          <br />
          MINORS. Jesus Film Project asks that parents supervise their children
          while online.
          <br />
          <br />
          JURISDICTIONAL. Any dispute arising from these terms shall be resolved
          exclusively in the state and federal courts of the State of
          California. Jesus Film Project makes no representation that materials
          in this site are appropriate or available for use in other locations.
          If you access this site from outside the United States, be advised
          this site may contain references to products and other information
          that may not be available or may be prohibited in your country.
        </Typography>
      </Trans>
    </Dialog>
  )
}
