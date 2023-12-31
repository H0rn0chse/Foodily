import express from "express";

const router = express.Router();

// Read All
router.get("/", async (req, res) => {
  res.sendStatus(501);
});

// Read Entity
router.get("/:prefId", async (req, res) => {
  res.sendStatus(501);
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
