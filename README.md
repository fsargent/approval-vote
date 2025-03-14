# Approval.Vote

A website that visualizes and analyzes Approval Voting election results. View it at [approval.vote](https://approval.vote).

## About

Approval.Vote provides detailed reports and visualizations for Approval Voting elections, where voters can select multiple candidates and the candidate with the most votes wins. The site is built with SvelteKit and hosted on GitHub Pages.

## Development

### Prerequisites

- [mise](https://mise.jdx.dev/) for environment management
- [trunk](https://trunk.io) for linting and formatting

### Setup

1. Install mise and trunk:

   ```bash
   # macOS
   brew install mise trunk-io

   # Other platforms: see mise.jdx.dev and trunk.io
   ```

2. Set up development environment:

   ```bash
   mise install    # Installs Node.js 20
   trunk install   # Installs linters and formatters
   npm ci         # Installs dependencies
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Code Quality

We use trunk.io for consistent code quality:

```bash
trunk check    # Run all linters
trunk fmt      # Format all files
```

## Building

Create a production build:

```bash
npm run build    # Generate static site
npm run preview  # Preview the production build
```

## Contributing Election Data

The election data is stored in `data.sqlite3`. To add a new election:

1. Fork this repository
2. Add your election data to `load-report.js`
3. Run the script to update `data.sqlite3`
4. Submit a pull request

## Deployment

The site automatically deploys to GitHub Pages when changes are merged to the main branch. The deployment process:

1. Generates card images using Puppeteer
2. Builds the static site
3. Deploys to GitHub Pages

## License

This project is licensed under [CC-BY-2.0](LICENSE). You may freely distribute and modify the content with attribution.
