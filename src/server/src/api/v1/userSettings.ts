import express from "express";
import db, { buildSetStatement } from "@/db";
import { AuthenticatedUser } from "@/routes/auth";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    type UserSettingsRow = {
      id: number,
      user_id: number,
      language: string,
    };
    const result = await db.query<UserSettingsRow>(
      "SELECT language, user_id FROM user_settings \
      WHERE user_id=$1",
      [(req.user as AuthenticatedUser).id]
    );

    if (!result.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [settings] = result.rows;
  
    res.status(200).json({
      result: {
        userId: settings.user_id,
        language: settings.language,
      }
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.put("/", async (req, res) => {
  try {
    type RequestBody = {
      language?: string,
    };
    const { body }: { body: RequestBody } = req;

    const userData = {
      language: body.language
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(userData, 2);

    const result = await db.query(
      `UPDATE user_settings
      ${setStatement}
      WHERE user_id=$1
      RETURNING id`,
      [
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

export default router;
