import express from "express";
import db from "@/db";
import { AuthenticatedUser } from "@/routes/auth";

const router = express.Router();

// Read All
router.get("/", async (req, res) => {
  try {
    type PrefRow = {
      id: number,
      owner_id: number,
      owner_username: string,
      user_id: number,
      user_username: string,
    };
    const result = await db.query<PrefRow>(
      `SELECT
        pref.id,
        pref.owner_id,
        owner.username owner_username,
        pref.user_id,
        _user.username user_username
      FROM food_preferences pref
        JOIN users owner
        ON pref.owner_id=owner.id
        JOIN users _user
        ON pref.user_id=_user.id
      WHERE pref.owner_id=$1`,
      [(req.user as AuthenticatedUser).id]
    );

    res.json({
      result: result.rows.map((row) => {
        return {
          id: row.id,
          owner: {
            id: row.owner_id,
            username: row.owner_username,
          },
          user: {
            id: row.user_id,
            username: row.user_username,
          }
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Read Entity
router.get("/:prefId", async (req, res) => {
  try {
    const { prefId } = req.params;

    type PrefRow = {
      id: number,
      owner_id: number,
      owner_username: string,
      user_id: number,
      user_username: string,
      preferred_vegetarian: boolean,
      coriander: boolean,
      coffee: boolean,
      additional_comments: string,
    };
    const prefResult = await db.query<PrefRow>(
      `SELECT
        pref.id,
        pref.owner_id,
        owner.username owner_username,
        pref.user_id,
        _user.username user_username,
        pref.preferred_vegetarian,
        pref.coriander,
        pref.coffee,
        pref.additional_comments
      FROM food_preferences pref
        JOIN users owner
        ON pref.owner_id=owner.id
        JOIN users _user
        ON pref.user_id=_user.id
      WHERE pref.owner_id=$1
        AND pref.id=$2`,
      [
        prefId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!prefResult.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [preference] = prefResult.rows;

    type AllergiesRow = {
      id: number,
      preference_id: number,
      name: string,
      description: string,
      exceptions: string,
    };
    const allergyResults = await db.query<AllergiesRow>(
      `SELECT id, preference_id, name, description, exceptions
      FROM food_allergies
      WHERE preference_id=$1`,
      [preference.id]
    );

    type DistasteRow = {
      id: number,
      preference_id: number,
      type: string,
      description: string,
    };
    const distasteResults = await db.query<DistasteRow>(
      `SELECT id, preference_id, type, description
      FROM food_distaste
      WHERE preference_id=$1`,
      [preference.id]
    );

    res.json({
      result: {
        id: preference.id,
        owner: {
          id: preference.owner_id,
          username: preference.owner_username,
        },
        user: {
          id: preference.user_id,
          username: preference.user_username,
        },
        preferredVegetarian: preference.preferred_vegetarian,
        coriander: preference.coriander,
        coffee: preference.coffee,
        additionalComments: preference.additional_comments,
        allergies: allergyResults.rows.map((row) => {
          return {
            id: row.id,
            preferenceId: row.preference_id,
            name: row.name,
            description: row.description,
            exceptions: row.exceptions,
          };
        }),
        distaste: distasteResults.rows.map((row) => {
          return {
            id: row.id,
            preferenceId: row.preference_id,
            type: row.type,
            description: row.description,
          };
        }),
      }
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create
router.post("/", async (req, res) => {
  res.sendStatus(501);
});

// Update
router.put("/:prefId", async (req, res) => {
  res.sendStatus(501);
});

// Delete
router.delete("/:prefId", async (req, res) => {
  res.sendStatus(501);
});

export default router;
