import { Router } from "express";

import { signupHandler, loginHandler } from "@dune/controllers/userController";

const router = Router();

router.route("/signup").post(signupHandler);
router.route("/login").post(loginHandler);

export default router;
