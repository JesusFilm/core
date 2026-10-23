-- Split from the preceding migration so this validation scan runs in its
-- own transaction, under SHARE UPDATE EXCLUSIVE (concurrent reads/writes
-- allowed) rather than inheriting the ACCESS EXCLUSIVE lock the prior
-- migration's SET DEFAULT/ADD CONSTRAINT ... NOT VALID held for the rest of
-- its own transaction — that lock was already released at the prior
-- migration's COMMIT by the time this one starts.
ALTER TABLE "Video" VALIDATE CONSTRAINT "Video_availableLanguages_not_null_check";

-- SET NOT NULL recognizes the equivalent validated CHECK constraint above
-- and skips its own full-table scan, so the ACCESS EXCLUSIVE lock it does
-- take here is brief.
ALTER TABLE "Video" ALTER COLUMN "availableLanguages" SET NOT NULL;
ALTER TABLE "Video" DROP CONSTRAINT "Video_availableLanguages_not_null_check";
