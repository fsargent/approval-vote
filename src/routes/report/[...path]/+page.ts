import { error } from "@sveltejs/kit";
import { getReport } from "$lib/reports";

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  try {
    const report = getReport(params.path);
    return { props: { report: report, path: params.path } };
  } catch (err) {
    return error(404, { message: "Not found" });
  }
}
