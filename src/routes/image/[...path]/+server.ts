import { error } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import { join } from "path";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  try {
    const cleanPath = params.path.replace(/\.png$/, "");
    // Change path to look in static/image instead of build/image
    const imagePath = join(
      process.cwd(),
      "static",
      "image",
      `${cleanPath}.png`,
    );

    try {
      const imageBuffer = await readFile(imagePath);
      return new Response(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      console.error("Image file not found:", imagePath);
      throw error(404, { message: "Image not found" });
    }
  } catch (err) {
    console.error("Error serving image:", err);
    throw error(500, {
      message: "Failed to serve image",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
