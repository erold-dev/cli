/**
 * Tech Info Commands
 *
 * Commands for managing project technical information: stack, deployment, commands.
 */

import inquirer from 'inquirer';
import api from '../lib/api.js';
import output from '../lib/output.js';

const STACK_CATEGORIES = ['frontend', 'backend', 'database', 'languages', 'tools', 'other'];
const PROVIDERS = ['vercel', 'aws', 'gcp', 'azure', 'digitalocean', 'heroku', 'netlify', 'railway', 'render', 'fly', 'other'];

/**
 * Register tech-info commands
 * @param {Command} program - Commander program
 */
export function registerTechInfoCommands(program) {
  const techInfo = program.command('tech').alias('tech-info').description('Manage project tech stack and deployment info');

  // Show tech info
  techInfo
    .command('show')
    .alias('get')
    .description('Show project tech info')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      await showTechInfo(options);
    });

  // Set stack items
  techInfo
    .command('stack')
    .description('Manage tech stack')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-c, --category <category>', `Category (${STACK_CATEGORIES.join(', ')})`)
    .option('-a, --add <items...>', 'Add items (space-separated)')
    .option('-r, --remove <items...>', 'Remove items (space-separated)')
    .option('-s, --set <items...>', 'Set items (replaces existing)')
    .action(async (options) => {
      await manageStack(options);
    });

  // Set deployment info
  techInfo
    .command('deployment')
    .alias('deploy')
    .description('Set deployment configuration')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('--provider <provider>', `Provider (${PROVIDERS.join(', ')})`)
    .option('--region <region>', 'Cloud region')
    .option('--production-url <url>', 'Production URL')
    .option('--staging-url <url>', 'Staging URL')
    .option('--cicd <cicd>', 'CI/CD system')
    .option('--prod-branch <branch>', 'Production branch')
    .option('--staging-branch <branch>', 'Staging branch')
    .action(async (options) => {
      await setDeployment(options);
    });

  // Manage commands
  techInfo
    .command('commands')
    .alias('cmd')
    .description('Manage useful commands')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-a, --add', 'Add a new command')
    .option('-r, --remove <index>', 'Remove command at index')
    .option('-l, --list', 'List all commands')
    .action(async (options) => {
      await manageCommands(options);
    });

  // Set notes
  techInfo
    .command('notes')
    .description('Set tech notes')
    .requiredOption('-p, --project <projectId>', 'Project ID')
    .option('-m, --message <message>', 'Notes content')
    .option('-e, --edit', 'Edit in editor')
    .action(async (options) => {
      await setNotes(options);
    });
}

/**
 * Show tech info
 */
