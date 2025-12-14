# Erold CLI Documentation

Complete command-line interface reference for Erold - manage projects directly from your terminal.

## Installation

```bash
# npm (recommended)
npm install -g @erold/cli

# yarn
yarn global add @erold/cli

# pnpm
pnpm add -g @erold/cli
```

Verify installation:
```bash
erold --version
```

---

## Authentication

### Interactive Login

```bash
erold login
```

Opens browser for authentication, then stores credentials securely in `~/.erold/config.json`.

### API Key Login (for CI/scripts)

```bash
erold login --api-key erold_sk_live_xxx --tenant your-tenant-id
```

### Environment Variables

```bash
export EROLD_API_KEY="erold_sk_live_xxxxxxxxxxxx"
export EROLD_TENANT_ID="your-tenant-id"
```

### Logout

```bash
erold logout
```

---

## Security Best Practices

### Credential Storage

| Method | Use Case | Security Level |
|--------|----------|----------------|
| Interactive login | Personal development | High (encrypted storage) |
| Environment variables | CI/CD, scripts | Medium (process isolation) |
| Config file | Shared machines | Low (use with caution) |

### Secure Configuration

**For personal use:**
```bash
# Login interactively (recommended)
erold login

# Credentials stored encrypted at ~/.erold/config.json
# File permissions: 600 (owner read/write only)
```

**For CI/CD:**
```yaml
# GitHub Actions
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      EROLD_API_KEY: ${{ secrets.EROLD_API_KEY }}
      EROLD_TENANT_ID: ${{ secrets.EROLD_TENANT_ID }}
    steps:
      - run: erold tasks list --status in_progress
```

**For scripts:**
```bash
#!/bin/bash
# Use .env file (never commit)
source .env
erold tasks list --json > tasks.json
```

### Never Do This

```bash
# DON'T hardcode keys in scripts
erold login --api-key erold_sk_live_xxx  # Bad!

# DON'T commit .env files
git add .env  # Bad!

# DON'T share config files
cp ~/.erold/config.json ./  # Bad!
```

---

## Configuration

### Config File Location

```
~/.erold/config.json
```

### Config Structure

```json
{
  "apiKey": "erold_sk_live_xxx",
  "tenant": "your-tenant-id",
  "defaultProject": "backend-api",
  "outputFormat": "table"
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EROLD_API_KEY` | Your API key | Yes |
| `EROLD_TENANT_ID` | Your tenant ID | Yes |
| `EROLD_API_URL` | Custom API URL | No |
| `EROLD_DEFAULT_PROJECT` | Default project for commands | No |
| `NO_COLOR` | Disable colored output | No |

---

## Global Options

All commands support these options:

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--no-color` | Disable colored output |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

---

## Commands

### Projects

#### List Projects

```bash
erold projects list
erold projects list --status active
erold projects list --json
```

Output:
```
┌────────────────┬─────────────┬────────┬───────────────┐
│ Name           │ Status      │ Tasks  │ Progress      │
├────────────────┼─────────────┼────────┼───────────────┤
│ Backend API    │ active      │ 45     │ ████████░░ 71%│
│ Mobile App     │ planning    │ 12     │ ░░░░░░░░░░ 0% │
│ Documentation  │ active      │ 8      │ ██████░░░░ 62%│
└────────────────┴─────────────┴────────┴───────────────┘
```

#### Get Project Details

```bash
erold projects get <project-id>
erold projects get backend-api
```

#### Create Project

```bash
erold projects create "New Project"
erold projects create "Backend API" --description "REST API services"
```

#### View Project Stats

```bash
erold projects stats <project-id>
erold projects stats backend-api
```

Output:
```
Project: Backend API

Tasks Overview:
  Total: 45
  Completed: 32 (71%)
  In Progress: 8
  Blocked: 2
  Open: 3

By Priority:
  Critical: 1
  High: 5
  Medium: 28
  Low: 11

Time Logged: 124.5 hours
```

---

### Tasks

#### List Tasks

```bash
# All tasks
erold tasks list

# With filters
erold tasks list --project backend-api
erold tasks list --status in_progress
erold tasks list --priority high
erold tasks list --assignee me

# Combine filters
erold tasks list --project backend-api --status todo --priority high
```

Output:
```
┌──────────┬─────────────────────────────┬────────────┬──────────┬──────────────┐
│ ID       │ Title                       │ Status     │ Priority │ Assignee     │
├──────────┼─────────────────────────────┼────────────┼──────────┼──────────────┤
│ TASK-123 │ Implement OAuth             │ in_progress│ high     │ John Doe     │
│ TASK-124 │ Add rate limiting           │ todo       │ medium   │ Jane Smith   │
│ TASK-125 │ Write API documentation     │ in_progress│ high     │ John Doe     │
└──────────┴─────────────────────────────┴────────────┴──────────┴──────────────┘
```

#### Get Task Details

```bash
erold tasks get TASK-123
```

Output:
```
TASK-123: Implement OAuth

Status: in_progress
Priority: high
Project: Backend API
Assignee: John Doe

Description:
  Add OAuth 2.0 authentication with Google and GitHub providers.
  Include refresh token handling and session management.

Progress: ████████░░ 75%
Time: 12h logged / 16h estimated
Due: 2024-04-01

