import express from "express";
import db, { buildSetStatement } from "@/db";
import { AuthenticatedUser } from "@/routes/auth";

import type { ApiResponse, User } from "@t/api";

const router = express.Router();

// Read All
router.get("/", async (req, res) => {
  try {
    type UsersRow = {
      id: number,
      username: string,
    };
    const result = await db.query<UsersRow>(
      `SELECT id, username
      FROM users
      WHERE owner_id=$1`,
      [
        (req.user as AuthenticatedUser).id
      ]
    );

    res.json({
      result: result.rows.map((row) => {
        return {
          id: row.id,
          username: row.username,
        };
      }),
      count: result.rowCount || 0
    } satisfies ApiResponse<User[]>);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Read Entity
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    type UsersRow = {
      id: number,
      username: string,
    };
    const result = await db.query<UsersRow>(
      `SELECT id, username
      FROM users
      WHERE owner_id=$1
        AND id=$2`,
      [
        (req.user as AuthenticatedUser).id,
        userId
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [user] = result.rows;

    res.json({
      result: {
        id: user.id,
        username: user.username,
      }
    } satisfies ApiResponse<User>);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create
router.post("/", async (req, res) => {
  try {
    type RequestBody = {
      username?: string,
    };
    const { body }: { body: RequestBody } = req;

    if (!body.username) {
      res.status(400).json({
        error: "Missing property 'username'"
      });
      return;
    }

    const userData = {
      username: body.username ?? ""
    };
    
    type UsersRow = {
      id: number,
    };
    const result = await db.query<UsersRow>(
      `INSERT INTO users(owner_id, username)
      VALUES($1, $2)
      RETURNING id`,
      [
        (req.user as AuthenticatedUser).id,
        userData.username
      ]
    );

    const userId = result.rows[0].id;

    res.setHeader("Location", `/api/v1/users/${userId}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    type RequestBody = {
      username?: string,
    };
    const { body }: { body: RequestBody } = req;

    const userData = {
      username: body.username
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(userData, 3);

    const result = await db.query(
      `UPDATE users
      ${setStatement}
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        userId,
        (req.user as AuthenticatedUser).id,
        ...newValues
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Delete
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `DELETE FROM users
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        userId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!result.rowCount) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
