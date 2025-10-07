#!/usr/bin/env python3
"""
Generate an election-wide race that combines all candidates from all contests
in the St. Louis 2025 election, with proper co-approval and voting pattern analysis.
"""

import json
import logging
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def generate_election_wide_race():
    """Generate election-wide race data from CVR and add to main database."""

    cvr_db_path = "cvr-data.sqlite3"
    main_db_path = "../data.sqlite3"

    if not Path(cvr_db_path).exists():
        logger.error(f"CVR database {cvr_db_path} does not exist!")
        return False

    if not Path(main_db_path).exists():
        logger.error(f"Main database {main_db_path} does not exist!")
        return False

    cvr_conn = sqlite3.connect(cvr_db_path)
    main_conn = sqlite3.connect(main_db_path)

    try:
        logger.info("🚀 Generating election-wide race data...")

        # Get all ballots with their approvals across all contests
        query = """
        SELECT 
            b.id as ballot_id,
            c.contest_name,
            s.candidate_name,
            s.selection_value
        FROM cvr_ballots b
        JOIN cvr_contests c ON b.id = c.ballot_id
        JOIN cvr_selections s ON c.id = s.contest_record_id
        WHERE s.selection_value = 1
        ORDER BY b.id, c.contest_name, s.candidate_name
        """

        ballot_data = defaultdict(lambda: defaultdict(set))
        all_candidates = set()
        contest_candidates = defaultdict(set)

        for row in cvr_conn.execute(query):
            ballot_id, contest_name, candidate_name, selection_value = row
            ballot_data[ballot_id][contest_name].add(candidate_name)
            all_candidates.add(candidate_name)
            contest_candidates[contest_name].add(candidate_name)

        logger.info(f"  Found {len(ballot_data)} ballots with approvals")
        logger.info(
            f"  Found {len(all_candidates)} total candidates across {len(contest_candidates)} contests"
        )

        # Create combined candidate names with contest prefixes
        candidate_mapping = {}
        combined_candidates = []

        for contest_name, candidates in contest_candidates.items():
            formatted_contest = format_contest_name(contest_name)
            for candidate in candidates:
                formatted_candidate = format_candidate_name(candidate)
                combined_name = f"{formatted_candidate} ({formatted_contest})"
                candidate_mapping[candidate] = combined_name
                combined_candidates.append(combined_name)

        logger.info(f"  Created {len(combined_candidates)} combined candidate names")

        # Calculate vote counts for each combined candidate
        candidate_votes = Counter()
        for ballot_id, contests in ballot_data.items():
            for contest_name, candidates in contests.items():
                for candidate in candidates:
                    combined_name = candidate_mapping[candidate]
                    candidate_votes[combined_name] += 1

        # Generate election-wide ballot approvals (each ballot approves candidates across all contests)
        election_wide_ballots = {}
        for ballot_id, contests in ballot_data.items():
            approved_candidates = set()
            for contest_name, candidates in contests.items():
                for candidate in candidates:
                    combined_name = candidate_mapping[candidate]
                    approved_candidates.add(combined_name)
            election_wide_ballots[ballot_id] = approved_candidates

        # Calculate co-approval matrix
        logger.info("  Calculating co-approval matrix...")
        co_approvals = []
        combined_candidates_list = list(combined_candidates)

        for i, cand_a in enumerate(combined_candidates_list):
            for j, cand_b in enumerate(combined_candidates_list):
                if i == j:  # Skip diagonal (same candidate)
                    continue

                # Count ballots that approved candidate A
                ballots_with_a = [
                    ballot_id
                    for ballot_id, approved in election_wide_ballots.items()
                    if cand_a in approved
                ]

                # Always create entry, even if 0 ballots approved candidate A
                both_count = 0
                co_approval_rate = 0.0

                if len(ballots_with_a) > 0:
                    # Count how many of those also approved candidate B
                    both_count = sum(
                        1
                        for ballot_id in ballots_with_a
                        if cand_b in election_wide_ballots[ballot_id]
                    )
                    co_approval_rate = (both_count / len(ballots_with_a)) * 100

                co_approvals.append(
                    {
                        "candidateA": cand_a,
                        "candidateB": cand_b,
                        "coApprovalCount": both_count,
                        "coApprovalRate": co_approval_rate,
                    }
                )

        logger.info(f"  Generated {len(co_approvals)} co-approval relationships")

        # Calculate voting patterns
        logger.info("  Calculating voting patterns...")
        total_ballots = len(election_wide_ballots)
        approval_distribution = Counter()

        for approved_candidates in election_wide_ballots.values():
            approval_distribution[len(approved_candidates)] += 1

        bullet_voting_count = approval_distribution[1]
        full_approval_count = approval_distribution[len(combined_candidates)]

        # Find most common combination
        combination_counts = Counter()
        for approved_candidates in election_wide_ballots.values():
            if len(approved_candidates) > 0:
                combination_counts[tuple(sorted(approved_candidates))] += 1

        most_common_combination = (
            list(combination_counts.most_common(1)[0][0]) if combination_counts else []
        )

        total_approvals = sum(
            len(approved) for approved in election_wide_ballots.values()
        )
        average_approvals = total_approvals / total_ballots if total_ballots > 0 else 0

        # Calculate candidate-specific approval distributions
        candidate_approval_distributions = {}
        for candidate in combined_candidates:
            # Get all ballots that approved this candidate
            candidate_ballots = [
                ballot_id
                for ballot_id, approved in election_wide_ballots.items()
                if candidate in approved
            ]

            if not candidate_ballots:
                continue

            # For each of these ballots, count how many total candidates they approved
            candidate_distribution = Counter()
            for ballot_id in candidate_ballots:
                total_approvals_on_ballot = len(election_wide_ballots[ballot_id])
                candidate_distribution[total_approvals_on_ballot] += 1

            candidate_approval_distributions[candidate] = dict(candidate_distribution)

        # Calculate "Anyone But X" analysis
        anyone_but_analysis = {}
        num_candidates = len(combined_candidates)

        for ballot_id, approved_candidates in election_wide_ballots.items():
            if len(approved_candidates) == num_candidates - 1:  # Approved all but one
                # Find which candidate was NOT approved
                not_approved = set(combined_candidates) - approved_candidates
                if len(not_approved) == 1:
                    excluded_candidate = list(not_approved)[0]
                    anyone_but_analysis[excluded_candidate] = (
                        anyone_but_analysis.get(excluded_candidate, 0) + 1
                    )

        # Calculate cross-race voting behavior - answer the key question:
        # "How many people voted for more than one candidate in at least one race?"
        logger.info("  Calculating cross-race voting behavior...")

        multi_approval_voters = 0
        single_approval_only_voters = 0

        for ballot_id, approved_candidates in election_wide_ballots.items():
            # Group approvals by race
            race_approvals = {}
            for candidate in approved_candidates:
                # Extract race from candidate name (everything after the last parenthesis)
                if "(" in candidate and ")" in candidate:
                    race = candidate.split("(")[-1].rstrip(")")
                    race_approvals[race] = race_approvals.get(race, 0) + 1

            # Check if this voter approved multiple candidates in any single race
            has_multi_approval_in_race = any(
                count > 1 for count in race_approvals.values()
            )

            if has_multi_approval_in_race:
                multi_approval_voters += 1
            else:
                single_approval_only_voters += 1

        multi_approval_rate = (
            (multi_approval_voters / total_ballots * 100) if total_ballots > 0 else 0
        )
        single_approval_only_rate = (
            (single_approval_only_voters / total_ballots * 100)
            if total_ballots > 0
            else 0
        )

        logger.info(
            f"  Multi-approval voters: {multi_approval_voters} ({multi_approval_rate:.1f}%)"
        )
        logger.info(
            f"  Single-approval only voters: {single_approval_only_voters} ({single_approval_only_rate:.1f}%)"
        )

        voting_patterns = {
            "totalBallots": total_ballots,
            "bulletVotingCount": bullet_voting_count,
            "bulletVotingRate": (
                (bullet_voting_count / total_ballots * 100) if total_ballots > 0 else 0
            ),
            "fullApprovalCount": full_approval_count,
            "fullApprovalRate": (
                (full_approval_count / total_ballots * 100) if total_ballots > 0 else 0
            ),
            "averageApprovalsPerBallot": average_approvals,
            "mostCommonCombination": most_common_combination,
            "approvalDistribution": dict(approval_distribution),
            "candidateApprovalDistributions": candidate_approval_distributions,
            "anyoneButAnalysis": anyone_but_analysis if anyone_but_analysis else None,
            # Add cross-race specific metrics
            "multiApprovalVoters": multi_approval_voters,
            "multiApprovalRate": multi_approval_rate,
            "singleApprovalOnlyVoters": single_approval_only_voters,
            "singleApprovalOnlyRate": single_approval_only_rate,
        }

        logger.info(
            f"  Bullet voting: {bullet_voting_count} ballots ({voting_patterns['bulletVotingRate']:.1f}%)"
        )
        logger.info(
            f"  Full approval: {full_approval_count} ballots ({voting_patterns['fullApprovalRate']:.1f}%)"
        )
        logger.info(f"  Average approvals per ballot: {average_approvals:.1f}")

        # Add to main database
        logger.info("  Adding election-wide race to main database...")

        # Insert report
        cursor = main_conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO reports (
                name, date, jurisdictionPath, electionPath, office, officeName,
                jurisdictionName, electionName, website, notes, ballotCount, path, hidden
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                "St. Louis Primary Municipal Election",
                "2025-03-04",
                "us/mo/st_louis",
                "2025/03",
                "election-wide",
                "Election Wide Details",
                "St. Louis, MO",
                "Primary Municipal Election",
                "https://www.stlouis-mo.gov/government/departments/board-election-commissioners/elections/results/index.cfm",
                "Combined analysis of all candidates across all races in the election.",
                total_ballots,
                "us/mo/st_louis/2025/03",
                0,
            ),
        )

        report_id = cursor.lastrowid
        logger.info(f"  Created report with ID: {report_id}")

        # Insert candidates
        for candidate, votes in candidate_votes.items():
            cursor.execute(
                """
                INSERT OR REPLACE INTO candidates (report_id, name, votes, winner)
                VALUES (?, ?, ?, ?)
            """,
                (report_id, candidate, votes, 0),
            )  # No winners in combined view

        logger.info(f"  Added {len(candidate_votes)} candidates")

        # Insert co-approvals
        cursor.execute("DELETE FROM co_approvals WHERE report_id = ?", (report_id,))
        for ca in co_approvals:
            cursor.execute(
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

        logger.info(f"  Added {len(co_approvals)} co-approval relationships")

        # Insert voting patterns
        cursor.execute("DELETE FROM voting_patterns WHERE report_id = ?", (report_id,))
        cursor.execute(
            """
            INSERT INTO voting_patterns (
                report_id, total_ballots, bullet_voting_count, bullet_voting_rate,
                full_approval_count, full_approval_rate, average_approvals_per_ballot,
                most_common_combination, approval_distribution, candidate_approval_distributions,
                anyone_but_analysis, multi_approval_voters, multi_approval_rate,
                single_approval_only_voters, single_approval_only_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                report_id,
                voting_patterns["totalBallots"],
                voting_patterns["bulletVotingCount"],
                voting_patterns["bulletVotingRate"],
                voting_patterns["fullApprovalCount"],
                voting_patterns["fullApprovalRate"],
                voting_patterns["averageApprovalsPerBallot"],
                json.dumps(voting_patterns["mostCommonCombination"]),
                json.dumps(voting_patterns["approvalDistribution"]),
                json.dumps(voting_patterns["candidateApprovalDistributions"]),
                (
                    json.dumps(voting_patterns["anyoneButAnalysis"])
                    if voting_patterns["anyoneButAnalysis"]
                    else None
                ),
                voting_patterns["multiApprovalVoters"],
                voting_patterns["multiApprovalRate"],
                voting_patterns["singleApprovalOnlyVoters"],
                voting_patterns["singleApprovalOnlyRate"],
            ),
        )

        logger.info("  Added voting patterns")

        main_conn.commit()
        logger.info("✅ Election-wide race generated successfully!")
        return True

    except Exception as e:
        logger.error(f"Error generating election-wide race: {e}")
        main_conn.rollback()
        return False
    finally:
        cvr_conn.close()
        main_conn.close()


def format_contest_name(contest_name):
    """Format contest name from CVR format to display format."""
    return (
        contest_name.replace("MAYOR", "Mayor")
        .replace("COMPTROLLER", "Comptroller")
        .replace("ALDERMAN - WARD ", "Alderman Ward ")
    )


def format_candidate_name(candidate_name):
    """Format candidate name from ALL CAPS to proper case."""
    return (
        " ".join(word.capitalize() for word in candidate_name.lower().split(" "))
        .replace('"', '"')
        .replace('"', '"')
    )


if __name__ == "__main__":
    generate_election_wide_race()
