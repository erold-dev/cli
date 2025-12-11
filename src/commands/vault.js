/**
 * Vault Commands
 *
 * Commands for managing project secrets/credentials: list, create, show, delete.
 * Requires admin or owner role.
 */

import inquirer from 'inquirer';
import api from '../lib/api.js';
import output from '../lib/output.js';
import config from '../lib/config.js';

const CATEGORIES = ['database', 'api', 'cloud', 'service', 'credential', 'other'];
const ENVIRONMENTS = ['all', 'production', 'staging', 'development'];

/**
 * Register vault commands
 * @param {Command} program - Commander program
 */
export function registerVaultCommands(program) {
  const vault = program.command('vault').description('Manage project secrets (admin/owner only)');

  // List vault entries
  vault
    .command('list')
    .alias('ls')
    .description('List vault entries for a project')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-c, --category <category>', `Filter by category (${CATEGORIES.join(', ')})`)
    .action(async (options) => {
      await listVault(options);
    });

  // Show vault entry (reveal value)
  vault
    .command('show <entryId>')
    .alias('get')
    .description('Show vault entry and reveal its value')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('--copy', 'Copy value to clipboard')
    .action(async (entryId, options) => {
      await showVault(entryId, options);
    });

  // Create vault entry
  vault
    .command('create')
    .alias('new')
    .description('Create a new vault entry')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-k, --key <key>', 'Secret key (e.g., DATABASE_URL)')
    .option('-v, --value <value>', 'Secret value')
    .option('-c, --category <category>', `Category (${CATEGORIES.join(', ')})`, 'other')
    .option('-e, --environment <env>', `Environment (${ENVIRONMENTS.join(', ')})`, 'all')
    .option('-d, --description <desc>', 'Description')
    .option('-i, --interactive', 'Interactive mode')
    .action(async (options) => {
      await createVault(options);
    });

  // Update vault entry
  vault
    .command('update <entryId>')
    .alias('edit')
    .description('Update a vault entry')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-v, --value <value>', 'New secret value')
    .option('-c, --category <category>', 'New category')
    .option('-d, --description <desc>', 'New description')
    .option('-e, --environment <env>', 'New environment')
    .action(async (entryId, options) => {
      await updateVault(entryId, options);
    });

  // Delete vault entry
  vault
    .command('delete <entryId>')
    .alias('rm')
    .description('Delete a vault entry')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (entryId, options) => {
      await deleteVault(entryId, options);
    });
}

/**
 * List vault entries
 */
