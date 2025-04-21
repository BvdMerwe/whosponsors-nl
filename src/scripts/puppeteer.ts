/* eslint-disable no-console */
import type {
    BoxModel, Browser, ElementHandle, Page, Point,
} from "puppeteer-core";
import puppeteer from "puppeteer-core";
import { NodeHtmlMarkdown } from "node-html-markdown";
import Random from "@/lib/random";
import switchVpnLocation from "@/scripts/switch-vpn-location";

export async function scrapeGoogle(searchQuery: string): Promise<string | null> {
    const { browser, page } = await initialize();

    try {
        if (page.url().indexOf("https://www.google.com/") < 0) {
            await page.goto("https://www.google.com/");
            await waitForTimeout(300);
        }

        const cookieBanner = await page.$("h1 ::-p-text(Before you continue to Google)");

        if (cookieBanner !== null) {
            const acceptButton = await page.$("button ::-p-text(Accept all)");
            const boundingBox = await acceptButton?.boxModel();

            // await drawBox(page, boundingBox);
            await moveMouseToBoundingBoxAndClick(page, boundingBox);
        }

        const searchBar = page.locator("textarea ::-p-aria([name=\"Search\"])");

        await searchBar.click();
        await searchBar.fill("");
        await page.type("textarea ::-p-aria([name=\"Search\"])", `What is the industry that ${searchQuery} operates in?`, {
            delay: Random.randomBetween(10, 30),
        });
        await waitForTimeout(30);
        await page.keyboard.press("Enter");

        if (Random.randomBetween(0, 2) === 1) {
            await naturalMouseMovement(page);
        }

        if (Random.randomBetween(0, 3) <= 2) {
            await naturalMouseScrolling(page);
        }

        await page.waitForSelector("#center_col");
        const resultsString = await getTextContent(page, await page.$("#center_col"));

        return NodeHtmlMarkdown.translate(resultsString);
    } catch (error: unknown) {
        // @ts-expect-error - we know it's a TypeError
        console.error(error.message);
        if (!page.isClosed()) {
            await page.screenshot({
                type: "jpeg",
                path: `screenshots/${Date.now()}.jpg`,
                fullPage: true,
                quality: 20,
            });
            await page.close();
        }

        await switchVpnLocation();
        await waitForTimeout(2000);

        return null;
    } finally {
        await browser.disconnect();
    }
}

export async function scrapeCreditSafe(searchQuery: string): Promise<string | null> {
    const { page } = await initialize();

    try {
        if (page.url().indexOf("creditsafe.com/") < 0) {
            await page.goto("https://www.creditsafe.com/business-index/en-gb/search/");
            await waitForTimeout(300);
        }

        const cookieAcceptButton = await page.$("button ::-p-text(Accept All)");

        if (cookieAcceptButton !== null) {
            await cookieAcceptButton.click();
            await waitForTimeout(1000);
        }

        await page.locator("#main-search > input").fill(searchQuery);
        await page.keyboard.press("Enter");

        const selector = "body > main > div > div:nth-child(1) > div > ul > li:nth-child(1) > div > div > a";

        await page.waitForSelector(selector, {
            timeout: 2000,
        });
        await page.locator(selector).click();

        const resultsString = await getTextContent(page, await page.locator("#info").waitHandle());

        await page.evaluate(() => window.stop());

        return NodeHtmlMarkdown.translate(resultsString);
    } catch (error: unknown) {
        // @ts-expect-error - we know it's a TypeError
        console.error(`Nothing at creditsafe for ${searchQuery}:`, error.message);
        await switchVpnLocation();
        await waitForTimeout(2000);
        await page.close();

        return null;
    }
}

export async function scrapeKvK(searchQuery: string): Promise<string | null> {
    const { page } = await initialize();

    try {
        await page.goto("https://www.kvk.nl/en/search/");

        const cookieAcceptButton = await page.$("button ::-p-text(Save your choice)");

        if (cookieAcceptButton !== null) {
            await cookieAcceptButton.click();
            await waitForTimeout(1000);
        }

        const searchBarSelector = "#main-content input[type=search]";

        await page.locator(searchBarSelector).fill("");
        await page.type(searchBarSelector, searchQuery);
        await page.keyboard.press("Enter");

        const selector = "[data-ui-test-class='search-results-list'] > li";
        const element = await page.waitForSelector(selector, {
            timeout: 2000,
        });
        const resultsString = await getTextContent(page, element);

        return NodeHtmlMarkdown.translate(resultsString);
    } catch (error: unknown) {
        // @ts-expect-error - we know it's a TypeError
        console.error(`Nothing at KvK for ${searchQuery}:`, error.message);

        return null;
    }
}

async function initialize(): Promise<{ browser: Browser, page: Page }> {
    const browser = await getBrowser(true);

    return {
        browser,
        page: (await browser.pages())[0] ?? await browser.newPage(),
    };
}

