import { error } from '@sveltejs/kit';
import { getIndex } from '$lib/server/reports';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params: _params }) {
  try {
    return { index: await getIndex() };
  } catch {
    return error(404, { message: 'Not found' });
  }
}
