import { launch } from "puppeteer";
import sanitizedFilename from "sanitize-filename";
import { mkdirSync, existsSync } from "fs"
import { promisify } from "util";
import { exec } from "child_process";
import CONFIG from "./config";
const asyncExec = promisify(exec);

interface IPermutation {
    page: IPath;
    route: IPath;
    screen: IScreen;
}

interface IScreen {
    width: number;
    height: number;
    name: string;
}

interface IPath {
    name: string;
    sanitizedName?: string;
    timeoutMS?: number;
}

(async () => {
    const pages: IPath[] = CONFIG.pages.map(page => {
        return {
            name: page.name,
            sanitizedName: sanitizedFilename(page.name),
            timeoutMS: page.timeoutMS
        }
    });

    // Puppeteer doesn't create folders if needed.
    pages.forEach(page => {
        if (!existsSync(page.sanitizedName)) {
            mkdirSync(page.sanitizedName);
        }
    });

    let permutations: IPermutation[] = [];
    {
        // Calc all permutations
        pages.forEach(page => {
            CONFIG.routes.forEach(route => {
                CONFIG.screens.forEach(screen => {
                    permutations.push({
                        page,
                        route,
                        screen,
                    });
                });
            });
        });
    }

    for (const perm of permutations) {
        try {
            const browser = await launch({
                headless: true,
                defaultViewport: {
                    width: perm.screen.width,
                    height: perm.screen.height
                }
            });
            const page = await browser.newPage();
            await page.goto(`${perm.page.name}/${perm.route.name}`);
            const loadTimeout = perm.route.timeoutMS || perm.page.timeoutMS || 0;

            // TODO Find a better way to wait for full load.
            await page.waitFor(loadTimeout);
            // TODO Inject code(styles) to hide carrot (blinking cursor) or specific elements

            await page.screenshot({
                path: `${perm.page.sanitizedName}/${perm.route.name}-${perm.screen.name}.png`,
                fullPage: true,
                type: "png"
            });
            await browser.close();
        } catch (err) {
            console.log(`Error on ${perm.screen.name}`)
            console.log(err);
        }
    }

    const { stdout, stderr } = await asyncExec(`img_diff -v -s ${pages[0].sanitizedName} -d ${pages[1].sanitizedName} -f diff/`);
    console.log(stdout);
    if (stderr) {
        console.error(stderr);
    }
})();