async function getBrowser(shouldConnect: boolean): Promise<Browser> {
    if (shouldConnect) {
        return puppeteer.connect({
            browserURL: "http://127.0.0.1:21222/",
            defaultViewport: {
                height: 700,
                width: 1366,
            },
            slowMo: 20,
        });
    } else {
        return puppeteer.launch({
            channel: "chrome",
            executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
            userDataDir: "./browserdata/chromium/puppeteer",
            defaultViewport: {
                height: 700,
                width: 1366,
            },
            timeout: 10000,
            args: [
                `--user-agent=${getRandomUserAgent()}`,
            ],
            headless: false,
            slowMo: 20,
        });
    }
}

const userAgents = [
    // Windows Chrome
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // Mac Chrome
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    // Windows Firefox
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    // Mac Firefox
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:120.0) Gecko/20100101 Firefox/120.0",
    // Windows Edge
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

function getRandomUserAgent(): string {
    return userAgents[Random.randomBetween(0, userAgents.length)];
}

function waitForRandomDelay(min: number = 50, max: number = 200): Promise<void> {
    return waitForTimeout(Random.randomBetween(min, max));
}

function waitForTimeout(millisecond: number = 1000): Promise<void> {
    return new Promise((r) => setTimeout(r, millisecond));
}

async function moveMouseToBoundingBox(page: Page, boxModel?: BoxModel | null): Promise<void> {
    if (boxModel === null || typeof boxModel === "undefined") {
        return;
    }

    const { content } = boxModel;

    await naturalMouseMovement(page);
    const pointCenter: Point = {
        x: 0, y: 0,
    };

    // Add slight randomization to the target point
    const variance = 5; // pixels

    pointCenter.x = (content[0].x + content[2].x) / 2 + (Math.random() * variance - variance / 2);
    pointCenter.y = (content[0].y + content[2].y) / 2 + (Math.random() * variance - variance / 2);

    // Randomize the number of steps
    const steps = Random.randomBetween(20, 40); // 20-40 steps

    await page.mouse.move(pointCenter.x, pointCenter.y, {
        steps,
    });
}

async function moveMouseToBoundingBoxAndClick(page: Page, boxModel?: BoxModel | null): Promise<void> {
    if (boxModel === null || typeof boxModel === "undefined") {
        return;
    }

    await drawBox(page, boxModel);

    await moveMouseToBoundingBox(page, boxModel);

    await page.locator("button ::-p-text(Accept all)").click();
    // await page.mouse.down({
    //     button: "left",
    // });
    // await waitForRandomDelay(20, 70);
    // await page.mouse.up({
    //     button: "left",
    // });
}

async function drawBox(page: Page, boxModel?: BoxModel | null): Promise<void> {
    if (boxModel === null || typeof boxModel === "undefined") {
        return;
    }

    const { content } = boxModel;

    // Calculate width and height
    const width = content[1].x - content[0].x;
    const height = content[2].y - content[0].y;

    // Remove existing highlight box if it exists
    await page.$eval(".puppeteer-highlight-box", (element) => element.remove())
        .catch(() => {
        }); // Ignore error if element doesn't exist

    // Add the highlight box element
    await page.addStyleTag({
        content: `
            .puppeteer-highlight-box {
                position: absolute;
                top: ${content[0].y}px;
                left: ${content[0].x}px;
                width: ${width}px;
                height: ${height}px;
                border: 2px solid red;
                background-color: rgba(255, 0, 0, 0.1);
                z-index: 10000;
                pointer-events: none;
            }
        `,
    });

    await page.$eval("body", (body) => {
        const highlightBox = document.createElement("div");

        highlightBox.className = "puppeteer-highlight-box";
        body.appendChild(highlightBox);
    });
}

async function naturalMouseMovement(page: Page): Promise<void> {
    console.log("Moving mouse to trick google.");
    const viewportSize = page.viewport();

    if (!viewportSize) return;

    // Move mouse in a slightly random curve
    const points = [
        {
            x: Math.random() * viewportSize.width * 0.8, y: Math.random() * viewportSize.height * 0.8,
        },
        {
            x: Math.random() * viewportSize.width * 0.8, y: Math.random() * viewportSize.height * 0.8,
        },
    ];

    for (const point of points) {
        await page.mouse.move(point.x, point.y, {
            steps: Random.randomBetween(10, 20),
        });
        await waitForRandomDelay(10, 20);
    }
}

async function naturalMouseScrolling(page: Page): Promise<void> {
    console.log("Performing natural scrolling to trick google.");
    await waitForRandomDelay(200, 1000);

    const timesToScroll = Random.randomBetween(2, 5);
    const scrolls = [];

    for (let i = 0; timesToScroll >= i; i++) {
        scrolls.push({
            deltaY: Random.randomBetween(50, 500),
        });
    }

    for (const scroll of scrolls) {
        await page.mouse.wheel(scroll);
        await waitForRandomDelay();
    }
}

async function getTextContent(page: Page, element?: ElementHandle | null): Promise<string> {
    if (element === null || typeof element === "undefined") {
        const body = await page.$("body");

        return await page.evaluate((el) => el?.innerHTML ?? "", body);
    } else {
        return await page.evaluate((el) => el?.innerHTML ?? "", element);
    }
}
