import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
const db = new Database("data.db");

const insertReport = db.prepare(
  "INSERT INTO reports (name, date, jurisdictionPath, electionPath, office, officeName, jurisdictionName, electionName, website, notes, ballotCount, winners, numberOfWinners, condorcet, numCandidates) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
const insertCandidate = db.prepare(
  "INSERT INTO candidates (report_id, name, votes, winner) VALUES (?, ?, ?, ?)"
);

function processReport(report) {
  const reportInfo = report.info;
  const { lastInsertRowid: reportId } = insertReport.run(
    reportInfo.name,
    reportInfo.date,
    reportInfo.jurisdictionPath,
    reportInfo.electionPath,
    reportInfo.office,
    reportInfo.officeName,
    reportInfo.jurisdictionName,
    reportInfo.electionName,
    reportInfo.website,
    reportInfo.notes,
    report.ballotCount,
    JSON.stringify(report.winners),
    report.numberOfWinners,
    report.condorcet,
    report.numCandidates
  );

  report.candidates.forEach((candidate) => {
    insertCandidate.run(
      reportId,
      candidate.name,
      candidate.votes,
      candidate.winner ? 1 : 0
    );
  });
}

function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);

    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (file === "report.json") {
      const report = JSON.parse(fs.readFileSync(fullPath));
      processReport(report);
    }
  }
}

scanDirectory("src/lib/reports");
