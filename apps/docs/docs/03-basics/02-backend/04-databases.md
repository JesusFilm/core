# Databases

## About

Our Microservices use [PostgreSQL](https://www.postgresql.org/) as their Database. In Typescript we make use of [Prisma](https://www.prisma.io/) as our ORM or or Object Relational Mapper to connect with the PostgreSQL Database. Prisma provides the best experience for us to work and interact with databases. Even complex things like connection pooling, caching, real-time database subscriptions are a breeze with Prisma.

In development we run a [PostgreSQL Docker Container](https://hub.docker.com/_/postgres) alongside your Dev Container. From your Dev Container you are able to connect to `postgres@db:5432` to access the PostgreSQL DB instance.

In Production we leverage [Amazon Aurora PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraPostgreSQL.html). This is a fully managed, PostgreSQL–compatible, and ACID–compliant relational database engine that combines the speed, reliability, and manageability of Amazon Aurora with the simplicity and cost-effectiveness of open-source databases. Aurora PostgreSQL is a drop-in replacement for PostgreSQL and makes it simple and cost-effective to set up, operate, and scale your new and existing PostgreSQL deployments, thus freeing you to focus on your business and applications. To learn more about Aurora in general, see [What is Amazon Aurora?](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html).

It is important to note that in development we run one Database instance with per microservice databases inside, however, in production each instance is host to a single microservice database instance and can only be accessed via a single microservice.

## Entity Relationship Diagrams (ERD)

What follows is the most up to date Entity Relationship Diagrams ([main branch](https://github.com/JesusFilm/core)). These are generated automatically when running `nx run api-*:prisma-generate` from your Dev Container.

### API Journeys

![API Journeys ERD](https://raw.githubusercontent.com/JesusFilm/core/main/apis/api-journeys/db/ERD.svg)

### API Languages

![API Languages ERD](https://raw.githubusercontent.com/JesusFilm/core/main/libs/prisma/languages/db/ERD.svg)

### API Media

![API Media ERD](https://raw.githubusercontent.com/JesusFilm/core/main/libs/prisma/media/db/ERD.svg)

### API Users

![API Users ERD](https://raw.githubusercontent.com/JesusFilm/core/main/libs/prisma/users/db/ERD.svg)
