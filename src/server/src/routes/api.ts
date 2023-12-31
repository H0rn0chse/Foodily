import express from "express";
import preferenceRouter from "@/api/v1/preferences";

const apiRouter = express.Router();
const v1Router = express.Router();

//v1
v1Router.use("/preferences", preferenceRouter);

apiRouter.use("/v1", v1Router);

// generic test
apiRouter.get("/", (req, res) => {
  res.send("api call-foo!");
});

export default apiRouter;
