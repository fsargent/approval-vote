import type { PageLoad } from './$types';
import { VOTING_METHODS } from './voting-methods';

export const load: PageLoad = async () => {
  return {
    votingMethods: VOTING_METHODS,
  };
};
