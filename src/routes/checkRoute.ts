import { Router } from "express";
import { auth } from "@dune/middleware/auth";

import {
    checkRes,
    checkSyncError,
    checkAsyncError,
    checkAuth,
} from "@dune/controllers/checkControler";

const router = Router();

router.route("/success").get(checkRes);
router.route("/syncError").get(checkSyncError);
router.route("/asyncError").get(checkAsyncError);
router.route("/auth").get(auth, checkAuth);

export default router;
