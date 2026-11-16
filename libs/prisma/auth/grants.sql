-- Run as the migration role after prisma migrate deploy, against auth only.
-- Run again after each migration that introduces tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  "AuthEnvironment", "OAuthArtifact", "AgentConnection", "ConsentReview",
  "AuthorizationGate", "SecurityAudit"
TO :"runtime_role";
