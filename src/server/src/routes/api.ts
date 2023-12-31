import express from "express";
import preferenceRouter from "@/api/v1/preferences";

const apiRouter = express.Router();
const v1Router = express.Router();

//v1
v1Router.use("/preferences", preferenceRouter);

apiRouter.use("/v1", v1Router);

// 404 for APIs
apiRouter.use((req, res) => {
  res.sendStatus(404);
});

export default apiRouter;
