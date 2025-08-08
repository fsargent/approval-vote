export const METHOD_FLOWCHARTS: Record<string, string> = {
  fptp: `flowchart TD
A[Start: Count votes] --> B[Candidate with highest votes wins]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  approval: `flowchart TD
A[Tally approvals per candidate] --> B[Most approvals wins]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  'limited-voting-single': `flowchart TD
A[Voters may select up to X candidates] --> B[Most votes wins]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  borda: `flowchart TD
A[Assign points by rank] --> B[Sum points] --> C[Highest total wins]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  condorcet: `flowchart TD
A[Compute head-to-head results] --> B{Candidate beats all others?}
B -->|Yes| C[Condorcet winner]
B -->|No| D[Tie-break mechanism]
style A fill:#e1f5fe
style C fill:#c8e6c9
style D fill:#fde68a
`,
  'highest-total': `flowchart TD
A[Sum scores per candidate] --> B[Highest total wins]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  star: `flowchart TD
A[Score 0–5] --> B[Sum scores] --> C[Top two finalists]
C --> D[Runoff: ballot preference]
D --> E[Preferred finalist wins]
style A fill:#e1f5fe
style E fill:#c8e6c9
`,
  'block-voting': `flowchart TD
A[Voters select 1] --> B[Count votes] --> C[Top N candidates win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'block-approval': `flowchart TD
A[Approve many] --> B[Count approvals] --> C[Top N win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'limited-voting': `flowchart TD
A[Select up to X] --> B[Count selections] --> C[Top N win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'cumulative-voting': `flowchart TD
A[Distribute points] --> B[Sum points] --> C[Top N win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  sntv: `flowchart TD
A[Select 1] --> B[Count votes] --> C[Top N win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'satisfaction-approval': `flowchart TD
A[Split each approval equally] --> B[Sum fractions] --> C[Top N win]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  spav: `flowchart TD
A[Round: count approvals] --> B[Elect highest]
B --> C[Reweight approvals]
C --> D{Seats left?}
D -->|Yes| A
D -->|No| E[Finish]
style A fill:#e1f5fe
style E fill:#c8e6c9
`,
  stv: `flowchart TD
A[Count first preferences] --> B{Reached quota?}
B -->|Yes| C[Elect]
C --> D[Transfer surplus]
B -->|No| E[Eliminate lowest]
D --> F{Seats filled?}
E --> F
F -->|No| A
F -->|Yes| G[Finish]
style A fill:#e1f5fe
style G fill:#c8e6c9
`,
  'cpo-stv': `flowchart TD
A[Enumerate outcomes] --> B[Compare pairs] --> C[Choose unbeaten outcome]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'schulze-stv': `flowchart TD
A[Compute strongest paths among sets] --> B[Select set with strongest paths]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  'meek-stv': `flowchart TD
A[Init keep factors] --> B[Iteratively update] --> C{Converged?}
C -->|No| B
C -->|Yes| D[Winners determined]
style A fill:#e1f5fe
style D fill:#c8e6c9
`,
  'pr-borda': `flowchart TD
A[Compute Borda scores] --> B[Allocate seats proportionally] --> C[Assign seats]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'wright-stv': `flowchart TD
A[Count per Wright rules] --> B[Elect/eliminate] --> C[Transfer refined]
C --> D{Seats filled?}
D -->|No| A
D -->|Yes| E[Finish]
style A fill:#e1f5fe
style E fill:#c8e6c9
`,
  'party-list-pr': `flowchart TD
A[Tally votes per party] --> B[Apply allocation formula] --> C[Distribute seats]
C --> D[Fill seats via list type]
style A fill:#e1f5fe
style D fill:#c8e6c9
`,
  mmp: `flowchart TD
A[Two votes: district + party] --> B[Elect district winners]
B --> C[Compute party seat totals]
C --> D[Add list seats to reach proportionality]
style A fill:#e1f5fe
style D fill:#c8e6c9
`,
  'block-score': `flowchart TD
A[Sum scores] --> B[Top N scores win]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  'equal-shares': `flowchart TD
A[Equal voter budget] --> B[Spend on approved candidates]
B --> C[Iterate until budgets used]
C --> D[Winners: highest support]
style A fill:#e1f5fe
style D fill:#c8e6c9
`,
  pav: `flowchart TD
A[Search optimal committee] --> B[Select maximizing approval utility]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
  'star-pr': `flowchart TD
A[Score candidates] --> B[Sequential proportional selection]
B --> C[Fill all seats]
style A fill:#e1f5fe
style C fill:#c8e6c9
`,
  'allocated-score': `flowchart TD
A[Weighted score allocation] --> B[Assign seats]
style A fill:#e1f5fe
style B fill:#c8e6c9
`,
};
