import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

/** Cliente do banco. Só disponível quando DATABASE_URL está configurada. */
export const db = url ? drizzle(postgres(url, { prepare: false }), { schema }) : null;
