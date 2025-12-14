import { Database } from "bun:sqlite";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Expected values (from official election results)
const EXPECTED_CANDIDATE_VOTES = {
	"Emily Buss": 615,
	"Maleah Bliss": 430,
	"Tynley Bean": 419,
	"Jeff Marshall": 407,
	"Jeff Saunders": 395,
};

const EXPECTED_TOTAL_BALLOTS = 1301;
const EXPECTED_TOTAL_APPROVALS = 2266; // Sum of all candidate votes

const REPORT_ID = 43;
const REPORT_PATH = "us/ut/senate_district_11/2025/12";

// Database path relative to project root
// Get the directory of this test file, then go up one level to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "data.sqlite3");

let db;

beforeAll(() => {
	try {
		db = new Database(dbPath);
	} catch (error) {
		throw new Error(
			`Database not found at ${dbPath}. Make sure data.sqlite3 exists in the project root. Original error: ${error.message}`,
		);
	}
});

afterAll(() => {
	if (db) {
		db.close();
	}
});

test("candidate vote counts match expected values", () => {
	const results = db
		.prepare(
			"SELECT name, votes FROM candidates WHERE report_id = ? ORDER BY name",
		)
		.all(REPORT_ID);

	for (const { name, votes } of results) {
		const expected = EXPECTED_CANDIDATE_VOTES[name];
		if (expected === undefined) {
			throw new Error(`Unexpected candidate: ${name}`);
		}
		expect(votes).toBe(expected);
	}
});

test("total ballot count matches expected value", () => {
	const ballotCount = db
		.prepare("SELECT ballotCount FROM reports WHERE id = ?")
		.get(REPORT_ID).ballotCount;

	expect(ballotCount).toBe(EXPECTED_TOTAL_BALLOTS);
});

test("vote sum consistency", () => {
	const sum = db
		.prepare("SELECT SUM(votes) as total FROM candidates WHERE report_id = ?")
		.get(REPORT_ID).total;

	expect(sum).toBe(EXPECTED_TOTAL_APPROVALS);
});

test("co-approval consistency", () => {
	const coApprovals = db
		.prepare(
			"SELECT candidate_a, candidate_b, co_approval_count, co_approval_rate FROM co_approvals WHERE report_id = ?",
		)
		.all(REPORT_ID);

	const candidateVotes = new Map(
		db
			.prepare("SELECT name, votes FROM candidates WHERE report_id = ?")
			.all(REPORT_ID)
			.map(({ name, votes }) => [name, votes]),
	);

	for (const {
		candidate_a,
		candidate_b,
		co_approval_count,
		co_approval_rate,
	} of coApprovals) {
		// Check that co-approval count doesn't exceed either candidate's total votes
		const candAVotes = candidateVotes.get(candidate_a) || 0;
		const candBVotes = candidateVotes.get(candidate_b) || 0;

		expect(co_approval_count).toBeLessThanOrEqual(candAVotes);
		expect(co_approval_count).toBeLessThanOrEqual(candBVotes);

		// Check that rate is reasonable (0-100%)
		expect(co_approval_rate).toBeGreaterThanOrEqual(0);
		expect(co_approval_rate).toBeLessThanOrEqual(100);

		// Check that rate calculation is correct (within rounding error)
		if (candAVotes > 0) {
			const expectedRate = (co_approval_count / candAVotes) * 100;
			expect(Math.abs(co_approval_rate - expectedRate)).toBeLessThan(0.01);
		}
	}
});

