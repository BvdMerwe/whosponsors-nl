import path from "node:path";

const [, , filePath] = process.argv;
const modulePath = path.resolve(filePath);

/* eslint-disable @typescript-eslint/no-require-imports */
const script = require(modulePath);

if (typeof script["default"] === "function") {
    const functionToExecute = script["default"];

    (async (): Promise<void> => {
        await functionToExecute();
    })();
} else {
    /* eslint-disable no-console */
    console.error(`No default export in '${filePath}'.`);
}
