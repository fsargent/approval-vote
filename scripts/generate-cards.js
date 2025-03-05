import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import Database from "better-sqlite3";

async function generateCards() {
  console.log("Starting card generation...");

  let browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--single-process", // Important for CI
      "--no-zygote", // Important for CI
    ],
    executablePath: process.env.CI ? "google-chrome-stable" : undefined,
  });

  const db = new Database("data.db");
  const reports = db
    .prepare(`SELECT DISTINCT path, office FROM reports WHERE hidden != 1`)
    .all();

  console.log(`Found ${reports.length} reports to process`);

  let page = await browser.newPage();
  await page.setDefaultTimeout(30000);
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2,
  });

  page.on("console", (msg) => console.log("Browser console:", msg.text()));
  page.on("pageerror", (err) => console.error("Browser error:", err));

  let successCount = 0;
  let failureCount = 0;

  for (const report of reports) {
    // Change the output path to static/image instead of build/image
    const outputPath = `static/image/${report.path}/${report.office}.png`;
    const outputDir = path.dirname(outputPath);

    try {
      console.log(`Processing: ${report.path}/${report.office}`);

      await fs.mkdir(outputDir, { recursive: true });

      const url = `http://localhost:5173/card/${report.path}/${report.office}`;
      console.log(`Loading URL: ${url}`);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      console.log("Waiting for .card element...");
      await page.waitForSelector(".card", { timeout: 5000 });

      console.log("Taking screenshot...");
      const element = await page.$(".card");
      if (!element) {
        throw new Error("Card element not found");
      }

      await element.screenshot({
        path: outputPath,
        type: "png",
        omitBackground: false,
      });

      successCount++;
      console.log(
        `✓ Generated: ${outputPath} (${successCount}/${reports.length})`,
      );

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      failureCount++;
      console.error(`✗ Failed ${report.path}/${report.office}:`, error.message);

      try {
        await page.reload({ waitUntil: "domcontentloaded", timeout: 5000 });
      } catch (reloadError) {
        console.error("Failed to reload page:", reloadError.message);
      }
    }

    if (successCount > 0 && successCount % 10 === 0) {
      console.log("Restarting browser to clear memory...");
      await page.close();
      await browser.close();

      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-extensions",
          "--single-process",
          "--no-zygote",
        ],
        executablePath: process.env.CI ? "google-chrome-stable" : undefined,
      });

      page = await browser.newPage();
      await page.setDefaultTimeout(30000);
      await page.setViewport({
        width: 1200,
        height: 630,
        deviceScaleFactor: 2,
      });
      page.on("console", (msg) => console.log("Browser console:", msg.text()));
      page.on("pageerror", (err) => console.error("Browser error:", err));
    }
  }

  await page.close();
  await browser.close();

  console.log("\nGeneration complete!");
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
}

// Make sure the dev server is running
async function checkDevServer() {
  try {
    const response = await fetch("http://localhost:5173");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log("Dev server is running");
    return true;
  } catch (error) {
    console.error("ERROR: Dev server is not running at http://localhost:5173");
    console.error("Please start the dev server with 'npm run dev' first");
    process.exit(1);
  }
}

// Run the script
checkDevServer()
  .then(() => generateCards())
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
