<div align="center">

# @erold/cli

**Command-line interface for Erold project management**

[![npm version](https://img.shields.io/npm/v/@erold/cli.svg)](https://www.npmjs.com/package/@erold/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

Manage your projects, tasks, and knowledge base directly from your terminal.

[Website](https://erold.dev) · [Documentation](https://erold.dev/docs/cli) · [Report Bug](https://github.com/erold-dev/cli/issues)

</div>

---

## Why Use the CLI?

- **Stay in your terminal** — No context switching between browser and IDE
- **Git integration** — Link commits to tasks automatically
- **Scriptable** — Automate workflows with bash scripts
- **Fast** — Instant access to your projects without loading a web app

## Quick Start

```bash
# Install globally
npm install -g @erold/cli

# Login to your account
erold login

# List your projects
erold projects list

# Create a task
erold tasks create "Implement user authentication" --project my-project --priority high
```

## Installation

### npm (recommended)

```bash
npm install -g @erold/cli
```

### yarn

```bash
yarn global add @erold/cli
```

### pnpm

```bash
pnpm add -g @erold/cli
```

### Verify installation

```bash
erold --version
```

## Authentication

### Interactive login

```bash
erold login
```

Opens your browser to authenticate, then stores credentials securely.

### API key (for CI/scripts)

```bash
# Set via environment variable
export EROLD_API_KEY="erold_your_api_key_here"
export EROLD_TENANT="your-tenant-id"

# Or use the login command with a key
erold login --api-key erold_xxx --tenant your-tenant
```

## Commands

### Projects

```bash
# List all projects
erold projects list

# Create a new project
erold projects create "Backend API"

# View project details
erold projects get <project-id>

# View project statistics
erold projects stats <project-id>
```

### Tasks

```bash
# List tasks (with filters)
erold tasks list
erold tasks list --project backend-api
erold tasks list --status in_progress
erold tasks list --priority high
erold tasks list --assignee me

# Create a task
erold tasks create "Add OAuth support" --project backend-api
erold tasks create "Fix login bug" --project backend-api --priority high

# Update a task
erold tasks update <task-id> --status in_progress
erold tasks update <task-id> --priority critical
erold tasks update <task-id> --assignee john@example.com

# Quick actions
erold tasks start <task-id>      # Start working on a task
erold tasks done <task-id>       # Mark task as complete
erold tasks block <task-id>      # Mark task as blocked

# Search tasks
erold tasks search "authentication"

# View task details
erold tasks get <task-id>
```

### Knowledge Base

```bash
# Search knowledge
erold kb search "deployment process"

# List articles
erold kb list
erold kb list --category engineering

# View article
erold kb get <article-id>

# Create article
erold kb create "API Guidelines" --category engineering --content "..."
```

### Context & Dashboard

```bash
# Get workspace overview
erold dashboard

# Get AI-ready context (useful for piping to AI tools)
erold context

# View workload distribution
erold workload
```

## Git Integration

Link your commits to Erold tasks for automatic progress tracking.

### Setup

```bash
# Enable git integration for current repo
erold git init
```

### Usage

Include task IDs in your commit messages:

```bash
git commit -m "Add login form [TASK-123]"
git commit -m "Fix validation bug [TASK-456]"
```

The CLI automatically updates task status based on your commits.

## Configuration

Configuration is stored in `~/.erold/config.json`:

```json
{
  "apiKey": "erold_xxx",
  "tenant": "your-tenant-id",
  "defaultProject": "backend-api"
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EROLD_API_KEY` | API key for authentication |
| `EROLD_TENANT` | Your tenant ID |
| `EROLD_API_URL` | Custom API URL (optional) |

## Examples

### Daily Workflow

```bash
# Morning: Check what's on your plate
erold dashboard
erold tasks list --assignee me --status todo

# Start working on a task
erold tasks start TASK-123

# End of day: Mark progress
erold tasks update TASK-123 --progress 75
erold tasks done TASK-124
```

### Create Tasks from a File

```bash
# tasks.txt contains one task per line
while read task; do
  erold tasks create "$task" --project my-project
done < tasks.txt
```

### Export to JSON

```bash
# Export all tasks as JSON
erold tasks list --json > tasks.json

# Export project stats
erold projects stats my-project --json > stats.json
```

### Pipe to AI Tools

```bash
# Get context for Claude
erold context | claude "What should I work on next?"

# Get blocked tasks for analysis
erold tasks list --status blocked --json | jq '.[] | .title'
```

## Troubleshooting

### "Not authenticated"

```bash
# Re-login
erold logout
erold login
```

### "Project not found"

```bash
# List available projects
erold projects list

# Use the correct project ID or slug
erold tasks list --project correct-project-id
```

### Command not found

```bash
# Check if installed globally
npm list -g @erold/cli

# Reinstall if needed
npm install -g @erold/cli
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Clone the repo
git clone https://github.com/erold-dev/cli.git
cd cli

# Install dependencies
npm install

# Run tests
npm test

# Run in development
npm run dev
```

## Related

- [@erold/mcp-server](https://github.com/erold-dev/mcp-server) — MCP server for AI assistants
- [Erold Web App](https://app.erold.dev) — Full web interface
- [Documentation](https://erold.dev/docs) — Complete documentation

## License

MIT © [Erold](https://erold.dev)
