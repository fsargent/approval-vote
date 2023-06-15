import Database from "better-sqlite3";
const db = new Database("data.db");

import type {
  IReportIndex,
  IContestReport,
  IElectionIndexEntry,
  IContestIndexEntry,
} from "$lib/report_types";

export function getIndex(): IReportIndex {
  const electionsRows = db.prepare("SELECT * FROM reports").all();

  const elections = electionsRows.map((electionRow): IElectionIndexEntry => {
    const contest: IContestIndexEntry = {
      office: electionRow.office,
      officeName: electionRow.officeName,
      name: electionRow.name,
      winners: JSON.parse(electionRow.winners),
      numCandidates: electionRow.numCandidates,
    };

    return {
      path: electionRow.path,
      jurisdictionName: electionRow.jurisdictionName,
      electionName: electionRow.electionName,
      date: electionRow.date,
      contests: [contest], // You may want to adjust this if your reports have more than one contest
    };
  });

  return { elections };
}

export function getReport(path: string): IContestReport {
  const reportRow = db
    .prepare("SELECT * FROM reports WHERE path = ?")
    .get(path);

  if (!reportRow) {
    throw new Error(`Report not found for path: ${path}`);
  }

  const candidateRows = db
    .prepare("SELECT * FROM candidates WHERE report_id = ?")
    .all(reportRow.id);

  const report: IContestReport = {
    info: {
      name: reportRow.name,
      date: reportRow.date,
      dataFormat: "unknown", // adjust as needed
      tabulation: "unknown", // adjust as needed
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
    candidates: candidateRows.map((row, index) => ({
      name: row.name,
      writeIn: row.writeIn || false,
      votes: row.votes,
      winner: row.winner === 1,
    })),
    winners: JSON.parse(reportRow.winners),
    condorcet: reportRow.condorcet,
    numCandidates: reportRow.numCandidates,
  };

  return report;
}
