#!/usr/bin/env python3
"""
One-shot script to process all St. Louis CVR data from zip files to website database.

This script:
1. Unzips all ZIP files in ./data/ directory
2. Parses all CVR XML files into cvr-data.sqlite3
3. Generates co-approval analysis for ALL contests automatically
4. Exports to main ../data.sqlite3 with automatic office name mapping
5. Is fully idempotent - safe to re-run

Usage:
    uv run process-all
"""

import os
import glob
import zipfile
import sqlite3
import logging
import subprocess
from pathlib import Path
from collections import Counter, defaultdict
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def unzip_data_files():
    """Unzip all ZIP files in ./data/ directory."""
    data_dir = Path("./data")
    if not data_dir.exists():
        logger.error("./data directory does not exist!")
        return False
    
    zip_files = list(data_dir.glob("*.zip"))
    if not zip_files:
        logger.info("No ZIP files found in ./data directory")
        return True
    
    for zip_path in zip_files:
        extract_dir = data_dir / zip_path.stem
        if extract_dir.exists():
            logger.info(f"✓ {zip_path.name} already extracted to {extract_dir}")
            continue
            
        logger.info(f"📦 Extracting {zip_path.name}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        logger.info(f"✓ Extracted to {extract_dir}")
    
    return True

def find_xml_directories():
    """Find all directories containing XML files."""
    data_dir = Path("./data")
    xml_dirs = []
    
    for root, dirs, files in os.walk(data_dir):
        if any(f.endswith('.xml') for f in files):
            xml_dirs.append(Path(root))
    
    logger.info(f"Found {len(xml_dirs)} directories with XML files:")
    for xml_dir in xml_dirs:
        xml_count = len(list(xml_dir.glob("*.xml")))
        logger.info(f"  {xml_dir}: {xml_count} XML files")
    
    return xml_dirs

def parse_cvr_data(xml_dirs):
    """Parse all CVR XML files into cvr-data.sqlite3."""
    output_db = "cvr-data.sqlite3"
    
    # Remove existing database for fresh start
    if Path(output_db).exists():
        logger.info(f"🗑️  Removing existing {output_db}")
        Path(output_db).unlink()
    
    for xml_dir in xml_dirs:
        logger.info(f"📊 Processing {xml_dir}...")
        
        # Run cvr_parser on this directory
        cmd = [
            "uv", "run", "python", "cvr_parser.py", 
            "--data-dir", str(xml_dir),
            "--output", output_db,
            "--batch-size", "5000"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Failed to process {xml_dir}: {result.stderr}")
            return False
    
    logger.info(f"✅ All CVR data parsed into {output_db}")
    return True

def normalize_contest_name(contest_name):
    """Convert contest name to office name format.
    
    Examples:
    - 'MAYOR' -> 'mayor'
    - 'COMPTROLLER' -> 'comptroller'  
    - 'ALDERMAN - WARD 3' -> 'alderman-ward3'
    - 'ALDERMAN - WARD 11' -> 'alderman-ward11'
    """
    return contest_name.lower().replace(' - ', '-').replace(' ', '')

def generate_co_approval_analysis(contest_name, cvr_conn):
    """Generate co-approval analysis for a specific contest."""
    
    # Get ballot approvals for this contest
    query = """
    SELECT 
        c.ballot_id,
        s.candidate_name
    FROM cvr_contests c
    JOIN cvr_selections s ON c.id = s.contest_record_id
    WHERE c.contest_name = ? AND s.selection_value = 1
    ORDER BY c.ballot_id
    """
    
    ballot_approvals = defaultdict(set)
    for row in cvr_conn.execute(query, (contest_name,)):
        ballot_approvals[row[0]].add(row[1])
    
    if len(ballot_approvals) < 2:
        return [], {}  # Not enough data
    
    # Get all candidates
    candidates = set()
    for approved_candidates in ballot_approvals.values():
        candidates.update(approved_candidates)
    candidates = list(candidates)
    
    if len(candidates) < 2:
        return [], {}  # Need at least 2 candidates
    
    # Calculate co-approval matrix
    co_approvals = []
    for i, cand_a in enumerate(candidates):
        for j, cand_b in enumerate(candidates):
            if i == j:
                continue
                
            # Count ballots that approved cand_a
            cand_a_ballots = [ballot_id for ballot_id, approved in ballot_approvals.items() 
                            if cand_a in approved]
            
            if len(cand_a_ballots) == 0:
                continue
            
            # Count how many of those also approved cand_b  
            both_count = sum(1 for ballot_id in cand_a_ballots 
                           if cand_b in ballot_approvals[ballot_id])
            
            co_approval_rate = (both_count / len(cand_a_ballots)) * 100
            
            co_approvals.append({
                'candidateA': cand_a,
                'candidateB': cand_b, 
                'coApprovalCount': both_count,
                'coApprovalRate': co_approval_rate
            })
    
    # Calculate voting patterns
    total_ballots = len(ballot_approvals)
    approval_distribution = Counter()
    
    for approved_candidates in ballot_approvals.values():
        approval_distribution[len(approved_candidates)] += 1
    
    bullet_voting_count = approval_distribution[1]
    full_approval_count = approval_distribution[len(candidates)]
    
    # Find most common combination
    combination_counts = Counter()
    for approved_candidates in ballot_approvals.values():
        if len(approved_candidates) > 0:
            combination_counts[tuple(sorted(approved_candidates))] += 1
    
    most_common_combination = list(combination_counts.most_common(1)[0][0]) if combination_counts else []
    
    total_approvals = sum(len(approved) for approved in ballot_approvals.values())
    average_approvals = total_approvals / total_ballots if total_ballots > 0 else 0
    
    voting_patterns = {
        'totalBallots': total_ballots,
        'bulletVotingCount': bullet_voting_count,
        'bulletVotingRate': (bullet_voting_count / total_ballots) * 100,
        'fullApprovalCount': full_approval_count,
        'fullApprovalRate': (full_approval_count / total_ballots) * 100,
        'averageApprovalsPerBallot': average_approvals,
        'mostCommonCombination': most_common_combination,
        'approvalDistribution': dict(approval_distribution)
    }
    
    return co_approvals, voting_patterns

def export_to_main_database():
    """Export all co-approval data to main database with automatic mapping."""
    cvr_db = "cvr-data.sqlite3"
    main_db = "../data.sqlite3"
    
    if not Path(cvr_db).exists():
        logger.error(f"CVR database {cvr_db} does not exist!")
        return False
    
    if not Path(main_db).exists():
        logger.error(f"Main database {main_db} does not exist!")
        return False
    
    cvr_conn = sqlite3.connect(cvr_db)
    main_conn = sqlite3.connect(main_db)
    
    # Create tables if they don't exist
    main_conn.executescript("""
        CREATE TABLE IF NOT EXISTS co_approvals (
            id INTEGER PRIMARY KEY,
            report_id INTEGER,
            candidate_a TEXT,
            candidate_b TEXT,
            co_approval_count INTEGER,
            co_approval_rate REAL,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        );
        
        CREATE TABLE IF NOT EXISTS voting_patterns (
            id INTEGER PRIMARY KEY,
            report_id INTEGER,
            total_ballots INTEGER,
            bullet_voting_count INTEGER,
            bullet_voting_rate REAL,
            full_approval_count INTEGER,
            full_approval_rate REAL,
            average_approvals_per_ballot REAL,
            most_common_combination TEXT,
            approval_distribution TEXT,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        );
    """)
    
    # Get all contests from CVR
    contests = cvr_conn.execute("SELECT DISTINCT contest_name FROM cvr_contests").fetchall()
    
    for (contest_name,) in contests:
        logger.info(f"🔄 Processing {contest_name}...")
        
        # Normalize contest name to match office field
        office_name = normalize_contest_name(contest_name)
        
        # Find matching report (with date constraint for St. Louis)
        report_result = main_conn.execute(
            "SELECT id FROM reports WHERE office = ? AND date = ?",
            (office_name, '2025-03-04')
        ).fetchone()
        
        if not report_result:
            logger.warning(f"  No matching report found for contest '{contest_name}' -> office '{office_name}'")
            continue
        
        report_id = report_result[0]
        logger.info(f"  ✓ Found report_id: {report_id}")
        
        # Generate co-approval analysis
        co_approvals, voting_patterns = generate_co_approval_analysis(contest_name, cvr_conn)
        
        if not co_approvals:
            logger.warning(f"  No co-approval data generated for {contest_name}")
            continue
        
        # Clear existing data for this report (idempotent)
        main_conn.execute("DELETE FROM co_approvals WHERE report_id = ?", (report_id,))
        main_conn.execute("DELETE FROM voting_patterns WHERE report_id = ?", (report_id,))
        
        # Insert co-approval data
        for ca in co_approvals:
            main_conn.execute("""
                INSERT INTO co_approvals (report_id, candidate_a, candidate_b, co_approval_count, co_approval_rate)
                VALUES (?, ?, ?, ?, ?)
            """, (report_id, ca['candidateA'], ca['candidateB'], ca['coApprovalCount'], ca['coApprovalRate']))
        
        # Insert voting patterns
        main_conn.execute("""
            INSERT INTO voting_patterns (
                report_id, total_ballots, bullet_voting_count, bullet_voting_rate,
                full_approval_count, full_approval_rate, average_approvals_per_ballot,
                most_common_combination, approval_distribution
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            voting_patterns['totalBallots'],
            voting_patterns['bulletVotingCount'], 
            voting_patterns['bulletVotingRate'],
            voting_patterns['fullApprovalCount'],
            voting_patterns['fullApprovalRate'],
            voting_patterns['averageApprovalsPerBallot'],
            json.dumps(voting_patterns['mostCommonCombination']),
            json.dumps(voting_patterns['approvalDistribution'])
        ))
        
        logger.info(f"  ✅ Exported {len(co_approvals)} co-approval entries and voting patterns")
    
    main_conn.commit()
    cvr_conn.close()
    main_conn.close()
    
    logger.info("🎉 All data exported to main database!")
    return True

def main():
    """Main entry point."""
    logger.info("🚀 Starting complete St. Louis CVR processing...")
    
    # Step 1: Unzip data files
    logger.info("\n" + "="*60)
    logger.info("STEP 1: Unzipping data files")
    logger.info("="*60)
    if not unzip_data_files():
        logger.error("❌ Failed to unzip data files")
        return 1
    
    # Step 2: Find XML directories
    logger.info("\n" + "="*60)
    logger.info("STEP 2: Finding XML files")
    logger.info("="*60)
    xml_dirs = find_xml_directories()
    if not xml_dirs:
        logger.error("❌ No XML files found!")
        return 1
    
    # Step 3: Parse CVR data
    logger.info("\n" + "="*60)
    logger.info("STEP 3: Parsing CVR data")
    logger.info("="*60)
    if not parse_cvr_data(xml_dirs):
        logger.error("❌ Failed to parse CVR data")
        return 1
    
    # Step 4: Export to main database
    logger.info("\n" + "="*60)
    logger.info("STEP 4: Exporting to main database")
    logger.info("="*60)
    if not export_to_main_database():
        logger.error("❌ Failed to export to main database")
        return 1
    
    logger.info("\n" + "🎉"*20)
    logger.info("✅ COMPLETE! All St. Louis CVR data processed successfully!")
    logger.info("🎉"*20)
    return 0

if __name__ == "__main__":
    exit(main())
