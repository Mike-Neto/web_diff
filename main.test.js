const { copyFileSync } = require("fs");
const { promisify } = require("util");
const { exec, spawn } = require("child_process");
const exec_promise = promisify(exec);

const timeoutMS = 30 * 1000;
let serverPrimary = null;
let serverSecondary = null;

beforeAll(() => {
    // Overwrite config file with test file
    copyFileSync("./test.config.js", "./config.js");
})

beforeEach(() => {
    // Spawn primary server
    serverPrimary = spawn("npx", ["http-server", "-p", "8080", "./testpage"]);
});

afterEach(() => {
    serverPrimary.kill();
    serverSecondary.kill();
});

test('It finds no difference on the same website', async () => {
    // Spawn secondary server
    serverSecondary = spawn("npx", ["http-server", "-p", "8081", "./testpage"]);

    expect.assertions(1);
    const { stderr } = await exec_promise("npm run start");
    expect(stderr).toBe("");
}, timeoutMS);

test('It finds one difference on the fancy website', async () => {
    // Spawn secondary server
    serverSecondary = spawn("npx", ["http-server", "-p", "8081", "./testpagefancy"]);

    expect.assertions(1);
    const { stderr } = await exec_promise("npm run start");
    expect(stderr).not.toBe("");
}, timeoutMS);
