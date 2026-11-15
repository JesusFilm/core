-- Run as the database administrator against the auth logical database only.
-- Supply migration_role, runtime_role, migration_password and runtime_password
-- as psql variables. No password is stored in a migration or image.
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD %L', :'migration_role', :'migration_password') \gexec
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD %L', :'runtime_role', :'runtime_password') \gexec
REVOKE ALL ON SCHEMA public FROM PUBLIC;
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I, %I', current_database(), :'migration_role', :'runtime_role') \gexec
SELECT format('ALTER SCHEMA public OWNER TO %I', :'migration_role') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'runtime_role') \gexec