Tags: auth, security, backend
Created: 2024-03-15 09:00
Updated: 2024-03-20 16:30
```

#### Create Task

```bash
erold tasks create "Task title" --project backend-api
erold tasks create "Implement OAuth" --project backend-api --priority high
erold tasks create "Fix bug" --project backend-api --priority critical --assignee john@example.com
```

#### Update Task

```bash
erold tasks update TASK-123 --status in_progress
erold tasks update TASK-123 --priority critical
erold tasks update TASK-123 --assignee jane@example.com
erold tasks update TASK-123 --progress 75
```

#### Quick Actions

```bash
# Start working on a task
erold tasks start TASK-123

# Mark task as complete
erold tasks done TASK-123

# Mark task as blocked
erold tasks block TASK-123 --reason "Waiting for API credentials"
```

#### Search Tasks

```bash
erold tasks search "authentication"
erold tasks search "bug" --project backend-api
```

#### Log Time

```bash
erold tasks log TASK-123 --hours 2.5
erold tasks log TASK-123 --hours 1 --notes "Fixed edge case"
```

#### Task Comments

```bash
# View comments
erold tasks comments TASK-123

# Add comment
erold tasks comment TASK-123 "Updated the implementation"
```

---

### Knowledge Base

#### Search Knowledge

```bash
erold kb search "deployment"
erold kb search "API rate limiting"
```

#### List Articles

```bash
erold kb list
erold kb list --category engineering
erold kb list --category api
```

Categories: `architecture`, `api`, `deployment`, `testing`, `security`, `performance`, `workflow`, `conventions`, `troubleshooting`, `other`

#### View Article

```bash
erold kb get <article-id>
```

#### Create Article

```bash
erold kb create "API Guidelines" --category api --content "..."
erold kb create "Deployment Guide" --category deployment --file ./DEPLOYMENT.md
```

---

### Dashboard & Context

#### View Dashboard

```bash
erold dashboard
```

Output:
```
┌─────────────────────────────────────────────────────────────┐
│                       EROLD DASHBOARD                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Projects: 5          Open Tasks: 45        Blocked: 3       │
│                                                              │
│  Your Tasks:                                                 │
│  • TASK-123: Implement OAuth [high] - in_progress           │
│  • TASK-125: Write API docs [high] - in_progress            │
│  • TASK-130: Fix login bug [critical] - todo                │
│                                                              │
│  Due Soon:                                                   │
│  • TASK-123: Implement OAuth - Due in 2 days                │
│  • TASK-128: Update dependencies - Due in 5 days            │
│                                                              │
│  Recently Completed:                                         │
│  • TASK-122: Add pagination - 2 hours ago                   │
│  • TASK-121: Fix memory leak - yesterday                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Get AI Context

```bash
erold context
```

Returns workspace context optimized for piping to AI tools.

#### View Workload

```bash
erold workload
```

Shows team workload distribution.

---

### Git Integration

#### Setup

```bash
# Enable git integration for current repo
erold git init
```

This installs git hooks that automatically link commits to tasks.

#### Usage

Include task IDs in commit messages:

```bash
git commit -m "Add login form [TASK-123]"
git commit -m "Fix validation bug [TASK-456]"
git commit -m "Implement OAuth [TASK-123] [TASK-124]"
```

The CLI automatically:
- Updates task progress based on commit frequency
- Adds commit references to task activity
- Marks tasks as in_progress when first committed

---

## Advanced Usage

### JSON Output for Scripts

```bash
# Export tasks as JSON
erold tasks list --json > tasks.json

# Process with jq
erold tasks list --json | jq '.[] | select(.priority == "high")'

# Get specific task
erold tasks get TASK-123 --json | jq '.title'
```

### Piping to AI Tools

```bash
# Get context for Claude
erold context | claude "What should I work on next?"

# Get blocked tasks for analysis
erold tasks list --status blocked --json | claude "Help me unblock these tasks"
```

### Batch Operations

```bash
# Create tasks from file
while IFS= read -r task; do
  erold tasks create "$task" --project backend-api
done < tasks.txt

# Update multiple tasks
for id in TASK-123 TASK-124 TASK-125; do
  erold tasks update $id --status in_progress
done
```

### Shell Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias et="erold tasks"
alias etl="erold tasks list"
alias etm="erold tasks list --assignee me"
alias ep="erold projects"
alias ed="erold dashboard"

# Quick task creation
newtask() {
  erold tasks create "$1" --project "${2:-default-project}"
}

# Start and log time
workstart() {
  erold tasks start "$1"
  echo "Started at $(date)" > /tmp/erold-timer
}

workend() {
  start=$(cat /tmp/erold-timer | grep -oP '\d{2}:\d{2}')
  hours=$(echo "scale=2; ($(date +%s) - $(date -d "$start" +%s)) / 3600" | bc)
  erold tasks log "$1" --hours "$hours"
  erold tasks done "$1"
}
```

---

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

# Use correct project ID or slug
erold tasks list --project correct-project-id
```

### "Command not found"

```bash
# Check if installed globally
npm list -g @erold/cli

# Reinstall if needed
npm install -g @erold/cli
```

### "Rate limit exceeded"

Wait for the rate limit window to reset (shown in error message) or upgrade your plan.

### Debug Mode

```bash
# Enable debug output
DEBUG=erold* erold tasks list
```

---

## Changelog

### v1.0.0 (2024-12-14)
- Initial stable release
- Full project and task management
- Knowledge base commands
- Git integration
- JSON output support
- Interactive dashboard

---

## Support

- **Documentation:** [erold.dev/docs/cli](https://erold.dev/docs/cli)
- **Issues:** [github.com/erold-dev/cli/issues](https://github.com/erold-dev/cli/issues)
- **Email:** support@erold.dev