async function showTechInfo(options) {
  output.startSpinner('Fetching tech info...');

  try {
    const info = await api.techInfo.get(options.project);

    output.stopSpinner(true);

    if (options.json) {
      console.log(JSON.stringify(info, null, 2));
      return;
    }

    console.log('');

    // Tech Stack
    console.log(output.colors.bold('Tech Stack'));
    console.log(output.colors.muted('─'.repeat(40)));
    for (const category of STACK_CATEGORIES) {
      const items = info.stack?.[category] || [];
      if (items.length > 0) {
        console.log(`  ${output.colors.highlight(category.charAt(0).toUpperCase() + category.slice(1))}: ${items.join(', ')}`);
      }
    }
    if (!Object.values(info.stack || {}).some(arr => arr?.length > 0)) {
      console.log(output.colors.muted('  No stack items configured'));
    }
    console.log('');

    // Deployment
    console.log(output.colors.bold('Deployment'));
    console.log(output.colors.muted('─'.repeat(40)));
    if (info.deployment?.provider) {
      console.log(`  Provider: ${info.deployment.provider}`);
    }
    if (info.deployment?.region) {
      console.log(`  Region: ${info.deployment.region}`);
    }
    if (info.deployment?.urls?.production) {
      console.log(`  Production: ${output.colors.success(info.deployment.urls.production)}`);
    }
    if (info.deployment?.urls?.staging) {
      console.log(`  Staging: ${output.colors.info(info.deployment.urls.staging)}`);
    }
    if (info.deployment?.cicd) {
      console.log(`  CI/CD: ${info.deployment.cicd}`);
    }
    if (info.deployment?.branch?.production || info.deployment?.branch?.staging) {
      console.log(`  Branches: prod=${info.deployment.branch?.production || 'main'}, staging=${info.deployment.branch?.staging || 'develop'}`);
    }
    if (!info.deployment?.provider && !info.deployment?.urls?.production) {
      console.log(output.colors.muted('  No deployment info configured'));
    }
    console.log('');

    // Commands
    console.log(output.colors.bold('Commands'));
    console.log(output.colors.muted('─'.repeat(40)));
    if (info.commands && info.commands.length > 0) {
      info.commands.forEach((cmd, index) => {
        console.log(`  [${index}] ${output.colors.highlight(cmd.name)}: ${cmd.command}`);
        if (cmd.description) {
          console.log(`      ${output.colors.muted(cmd.description)}`);
        }
      });
    } else {
      console.log(output.colors.muted('  No commands configured'));
    }
    console.log('');

    // Notes
    if (info.notes) {
      console.log(output.colors.bold('Notes'));
      console.log(output.colors.muted('─'.repeat(40)));
      console.log(`  ${info.notes}`);
      console.log('');
    }

    if (info.updatedAt) {
      output.muted(`Last updated: ${output.formatDateTime(info.updatedAt)}`);
    }
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Manage tech stack
 */
async function manageStack(options) {
  const { project, category, add, remove, set } = options;

  if (!category) {
    output.error(`Category required. Use -c with one of: ${STACK_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  if (!STACK_CATEGORIES.includes(category)) {
    output.error(`Invalid category. Must be one of: ${STACK_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  if (!add && !remove && !set) {
    output.error('Specify --add, --remove, or --set with items');
    process.exit(1);
  }

  output.startSpinner('Updating stack...');

  try {
    // Get current info
    const info = await api.techInfo.get(project);
    const currentStack = info.stack || {};
    let items = currentStack[category] || [];

    if (set) {
      items = set;
    } else if (add) {
      items = [...new Set([...items, ...add])];
    } else if (remove) {
      items = items.filter(item => !remove.includes(item));
    }

    // Update
    await api.techInfo.update(project, {
      stack: { ...currentStack, [category]: items },
    });

    output.stopSpinner(true, 'Stack updated');
    console.log(`\n${output.colors.highlight(category)}: ${items.join(', ') || '(empty)'}`);
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Set deployment info
 */
async function setDeployment(options) {
  const { project, provider, region, productionUrl, stagingUrl, cicd, prodBranch, stagingBranch } = options;

  const updates = {};
  if (provider) {
    if (!PROVIDERS.includes(provider)) {
      output.error(`Invalid provider. Must be one of: ${PROVIDERS.join(', ')}`);
      process.exit(1);
    }
    updates.provider = provider;
  }
  if (region) updates.region = region;
  if (productionUrl || stagingUrl) {
    updates.urls = {};
    if (productionUrl) updates.urls.production = productionUrl;
    if (stagingUrl) updates.urls.staging = stagingUrl;
  }
  if (cicd) updates.cicd = cicd;
  if (prodBranch || stagingBranch) {
    updates.branch = {};
    if (prodBranch) updates.branch.production = prodBranch;
    if (stagingBranch) updates.branch.staging = stagingBranch;
  }

  if (Object.keys(updates).length === 0) {
    output.error('No updates provided. Use --provider, --region, --production-url, etc.');
    process.exit(1);
  }

  output.startSpinner('Updating deployment info...');

  try {
    await api.techInfo.update(project, { deployment: updates });

    output.stopSpinner(true, 'Deployment info updated');

    console.log('');
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          console.log(`  ${key}.${k}: ${v}`);
        });
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Manage commands
 */
async function manageCommands(options) {
  const { project, add, remove, list } = options;

  try {
    // Get current info
    const info = await api.techInfo.get(project);
    const commands = info.commands || [];

    if (list || (!add && remove === undefined)) {
      // List commands
      console.log('');
      console.log(output.colors.bold('Commands'));
      console.log(output.colors.muted('─'.repeat(40)));
      if (commands.length > 0) {
        commands.forEach((cmd, index) => {
          console.log(`  [${index}] ${output.colors.highlight(cmd.name)}: ${cmd.command}`);
          if (cmd.description) {
            console.log(`      ${output.colors.muted(cmd.description)}`);
          }
        });
      } else {
        console.log(output.colors.muted('  No commands configured'));
      }
      return;
    }

    if (add) {
      // Add a new command interactively
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Command name (e.g., Build):',
          validate: (input) => (input ? true : 'Name is required'),
        },
        {
          type: 'input',
          name: 'command',
          message: 'Command (e.g., npm run build):',
          validate: (input) => (input ? true : 'Command is required'),
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
        },
      ]);

      output.startSpinner('Adding command...');

      const newCommand = {
        name: answers.name,
        command: answers.command,
        description: answers.description || '',
      };

      await api.techInfo.update(project, {
        commands: [...commands, newCommand],
      });

      output.stopSpinner(true, 'Command added');
      console.log(`\n  ${output.colors.highlight(newCommand.name)}: ${newCommand.command}`);
      return;
    }

    if (remove !== undefined) {
      const index = parseInt(remove, 10);
      if (isNaN(index) || index < 0 || index >= commands.length) {
        output.error(`Invalid index. Must be between 0 and ${commands.length - 1}`);
        process.exit(1);
      }

      const removed = commands[index];
      const updatedCommands = [...commands];
      updatedCommands.splice(index, 1);

      output.startSpinner('Removing command...');

      await api.techInfo.update(project, { commands: updatedCommands });

      output.stopSpinner(true, 'Command removed');
      console.log(`\n  Removed: ${removed.name}`);
    }
  } catch (err) {
    output.error(err.message);
    process.exit(1);
  }
}

/**
 * Set notes
 */
async function setNotes(options) {
  const { project, message, edit } = options;

  let notes = message;

  if (edit || !notes) {
    // Get current notes and edit
    const info = await api.techInfo.get(project);

    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'notes',
        message: 'Edit notes:',
        default: info.notes || '',
      },
    ]);

    notes = answers.notes;
  }

  output.startSpinner('Updating notes...');

  try {
    await api.techInfo.update(project, { notes });

    output.stopSpinner(true, 'Notes updated');
    console.log(`\n${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}`);
  } catch (err) {
    output.stopSpinner(false);
    output.error(err.message);
    process.exit(1);
  }
}

export default { registerTechInfoCommands };
