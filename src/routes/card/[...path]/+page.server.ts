import { error } from '@sveltejs/kit';
import { getReport } from '$lib/server/reports';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    console.log('Card route - loading path:', params.path);
    const report = getReport(params.path);
    console.log('Report loaded:', !!report);
    if (!report) {
      throw error(404, { message: 'Not found' });
    }
    return { report, path: params.path };
  } catch (err) {
    console.error('Error in card route:', err);
    throw error(404, {
      message: 'Not found',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
