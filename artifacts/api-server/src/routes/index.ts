import { Router, type IRouter } from "express";
import healthRouter from "./health";
import checkinsRouter from "./checkins";
import libraryRouter from "./library";
import insightsRouter from "./insights";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/checkins", checkinsRouter);
router.use("/library", libraryRouter);
router.use("/insights", insightsRouter);

export default router;
