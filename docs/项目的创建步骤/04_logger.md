# Logger

使用了 3 个 package:

-   [morgan](http://expressjs.com/en/resources/middleware/morgan.html): 一个通用的 logging module
-   [morganBody](https://www.npmjs.com/package/morgan-body): 展示 request 和 response 的 body
-   [winston](https://github.com/winstonjs/winston#readme)

主要参考了[这篇文章](https://losikov.medium.com/part-3-brushing-up-get-more-from-node-js-express-open-api-3-0-4ce482ffa958)

## config

使用 3 个 config 管理 logger。

-   `MORGAN_LOGGER`： 是否使用 morgan
-   `MORGAN_BODY_LOGGER`：是否使用 morganBody
-   `LOGGER_LEVEL`：winston 需要记录的最低 logger 等级，比这个再低就不会记录

具体参考 `config/index.ts`

## morgan 和 morganBody

都是 Middlreware。在 `app.ts` 内使用。

## winston

创建里一个独立的 module，`utils/logger`，代码抄了上面的参考文章。

在需要 console 的地方，使用 `logger` 即可：

```ts
import logger from "@dune/utils/logger";

logger.info("这是一个信息");
logger.error("这是一个error");
```
