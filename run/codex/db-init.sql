DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'journeys') THEN
    CREATE DATABASE journeys;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'users') THEN
    CREATE DATABASE users;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'languages') THEN
    CREATE DATABASE languages;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'media') THEN
    CREATE DATABASE media;
  END IF;

  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'analytics') THEN
    CREATE DATABASE analytics;
  END IF;
END
$$;
