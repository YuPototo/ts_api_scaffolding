// https://dev.to/kwabenberko/extend-express-s-request-object-with-typescript-declaration-merging-1nn5
import { User } from "./src/db/client";

declare global {
    namespace Express {
        interface Request {
            currentUser: User;
        }
    }
}
