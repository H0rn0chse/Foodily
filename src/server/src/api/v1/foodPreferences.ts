import express from "express";
import db, { buildSetStatement } from "@/db";
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

    res.status(200).json({
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

    res.status(200).json({
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
  try {
    type RequestBody = {
      userId?: string,
      preferredVegetarian?: boolean,
      coriander?: boolean,
      coffee?: boolean,
      additionalComments?: string,
    };
    const { body }: { body: RequestBody } = req;

    if (!body.userId) {
      res.status(400).json({
        error: "Missing property 'userId'"
      });
      return;
    }

    const prefData = {
      userId: body.userId,
      preferredVegetarian: body.preferredVegetarian ?? false,
      coriander: body.coriander ?? false,
      coffee: body.coffee ?? false,
      additionalComments: body.additionalComments ?? "",
    };

    type PrefRow = {
      id: number,
    };
    const result = await db.query<PrefRow>(
      `INSERT INTO food_preferences(
        owner_id,
        user_id,
        preferred_vegetarian,
        coriander,
        coffee,
        additional_comments
      )
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        (req.user as AuthenticatedUser).id,
        prefData.userId,
        prefData.preferredVegetarian,
        prefData.coriander,
        prefData.coffee,
        prefData.additionalComments,
      ]
    );

    const prefId = result.rows[0].id;

    res.setHeader("Location", `/api/v1/foodPreference/${prefId}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update
router.put("/:prefId", async (req, res) => {
  try {
    const { prefId } = req.params;

    type RequestBody = {
      preferredVegetarian?: boolean,
      coriander?: boolean,
      coffee?: boolean,
      additionalComments?: string,
    };
    const { body }: { body: RequestBody } = req;

    const dinnerData = {
      preferredVegetarian: body.preferredVegetarian,
      coriander: body.coriander,
      coffee: body.coffee,
      additionalComments: body.additionalComments,
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(dinnerData, 3);

    const result = await db.query(
      `UPDATE food_preferences
      ${setStatement}
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        prefId,
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
router.delete("/:prefId", async (req, res) => {
  try {
    const { prefId } = req.params;

    const result = await db.query(
      `DELETE FROM food_preferences
      WHERE id=$1
        AND owner_id=$2
      RETURNING id`,
      [
        prefId,
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

// Read Allergy
router.get("/:prefId/allergies/:allergyId", async (req, res) => {
  try {
    const { prefId, allergyId } = req.params;

    type AllergiesRow = {
      id: number,
      preference_id: number,
      name: string,
      description: string,
      exceptions: string,
    };
    const allergyResult = await db.query<AllergiesRow>(
      `SELECT
        allergy.id,
        allergy.preference_id,
        allergy.name,
        allergy.description,
        allergy.exceptions
      FROM food_allergies allergy
        JOIN food_preferences pref
        ON pref.id=allergy.preference_id
      WHERE pref.owner_id=$3
        AND pref.id=$1
        AND allergy.id=$2`,
      [
        prefId,
        allergyId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!allergyResult.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [allergy] = allergyResult.rows;

    res.status(200).json({
      result: {
        id: allergy.id,
        preferenceId: allergy.preference_id,
        name: allergy.name,
        description: allergy.description,
        exceptions: allergy.exceptions,
      }
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create Allergy
router.post("/:prefId/allergies", async (req, res) => {
  try {
    const { prefId } = req.params;

    type PrefRow = {
      id: number,
    };
    const prefResult = await db.query<PrefRow>(
      `SELECT id
      FROM food_preferences
      WHERE id=$1
        AND owner_id=$2`,
      [
        prefId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!prefResult.rowCount) {
      res.sendStatus(403);
      return;
    }

    type RequestBody = {
      name?: string,
      description?: string,
      exceptions?: string,
    };
    const { body }: { body: RequestBody } = req;

    const allergyData = {
      name: body.name ?? "",
      description: body.description ?? "",
      exceptions: body.exceptions ?? "",
    };
    
    type AllergiesRow = {
      id: number,
    };
    const result = await db.query<AllergiesRow>(
      `INSERT INTO food_allergies(
        preference_id,
        name,
        description,
        exceptions
      )
      VALUES($1, $2, $3, $4)
      RETURNING id`,
      [
        prefId,
        allergyData.name,
        allergyData.description,
        allergyData.exceptions,
      ]
    );

    res.setHeader("Location", `/api/v1/foodPreferences/${prefId}/allergies/${result.rows[0].id}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update Allergy
router.put("/:prefId/allergies/:allergyId", async (req, res) => {
  try {
    const { prefId, allergyId } = req.params;

    type RequestBody = {
      name?: string,
      description?: string,
      exceptions?: string,
    };
    const { body }: { body: RequestBody } = req;

    const allergyData = {
      name: body.name,
      description: body.description,
      exceptions: body.exceptions,
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(allergyData, 4);

    const result = await db.query(
      `UPDATE food_allergies
      ${setStatement}
      WHERE id=$1
      AND preference_id IN (
        SELECT id
        FROM food_preferences
        WHERE id=$2
          AND owner_id=$3
      )
      RETURNING id`,
      [
        allergyId,
        prefId,
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

// Delete Allergy
router.delete("/:prefId/allergies/:allergyId", async (req, res) => {
  try {
    const { prefId, allergyId } = req.params;

    const result = await db.query(
      `DELETE FROM food_allergies
      WHERE id=$1
        AND preference_id IN (
          SELECT id
          FROM food_preferences
          WHERE id=$2
            AND owner_id=$3
        )
      RETURNING id`,
      [
        allergyId,
        prefId,
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

// Read Distaste
router.get("/:prefId/distaste/:distasteId", async (req, res) => {
  try {
    const { prefId, distasteId } = req.params;

    type DistasteRow = {
      id: number,
      preference_id: number,
      type: string,
      description: string,
    };
    const distasteResult = await db.query<DistasteRow>(
      `SELECT
        distaste.id,
        distaste.preference_id,
        distaste.type,
        distaste.description
      FROM food_distaste distaste
        JOIN food_preferences pref
        ON pref.id=distaste.preference_id
      WHERE pref.owner_id=$3
        AND pref.id=$1
        AND distaste.id=$2`,
      [
        prefId,
        distasteId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!distasteResult.rowCount) {
      res.sendStatus(404);
      return;
    }

    const [distaste] = distasteResult.rows;

    res.status(200).json({
      result: {
        id: distaste.id,
        preferenceId: distaste.preference_id,
        type: distaste.type,
        description: distaste.description,
      }
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create Distaste
router.post("/:prefId/distaste", async (req, res) => {
  try {
    const { prefId } = req.params;

    type PrefRow = {
      id: number,
    };
    const prefResult = await db.query<PrefRow>(
      `SELECT id
      FROM food_preferences
      WHERE id=$1
        AND owner_id=$2`,
      [
        prefId,
        (req.user as AuthenticatedUser).id
      ]
    );

    if (!prefResult.rowCount) {
      res.sendStatus(403);
      return;
    }

    type RequestBody = {
      type?: string,
      description?: string,
    };
    const { body }: { body: RequestBody } = req;

    const distasteData = {
      type: body.type ?? "",
      description: body.description ?? "",
    };
    
    type AllergiesRow = {
      id: number,
    };
    const result = await db.query<AllergiesRow>(
      `INSERT INTO food_distaste(
        preference_id,
        type,
        description
      )
      VALUES($1, $2, $3)
      RETURNING id`,
      [
        prefId,
        distasteData.type,
        distasteData.description,
      ]
    );

    res.setHeader("Location", `/api/v1/foodPreferences/${prefId}/distaste/${result.rows[0].id}`);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Update Distaste
router.put("/:prefId/distaste/:distasteId", async (req, res) => {
  try {
    const { prefId, distasteId } = req.params;

    type RequestBody = {
      type?: string,
      description?: string,
    };
    const { body }: { body: RequestBody } = req;

    const distasteData = {
      type: body.type,
      description: body.description,
    };
    const {
      setStatement,
      newValues,
    } = buildSetStatement(distasteData, 4);

    const result = await db.query(
      `UPDATE food_distaste
      ${setStatement}
      WHERE id=$1
      AND preference_id IN (
        SELECT id
        FROM food_preferences
        WHERE id=$2
          AND owner_id=$3
      )
      RETURNING id`,
      [
        distasteId,
        prefId,
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

// Delete Distaste
router.delete("/:prefId/distaste/:distasteId", async (req, res) => {
  try {
    const { prefId, distasteId } = req.params;

    const result = await db.query(
      `DELETE FROM food_distaste
      WHERE id=$1
        AND preference_id IN (
          SELECT id
          FROM food_preferences
          WHERE id=$2
            AND owner_id=$3
        )
      RETURNING id`,
      [
        distasteId,
        prefId,
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
