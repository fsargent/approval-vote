import Database from "better-sqlite3";

// Path to your SQLite database file
const db = new Database("data.db");

const insertReport = db.prepare(`
  INSERT INTO reports (name, date, jurisdictionPath, electionPath, office, officeName, jurisdictionName, electionName, website, notes, ballotCount, path, hidden)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCandidate = db.prepare(`
  INSERT INTO candidates (report_id, name, votes, winner)
  VALUES (?, ?, ?, ?)
`);

function addReportAndCandidates(report, candidates) {
  // Start a transaction
  const transaction = db.transaction(() => {
    // Insert the report
    const result = insertReport.run(
      report.name,
      report.date,
      report.jurisdictionPath,
      report.electionPath,
      report.office,
      report.officeName,
      report.jurisdictionName,
      report.electionName,
      report.website,
      report.notes,
      report.ballotCount,
      report.path,
      report.hidden
    );

    // Get the last inserted row ID
    const reportId = result.lastInsertRowid;

    // Insert candidates
    for (const candidate of candidates) {
      insertCandidate.run(reportId, candidate.name, candidate.votes, candidate.winner);
    }
  });

  // Execute the transaction
  try {
    transaction();
    console.log("Transaction successful.");
  } catch (error) {
    console.error("Failed to execute transaction:", error);
  }
}

// Example data to insert
const report = {
  name: "June 11, 2024 Commissioner Fargo",
  date: "2024-06-11",
  jurisdictionPath: "us/nd/fargo",
  electionPath: "2024/06",
  office: "commissioner",
  officeName: "City Commissioner",
  jurisdictionName: "Fargo, ND",
  electionName: "Primary Election",
  website: "https://results.sos.nd.gov/resultsSW.aspx?text=All&type=CIALL&map=CTY&area=Fargo&name=Fargo",
  notes: "",
  ballotCount: 14781,
  path: "us/nd/fargo/2024/06",
  hidden: 0
};

const candidates = [
  { name: "Michelle Turnberg", votes: 6850, winner: 1 },
  { name: "John Strand", votes: 6579, winner: 1 },
  { name: "Al Carlson", votes: 5746, winner: 0 },
  { name: "Arlette Preston", votes: 5560, winner: 0 },
  { name: "Anna Johnson", votes: 3545, winner: 0 },
  { name: "Delson Saintal", votes: 2378, winner: 0 },
  { name: "Nathan Pullen", votes: 1879, winner: 0 },
  { name: "write-in", votes: 85, winner: 0 }
];

// Add the report and candidates to the database
addReportAndCandidates(report, candidates);

console.log("Report and candidates added successfully");
