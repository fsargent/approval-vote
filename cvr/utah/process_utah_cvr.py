#!/usr/bin/env python3
"""
Process Utah CVR data from JSON format and export to main database.

This script:
1. Loads Utah CVR data from JSON
2. Creates CVR tables in main database (if needed)
3. Exports CVR data with source='utah'
4. Generates co-approval analysis and voting patterns

After running this script, you can validate the results by running:
    python3 test_utah_cvr.py
"""

import json
import logging
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def generate_co_approval_analysis(ballots_data, candidates):
    """Generate co-approval analysis from ballot data."""
    total_ballots = len(ballots_data)

    # Build mapping of candidate to set of ballot indices that approved them
    candidate_ballots = defaultdict(set)
    for idx, ballot in enumerate(ballots_data):
        for key in sorted(ballot.keys()):
            if key.startswith("vote_") and ballot[key]:
                candidate_ballots[ballot[key]].add(idx)

    # Calculate co-approval matrix
    # For each pair (A, B), calculate: of voters who approved A, what % also approved B?
    co_approval_list = []
    for i, cand_a in enumerate(candidates):
        for j, cand_b in enumerate(candidates):
            if i == j:
                continue

            # Get ballots that approved candidate A
            cand_a_ballots = candidate_ballots.get(cand_a, set())
            if len(cand_a_ballots) == 0:
                continue

            # Count how many of those also approved candidate B
            both_count = len(cand_a_ballots & candidate_ballots.get(cand_b, set()))

            # Rate is percentage of candidate A voters who also approved candidate B
            co_approval_rate = (
                (both_count / len(cand_a_ballots) * 100)
                if len(cand_a_ballots) > 0
                else 0
            )

            co_approval_list.append(
                {
                    "candidateA": cand_a,
                    "candidateB": cand_b,
                    "coApprovalCount": both_count,
                    "coApprovalRate": co_approval_rate,
                }
            )

    # Calculate voting patterns
    approval_counts = Counter()
    bullet_voting = 0
    full_approval = 0
    candidate_approvals = defaultdict(int)
    anyone_but_counts = defaultdict(int)

    for ballot in ballots_data:
        approved = []
        for key in sorted(ballot.keys()):
            if key.startswith("vote_") and ballot[key]:
                approved.append(ballot[key])

        num_approvals = len(approved)
        approval_counts[num_approvals] += 1

        if num_approvals == 1:
            bullet_voting += 1

        if num_approvals == len(candidates):
            full_approval += 1

        for candidate in approved:
            candidate_approvals[candidate] += 1

        # Anyone but analysis: count exclusions
        for candidate in candidates:
            if candidate not in approved:
                anyone_but_counts[candidate] += 1

    # Calculate approval distributions
    approval_distribution = {str(k): v for k, v in sorted(approval_counts.items())}

    # Calculate candidate-specific approval distributions
    # For each candidate, count how many voters who approved them approved 1, 2, 3, etc. total candidates
    candidate_approval_distributions = {}
    for candidate in candidates:
        # Get all ballots that approved this candidate
        candidate_ballot_distribution = Counter()
        for ballot in ballots_data:
            approved = []
            for key in sorted(ballot.keys()):
                if key.startswith("vote_") and ballot[key]:
                    approved.append(ballot[key])

            # If this ballot approved the candidate, count how many total approvals it had
            if candidate in approved:
                total_approvals = len(approved)
                candidate_ballot_distribution[total_approvals] += 1

        if candidate_ballot_distribution:
            candidate_approval_distributions[candidate] = {
                str(k): v for k, v in sorted(candidate_ballot_distribution.items())
            }

    # Find most common combination
    combination_counts = Counter()
    for ballot in ballots_data:
        approved = tuple(
            sorted(
                [
                    ballot[key]
                    for key in sorted(ballot.keys())
                    if key.startswith("vote_") and ballot[key]
                ]
            )
        )
        combination_counts[approved] += 1

    most_common = combination_counts.most_common(1)[0] if combination_counts else None
    most_common_combination = (
        {
            "candidates": list(most_common[0]),
            "count": most_common[1],
            "rate": most_common[1] / total_ballots if total_ballots > 0 else 0,
        }
        if most_common
        else None
    )

    # Anyone but analysis - ballots with exactly N-1 approvals (all candidates except one)
    anyone_but_analysis = {}
    num_candidates = len(candidates)

    for ballot in ballots_data:
        approved = []
        for key in sorted(ballot.keys()):
            if key.startswith("vote_") and ballot[key]:
                approved.append(ballot[key])

        # Only count ballots with exactly N-1 approvals
        if len(approved) == num_candidates - 1:
            # Find the one candidate that was NOT approved
            excluded_candidates = set(candidates) - set(approved)
            if len(excluded_candidates) == 1:
                excluded_candidate = list(excluded_candidates)[0]
                anyone_but_analysis[excluded_candidate] = (
                    anyone_but_analysis.get(excluded_candidate, 0) + 1
                )

    voting_patterns = {
        "totalBallots": total_ballots,
        "bulletVotingCount": bullet_voting,
        "bulletVotingRate": bullet_voting / total_ballots if total_ballots > 0 else 0,
        "fullApprovalCount": full_approval,
        "fullApprovalRate": full_approval / total_ballots if total_ballots > 0 else 0,
        "averageApprovalsPerBallot": (
            sum(approval_counts[k] * k for k in approval_counts) / total_ballots
            if total_ballots > 0
            else 0
        ),
        "mostCommonCombination": most_common_combination,
        "approvalDistribution": approval_distribution,
        "candidateApprovalDistributions": candidate_approval_distributions,
        "anyoneButAnalysis": anyone_but_analysis,
    }

    return co_approval_list, voting_patterns


