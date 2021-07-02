import { Router } from "express";

import {
    checkRes,
    checkSyncError,
    checkAsyncError,
} from "@dune/controllers/checks";

const router = Router();

router.route("/success").get(checkRes);
router.route("/syncError").get(checkSyncError);
router.route("/asyncError").get(checkAsyncError);

export default router;
