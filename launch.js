#!/usr/bin/env node

/**
 * render-neural launcher script
 * Provides easy commands to launch the application
 */

const { spawn } = require('child_process');
const path = require('path');

const commands = {
  dev: {
    cmd: 'npm',
    args: ['run', 'dev'],
    description: 'Start development server'
  },
  build: {
    cmd: 'npm',
    args: ['run', 'build'],
    description: 'Build for production'
  },
  preview: {
    cmd: 'npm',
    args: ['run', 'preview'],
    description: 'Preview production build'
  },
  install: {
    cmd: 'npm',
    args: ['install'],
    description: 'Install dependencies'
  }
};

function showHelp() {
  console.log(`
🚀 render-neural launcher

Usage: node launch.js <command>

Available commands:
${Object.entries(commands).map(([name, cmd]) => 
  `  ${name.padEnd(10)} - ${cmd.description}`
).join('\n')}

Examples:
  node launch.js dev      # Start development server
  node launch.js build    # Build for production
  node launch.js install  # Install dependencies

Keyboard shortcuts in browser:
  Ctrl/Cmd + D: Launch dev server
  Ctrl/Cmd + B: Build app
  Ctrl/Cmd + R: Launch React app directly
  Ctrl/Cmd + C: Clear terminal
`);
}

function runCommand(commandName) {
  const command = commands[commandName];
  
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    showHelp();
    process.exit(1);
  }

  console.log(`🚀 Running: ${command.cmd} ${command.args.join(' ')}`);
  console.log(`📝 ${command.description}\n`);

  const child = spawn(command.cmd, command.args, {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  child.on('error', (error) => {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Command completed successfully`);
    } else {
      console.error(`❌ Command failed with code ${code}`);
      process.exit(code);
    }
  });
}

// Main
const command = process.argv[2];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
} else {
  runCommand(command);
}
