import { error } from "@sveltejs/kit";
import { getReport } from "$lib/server/reports";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const report = getReport(params.path);
  if (!report) {
    throw error(404, {
      message: "Not found",
    });
  }
  return { report: report, path: params.path };
}
