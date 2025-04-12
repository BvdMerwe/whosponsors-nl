import path from "node:path";

const [, , filePath] = process.argv;
const modulePath = path.resolve(filePath);

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
