import crypto from "crypto";
import { Client } from "pg";

/*
 * User
 * UserSetting
 * Dinner
 *  - Participants
 *  - Courses
 *    + Rating
 * FoodPreference
 * FoodPreferenceForm
 */

export async function init (client: Client) {
  await dropAllTables(client);
  await createTables(client);
  console.log("✅ Database schema applied");
  await addTestData(client);
}

async function dropAllTables (client: Client) {
  await [
    "users",
    "user_settings",
    "recipe",
    "dinners",
    "dinner_courses",
    "dinner_participants",
    "dinner_ratings",
    "food_preferences",
    "food_distaste",
    "food_allergies",
  ].reduce(async (promise, tableName) => {
    await promise;
    await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
  }, Promise.resolve());
}

async function createTables (client: Client) {
  await client.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    hashed_password BYTEA,
    salt BYTEA,
    UNIQUE (username)
  )`); // todo: check cascade

  await client.query(`CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    language TEXT,
    UNIQUE (user_id)
  )`);

  // await client.query(`CREATE TABLE IF NOT EXISTS recipe (
  //   id SERIAL PRIMARY KEY,
  //   owner_id INT REFERENCES users(id),
  //   link TEXT,
  //   comment TEXT
  // )`);

  await client.query(`CREATE TABLE IF NOT EXISTS dinners (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP
  )`);

  await client.query(`CREATE TABLE IF NOT EXISTS dinner_courses (
    id SERIAL PRIMARY KEY,
    dinner_id INT REFERENCES dinners(id) ON DELETE CASCADE NOT NULL,
    course_number INT,
    main BOOLEAN,
    title TEXT,
    description TEXT,
    type TEXT,
    vegetarian BOOLEAN
  )`); // todo 'type' to enum

  await client.query(`CREATE TABLE IF NOT EXISTS dinner_participants (
    id SERIAL PRIMARY KEY,
    dinner_id INT REFERENCES dinners(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (dinner_id, user_id)
  )`);

  await client.query(`CREATE TABLE IF NOT EXISTS dinner_ratings (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES dinner_courses(id) ON DELETE CASCADE NOT NULL,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INT,
    comment TEXT,
    UNIQUE (course_id, owner_id)
  )`); // todo 'rating' to enum

  await client.query(`CREATE TABLE IF NOT EXISTS food_preferences (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    preferred_vegetarian BOOLEAN,
    coriander BOOLEAN,
    coffee BOOLEAN,
    additional_comments TEXT
  )`);

  await client.query(`CREATE TABLE IF NOT EXISTS food_distaste (
    id SERIAL PRIMARY KEY,
    preference_id INT REFERENCES food_preferences(id) ON DELETE CASCADE NOT NULL,
    type TEXT,
    description TEXT,
    UNIQUE (preference_id, type)
  )`); // todo 'type' to enum

  await client.query(`CREATE TABLE IF NOT EXISTS food_allergies (
    id SERIAL PRIMARY KEY,
    preference_id INT REFERENCES food_preferences(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    description TEXT,
    exceptions TEXT
  )`);

  await client.query(`CREATE TABLE IF NOT EXISTS food_preference_forms (
    id SERIAL PRIMARY KEY,
    preference_id INT REFERENCES food_preferences(id) ON DELETE CASCADE NOT NULL,
    status TEXT
  )`); // todo 'status' to enum
}

async function addTestData (client: Client) {
  const salt = crypto.randomBytes(16);
  await client.query( // initial user
    `INSERT INTO users (username, hashed_password, salt)
    VALUES ($1, $2, $3)
    ON CONFLICT (username)
    DO NOTHING`,
    [
      "admin", // username
      crypto.pbkdf2Sync("1234", salt, 310000, 32, "sha256"), // hashed_password
      salt // salt
    ]
  );
  console.log("✅ Initial User created");


  await client.query( // guest1
    `INSERT INTO users (username, owner_id)
    VALUES ($1, $2)`,
    [
      "guest1", // username
      1 // owner_id
    ]
  );

  await client.query( // guest1
    `INSERT INTO users (username, owner_id)
    VALUES ($1, $2)`,
    [
      "guest2", // username
      1 // owner_id
    ]
  );

  await client.query( // user_settings - admin
    `INSERT INTO user_settings(user_id, language)
    VALUES($1, $2)`,
    [
      1, // user_id
      "en" // language
    ]
  );

  await client.query( // dinner1
    `INSERT INTO dinners(owner_id, date)
    VALUES($1, $2)`,
    [
      1, // owner_id
      new Date().toUTCString() // date
    ]
  );

  await client.query( // dinner1 - course1
    `INSERT INTO dinner_courses(dinner_id, course_number, main, title, description, type, vegetarian)
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      1, // dinner_id
      1, // course_number
      false, // main
      "Kartoffelsuppe", // title
      "", // description
      "soup", // type
      true, // vegetarian
    ]
  );

  await client.query( // dinner1 - course2
    `INSERT INTO dinner_courses(dinner_id, course_number, main, title, description, type, vegetarian)
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      1, // dinner_id
      2, // course_number
      true, // main
      "Pekingente", // title
      "", // description
      "main_dish", // type
      false, // vegetarian
    ]
  );

  await client.query( // dinner1 - course3
    `INSERT INTO dinner_courses(dinner_id, course_number, main, title, description, type, vegetarian)
    VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      1, // dinner_id
      3, // course_number
      false, // main
      "Tiramisu", // title
      "", // description
      "dessert", // type
      false, // vegetarian
    ]
  );

  await client.query( // dinner1 - participant - admin
    `INSERT INTO dinner_participants(dinner_id, user_id)
    VALUES($1, $2)`,
    [
      1, // dinner_id
      1 // user_id
    ]
  );

  await client.query( // dinner1 - participant - guest1
    `INSERT INTO dinner_participants(dinner_id, user_id)
    VALUES($1, $2)`,
    [
      1, // dinner_id
      2 // user_id
    ]
  );

  await client.query( // dinner1 - participant - guest1
    `INSERT INTO dinner_participants(dinner_id, user_id)
    VALUES($1, $2)`,
    [
      1, // dinner_id
      3 // user_id
    ]
  );
}
