import { error } from "@sveltejs/kit";
import { getReport } from "$lib/server/reports";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    const report = getReport(params.path);
    if (!report) {
      error(404, { message: "Not found" });
    }
    return { report, path: params.path };
  } catch (err) {
    error(404, { message: "Not found" });
  }
}
