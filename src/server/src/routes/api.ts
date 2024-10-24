import express from "express";
import usersRouter from "@/api/v1/users";
import userSettingsRouter from "@/api/v1/userSettings";
import dinnersRouter from "@/api/v1/dinners";
import foodPreferencesRouter from "@/api/v1/foodPreferences";
import foodPreferenceFormsRouter from "@/api/v1/foodPreferenceForms";

import baseApiDoc from "@/api/v1/api.json" assert { type: "json" };
import usersApiDoc from "@/api/v1/users.json" assert { type: "json" };
import dinnersApiDoc from "@/api/v1/dinners.json" assert { type: "json" };

const apiRouter = express.Router();
const v1Router = express.Router();

function addSubRouterApiDocs (apiDoc: Record<string, unknown>, subRouterPath: string, subRouterApiDoc: Record<string, unknown>) {
  if (!apiDoc.paths || typeof apiDoc.paths !== "object") {
    apiDoc.paths = {};
  }
  for (const path in subRouterApiDoc) {
    const apiDocPaths = apiDoc.paths as Record<string, unknown>;
    apiDocPaths[`${subRouterPath}${path}`] = subRouterApiDoc[path];

  }
}

//v1
v1Router.use("/users", usersRouter);
addSubRouterApiDocs(baseApiDoc, "/users", usersApiDoc);

v1Router.use("/userSettings", userSettingsRouter);
// addSubRouterApiDocs(baseApiDoc, "/users", usersApiDoc);

v1Router.use("/dinners", dinnersRouter);
addSubRouterApiDocs(baseApiDoc, "/dinners", dinnersApiDoc);

v1Router.use("/foodPreferences", foodPreferencesRouter);
// addSubRouterApiDocs(baseApiDoc, "/users", usersApiDoc);

v1Router.use("/foodPreferenceForms", foodPreferenceFormsRouter);
// addSubRouterApiDocs(baseApiDoc, "/users", usersApiDoc);

apiRouter.use("/v1", v1Router);

// 404 for APIs
apiRouter.use((req, res) => {
  res.sendStatus(404);
});

export const apiDoc = baseApiDoc;

export default apiRouter;
