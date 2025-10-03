-- Final SQL script to generate 10,000 visitors with unique users and events
-- This version ensures each visitor gets a completely unique user
-- Step 1: Get team info from the journey
WITH journey_info AS (
    SELECT j."teamId"
    FROM "Journey" j
    WHERE j."id" = 'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7'
),
-- Step 2: Generate visitors with completely unique users
visitor_data AS (
    SELECT gen_random_uuid() as "id",
        gen_random_uuid() as "userId",
        -- Generate unique userId for each visitor
        NOW() - (random() * interval '30 days') as "createdAt",
        CASE
            (random() * 3)::int
            WHEN 0 THEN 'US'
            WHEN 1 THEN 'CA'
            ELSE 'GB'
        END as "countryCode",
        (random() * 3600)::int as "duration",
        'test' || generate_series || '@example.com' as "email",
        'whatsApp'::"MessagePlatform" as "messagePlatform",
        'Test User ' || generate_series as "name",
        '+1' || (1000000000 + (random() * 8999999999)::bigint) as "phone",
        'star'::"VisitorStatus" as "status",
        ji."teamId",
        '{"browser": "Test Browser", "version": "1.0"}'::json as "userAgent",
        NOW() as "updatedAt"
    FROM generate_series(1, 10000),
        journey_info ji
),
-- Step 3: Insert users into UserTeam table
inserted_users AS (
    INSERT INTO "UserTeam" ("id", "userId", "teamId", "role", "updatedAt")
    SELECT gen_random_uuid(),
        vd."userId",
        vd."teamId",
        'member',
        NOW()
    FROM visitor_data vd
    RETURNING "userId",
        "teamId"
),
-- Step 4: Insert visitors
inserted_visitors AS (
    INSERT INTO "Visitor" (
            "id",
            "createdAt",
            "countryCode",
            "duration",
            "email",
            "messagePlatform",
            "name",
            "phone",
            "status",
            "teamId",
            "userId",
            "userAgent",
            "updatedAt"
        )
    SELECT "id",
        "createdAt",
        "countryCode",
        "duration",
        "email",
        "messagePlatform",
        "name",
        "phone",
        "status",
        "teamId",
        "userId",
        "userAgent",
        "updatedAt"
    FROM visitor_data
    RETURNING "id",
        "name",
        "email"
),
-- Step 5: Create journey visitor relationships
journey_visitor_data AS (
    SELECT gen_random_uuid() as "id",
        'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7' as "journeyId",
        v."id" as "visitorId",
        (random() * 300 + 60)::int as "duration"
    FROM inserted_visitors v
),
-- Step 6: Insert journey visitors
inserted_journey_visitors AS (
    INSERT INTO "JourneyVisitor" ("id", "journeyId", "visitorId", "duration")
    SELECT "id",
        "journeyId",
        "visitorId",
        "duration"
    FROM journey_visitor_data
    RETURNING "visitorId"
),
-- Step 7: Generate events for each visitor
event_data AS (
    SELECT gen_random_uuid() as "id",
        'TextResponseSubmissionEvent' as "typename",
        'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7' as "journeyId",
        CASE
            (random() * 4)::int
            WHEN 0 THEN 'a76252da-90b8-48fb-94a0-57093fdf63f4'
            WHEN 1 THEN 'b76252da-90b8-48fb-94a0-57093fdf63f5'
            WHEN 2 THEN 'c76252da-90b8-48fb-94a0-57093fdf63f6'
            ELSE 'd76252da-90b8-48fb-94a0-57093fdf63f7'
        END as "blockId",
        CASE
            (random() * 4)::int
            WHEN 0 THEN 'aa723aeb-68cb-4ba0-a67d-df43c50a5960'
            WHEN 1 THEN 'bb723aeb-68cb-4ba0-a67d-df43c50a5961'
            WHEN 2 THEN 'cc723aeb-68cb-4ba0-a67d-df43c50a5962'
            ELSE 'dd723aeb-68cb-4ba0-a67d-df43c50a5963'
        END as "stepId",
        NOW() - (random() * interval '30 days') as "createdAt",
        CASE
            (random() * 6)::int
            WHEN 0 THEN 'What is your favorite color?'
            WHEN 1 THEN 'How did you hear about us?'
            WHEN 2 THEN 'What is your age range?'
            WHEN 3 THEN 'Prayer Request'
            WHEN 4 THEN 'Additional Comments'
            ELSE 'What challenges you most?'
        END as "label",
        CASE
            (random() * 6)::int
            WHEN 0 THEN CASE
                (random() * 5)::int
                WHEN 0 THEN 'Blue'
                WHEN 1 THEN 'Red'
                WHEN 2 THEN 'Green'
                WHEN 3 THEN 'Purple'
                ELSE 'Orange'
            END
            WHEN 1 THEN CASE
                (random() * 4)::int
                WHEN 0 THEN 'Social media'
                WHEN 1 THEN 'Friend recommendation'
                WHEN 2 THEN 'Google search'
                ELSE 'Email newsletter'
            END
            WHEN 2 THEN CASE
                (random() * 4)::int
                WHEN 0 THEN '18-24'
                WHEN 1 THEN '25-34'
                WHEN 2 THEN '35-44'
                ELSE '45-54'
            END
            WHEN 3 THEN CASE
                (random() * 4)::int
                WHEN 0 THEN 'Please pray for my family'
                WHEN 1 THEN 'Health and healing'
                WHEN 2 THEN 'Job search guidance'
                ELSE 'World peace'
            END
            WHEN 4 THEN 'This is a test response for data generation'
            ELSE CASE
                (random() * 3)::int
                WHEN 0 THEN 'Time management'
                WHEN 1 THEN 'Patience'
                ELSE 'Forgiveness'
            END
        END as "value",
        jv."visitorId",
        NOW() as "updatedAt"
    FROM inserted_journey_visitors jv
        CROSS JOIN generate_series(1, (random() * 3 + 1)::int) -- 1-4 events per visitor
) -- Step 8: Insert events
INSERT INTO "Event" (
        "id",
        "typename",
        "journeyId",
        "blockId",
        "stepId",
        "createdAt",
        "label",
        "value",
        "visitorId",
        "updatedAt"
    )
SELECT "id",
    "typename",
    "journeyId",
    "blockId",
    "stepId",
    "createdAt",
    "label",
    "value",
    "visitorId",
    "updatedAt"
FROM event_data;
-- Verify results
SELECT 'Users created:' as metric,
    COUNT(*) as count
FROM "UserTeam" ut
    JOIN "Journey" j ON ut."teamId" = j."teamId"
WHERE j."id" = 'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7'
UNION ALL
SELECT 'Visitors created:' as metric,
    COUNT(*) as count
FROM "Visitor" v
    JOIN "JourneyVisitor" jv ON v."id" = jv."visitorId"
WHERE jv."journeyId" = 'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7'
UNION ALL
SELECT 'Events created:' as metric,
    COUNT(*) as count
FROM "Event" e
WHERE e."journeyId" = 'c9bcd294-24fd-4d32-b9aa-72193aa6d8f7';