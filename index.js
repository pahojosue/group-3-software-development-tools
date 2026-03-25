import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';

let currentPM = 'npm';

const runCommand = (command) => {
    try {
        console.log(chalk.blue(`\nExecuting: ${command}`));
        execSync(command, { encoding: 'utf-8', stdio: 'inherit' });
        console.log(chalk.green('\nCommand completed successfully.\n'));
    } catch (error) {
        console.error(chalk.red('\nError executing command. Please check the logs above.\n'));
    }
};

const handleDirectCommand = (command, pkgName) => {
    switch (command.toLowerCase()) {
        case 'init':
            runCommand(`${currentPM} init -y`);
            break;
        case 'install':
            if (!pkgName) {
                console.log(chalk.red('✖ Error: Please provide a package name. Example: node index.js install express'));
                return;
            }
            runCommand(currentPM === 'npm' ? `npm install ${pkgName}` : `yarn add ${pkgName}`);
            break;
        case 'list':
            runCommand(currentPM === 'npm' ? 'npm list --depth=0' : 'yarn list --depth=0');
            break;
        case 'remove':
            if (!pkgName) {
                console.log(chalk.red('✖ Error: Please provide a package name. Example: node index.js remove express'));
                return;
            }
            runCommand(currentPM === 'npm' ? `npm uninstall ${pkgName}` : `yarn remove ${pkgName}`);
            break;
        case 'update':
            runCommand(currentPM === 'npm' ? 'npm update' : 'yarn upgrade');
            break;
        case 'audit':
            runCommand(`${currentPM} audit`);
            break;
        default:
            console.log(chalk.red(`✖ Error: Unknown command "${command}".`));
            console.log(chalk.yellow('Available commands: init, install <pkg>, list, remove <pkg>, update, audit'));
            break;
    }
};

const askForPackage = async (actionText) => {
    const { pkgName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'pkgName',
            message: `Enter the name of the package to ${actionText}:`,
            validate: (input) => input.trim() !== '' ? true : 'Package name cannot be empty.'
        }
    ]);
    return pkgName;
};

// The main interactive menu
const mainMenu = async () => {
    console.log(chalk.bold.magenta(`\n==== Simple DMS CLI (Using ${currentPM}) ====`));

    console.log(`
        1. Init (Initialize a new project)
        2. Install (Add a package)
        3. List (View top-level installed packages)
        4. Remove (Uninstall a package)
        5. Update (Update all dependencies)
        6. Audit (Run security checks)
        7. Tree (Visualize full dependency graph)
        8. Switch Package Manager (npm <-> yarn)
        9. Exit
    `);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                '1. Init (Initialize a new project)',
                '2. Install (Add a package)',
                '3. List (View top-level installed packages)',
                '4. Remove (Uninstall a package)',
                '5. Update (Update all dependencies)',
                '6. Audit (Run security checks)',
                '7. Tree (Visualize full dependency graph)',
                '8. Switch Package Manager (npm <-> yarn)',
                '9. Exit'
            ]
        }
    ]);    

    switch (action.split('.')[0]) {
        case '1':
            runCommand(currentPM === 'npm' ? 'npm init -y' : 'yarn init -y');
            break;
        case '2':
            const pkgToInstall = await askForPackage('install');
            runCommand(currentPM === 'npm' ? `npm install ${pkgToInstall}` : `yarn add ${pkgToInstall}`);
            break;
        case '3':
            runCommand(currentPM === 'npm' ? 'npm list --depth=0' : 'yarn list --depth=0');
            break;
        case '4':
            const pkgToRemove = await askForPackage('remove');
            runCommand(currentPM === 'npm' ? `npm uninstall ${pkgToRemove}` : `yarn remove ${pkgToRemove}`);
            break;
        case '5':
            runCommand(currentPM === 'npm' ? 'npm update' : 'yarn upgrade');
            break;
        case '6':
            runCommand(currentPM === 'npm' ? 'npm audit' : 'yarn audit');
            break;
        case '7':
            console.log(chalk.cyan('Generating dependency graph...'));
            runCommand(currentPM === 'npm' ? 'npm list --all' : 'yarn list');
            break;
        case '8':
            currentPM = currentPM === 'npm' ? 'yarn' : 'npm';
            console.log(chalk.yellow(`\nSwitched package manager to: ${currentPM}\n`));
            break;
        case '9':
            console.log(chalk.green('Goodbye!'));
            process.exit(0);
    }

    await mainMenu();
};

const args = process.argv.slice(2);

if (args.length > 0) {
    const command = args[0];
    const pkgName = args[1];
    handleDirectCommand(command, pkgName);
} else {
    console.log(chalk.bold.green('Welcome to the Simple Dependency Management System!'));
    mainMenu();
}