async function listVault(options) {
  output.startSpinner('Fetching vault entries...');

  try {
    const entries = await api.vault.list(options.project);

    output.stopSpinner(true);

    if (!entries || entries.length === 0) {
      output.info('No vault entries found');
      return;
    }

    // Filter by category if specified
    let filtered = entries;
    if (options.category) {
      filtered = entries.filter(e => e.category === options.category);
    }

    const tableData = output.table(filtered, [
      { key: 'id', header: 'ID', format: (v) => output.colors.muted(v.substring(0, 8)) },
      { key: 'key', header: 'Key', format: (v) => output.colors.highlight(v) },
      { key: 'category', header: 'Category' },
      { key: 'environment', header: 'Env', format: (v) => formatEnv(v) },
      { key: 'description', header: 'Description', format: (v) => output.truncate(v || '', 30) },
      { key: 'updatedAt', header: 'Updated', format: (v) => output.formatRelativeTime(v) },
    ]);

    console.log(tableData);
    output.muted(`\nShowing ${filtered.length} secret(s)`);
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Show vault entry and reveal value
 */
async function showVault(entryId, options) {
  output.startSpinner('Fetching secret...');

  try {
    const entry = await api.vault.get(options.project, entryId);

    output.stopSpinner(true);

    console.log('');
    console.log(output.colors.bold(entry.key));
    console.log(output.colors.muted(`Category: ${entry.category}`));
    console.log(output.colors.muted(`Environment: ${entry.environment}`));
    if (entry.description) {
      console.log(output.colors.muted(`Description: ${entry.description}`));
    }
    console.log('');
    console.log(output.colors.highlight('Value:'));
    console.log(entry.value);
    console.log('');

    if (options.copy) {
      try {
        // Try to copy to clipboard using pbcopy (macOS) or similar
        const { execSync } = await import('child_process');
        const platform = process.platform;

        if (platform === 'darwin') {
          execSync('pbcopy', { input: entry.value });
          output.success('Value copied to clipboard');
        } else if (platform === 'linux') {
          execSync('xclip -selection clipboard', { input: entry.value });
          output.success('Value copied to clipboard');
        } else {
          output.warn('Clipboard copy not supported on this platform');
        }
      } catch {
        output.warn('Could not copy to clipboard');
      }
    }

    output.warn('This access has been logged for security audit.');
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Create a vault entry
 */
async function createVault(options) {
  let { key, value, category, environment, description, interactive, project } = options;

  // Interactive mode or missing required fields
  if (interactive || !key || !value) {
    const questions = [];

    if (!key) {
      questions.push({
        type: 'input',
        name: 'key',
        message: 'Secret key (e.g., DATABASE_URL):',
        validate: (input) => {
          if (!input) return 'Key is required';
          if (!/^[A-Z][A-Z0-9_]*$/.test(input.toUpperCase())) {
            return 'Key must be uppercase with underscores (e.g., DATABASE_URL)';
          }
          return true;
        },
        filter: (input) => input.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
      });
    }

    if (!value) {
      questions.push({
        type: 'password',
        name: 'value',
        message: 'Secret value:',
        mask: '*',
        validate: (input) => (input ? true : 'Value is required'),
      });
    }

    if (interactive) {
      questions.push(
        {
          type: 'list',
          name: 'category',
          message: 'Category:',
          choices: CATEGORIES,
          default: category || 'other',
        },
        {
          type: 'list',
          name: 'environment',
          message: 'Environment:',
          choices: ENVIRONMENTS,
          default: environment || 'all',
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
          default: description || '',
        }
      );
    }

    const answers = await inquirer.prompt(questions);
    key = key || answers.key;
    value = value || answers.value;
    category = answers.category || category;
    environment = answers.environment || environment;
    description = answers.description || description;
  }

  // Validate category
  if (!CATEGORIES.includes(category)) {
    output.error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  // Format key
  key = key.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

  output.startSpinner('Creating secret...');

  try {
    const entryData = {
      key,
      value,
      category,
      environment,
      description: description || '',
    };

    const entry = await api.vault.create(project, entryData);

    output.stopSpinner(true, 'Secret created');
    output.success(`Created: ${entry.key}`);

    console.log('');
    console.log(output.colors.bold(entry.key));
    console.log(output.colors.muted(`Category: ${entry.category}`));
    console.log(output.colors.muted(`Environment: ${entry.environment}`));
    console.log(output.colors.muted(`ID: ${entry.id}`));
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Update a vault entry
 */
async function updateVault(entryId, options) {
  const updates = {};

  if (options.value) updates.value = options.value;
  if (options.category) {
    if (!CATEGORIES.includes(options.category)) {
      output.error(`Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
      process.exit(1);
    }
    updates.category = options.category;
  }
  if (options.description !== undefined) updates.description = options.description;
  if (options.environment) {
    if (!ENVIRONMENTS.includes(options.environment)) {
      output.error(`Invalid environment. Must be one of: ${ENVIRONMENTS.join(', ')}`);
      process.exit(1);
    }
    updates.environment = options.environment;
  }

  if (Object.keys(updates).length === 0) {
    // If no updates provided, prompt for new value
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'value',
        message: 'New secret value:',
        mask: '*',
      },
    ]);

    if (answers.value) {
      updates.value = answers.value;
    } else {
      output.info('No changes made');
      return;
    }
  }

  output.startSpinner('Updating secret...');

  try {
    const entry = await api.vault.update(options.project, entryId, updates);
    output.stopSpinner(true, 'Secret updated');

    console.log('');
    console.log(output.colors.bold(entry.key));
    console.log(output.colors.muted(`Updated: ${output.formatDateTime(entry.updatedAt)}`));
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Delete a vault entry
 */
async function deleteVault(entryId, options) {
  if (!options.force) {
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'delete',
        message: `Are you sure you want to delete this secret? This cannot be undone.`,
        default: false,
      },
    ]);

    if (!confirm.delete) {
      output.info('Cancelled');
      return;
    }
  }

  output.startSpinner('Deleting secret...');

  try {
    await api.vault.delete(options.project, entryId);
    output.stopSpinner(true, 'Secret deleted');
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Format environment for display
 */
function formatEnv(env) {
  const colors = {
    production: output.colors.error,
    staging: output.colors.warning,
    development: output.colors.info,
    all: output.colors.muted,
  };
  return (colors[env] || output.colors.muted)(env);
}

export default { registerVaultCommands };
