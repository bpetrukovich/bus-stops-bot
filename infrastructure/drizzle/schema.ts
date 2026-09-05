import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";

export const reminders = pgTable(
  "reminders",
  {
    busstop: varchar({ length: 10 }).notNull(),
    transportName: varchar({ length: 100 }).notNull(),
    remindInMinutes: integer().notNull(),
    key: integer().notNull(),
    userId: integer().notNull(),
    isActive: boolean().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.key] })],
);