def export_utah_cvr_to_main_database():
    """Export Utah CVR data to main database."""
    json_path = Path("../2025-12-11-utah-senate-district-11/utah_senate_11_cvr.json")
    main_db = "../../data.sqlite3"

    if not json_path.exists():
        logger.error(f"Utah CVR JSON file {json_path} does not exist!")
        return False

    if not Path(main_db).exists():
        logger.error(f"Main database {main_db} does not exist!")
        return False

    logger.info(f"Loading Utah CVR data from {json_path}...")
    with open(json_path) as f:
        ballots_data = json.load(f)

    logger.info(f"Loaded {len(ballots_data)} ballots")

    main_conn = sqlite3.connect(main_db)

    # Get report ID for Utah Senate District 11
    report_result = main_conn.execute(
        "SELECT id FROM reports WHERE path = ?",
        ("us/ut/senate_district_11/2025/12",),
    ).fetchone()

    if not report_result:
        logger.error("Utah Senate District 11 report not found in database!")
        return False

    report_id = report_result[0]
    logger.info(f"Found report_id: {report_id}")

    # Get candidates for this report
    candidates_result = main_conn.execute(
        "SELECT name FROM candidates WHERE report_id = ? ORDER BY name", (report_id,)
    ).fetchall()
    candidates = [row[0] for row in candidates_result]
    logger.info(f"Found {len(candidates)} candidates: {', '.join(candidates)}")

    # Generate co-approval analysis
    logger.info("Generating co-approval analysis...")
    co_approvals, voting_patterns = generate_co_approval_analysis(
        ballots_data, candidates
    )

    # Clear existing data for this report (idempotent)
    main_conn.execute("DELETE FROM co_approvals WHERE report_id = ?", (report_id,))
    main_conn.execute("DELETE FROM voting_patterns WHERE report_id = ?", (report_id,))

    # Insert co-approval data
    for ca in co_approvals:
        main_conn.execute(
            """
            INSERT INTO co_approvals (report_id, candidate_a, candidate_b, co_approval_count, co_approval_rate)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                report_id,
                ca["candidateA"],
                ca["candidateB"],
                ca["coApprovalCount"],
                ca["coApprovalRate"],
            ),
        )

    # Insert voting patterns
    import json as json_module

    main_conn.execute(
        """
        INSERT INTO voting_patterns (
            report_id, total_ballots, bullet_voting_count, bullet_voting_rate,
            full_approval_count, full_approval_rate, average_approvals_per_ballot,
            most_common_combination, approval_distribution, candidate_approval_distributions,
            anyone_but_analysis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            report_id,
            voting_patterns["totalBallots"],
            voting_patterns["bulletVotingCount"],
            voting_patterns["bulletVotingRate"],
            voting_patterns["fullApprovalCount"],
            voting_patterns["fullApprovalRate"],
            voting_patterns["averageApprovalsPerBallot"],
            json_module.dumps(voting_patterns["mostCommonCombination"]),
            json_module.dumps(voting_patterns["approvalDistribution"]),
            json_module.dumps(voting_patterns["candidateApprovalDistributions"]),
            json_module.dumps(voting_patterns["anyoneButAnalysis"]),
        ),
    )

    logger.info(
        f"  ✅ Exported {len(co_approvals)} co-approval entries and voting patterns"
    )

    # Update the reports table with accurate ballot count from CVR
    logger.info(f"  Updating report ballot count to {voting_patterns['totalBallots']}")
    main_conn.execute(
        """
        UPDATE reports 
        SET ballotCount = ? 
        WHERE id = ?
    """,
        (voting_patterns["totalBallots"], report_id),
    )

    # Update candidate vote counts from CVR data
    logger.info("  Updating candidate vote counts from CVR data")
    from collections import Counter

    # Count votes from ballots_data
    candidate_votes = Counter()
    for ballot in ballots_data:
        for key in sorted(ballot.keys()):
            if key.startswith("vote_") and ballot[key]:
                candidate_votes[ballot[key]] += 1

    # Update each candidate's vote count
    for candidate_name, vote_count in candidate_votes.items():
        logger.info(f"    Updating {candidate_name}: {vote_count} votes")
        main_conn.execute(
            """
            UPDATE candidates 
            SET votes = ? 
            WHERE report_id = ? AND name = ?
        """,
            (vote_count, report_id, candidate_name),
        )

        # Verify the update worked
        updated_count = main_conn.execute(
            """
            SELECT votes FROM candidates 
            WHERE report_id = ? AND name = ?
        """,
            (report_id, candidate_name),
        ).fetchone()

        if updated_count and updated_count[0] != vote_count:
            logger.warning(
                f"    Vote count mismatch for {candidate_name}: expected {vote_count}, got {updated_count[0]}"
            )

    # Export CVR tables to main database
    logger.info("\n📦 Exporting CVR tables to main database...")
    source = "utah"

    # Delete existing Utah CVR data (idempotent)
    main_conn.execute("DELETE FROM cvr_selections WHERE source = ?", (source,))
    main_conn.execute("DELETE FROM cvr_contests WHERE source = ?", (source,))
    main_conn.execute("DELETE FROM cvr_ballots WHERE source = ?", (source,))

    # Insert ballots
    logger.info("  Inserting cvr_ballots...")
    contest_name = "Utah Senate District 11"
    contest_id = "utah_senate_district_11_2025_12"

    ballot_id_map = {}
    cursor = main_conn.cursor()
    for idx, ballot in enumerate(ballots_data, 1):
        tracking = ballot.get("tracking", f"utah_ballot_{idx}")
        cursor.execute(
            """
            INSERT INTO cvr_ballots (source, cvr_guid, batch_sequence, sheet_number, precinct_name, precinct_id, is_blank)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (source, tracking, None, None, None, None, False),
        )
        ballot_id = cursor.lastrowid
        ballot_id_map[idx] = ballot_id

    logger.info(f"  ✓ Inserted {len(ballot_id_map)} ballots")

    # Insert contests and selections
    logger.info("  Inserting cvr_contests and cvr_selections...")
    contest_id_map = {}
    selection_count = 0

    for idx, ballot in enumerate(ballots_data, 1):
        ballot_id = ballot_id_map[idx]  # idx starts at 1 from enumerate(..., 1)

        # Insert contest record
        cursor.execute(
            """
            INSERT INTO cvr_contests (source, ballot_id, contest_name, contest_id, undervotes)
            VALUES (?, ?, ?, ?, ?)
        """,
            (source, ballot_id, contest_name, contest_id, 0),
        )
        contest_record_id = cursor.lastrowid
        contest_id_map[idx] = contest_record_id

        # Insert selections
        for key in sorted(ballot.keys()):
            if key.startswith("vote_") and ballot[key]:
                candidate_name = ballot[key]
                cursor.execute(
                    """
                    INSERT INTO cvr_selections (source, contest_record_id, candidate_name, candidate_id, selection_value)
                    VALUES (?, ?, ?, ?, ?)
                """,
                    (
                        source,
                        contest_record_id,
                        candidate_name,
                        candidate_name.lower().replace(" ", "_"),
                        1,
                    ),
                )
                selection_count += 1

    logger.info(
        f"  ✓ Inserted {len(contest_id_map)} contests and {selection_count} selections"
    )

    main_conn.commit()
    main_conn.close()

    logger.info("🎉 All Utah CVR data exported to main database!")
    return True


if __name__ == "__main__":
    import sys

    if export_utah_cvr_to_main_database():
        sys.exit(0)
    else:
        sys.exit(1)
