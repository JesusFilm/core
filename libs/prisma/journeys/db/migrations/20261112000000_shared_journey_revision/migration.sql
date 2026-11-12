BEGIN;

-- Block old and new writers until backfill AND every trigger are installed.
-- Normal application roles must not disable triggers or use replica mode.
LOCK TABLE "Journey", "Block", "Action", "ChatButton", "JourneyTheme",
  "JourneyCustomizationField", "JourneyTag", "Integration"
  IN SHARE ROW EXCLUSIVE MODE;

CREATE TABLE "JourneyRevision" (
  "journeyId" TEXT NOT NULL PRIMARY KEY,
  "revision" BIGINT NOT NULL DEFAULT 0 CHECK ("revision" >= 0),
  "lastTransactionId" BIGINT,
  CONSTRAINT "JourneyRevision_journeyId_fkey" FOREIGN KEY ("journeyId")
    REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "JourneyRevision" ("journeyId") SELECT "id" FROM "Journey";

-- Reverse dependency lookups must not scan all content on each block write.
CREATE INDEX "Block_parentBlockId_idx" ON "Block"("parentBlockId");
CREATE INDEX "Block_nextBlockId_idx" ON "Block"("nextBlockId");
CREATE INDEX "Block_startIconId_idx" ON "Block"("startIconId");
CREATE INDEX "Block_endIconId_idx" ON "Block"("endIconId");
CREATE INDEX "Block_submitIconId_idx" ON "Block"("submitIconId");
CREATE INDEX "Block_integrationId_idx" ON "Block"("integrationId");
CREATE INDEX "Action_blockId_idx" ON "Action"("blockId");

-- An attachment must serialize with a source update before that update
-- enumerates referring journeys. FK KEY SHARE alone permits content updates.
CREATE FUNCTION journey_revision_reference_lock() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  old_data JSONB;
  new_data JSONB := to_jsonb(NEW);
  reference_ids TEXT[];
BEGIN
  IF TG_OP = 'UPDATE' THEN old_data := to_jsonb(OLD); END IF;
  IF TG_TABLE_NAME = 'Block'
    AND old_data->'integrationId' IS DISTINCT FROM new_data->'integrationId' THEN
    PERFORM "id" FROM "Integration" WHERE "id" = new_data->>'integrationId'
      FOR NO KEY UPDATE;
  END IF;
  SELECT array_agg(value) INTO reference_ids FROM jsonb_each_text(new_data)
    WHERE key = ANY(ARRAY['primaryImageBlockId', 'creatorImageBlockId',
      'logoImageBlockId', 'menuStepBlockId', 'parentBlockId', 'coverBlockId',
      'posterBlockId', 'pollOptionImageBlockId', 'nextBlockId', 'startIconId',
      'endIconId', 'submitIconId', 'blockId'])
    AND value IS NOT NULL
    AND (old_data->key IS DISTINCT FROM new_data->key
      OR (TG_TABLE_NAME = 'Action' AND key = 'parentBlockId'));
  PERFORM "id" FROM "Block" WHERE "id" = ANY(reference_ids)
    ORDER BY "id" FOR NO KEY UPDATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER journey_revision_reference_lock BEFORE INSERT OR UPDATE ON "Journey"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_reference_lock();
CREATE TRIGGER journey_revision_reference_lock BEFORE INSERT OR UPDATE ON "Block"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_reference_lock();
CREATE TRIGGER journey_revision_reference_lock BEFORE INSERT OR UPDATE ON "Action"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_reference_lock();

-- A shared menu/cover may contain mutable descendants. Walk containment upward
-- and mutable slots backward, with UNION to terminate on existing cycles.
-- Navigation destinations remain reference-only, not copied subtrees.
CREATE FUNCTION journey_revision_block_dependencies(block_ids TEXT[]) RETURNS TEXT[]
LANGUAGE sql STABLE AS $$
  WITH RECURSIVE affected(id) AS (
    SELECT id FROM unnest(block_ids) id WHERE id IS NOT NULL
    UNION
    SELECT parent."id" FROM affected changed
      LEFT JOIN "Block" child ON child."id" = changed.id
      JOIN "Block" parent ON parent."id" = child."parentBlockId"
        OR parent."coverBlockId" = changed.id OR parent."posterBlockId" = changed.id
        OR parent."pollOptionImageBlockId" = changed.id
        OR parent."startIconId" = changed.id OR parent."endIconId" = changed.id
        OR parent."submitIconId" = changed.id
  ) SELECT array_agg(id) FROM affected;
$$;

-- The Journey row is the publication/state lock. Revision and content changes
-- roll back together. Multiple row writes in one transaction advance it once.
CREATE FUNCTION journey_revision_touch(journey_ids TEXT[]) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  journey_id TEXT;
BEGIN
  FOR journey_id IN SELECT DISTINCT unnest(journey_ids) ORDER BY 1 LOOP
    PERFORM "id" FROM "Journey" WHERE "id" = journey_id FOR NO KEY UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;
    INSERT INTO "JourneyRevision" ("journeyId", "revision", "lastTransactionId")
      VALUES (journey_id, 1, txid_current())
    ON CONFLICT ("journeyId") DO UPDATE SET
      "revision" = "JourneyRevision"."revision" + 1,
      "lastTransactionId" = txid_current()
    WHERE "JourneyRevision"."lastTransactionId" IS DISTINCT FROM txid_current();
  END LOOP;
END;
$$;

CREATE FUNCTION journey_revision_root() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "JourneyRevision" ("journeyId") VALUES (NEW."id");
  ELSIF (to_jsonb(OLD) - ARRAY['updatedAt', 'plausibleToken', 'hostId'])
    IS DISTINCT FROM
    (to_jsonb(NEW) - ARRAY['updatedAt', 'plausibleToken', 'hostId']) THEN
    PERFORM journey_revision_touch(ARRAY[NEW."id"]);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER journey_revision_root AFTER INSERT OR UPDATE ON "Journey"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_root();

CREATE FUNCTION journey_revision_child() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  journey_ids TEXT[];
  entity_ids TEXT[];
  affected_ids TEXT[];
  locked_ids TEXT[] := ARRAY[]::TEXT[];
  pending_ids TEXT[];
BEGIN
  IF TG_OP <> 'INSERT' THEN old_data := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN new_data := to_jsonb(NEW); END IF;
  -- Timestamps and analytics column order are not authoring content.
  IF TG_OP = 'UPDATE' AND
    (old_data - ARRAY['updatedAt', 'exportOrder']) IS NOT DISTINCT FROM
    (new_data - ARRAY['updatedAt', 'exportOrder']) THEN RETURN NULL; END IF;

  IF TG_TABLE_NAME = 'Action' THEN
    -- Action.journeyId is a legacy destination, NEVER its owning journey.
    SELECT array_agg("journeyId") INTO journey_ids FROM "Block"
      WHERE "id" IN (old_data->>'parentBlockId', new_data->>'parentBlockId');
    entity_ids := ARRAY[old_data->>'parentBlockId', new_data->>'parentBlockId'];
  ELSIF TG_TABLE_NAME = 'Integration' THEN
    SELECT array_agg("journeyId") INTO journey_ids FROM "Block"
      WHERE "integrationId" IN (old_data->>'id', new_data->>'id');
    SELECT array_agg("id") INTO entity_ids FROM "Block"
      WHERE "integrationId" IN (old_data->>'id', new_data->>'id');
  ELSE
    journey_ids := ARRAY[old_data->>'journeyId', new_data->>'journeyId'];
  END IF;

  IF TG_TABLE_NAME IN ('Block', 'Action', 'Integration') THEN
    IF TG_TABLE_NAME = 'Block' THEN
      entity_ids := ARRAY[old_data->>'id', new_data->>'id',
        old_data->>'parentBlockId', new_data->>'parentBlockId'];
    END IF;
    -- Lock mutable ancestors before enumerating journey references. A parent
    -- may have moved while we waited, so expand until all dependencies lock.
    LOOP
      affected_ids := journey_revision_block_dependencies(entity_ids);
      SELECT array_agg(id) INTO pending_ids FROM unnest(affected_ids) id
        WHERE NOT (id = ANY(locked_ids));
      EXIT WHEN pending_ids IS NULL;
      PERFORM "id" FROM "Block" WHERE "id" = ANY(pending_ids)
        ORDER BY "id" FOR NO KEY UPDATE;
      locked_ids := locked_ids || pending_ids;
    END LOOP;
    journey_ids := journey_ids || ARRAY(
      SELECT "id" FROM "Journey" WHERE
        "primaryImageBlockId" = ANY(affected_ids) OR
        "creatorImageBlockId" = ANY(affected_ids) OR
        "logoImageBlockId" = ANY(affected_ids) OR
        "menuStepBlockId" = ANY(affected_ids)
      UNION
      SELECT "journeyId" FROM "Block" WHERE
        "id" = ANY(affected_ids) OR "nextBlockId" = ANY(affected_ids)
      UNION
      SELECT parent."journeyId" FROM "Action" action
        JOIN "Block" parent ON parent."id" = action."parentBlockId"
        WHERE action."blockId" = ANY(affected_ids)
    );
  END IF;
  PERFORM journey_revision_touch(journey_ids);
  RETURN NULL;
END;
$$;

CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "Block"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "Action"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "ChatButton"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "JourneyTheme"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "JourneyCustomizationField"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "JourneyTag"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();
CREATE TRIGGER journey_revision_child AFTER INSERT OR UPDATE OR DELETE ON "Integration"
  FOR EACH ROW EXECUTE FUNCTION journey_revision_child();

COMMIT;
