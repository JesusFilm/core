# AI journey builder prototype

Tracks ENG-3766 and ENG-3768. The authenticated admin page is `/ai-builder`, reachable through **AI Builder** in the navigation drawer. Chat and draft JSON stay in browser local storage. Preview blocks use the existing renderer. This prototype does not save real journeys to the database.

## Stage configuration

Set `QWEN_AI_JOURNEYS_KEY` in Doppler project `api-journeys`, config `stg`, to a dedicated LiteLLM gateway key. The code defaults to `https://ai-gateway.jesusfilm.org/v1`, model `coding`, and a five-minute run timeout. Local development uses the same key name in the environment running api-journeys.

The API infrastructure passes this key to ECS only for stage. Apply the stage Terraform plan before testing, then deploy/restart api-journeys so its task uses the new secret mapping. Merely changing Doppler does not update the ECS task definition. No Prisma migration is needed for this prototype.

Open a draft PR targeting main with the `on stage` label. The merge bot maintains it on stage. Keep the PR unmerged while testing.

## Stage smoke test

1. Sign in to journeys-admin on stage and open `/ai-builder`.
2. Create a draft and request a five-step Easter journey for teens.
3. Confirm the proposed plan. Check that progress continues and the preview renders each card, including images.
4. Request a small edit to one card. Check that the requested card changes and the other cards remain unchanged.
5. Reload the page and reopen the draft. Check that chat and preview persist.
6. Start another request and stop it. Check that another request can be started and the previous journey stays available.

Image search calls the existing gateway with `GATEWAY_URL` and `INTEROP_TOKEN`, which are already configured for api-journeys. No additional image key is needed.

## Quality evaluation

`testSet/testSet.json` is still a draft for Siyang to edit and freeze. Run `testSet/runTestSet.ts` with the API environment loaded, using the command documented at the top of that file. `--only create-01,edit-01` runs a small smoke set; `--no-images` skips Unsplash. Results and blank scoring sheets are written under the ignored `testSet/results` directory.

Automated validity checks do not establish the quality pass bar. Siyang still needs to score results 1–5 and assess whether edits respect the requested scope.
