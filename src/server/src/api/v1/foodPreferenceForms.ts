import express from "express";

const router = express.Router();

// Read All
router.get("/", async (req, res) => {
  res.sendStatus(501);
});

// Read Entity
router.get("/:formId", async (req, res) => {
  res.sendStatus(501);
});

// Create
router.post("/", async (req, res) => {
  res.sendStatus(501);
});

// Update
router.put("/:formId", async (req, res) => {
  res.sendStatus(501);
});

// Delete
router.delete("/:formId", async (req, res) => {
  res.sendStatus(501);
});

export default router;
