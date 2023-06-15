import { error } from "@sveltejs/kit";
import { getReport } from "$lib/server/reports";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    const report = getReport(params.path);
    return { report: report, path: params.path };
  } catch (err) {
    return error(404, { message: "Not found" });
  }
}
