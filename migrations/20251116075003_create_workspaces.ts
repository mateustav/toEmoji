import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("workspaces", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.uuid("uuid").notNullable().unique().defaultTo(knex.raw("uuidv4()"));
    table.string("external_id").notNullable().unique();
    table.jsonb("bot_access_token_encrypted").notNullable();
    table.specificType("emojis", "text[]").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.raw(`ALTER TABLE workspaces
        ADD CONSTRAINT bot_access_token_encrypted_keys
        CHECK (
          (bot_access_token_encrypted \\? 'iv') AND
          (bot_access_token_encrypted \\? 'content') AND
          (bot_access_token_encrypted \\? 'tag')
        )`);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("workspaces");
}
