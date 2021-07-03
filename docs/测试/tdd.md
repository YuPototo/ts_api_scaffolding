## TDD

这里只考虑 integration test

### 只对一个 test 文件做测试：

先 export 两个环境变量：

-   ENV_FILE
-   DATABASE_URL

```
export ENV_FILE=./config/.env.test && export DATABASE_URL=postgresql://prisma:prisma@localhost:5433/tests
```

变量的内容参考 env 文件。

然后，对某个文件做测试

```
yarn jest tests/integration/auth.test.ts
```

### 只对某个 describe 或 test 做测试

使用 `-t` flag。

describe 或 test 名称里包含 `validate` 的才会运行

```
yarn jest -t="validate"
```

建议结合“只对文件做测试使用”，如下：

```
yarn jest tests/integration/auth.test.ts -t="validate"
```

### 运行所有 test 文件

需要使用 `--runInBand` 执行，保证每次只运行一个文件。
