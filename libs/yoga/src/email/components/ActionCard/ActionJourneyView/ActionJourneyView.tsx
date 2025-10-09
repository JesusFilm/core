import {
  Button,
  Column,
  Hr,
  Img,
  Row,
  Section,
  Text
} from '@react-email/components'
import { ReactElement } from 'react'

import { JourneyForEmails } from '../../../types/types'
import { ActionButton } from '../ActionButton'

interface ActionJourneyViewProps {
  journey: JourneyForEmails
  url: string
  buttonText: string
  variant?: 'withTeam'
}

export function ActionJourneyView({
  journey,
  url,
  buttonText,
  variant
}: ActionJourneyViewProps): ReactElement {
  return (
    <Section align="center">
      <Hr className="mt-[20px]" />
      <Row>
        <Column align="center">
          <Button href={url}>
            <Row className="px-[28px]">
              <Column align="center">
                {journey.primaryImageBlock?.src != null ? (
                  <Img
                    className="mt-[30px] rounded-lg"
                    width={160}
                    height={160}
                    src={journey.primaryImageBlock?.src}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="mt-[30px] h-[160px] w-[160px] rounded-lg bg-zinc-400">
                    <Text className="m-[0px] pt-[65px] text-center align-middle font-sans text-3xl font-bold text-[#FFFFFF]">
                      {journey?.title.at(0)}
                    </Text>
                  </div>
                )}
              </Column>
            </Row>
            {variant === 'withTeam' && (
              <Row className="px-[28px]">
                <Column align="center">
                  <Text className="mb-[0px] font-sans text-[12px] leading-[16px] font-semibold text-[#ABADB7]">
                    {journey?.team?.title.toUpperCase()}
                  </Text>
                </Column>
              </Row>
            )}
            <Row className="px-[28px]">
              <Column align="center">
                <Text className="font-sans text-[20px] leading-[28px] font-semibold text-black visited:text-black">
                  {journey.title}
                </Text>
              </Column>
            </Row>
          </Button>
        </Column>
      </Row>
      {url != null && buttonText != null && (
        <Row className="mt-[20px] px-[28px]">
          <Column align="center">
            <ActionButton url={url} buttonText={buttonText} />
          </Column>
        </Row>
      )}
    </Section>
  )
}

export default ActionJourneyView
