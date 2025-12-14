import { Database } from "bun:sqlite";

// Path to your SQLite database file
const db = new Database("data.sqlite3");

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
			report.hidden,
		);

		// Get the last inserted row ID
		const reportId = result.lastInsertRowid;

		// Insert candidates
		for (const candidate of candidates) {
			insertCandidate.run(
				reportId,
				candidate.name,
				candidate.votes,
				candidate.winner,
			);
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
addReportAndCandidates(
	{
		name: "St. Louis Primary Municipal Election",
		date: "2025-03-04",
		jurisdictionPath: "us/mo/st_louis",
		electionPath: "2025/03",
		office: "mayor",
		officeName: "Mayor",
		jurisdictionName: "St. Louis, MO",
		electionName: "Primary Municipal Election",
		website:
			"https://www.stlouis-mo.gov/government/departments/board-election-commissioners/elections/results/index.cfm",
		notes: "Total Ballots had to be calculated from approval percentage.",
		ballotCount: 34910,
		path: "us/mo/st_louis/2025/03",
		hidden: 0,
	},
	[
		{ name: 'Michael "Mike" Butler', votes: 8679, winner: 0 },
		{ name: "Tishaura O. Jones", votes: 11582, winner: 0 },
		{ name: "Cara Spencer", votes: 23785, winner: 1 },
		{ name: "Andrew Jones", votes: 4757, winner: 0 },
	],
);

addReportAndCandidates(
	{
		name: "St. Louis Primary Municipal Election",
		date: "2025-03-04",
		jurisdictionPath: "us/mo/st_louis",
		electionPath: "2025/03",
		office: "comptroller",
		officeName: "Comptroller",
		jurisdictionName: "St. Louis, MO",
		electionName: "Primary Municipal Election",
		website:
			"https://www.stlouis-mo.gov/government/departments/board-election-commissioners/elections/results/index.cfm",
		notes: "Total Ballots had to be calculated from approval percentage.",
		ballotCount: 34961,
		path: "us/mo/st_louis/2025/03",
		hidden: 0,
	},
	[
		{ name: "Donna M.C. Baringer", votes: 16664, winner: 1 },
		{ name: "Darlene Green", votes: 16117, winner: 0 },
		{ name: "Celeste Metcalf", votes: 8541, winner: 0 },
	],
);

addReportAndCandidates(
	{
		name: "St. Louis Primary Municipal Election",
		date: "2025-03-04",
		jurisdictionPath: "us/mo/st_louis",
		electionPath: "2025/03",
		office: "alderman-ward3",
		officeName: "Alderman - Ward 3",
		jurisdictionName: "St. Louis, MO",
		electionName: "Primary Municipal Election",
		website:
			"https://www.stlouis-mo.gov/government/departments/board-election-commissioners/elections/results/index.cfm",
		notes: "Total Ballots had to be calculated from approval percentage.",
		ballotCount: 1660,
		path: "us/mo/st_louis/2025/03",
		hidden: 0,
	},
	[
		{ name: "Dallas Adams", votes: 693, winner: 0 },
		{ name: "Shane Cohn", votes: 919, winner: 1 },
		{ name: "Inez Bordeaux", votes: 450, winner: 0 },
	],
);

addReportAndCandidates(
	{
		name: "St. Louis Primary Municipal Election",
		date: "2025-03-04",
		jurisdictionPath: "us/mo/st_louis",
		electionPath: "2025/03",
		office: "alderman-ward11",
		officeName: "Alderman - Ward 11",
		jurisdictionName: "St. Louis, MO",
		electionName: "Primary Municipal Election",
		website:
			"https://www.stlouis-mo.gov/government/departments/board-election-commissioners/elections/results/index.cfm",
		notes: "Total Ballots had to be calculated from approval percentage.",
		ballotCount: 1185,
		path: "us/mo/st_louis/2025/03",
		hidden: 0,
	},
	[
		{ name: "Melinda Long", votes: 140, winner: 0 },
		{ name: "Rebecca Mccloud", votes: 421, winner: 0 },
		{ name: "Laura M. Keys", votes: 743, winner: 1 },
	],
);
