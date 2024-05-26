import express from "express";
import db, { buildSetStatement } from "@/db";
import type { AuthenticatedUser } from "@/routes/auth";
import type { Course, DinnerDetails, DinnerList } from "@t/dinner";
import type { ApiResponse } from "@t/api";


const router = express.Router();

// todo ratings

// Read All
router.get("/", async (req, res) => {
  try {
    type DinnersRow = {
      id: number,
      owner_id: number,
      username: string,
      date: string,
    };
    const queryResult = await db.query<DinnersRow>(
      `SELECT
        dinners.id,
        dinners.owner_id,
        dinner_owner.username,
        date
      FROM dinners
        JOIN users dinner_owner
        ON dinners.owner_id=dinner_owner.id
      WHERE dinners.owner_id=$1`,
      [(req.user as AuthenticatedUser).id]
    );

    res.json({
      result: queryResult.rows.map((row) => {
        return {
          id: row.id,
          ownerId: row.owner_id,
          username: row.username,
          date: row.date,
        };
      }),
      count: queryResult.rowCount
    } as ApiResponse<DinnerList>);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Read Entity
router.get("/:dinnerId", async (req, res) => {
  try {
    const { dinnerId } = req.params;

    type DinnersRow = {
      id: number,
      owner_id: number,
      username: string,
      date: string,
      participants: number[],
      courses: number[]
    };
    const dinnerResult = await db.query<DinnersRow>(
      `SELECT
        dinners.id,
        dinners.owner_id,
        date,
        ARRAY(
          SELECT user_id
          FROM dinner_participants
          WHERE dinner_id=$1
        ) participants,
        ARRAY(
          SELECT id
          FROM dinner_courses
          WHERE dinner_id=$1
        ) courses
      FROM dinners
        JOIN users dinner_owner
        ON dinners.owner_id=dinner_owner.id
      WHERE dinners.id=$1
        AND dinners.owner_id=$2`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!dinnerResult.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [ dinner ] = dinnerResult.rows;

    type ParticipantsRow = {
      id: number,
      username: string,
    };
    const participantResult = await db.query<ParticipantsRow>(
      `SELECT
        id,
        username
      FROM users
      WHERE id=ANY($1::int[])`,
      [dinner.participants]
    );

    type CoursesRow = {
      id: number,
      course_number: number,
      main: boolean,
      title: string,
      description: string,
      type: string,
      vegetarian: boolean,
    };
    const courseResults = await db.query<CoursesRow>(
      `SELECT
        id,
        course_number,
        main,
        title,
        description,
        type,
        vegetarian
      FROM dinner_courses
      WHERE id=ANY($1::int[])`,
      [dinner.courses]
    );

    res.json({
      result: {
        id: dinner.id,
        ownerId: dinner.owner_id,
        username: dinner.username,
        date: dinner.date,
        participants: participantResult.rows.map((row) => {
          return {
            id: row.id,
            username: row.username,
          };
        }),
        courses: courseResults.rows.map((row) => {
          return {
            id: row.id,
            courseNumber: row.course_number,
            main: row.main,
            title: row.title,
            description: row.description,
            type: row.type,
            vegetarian: row.vegetarian,
          };
        })
      }
    } as ApiResponse<DinnerDetails>);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    type RequestBody = {
      date?: string,
    };
    const { body }: { body: RequestBody } = req;

    const dinnerData = {
      date: body.date ?? new Date().toUTCString()
    };
    
    type DinnersRow = {
      id: number,
    };
    const result = await db.query<DinnersRow>(
      `INSERT INTO dinners(
        owner_id,
        date
      )
      VALUES($1, $2)
      RETURNING id`,
      [
        (req.user as AuthenticatedUser).id,
        dinnerData.date
      ]
    );

    const dinnerId = result.rows[0].id;

    await db.query(
      `INSERT INTO dinner_participants(
        dinner_id,
        user_id
      )
      VALUES($1, $2)
      RETURNING id`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );

    res.setHeader("Location", `/api/v1/dinners/${dinnerId}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update
router.put("/:dinnerId", async (req, res) => {
  try {
    const { dinnerId } = req.params;

    type RequestBody = {
      date?: string,
    };
    const { body }: { body: RequestBody } = req;

    const dinnerData = {
      date: body.date
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(dinnerData, 3);

    const result = await db.query(
      `UPDATE dinners
      ${setStatement}
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id,
        ...newValues
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Delete
router.delete("/:dinnerId", async (req, res) => {
  try {
    const { dinnerId } = req.params;

    const result = await db.query(
      `DELETE FROM dinners
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Read Course
router.get("/:dinnerId/courses/:courseId", async (req, res) => {
  try {
    const { dinnerId, courseId } = req.params;

    type CoursesRow = {
      id: number,
      course_number: number,
      main: boolean,
      title: string,
      description: string,
      type: string,
      vegetarian: boolean,
    };
    const courseResult = await db.query<CoursesRow>(
      `SELECT
        course.id,
        course.course_number,
        course.main,
        course.title,
        course.description,
        course.type,
        course.vegetarian
      FROM dinner_courses course
        JOIN dinners
        ON dinners.id=course.dinner_id
      WHERE dinners.owner_id=$3
        AND dinners.id=$1
        AND course.id=$2`,
      [
        dinnerId,
        courseId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!courseResult.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [course] = courseResult.rows;

    res.json({
      result: {
        id: course.id,
        courseNumber: course.course_number,
        main: course.main,
        title: course.title,
        description: course.description,
        type: course.type,
        vegetarian: course.vegetarian,
      }
    } as ApiResponse<Course>);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create Course
router.post("/:dinnerId/courses", async (req, res) => {
  try {
    const { dinnerId } = req.params;

    type DinnersRow = {
      id: number,
    };
    const dinnerResult = await db.query<DinnersRow>(
      `SELECT id
      FROM dinners
      WHERE id=$1
        AND owner_id=$2`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!dinnerResult.rowCount) {
      res.sendStatus(403);
      return;
    }

    type RequestBody = {
      courseNumber?: number,
      main?: boolean,
      title?: string,
      description?: string,
      type?: string,
      vegetarian?: boolean,
    };
    const { body }: { body: RequestBody } = req;

    const courseData = {
      courseNumber: body.courseNumber ?? 1,
      main: body.main ?? true,
      title: body.title ?? "",
      description: body.description ?? "",
      type: body.type ?? "main_dish",
      vegetarian: body.vegetarian ?? false,
    };
    
    type CoursesRow = {
      id: number,
    };
    const result = await db.query<CoursesRow>(
      `INSERT INTO dinner_courses(
        dinner_id,
        course_number,
        main,
        title,
        description,
        type,
        vegetarian
      )
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        dinnerId,
        courseData.courseNumber,
        courseData.main,
        courseData.title,
        courseData.description,
        courseData.type,
        courseData.vegetarian,
      ]
    );

    res.setHeader("Location", `/api/v1/dinners/${dinnerId}/courses/${result.rows[0].id}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update Course
router.put("/:dinnerId/courses/:courseId", async (req, res) => {
  try {
    const { dinnerId, courseId } = req.params;

    type RequestBody = {
      courseNumber?: number,
      main?: boolean,
      title?: string,
      description?: string,
      type?: string,
      vegetarian?: boolean,
    };
    const { body }: { body: RequestBody } = req;

    const courseData = {
      course_number: body.courseNumber,
      main: body.main,
      title: body.title,
      description: body.description,
      type: body.type,
      vegetarian: body.vegetarian,
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(courseData, 4);

    const result = await db.query(
      `UPDATE dinner_courses
      ${setStatement}
      WHERE id=$1
      AND dinner_id IN (
        SELECT id
        FROM dinners
        WHERE id=$2
          AND owner_id=$3
      )
      RETURNING id`,
      [
        courseId,
        dinnerId,
        (req.user as AuthenticatedUser).id,
        ...newValues
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Delete Course
router.delete("/:dinnerId/courses/:courseId", async (req, res) => {
  try {
    const { dinnerId, courseId } = req.params;

    const result = await db.query(
      `DELETE FROM dinner_courses
      WHERE id=$1
        AND dinner_id IN (
          SELECT id
          FROM dinners
          WHERE id=$2
            AND owner_id=$3
        )
      RETURNING id`,
      [
        courseId,
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );
    
    if (!result.rowCount) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Add Participant
router.post("/:dinnerId/participants", async (req, res) => {
  try {
    const { dinnerId } = req.params;

    type RequestBody = {
      userId?: number,
    };
    const { body }: { body: RequestBody } = req;

    if (!body.userId) {
      res.status(400).json({
        error: "Missing property 'userId'"
      });
      return;
    }

    type DinnersRow = {
      id: number,
    };
    const dinnerResult = await db.query<DinnersRow>(
      `SELECT id
      FROM dinners
      WHERE id=$1
        AND owner_id=$2
        AND id NOT IN (
          SELECT dinner_id
          FROM dinner_participants
          WHERE user_id=$3
        )`,
      [
        dinnerId,
        (req.user as AuthenticatedUser).id,
        body.userId
      ]
    );

    if (!dinnerResult.rowCount) {
      res.sendStatus(400);
      return;
    }

    const participantData = {
      userId: body.userId,
    };
    
    await db.query(
      `INSERT INTO dinner_participants(
        dinner_id,
        user_id
      )
      VALUES($1, $2)
      RETURNING id`,
      [
        dinnerId,
        participantData.userId,
      ]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Remove Participant
router.delete("/:dinnerId/participants/:userId", async (req, res) => {
  try {
    const { dinnerId, userId } = req.params;

    const result = await db.query(
      `DELETE FROM dinner_participants
      WHERE user_id=$1
        AND dinner_id IN (
          SELECT id
          FROM dinners
          WHERE id=$2
            AND owner_id=$3
            AND owner_id!=$1
        )
      RETURNING id`,
      [
        userId,
        dinnerId,
        (req.user as AuthenticatedUser).id
      ]
    );
    
    if (!result.rowCount) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
