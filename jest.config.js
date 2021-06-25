module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "@dune/(.*)": "<rootDir>/src/$1",
    },
};
