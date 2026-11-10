## BigQuery replication verification handoff for #10524

Checked 2026-11-10 in the issue worktree. Live warehouse verification is pending external access; backend unit/API tests do not establish BigQuery delivery.

Repository evidence:

- `infrastructure/UPGRADES.md:70-82` records the production 2026-10-20 preflight. The journeys database used logical replication slot `bigquery`, output plugin `pgoutput`, and publication `bq_publication` for all tables. Google Datastream replicated changes to BigQuery through the bastion. The document records stream recovery and backfill after the production PostgreSQL upgrade.
- `infrastructure/modules/aws/main.tf:40-49` allows the configured Google Datastream source addresses to SSH to the bastion. This supports the documented network path; it does not establish current stream health.
- No actual GCP project, region, stream ID, source/destination connection-profile ID, destination dataset/table ID, maximum staleness setting, or expected/measured replication delay was found in the checked-in infrastructure. The publication's all-tables selection is source-side evidence only. Datastream's current object selection and destination Event inclusion remain unverified.

Access evidence:

- `gcloud`, `bq`, and `aws` are unavailable on PATH.
- `/home/phoebe/.config/gcloud` and its application-default-credentials file are absent.
- `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GCLOUD_PROJECT`, and `CLOUDSDK_CORE_PROJECT` are unset.
- No connected BigQuery or Datastream tool is available in this session.
- Matthew's Google principal and destination IAM grants cannot be determined from this environment. No read-access claim is made.

Remaining external checks, owned by the backend deployment handoff:

1. Obtain authenticated read access to the existing production Datastream project. Record the full stream resource name, source/destination connection profiles, source database, publication, replication slot, destination project/dataset/table, current stream state, object-level errors, and destination write mode. Confirm `public.Event` is selected at both source and destination. Reuse this pipeline; do not introduce a second BigQuery writer.
2. Record the configured destination maximum staleness and current Datastream latency. Define the expected reconciliation window from the actual configuration and observed latency, rather than inventing a fixed delay.
3. Deploy the additive Event migration and backend schema. Verify the new nullable `captureIdentity`, `captureTag`, `captureTrigger` and `templateFamilyId` columns appear in the actual destination Event table using `INFORMATION_SCHEMA.COLUMNS`. Historical rows must remain null in the added fields.
4. Against a controlled journey in the deployed environment, authenticate as an anonymous visitor and call one fixed capture create mutation and one custom capture create mutation with distinct saved occurrence UUIDs. Record API saved IDs, concrete typenames, block/step/journey, stable identity/tag, family, and source creation timestamps. Redeliver each UUID and confirm it does not overwrite attribution or add another Event row.
5. Query the actual destination table by those UUIDs after the measured propagation window. Reconcile every identity and attribution field, record arrival timestamps and observed delay, and verify one destination row per source occurrence according to the stream's actual destination write mode. For append-only destinations, use the stream's documented latest-row/delete semantics before counting.
6. Identify Matthew's exact principal. Review effective dataset/table grants plus any required query-job project access, row policies and policy-tag access. Have Matthew execute the same query successfully under his own principal; a service-account query alone does not verify his access.
7. After #10526 is deployed, repeat the reconciliation using actual viewer-generated occurrence UUIDs. Verify Card, selected RadioOption, and video start/completion paths. This final viewer reconciliation is still pending and cannot be established by backend API tests.

Sample reconciliation query template. Replace the destination placeholders only after recording the live identifiers. Capture columns below follow the implementation contract:

```sql
SELECT
  id,
  typename,
  journeyId,
  visitorId,
  blockId,
  stepId,
  createdAt,
  captureIdentity,
  captureTag,
  captureTrigger,
  templateFamilyId
FROM `<actual project>.<actual dataset>.<actual Event table>`
WHERE id IN (@fixed_occurrence_id, @custom_occurrence_id)
ORDER BY createdAt, id;
```

Schema propagation check:

```sql
SELECT column_name, data_type, is_nullable
FROM `<actual project>.<actual dataset>.INFORMATION_SCHEMA.COLUMNS`
WHERE table_name = @actual_event_table
ORDER BY ordinal_position;
```

There is no historical tag backfill. Raw capture occurrence counts do not equal Plausible unique visitors.

## Local database verification

On 2026-11-10, the generated additive migration was applied to the isolated local
`journeys_issue_10524` database. Actual GraphQL execution against PostgreSQL created
`ChristDecisionCaptureEvent` UUID `ef6f774e-408c-441d-bd47-141acff92051` and
`Custom1CaptureEvent` UUID `c271851f-2f5a-41dc-b01d-900055debbdf`.
Eight concurrent deliveries of the custom UUID produced one stored row. Both concrete
types resolved through the actual Event interface. Editing the journey family and Card
tag left the original capture and its retry unchanged. Journey interaction lists/counts
remained empty and `JourneyVisitor.activityCount` stayed zero. The local fixtures were
removed after verification. These are local verification UUIDs, not warehouse evidence;
new controlled UUIDs must be recorded against the deployed API in steps 4 and 5 above.
