-- USER
-- email: admin@example.com
-- password: password
INSERT INTO "public"."users"
            ("id",
             "email",
             "inserted_at",
             "updated_at",
             "name",
             "last_seen",
             "password_hash",
             "trial_expiry_date",
             "email_verified",
             "theme",
             "grace_period")
VALUES     (1,
            'admin@example.com',
            '2024-05-08 15:13:37',
            '2024-05-08 15:13:37',
            'Admin User',
            '2024-05-08 15:13:37',
            '$2b$12$vJ8s2/Eri0rMb4y0hA7ahuihLD8mENo6VB0Nv4qGUx0RC87cHLHvC',
            '2124-05-08',
            true,
            'system',
            NULL); 

-- API KEY
-- key: 3ck4IeyRr7uq3Ax87JW3ksGhoVH-poKhOJyxqhe_PKz65dpSUc1j9kyoC_KURVdD
INSERT INTO "public"."api_keys"
            ("id",
             "user_id",
             "name",
             "key_prefix",
             "key_hash",
             "inserted_at",
             "updated_at",
             "scopes",
             "hourly_request_limit")
VALUES     (1,
            1,
            'Development',
            '3ck4Ie',
            '0893a642987eda0c9f1482abf10cf1a2ad0a58eaed13acac03e3a3055086f0ea',
            '2024-05-08 15:14:00',
            '2024-05-08 15:14:00',
            '{sites:provision:*}',
            600); 