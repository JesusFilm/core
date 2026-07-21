# QA-554 Watch acceptance

## Goal

Prove that repaired Do You Ever Wonder parent-language availability is visible through public Watch behavior.

## User flow

Open each reported parent-language URL → confirm the parent resolves → confirm the collection reports and renders eight Child Videos.

## Coverage

- Kurmanji Standard (`20770`)
- Tajik
- Pashto Eastern Afghan
- Parent page does not return an HTTP error
- Exactly eight Child cards render for each language

## Verification

Run `pnpm dlx nx run watch-e2e:e2e --grep "Do You Ever Wonder"` against a deployment containing the repaired catalog and refreshed indexes.

## Manual follow-up

Verify the same three languages and eight Children in the iOS app after index and cache refresh. No automated iOS harness exists in this repository.
