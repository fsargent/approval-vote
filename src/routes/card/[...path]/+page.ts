import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const reports = import.meta.glob("$lib/reports/**/report.json", {
    eager: true,
  });
  const report = reports[`/src/lib/reports/${params.path}/report.json`];
  if (!report) {
    throw error(404, {
      message: "Not found",
    });
  }
  return { report: report, path: params.path };
}
