export const shorthands = undefined;

export function up(pgm) {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      hashed_password TEXT,
      UNIQUE NULLS NOT DISTINCT (username, owner_id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      language TEXT,
      UNIQUE (user_id)
    );

    CREATE TABLE IF NOT EXISTS dinners (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      title TEXT,
      date TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dinner_courses (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      dinner_id BIGINT REFERENCES dinners(id) ON DELETE CASCADE NOT NULL,
      course_number INT,
      title TEXT,
      description TEXT,
      type TEXT,
      vegetarian BOOLEAN,
      vegan BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS dinner_participants (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      dinner_id BIGINT REFERENCES dinners(id) ON DELETE CASCADE NOT NULL,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      UNIQUE (dinner_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS dinner_ratings (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      course_id BIGINT REFERENCES dinner_courses(id) ON DELETE CASCADE NOT NULL,
      owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      rating INT,
      comment TEXT,
      UNIQUE (course_id, owner_id)
    );

    CREATE TABLE IF NOT EXISTS food_preference_forms (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS food_preferences (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      form_id BIGINT REFERENCES food_preference_forms(id) ON DELETE CASCADE,
      preferred_vegetarian BOOLEAN,
      coriander BOOLEAN,
      coffee BOOLEAN,
      additional_comments TEXT,
      UNIQUE NULLS NOT DISTINCT (owner_id, user_id, form_id)
    );

    CREATE TABLE IF NOT EXISTS food_distaste (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      preference_id BIGINT REFERENCES food_preferences(id) ON DELETE CASCADE NOT NULL,
      type TEXT,
      description TEXT,
      UNIQUE (preference_id, type)
    );

    CREATE TABLE IF NOT EXISTS food_allergies (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      preference_id BIGINT REFERENCES food_preferences(id) ON DELETE CASCADE NOT NULL,
      name TEXT,
      description TEXT,
      exceptions TEXT
    );
  `);
}

export function down(pgm) {
  pgm.sql(`
    DROP TABLE IF EXISTS food_allergies CASCADE;
    DROP TABLE IF EXISTS food_distaste CASCADE;
    DROP TABLE IF EXISTS food_preferences CASCADE;
    DROP TABLE IF EXISTS food_preference_forms CASCADE;
    DROP TABLE IF EXISTS dinner_ratings CASCADE;
    DROP TABLE IF EXISTS dinner_participants CASCADE;
    DROP TABLE IF EXISTS dinner_courses CASCADE;
    DROP TABLE IF EXISTS dinners CASCADE;
    DROP TABLE IF EXISTS user_settings CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}
