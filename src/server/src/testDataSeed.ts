import argon2 from "argon2";
import { Client } from "pg";

export async function seedLocalTestData (client: Client) {
  const tableCheck = await client.query("SELECT to_regclass('public.users') AS users_table");
  if (!tableCheck.rows[0]?.users_table) {
    console.log("ℹ️ Local seed skipped because schema is not initialized");
    return;
  }

  const existingUser = await client.query("SELECT 1 FROM users LIMIT 1");
  if ((existingUser.rowCount ?? 0) > 0) {
    console.log("ℹ️ Local seed skipped because users already exist");
    return;
  }

  await insertTestData(client);
}

async function insertTestData (client: Client) {
  const hashedPassword = await argon2.hash("1234", { type: argon2.argon2id });
  await client.query(
    `INSERT INTO users (
      username,
      hashed_password
    )
    VALUES ($1, $2)`,
    [
      "admin",
      hashedPassword
    ]
  );
  console.log("✅ Initial User created");

  await client.query(
    `INSERT INTO users (
      username,
      owner_id
    )
    VALUES ($1, $2)`,
    [
      "guest1",
      "1"
    ]
  );

  await client.query(
    `INSERT INTO users (
      username,
      owner_id
    )
    VALUES ($1, $2)`,
    [
      "guest2",
      "1"
    ]
  );

  await client.query(
    `INSERT INTO user_settings(
      user_id,
      language
    )
    VALUES($1, $2)`,
    [
      "1",
      "en"
    ]
  );

  for (let i = 0; i < 20; i++) {
    await client.query(
      `INSERT INTO dinners(
        owner_id,
        title,
        date
      )
      VALUES($1, $2, $3)`,
      [
        "1",
        `Dinner ${i + 1}`,
        new Date().toUTCString()
      ]
    );
  }

  await client.query(
    `INSERT INTO dinner_courses(
      dinner_id,
      course_number,
      title,
      description,
      type,
      vegetarian,
      vegan
    )
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      "1",
      1,
      "Kartoffelsuppe",
      "",
      "starter",
      true,
      false,
    ]
  );

  await client.query(
    `INSERT INTO dinner_courses(
      dinner_id,
      course_number,
      title,
      description,
      type,
      vegetarian,
      vegan
    )
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      "1",
      2,
      "Pekingente",
      "",
      "main",
      false,
      false
    ]
  );

  await client.query(
    `INSERT INTO dinner_courses(
      dinner_id,
      course_number,
      title,
      description,
      type,
      vegetarian,
      vegan
    )
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      "1",
      3,
      "Tiramisu",
      "",
      "dessert",
      false,
      true
    ]
  );

  await client.query(
    `INSERT INTO dinner_participants(
      dinner_id,
      user_id
    )
    VALUES($1, $2)`,
    [
      "1",
      "1"
    ]
  );

  await client.query(
    `INSERT INTO dinner_participants(
      dinner_id,
      user_id
    )
    VALUES($1, $2)`,
    [
      "1",
      "2"
    ]
  );

  await client.query(
    `INSERT INTO dinner_participants(
      dinner_id,
      user_id
    )
    VALUES($1, $2)`,
    [
      "1",
      "3"
    ]
  );

  await client.query(
    `INSERT INTO food_preferences(
      owner_id,
      user_id,
      preferred_vegetarian,
      coriander,
      coffee,
      additional_comments
    )
    VALUES($1, $2, $3, $4, $5, $6)`,
    [
      "1",
      "1",
      false,
      true,
      true,
      "comment",
    ]
  );

  await client.query(
    `INSERT INTO food_allergies(
      preference_id,
      name,
      description,
      exceptions
    )
    VALUES($1, $2, $3, $4)`,
    [
      "1",
      "Laktose",
      "Milch macht Boom",
      "Laktosefreie Milch",
    ]
  );

  await client.query(
    `INSERT INTO food_distaste(
      preference_id,
      type,
      description
      )
    VALUES($1, $2, $3)`,
    [
      "1",
      "vegetables",
      "Rosenkohl",
    ]
  );
}
