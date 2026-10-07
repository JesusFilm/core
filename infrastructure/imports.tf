# One-off: adopt the stage ClickHouse Cloud service that was created in the
# console (the organisation's first service has to be, since that is where the
# organisation's tier is chosen). Atlantis performs the import as part of the
# apply; remove this file once it has been applied.
import {
  to = module.stage.module.short_links_clickhouse.clickhouse_service.this
  id = "088140de-e3e3-466a-8e1c-4880378ef66d"
}
