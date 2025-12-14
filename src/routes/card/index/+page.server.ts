import { getIndex } from "$lib/server/reports";

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		return { index: await getIndex() };
	} catch {
		return { index: new Map() };
	}
}
