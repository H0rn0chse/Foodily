import express from "express";
import db from "@/db";
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
  
    // console.log(JSON.stringify(result.rows[0], null, 2));
    res.json({
      result: result.rows[0]
    });
  } catch (err) {
    // todo logging
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
