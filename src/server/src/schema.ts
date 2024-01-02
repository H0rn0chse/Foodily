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
  await client.query("CREATE TABLE IF NOT EXISTS users ( \
    id SERIAL PRIMARY KEY, \
    owner_id INT REFERENCES users(id), \
    username TEXT NOT NULL, \
    hashed_password BYTEA, \
    salt BYTEA, \
    UNIQUE (username) \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS user_settings ( \
    id SERIAL PRIMARY KEY, \
    user_id INT REFERENCES users(id) NOT NULL, \
    language TEXT, \
    UNIQUE (user_id) \
  )");

  // await client.query("CREATE TABLE IF NOT EXISTS recipe ( \
  //   id SERIAL PRIMARY KEY, \
  //   owner_id INT REFERENCES users(id), \
  //   link TEXT, \
  //   comment TEXT \
  // )");

  await client.query("CREATE TABLE IF NOT EXISTS dinners ( \
    id SERIAL PRIMARY KEY, \
    owner_id INT REFERENCES users(id) NOT NULL, \
    date TIMESTAMP \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS dinner_courses ( \
    id SERIAL PRIMARY KEY, \
    dinner_id INT REFERENCES dinners(id) NOT NULL, \
    course_number INT, \
    title TEXT, \
    description TEXT, \
    type TEXT, \
    vegetarian BOOLEAN, \
    UNIQUE (dinner_id, course_number) \
  )"); // todo 'type' to enum

  await client.query("CREATE TABLE IF NOT EXISTS dinner_participants ( \
    id SERIAL PRIMARY KEY, \
    dinner_id INT REFERENCES dinners(id) NOT NULL, \
    user_id INT REFERENCES users(id) NOT NULL, \
    UNIQUE (dinner_id, user_id) \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS dinner_ratings ( \
    id SERIAL PRIMARY KEY, \
    course_id INT REFERENCES dinner_courses(id) NOT NULL, \
    owner_id INT REFERENCES users(id) NOT NULL, \
    rating INT, \
    comment TEXT, \
    UNIQUE (course_id, owner_id) \
  )"); // todo 'rating' to enum

  await client.query("CREATE TABLE IF NOT EXISTS food_preferences ( \
    id SERIAL PRIMARY KEY, \
    owner_id INT REFERENCES users(id) NOT NULL, \
    user_id INT REFERENCES users(id) NOT NULL, \
    preferred_vegetarian BOOLEAN, \
    coriander BOOLEAN, \
    coffee BOOLEAN, \
    additional_comments TEXT \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS food_distaste ( \
    id SERIAL PRIMARY KEY, \
    preference_id INT REFERENCES food_preferences(id) NOT NULL, \
    type TEXT, \
    description TEXT, \
    UNIQUE (preference_id, type) \
  )"); // todo 'type' to enum

  await client.query("CREATE TABLE IF NOT EXISTS food_allergies ( \
    id SERIAL PRIMARY KEY, \
    preference_id INT REFERENCES food_preferences(id) NOT NULL, \
    name TEXT, \
    description TEXT, \
    exceptions TEXT \
  )");

  await client.query("CREATE TABLE IF NOT EXISTS food_preference_forms ( \
    id SERIAL PRIMARY KEY, \
    preference_id INT REFERENCES food_preferences(id) NOT NULL, \
    status TEXT \
  )"); // todo 'status' to enum
}

async function addTestData (client: Client) {
  const salt = crypto.randomBytes(16);
  await client.query(
    "INSERT INTO users (username, hashed_password, salt) \
    VALUES ($1, $2, $3) \
    ON CONFLICT (username) \
    DO NOTHING",
    [
      "admin",
      crypto.pbkdf2Sync("1234", salt, 310000, 32, "sha256"),
      salt
    ]
  );
  console.log("✅ Initial User created");

  await client.query(
    "INSERT INTO user_settings(user_id, language)\
    VALUES($1, $2)",
    [
      1,
      "en"
    ]
  );
}
