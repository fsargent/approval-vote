import { error } from "@sveltejs/kit";
import { getIndex } from "$lib/server/reports";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    return { index: await getIndex() };
  } catch (err) {
    return error(404, { message: "Not found" });
  }
}
