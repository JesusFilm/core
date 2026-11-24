-- Execute on every application database through an existing approved connection.
-- Catalog reads only: results require human review and do not authorize fixes.
BEGIN TRANSACTION READ ONLY;

SELECT current_database(), current_setting('server_version');
SELECT datname, datistemplate, datconnlimit
FROM pg_catalog.pg_database
WHERE datconnlimit = -2 OR datname IN ('template0', 'template1');

SELECT database, gid, prepared
FROM pg_catalog.pg_prepared_xacts;

SELECT slot_name, slot_type, plugin, database, active
FROM pg_catalog.pg_replication_slots;

SELECT extname, extversion
FROM pg_catalog.pg_extension
ORDER BY extname;

SELECT pubname, puballtables
FROM pg_catalog.pg_publication;

-- Avoid reading subconninfo because it may contain credentials.
SELECT subname, subenabled, subslotname
FROM pg_catalog.pg_subscription;

SELECT n.nspname, c.relname, a.attname,
       pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
WHERE NOT a.attisdropped
  AND a.atttypid IN ('pg_catalog.regproc'::pg_catalog.regtype,
                    'pg_catalog.regprocedure'::pg_catalog.regtype,
                    'pg_catalog.regoper'::pg_catalog.regtype,
                    'pg_catalog.regoperator'::pg_catalog.regtype,
                    'pg_catalog.regconfig'::pg_catalog.regtype,
                    'pg_catalog.regdictionary'::pg_catalog.regtype)
  AND n.nspname NOT IN ('pg_catalog', 'information_schema');

ROLLBACK;
