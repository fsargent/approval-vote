import { error } from "@sveltejs/kit";
import puppeteer from "puppeteer";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, params }) => {
  try {
    console.log("Generating PNG for path:", params.path);
    const cardUrl = `${url.origin}/card/${params.path}`;
    console.log("Loading URL:", cardUrl);

    const browser = await puppeteer.launch({
      headless: "new",
      channel: "chrome", // Use installed Chrome
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to the card HTML page
    await page.goto(cardUrl, {
      waitUntil: "networkidle0",
    });
    console.log("Page loaded");

    // Wait for the chart to render
    await page.waitForSelector(".card");
    console.log("Card element found");

    // Set viewport to ensure consistent size
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 2, // Retina quality
    });

    // Get the card element
    const element = await page.$(".card");
    if (!element) {
      throw new Error("Card element not found");
    }

    // Take a screenshot of just the card element
    const screenshot = await element.screenshot({
      type: "png",
      omitBackground: false,
    });
    console.log("Screenshot taken");

    await browser.close();

    // Return the image with appropriate headers
    return new Response(screenshot, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Error generating card image:", err);
    throw error(500, {
      message: "Failed to generate card image",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
