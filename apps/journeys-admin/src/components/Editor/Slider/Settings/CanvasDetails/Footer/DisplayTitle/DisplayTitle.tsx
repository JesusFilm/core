import Stack from "@mui/material/Stack";
import { useTranslation } from "next-i18next";
import { ReactElement } from "react";

import { useCommand } from "@core/journeys/ui/CommandProvider";
import { useJourney } from "@core/journeys/ui/JourneyProvider";
import Type3 from "@core/shared/ui/icons/Type3";

import { useJourneyUpdateMutation } from "../../../../../../../libs/useJourneyUpdateMutation";
import { TextFieldForm } from "../../../../../../TextFieldForm";
import { Accordion } from "../../Properties/Accordion";

export function DisplayTitle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyUpdate] = useJourneyUpdateMutation()

  async function handleUpdate(displayTitle): Promise<void> {
    if (journey == null) return

    const undoDisplayTitle = journey.displayTitle
    add({
      parameters: {
        execute: { displayTitle },
        undo: { displayTitle: undoDisplayTitle }
      },
      execute({ displayTitle }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              displayTitle 
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          __typename: 'Journey',
          id: journey.id,
          title: journey.title,
          description: journey.description,
          strategySlug: journey.strategySlug,
          language: journey.language,
          tags: [],
          displayTitle: displayTitle ?? journey.seoTitle ?? journey.title
        }
      }
    })
      }
    })
  }

  return (<Accordion
      id="display title"
      icon={<Type3 />}
      name={t('Display Title')}
>
    <Stack sx={{ p: 4, pt: 2 }} data-testid="DisplayTitle">
      <TextFieldForm
        id="display-title"
        initialValue={journey?.displayTitle ?? journey?.seoTitle ?? journey?.title}
        onSubmit={handleUpdate}
        label={t('Display Title')}
      />
    </Stack>
  </Accordion>)
}