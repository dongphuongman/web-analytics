-- Sites per user: 5 -> 10. Only rows still on the old default move; a limit
-- an operator set by hand (including 0 = unlimited) is kept. New users get 10
-- from Better Auth's additionalFields (lib/auth.ts): changing the column
-- DEFAULT would make drizzle-kit rebuild the users table, and dropping it
-- cascades to sessions.
UPDATE `users` SET `site_limit` = 10 WHERE `site_limit` = 5;