test("voting patterns consistency", () => {
	const patterns = db
		.prepare(
			"SELECT total_ballots, bullet_voting_count, full_approval_count, average_approvals_per_ballot FROM voting_patterns WHERE report_id = ?",
		)
		.get(REPORT_ID);

	expect(patterns).toBeDefined();

	const {
		total_ballots,
		bullet_voting_count,
		full_approval_count,
		average_approvals_per_ballot,
	} = patterns;

	// Check total ballots matches report
	const reportBallots = db
		.prepare("SELECT ballotCount FROM reports WHERE id = ?")
		.get(REPORT_ID).ballotCount;
	expect(total_ballots).toBe(reportBallots);

	// Check bullet voting doesn't exceed total ballots
	expect(bullet_voting_count).toBeLessThanOrEqual(total_ballots);

	// Check full approval doesn't exceed total ballots
	expect(full_approval_count).toBeLessThanOrEqual(total_ballots);

	// Check average approvals is reasonable
	const numCandidates = Object.keys(EXPECTED_CANDIDATE_VOTES).length;
	expect(average_approvals_per_ballot).toBeGreaterThanOrEqual(0);
	expect(average_approvals_per_ballot).toBeLessThanOrEqual(numCandidates);
});

test("'Anyone But' analysis consistency", () => {
	const anyoneButJson = db
		.prepare(
			"SELECT anyone_but_analysis FROM voting_patterns WHERE report_id = ?",
		)
		.get(REPORT_ID)?.anyone_but_analysis;

	expect(anyoneButJson).toBeDefined();

	const anyoneBut = JSON.parse(anyoneButJson);
	const totalBallots = db
		.prepare("SELECT total_ballots FROM voting_patterns WHERE report_id = ?")
		.get(REPORT_ID).total_ballots;

	let totalAnyoneBut = 0;

	for (const [candidate, count] of Object.entries(anyoneBut)) {
		let exclusionCount = count;
		if (typeof count === "object" && count !== null) {
			exclusionCount = count.exclusionCount || count.exclusionCount || 0;
		}

		totalAnyoneBut += exclusionCount;

		// Check that count doesn't exceed total ballots
		expect(exclusionCount).toBeLessThanOrEqual(totalBallots);
	}

	// Check that total 'Anyone But' ballots don't exceed total ballots
	expect(totalAnyoneBut).toBeLessThanOrEqual(totalBallots);
});

test("candidate approval distributions consistency", () => {
	const distJson = db
		.prepare(
			"SELECT candidate_approval_distributions FROM voting_patterns WHERE report_id = ?",
		)
		.get(REPORT_ID)?.candidate_approval_distributions;

	expect(distJson).toBeDefined();

	const distributions = JSON.parse(distJson);
	const candidateVotes = new Map(
		db
			.prepare("SELECT name, votes FROM candidates WHERE report_id = ?")
			.all(REPORT_ID)
			.map(({ name, votes }) => [name, votes]),
	);

	for (const [candidate, dist] of Object.entries(distributions)) {
		// Sum up the distribution counts
		const totalInDist = Object.values(dist).reduce(
			(sum, count) => sum + Number(count),
			0,
		);
		const expectedVotes = candidateVotes.get(candidate) || 0;

		expect(totalInDist).toBe(expectedVotes);
	}
});

test("CVR data consistency", () => {
	// Count ballots in cvr_ballots
	const cvrBallotCount = db
		.prepare("SELECT COUNT(*) as count FROM cvr_ballots WHERE source = 'utah'")
		.get().count;

	// Count contests
	const cvrContestCount = db
		.prepare("SELECT COUNT(*) as count FROM cvr_contests WHERE source = 'utah'")
		.get().count;

	// Count selections
	const cvrSelectionCount = db
		.prepare(
			"SELECT COUNT(*) as count FROM cvr_selections WHERE source = 'utah'",
		)
		.get().count;

	// Get total ballots from reports
	const reportBallots = db
		.prepare("SELECT ballotCount FROM reports WHERE id = ?")
		.get(REPORT_ID).ballotCount;

	expect(cvrBallotCount).toBe(reportBallots);
	expect(cvrContestCount).toBe(reportBallots);
	expect(cvrSelectionCount).toBe(EXPECTED_TOTAL_APPROVALS);
});
