import express from "express";
import usersRouter from "@/api/v1/users";
import userSettingsRouter from "@/api/v1/userSettings";
import dinnersRouter from "@/api/v1/dinners";
import foodPreferencesRouter from "@/api/v1/foodPreferences";
import foodPreferenceFormsRouter from "@/api/v1/foodPreferenceForms";

const apiRouter = express.Router();
const v1Router = express.Router();

//v1
v1Router.use("/users", usersRouter);
v1Router.use("/userSettings", userSettingsRouter);
v1Router.use("/dinners", dinnersRouter);
v1Router.use("/foodPreferences", foodPreferencesRouter);
v1Router.use("/foodPreferenceForms", foodPreferenceFormsRouter);

apiRouter.use("/v1", v1Router);

// 404 for APIs
apiRouter.use((req, res) => {
  res.sendStatus(404);
});

export default apiRouter;
