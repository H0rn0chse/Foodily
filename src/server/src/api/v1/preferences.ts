import express from "express";
import db from "@/db";

const router = express.Router();

router.get("/", async (req, res) => {
  // console.log(JSON.stringify(req.session, null, 2));
  try {
    const result = await db.query(
      "SELECT language, user_id FROM userPreferences \
      WHERE user_id=$1",
      [1]
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
