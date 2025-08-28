import Database from 'better-sqlite3';
const db = new Database('data.sqlite3');

import type {
  IReportIndex,
  IContestReport,
  IReportIndexByYear,
  ICandidate,
  IContestIndexEntry,
  IElectionIndexEntry,
} from '$lib/report_types';

// Helper function to create a contest object
function createContest(row: IContestIndexEntry & { sumVotes: number }, winners: string[]) {
  return {
    office: row.office,
    officeName: row.officeName,
    name: row.name,
    winners: winners,
    numCandidates: row.numCandidates,
    ballotCount: row.ballotCount,
    sumVotes: row.sumVotes,
  };
}

function getWinners(reportId: number) {
  const winnersSqlCmd = `
    SELECT
      name
    FROM
      candidates
    WHERE
      report_id = ?
      AND winner = 1
  `;

  const winnersRows = db.prepare(winnersSqlCmd).all(reportId) as {
    name: string;
  }[];

  return winnersRows.map((row) => row.name);
}

// Helper function to create a new election
function createElection(row: IElectionIndexEntry, contest: IContestIndexEntry) {
  return {
    path: row.path,
    jurisdictionName: row.jurisdictionName,
    electionName: row.electionName,
    date: row.date,
    contests: [contest],
  };
}

// Helper function to add a contest to an existing election
function addContestToElection(election: IElectionIndexEntry, contest: IContestIndexEntry) {
  election.contests.push(contest);
  election.contests.sort((b: IContestIndexEntry, a: IContestIndexEntry) => {
    // Extract numeric part from office names surrounded by spaces
    const numA: number = extractNumber(a.officeName);
    const numB: number = extractNumber(b.officeName);

    // Compare as numbers
    return numB - numA;
  });
}

function extractNumber(str: string) {
  const match = str.match(/\b(\d+)(st|nd|rd|th)?\b/);
  return match ? parseInt(match[1]) : null;
}

export function getIndex(): IReportIndex {
  const sqlCmd = `
    SELECT
      reports.*,
      COUNT(candidates.name) AS numCandidates,
      SUM(candidates.votes) AS sumVotes
    FROM
      reports
    JOIN
      candidates ON reports.id = candidates.report_id
    WHERE
      reports.hidden != 1
    GROUP BY
      reports.id
    ORDER BY
      reports.date DESC
  `;

  const rows = db.prepare(sqlCmd).all();

  const electionsByYear = rows.reduce(
    (
      grouped: IReportIndexByYear,
      row: IElectionIndexEntry & { sumVotes: number }
    ): IReportIndexByYear => {
      const year = new Date(row.date).getFullYear();
      const winners = getWinners(row.id);
      const contest = createContest(row, winners);

      if (!grouped[year]) {
        grouped[year] = [];
      }

      const existingElectionIndex = grouped[year].findIndex(
        (election: IElectionIndexEntry) => election.path === row.path
      );

      if (existingElectionIndex === -1) {
        grouped[year].push(createElection(row, contest));
      } else {
        addContestToElection(grouped[year][existingElectionIndex], contest);
      }

      return grouped;
    },
    {}
  );

  // Sort contests within each election by ballotCount (descending)
  for (const year in electionsByYear) {
    for (const election of electionsByYear[year]) {
      election.contests.sort((a, b) => b.ballotCount - a.ballotCount);
    }
  }

  const groupedArray = Object.entries(electionsByYear as IReportIndexByYear).sort(
    (a, b) => parseInt(b[0]) - parseInt(a[0])
  );

  // Convert the reversed array back to a Map
  const groupedMap = new Map(groupedArray);

  return groupedMap;
}

export function getReport(path: string): IContestReport {
  let office = path.split('/').slice(-1);
  path = path.split('/').slice(0, -1).join('/');
  const reportRow = db
    .prepare('SELECT * FROM reports WHERE path = ? AND office = ?')
    .get(path, office) as IContestReport;

  if (!reportRow) {
    throw new Error(`Report not found for path: ${path}`);
  }

  const candidateRows = db
    .prepare('SELECT * FROM candidates WHERE report_id = ?')
    .all(reportRow.id) as ICandidate[];

  // Make the winners array by getting all the candidates with winner = 1
  const winners = db
    .prepare('SELECT name FROM candidates WHERE report_id = ? AND winner = 1')
    .all(reportRow.id) as ICandidate[];

  const winnerNames = winners.map((candidate: ICandidate) => candidate.name);

  // Load co-approval data
  const coApprovalRows = db
    .prepare('SELECT * FROM co_approvals WHERE report_id = ?')
    .all(reportRow.id) as Array<{
    candidate_a: string;
    candidate_b: string;
    co_approval_count: number;
    co_approval_rate: number;
  }>;

  const coApprovals = coApprovalRows.map((row) => ({
    candidateA: row.candidate_a,
    candidateB: row.candidate_b,
    coApprovalCount: row.co_approval_count,
    coApprovalRate: row.co_approval_rate,
  }));

  // Load voting patterns
  const votingPatternsRow = db
    .prepare('SELECT * FROM voting_patterns WHERE report_id = ?')
    .get(reportRow.id) as
    | {
        total_ballots: number;
        bullet_voting_count: number;
        bullet_voting_rate: number;
        full_approval_count: number;
        full_approval_rate: number;
        average_approvals_per_ballot: number;
        most_common_combination: string;
        approval_distribution: string;
        candidate_approval_distributions?: string;
      }
    | undefined;
  let votingPatterns = null;
  if (votingPatternsRow) {
    votingPatterns = {
      totalBallots: votingPatternsRow.total_ballots,
      bulletVotingCount: votingPatternsRow.bullet_voting_count,
      bulletVotingRate: votingPatternsRow.bullet_voting_rate,
      fullApprovalCount: votingPatternsRow.full_approval_count,
      fullApprovalRate: votingPatternsRow.full_approval_rate,
      averageApprovalsPerBallot: votingPatternsRow.average_approvals_per_ballot,
      mostCommonCombination: JSON.parse(votingPatternsRow.most_common_combination || '[]'),
      approvalDistribution: JSON.parse(votingPatternsRow.approval_distribution || '{}'),
      candidateApprovalDistributions: votingPatternsRow.candidate_approval_distributions
        ? JSON.parse(votingPatternsRow.candidate_approval_distributions)
        : undefined,
    };
  }

  const report: IContestReport = {
    info: {
      name: reportRow.name,
      date: reportRow.date,
      dataFormat: 'unknown', // adjust as needed
      tabulation: 'unknown', // adjust as needed
      jurisdictionPath: reportRow.jurisdictionPath,
      electionPath: reportRow.electionPath,
      office: reportRow.office,
      loaderParams: {}, // adjust as needed
      jurisdictionName: reportRow.jurisdictionName,
      officeName: reportRow.officeName,
      electionName: reportRow.electionName,
      website: reportRow.website,
      notes: reportRow.notes,
    },
    ballotCount: reportRow.ballotCount,
    candidates: candidateRows.map((row, _index) => ({
      name: row.name,
      writeIn: row.writeIn || false,
      votes: row.votes,
      winner: row.winner === 1,
    })),
    winners: winnerNames,
    condorcet: reportRow.condorcet,
    numCandidates: candidateRows.length,
    coApprovals: coApprovals.length > 0 ? coApprovals : undefined,
    votingPatterns: votingPatterns || undefined,
  };

  return report;
}
