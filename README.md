# Approval.Vote

Reports are stored in the sqlite3 `data.db`. Edit it and submit a PR to add a new election.

## Developing

```bash
npm ci
npm run dev
```

## Building

To create a production, static version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Adding results to the dataset

To keep this very simple, the dataset is statically hosted in this github repo in `./data.db`

To add to the report, edit `./load-report.js` with the data from the election.

Submit a pull request with the updated `data.db`.

## Deployment
The site is hosted on github pages. Merge to main and it'll auto deploy.
Site is hosted on github pages. Merge to main and it'll auto-deploy.

