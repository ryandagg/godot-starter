#!/usr/bin/env node
/**
 * Chat History Export Tool for Godot Learning Project
 * 
 * This script helps automate the export of chat conversations for learning documentation.
 * It handles file naming, metadata generation, and git integration.
 * 
 * Usage:
 *     node export-chat.js --topic "player-implementation" --phase "week-01"
 *     node export-chat.js --interactive  // Interactive mode
 *     node export-chat.js --summary --week 1  // Create weekly summary
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

class ChatExporter {
    constructor(projectRoot = null) {
        this.projectRoot = projectRoot ? path.resolve(projectRoot) : process.cwd();
        this.chatLogsDir = path.join(this.projectRoot, 'docs', 'chat-logs');
        this.sessionsDir = path.join(this.chatLogsDir, 'sessions');
        this.summariesDir = path.join(this.chatLogsDir, 'summaries');
        this.exportsDir = path.join(this.chatLogsDir, 'exports');
        this.templatesDir = path.join(this.exportsDir, 'templates');
        
        // Session counter file
        this.counterFile = path.join(this.exportsDir, 'session_counter.json');
        
        // Initialize session count to 0 (will be loaded properly in init)
        this.sessionCount = 0;
    }
    
    async init() {
        // Ensure directories exist
        await this.ensureDirectories();
        
        // Load session counter
        await this.loadSessionCounter();
    }
    
    async ensureDirectories() {
        const dirs = [
            this.sessionsDir,
            this.summariesDir,
            this.templatesDir
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    
    async loadSessionCounter() {
        try {
            const data = await fs.readFile(this.counterFile, 'utf8');
            const parsed = JSON.parse(data);
            const count = parsed.session_count;
            this.sessionCount = (typeof count === 'number' && !isNaN(count)) ? count : 0;
        } catch (error) {
            this.sessionCount = 0;
            await this.saveSessionCounter();
        }
    }
    
    async saveSessionCounter() {
        const data = JSON.stringify({ session_count: this.sessionCount }, null, 2);
        await fs.writeFile(this.counterFile, data);
    }
    
    async incrementSessionCounter() {
        this.sessionCount += 1;
        await this.saveSessionCounter();
        return this.sessionCount;
    }
    
    getNextSessionNumber() {
        return this.sessionCount + 1;
    }
    
    sanitizeTopic(topic) {
        // Replace spaces with hyphens, remove special characters
        return topic.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
    
    generateSessionFilename(topic, sessionNumber = null) {
        if (sessionNumber === null) {
            sessionNumber = this.getNextSessionNumber();
        }
        
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const topicClean = this.sanitizeTopic(topic);
        const sessionNum = sessionNumber.toString().padStart(3, '0');
        
        return `${dateStr}-session-${sessionNum}-${topicClean}.md`;
    }
    
    async loadTemplate(templateName = 'session-template.md') {
        const templatePath = path.join(this.templatesDir, templateName);
        
        try {
            return await fs.readFile(templatePath, 'utf8');
        } catch (error) {
            return this.getDefaultTemplate();
        }
    }
    
    getDefaultTemplate() {
        return `# Session [NUMBER]: [TOPIC]

**Date**: {date}  
**Duration**: [estimated duration]  
**Focus**: [main learning objective]  
**Participants**: Human Developer + AI Assistant

## Session Metadata
- **Learning Phase**: [Week N / Phase Name]
- **Primary Goal**: [what we aimed to accomplish]
- **Technologies**: [Godot, C#, etc.]
- **Files Modified**: [list of changed files]

## Conversation

### Human
[Paste conversation content here]

### Assistant
[AI responses]

## Key Learnings

### Technical Insights
- [bullet points of new knowledge]

### Development Process
- [workflow and methodology insights]

### Next Steps
- [ ] [immediate follow-up tasks]

## Code Changes
- **Files Added**: [list]
- **Files Modified**: [list]
- **Tests Added**: [list]

## References
- [documentation links]
- [related sessions]
`;
    }
    
    async createSessionFile(topic, phase = null, focus = null) {
        const sessionNumber = await this.incrementSessionCounter();
        const filename = this.generateSessionFilename(topic, sessionNumber);
        const filepath = path.join(this.sessionsDir, filename);
        
        const template = await this.loadTemplate();
        const dateStr = new Date().toISOString().split('T')[0];
        
        // Fill in template variables
        let content = template
            .replace(/\[NUMBER\]/g, sessionNumber.toString().padStart(3, '0'))
            .replace(/\[TOPIC\]/g, this.toTitleCase(topic))
            .replace(/YYYY-MM-DD/g, dateStr);
        
        if (phase) {
            content = content.replace(/\[Week N \/ Phase Name\]/g, phase);
        }
        if (focus) {
            content = content.replace(/\[main learning objective\]/g, focus);
        }
        
        await fs.writeFile(filepath, content);
        
        return { filepath, sessionNumber };
    }
    
    toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
    
    async listSessions(limit = 10) {
        try {
            const files = await fs.readdir(this.sessionsDir);
            const sessionFiles = files
                .filter(file => file.endsWith('.md'))
                .sort()
                .reverse()
                .slice(0, limit);
            
            console.log(`Recent sessions (showing ${sessionFiles.length}):`);
            sessionFiles.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file}`);
            });
            
            return sessionFiles;
        } catch (error) {
            console.log('No sessions found.');
            return [];
        }
    }
    
    getGitStatus() {
        try {
            const result = execSync('git status --porcelain', {
                cwd: this.projectRoot,
                encoding: 'utf8'
            });
            return result.trim();
        } catch (error) {
            return null;
        }
    }
    
    getRecentCommits(count = 5) {
        try {
            const result = execSync(`git log --oneline -${count}`, {
                cwd: this.projectRoot,
                encoding: 'utf8'
            });
            return result.trim().split('\n').filter(line => line.trim());
        } catch (error) {
            return [];
        }
    }
    
    async interactiveSessionCreation() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const question = (prompt) => new Promise(resolve => {
            rl.question(prompt, resolve);
        });
        
        try {
            console.log('=== Chat Export Tool - Interactive Mode ===\n');
            
            // Show context
            console.log('Current project status:');
            const gitStatus = this.getGitStatus();
            if (gitStatus) {
                console.log('Modified files:');
                gitStatus.split('\n').forEach(line => {
                    if (line.trim()) console.log(`  ${line}`);
                });
            } else {
                console.log('  No modified files');
            }
            
            console.log();
            const recentCommits = this.getRecentCommits(3);
            if (recentCommits.length > 0 && recentCommits[0]) {
                console.log('Recent commits:');
                recentCommits.forEach(commit => {
                    if (commit.trim()) console.log(`  ${commit}`);
                });
            }
            
            console.log();
            console.log('Recent sessions:');
            await this.listSessions(5);
            
            console.log('\n=== Create New Session ===');
            
            // Get session details
            const topic = await question("Session topic (e.g., 'player-implementation'): ");
            if (!topic.trim()) {
                console.log('Topic is required!');
                rl.close();
                return null;
            }
            
            const phase = await question("Learning phase (e.g., 'week-01', 'milestone-mvp'): ");
            const focus = await question("Main learning objective: ");
            
            // Create session file
            try {
                const { filepath, sessionNumber } = await this.createSessionFile(
                    topic.trim(), 
                    phase.trim() || null, 
                    focus.trim() || null
                );
                
                console.log(`\nSession file created: ${filepath}`);
                console.log(`Session number: ${sessionNumber.toString().padStart(3, '0')}`);
                
                // Instructions
                console.log('\nNext steps:');
                console.log('1. Copy your chat conversation to clipboard');
                console.log(`2. Edit the file: ${filepath}`);
                console.log('3. Replace template placeholders with actual content');
                console.log('4. Fill in the Key Learnings and Implementation Summary sections');
                console.log("5. Run 'git add' and 'git commit' to save your progress");
                
                // Offer to open file
                const openFile = await question('\nOpen the file now? (y/n): ');
                if (openFile.toLowerCase().startsWith('y')) {
                    this.openFileInEditor(filepath);
                }
                
                rl.close();
                return filepath;
                
            } catch (error) {
                console.error(`Error creating session file: ${error.message}`);
                rl.close();
                return null;
            }
            
        } catch (error) {
            console.error(`Interactive session failed: ${error.message}`);
            rl.close();
            return null;
        }
    }
    
    openFileInEditor(filepath) {
        try {
            const platform = process.platform;
            let command;
            
            if (platform === 'darwin') { // macOS
                command = `open "${filepath}"`;
            } else if (platform === 'linux') {
                command = `xdg-open "${filepath}"`;
            } else if (platform === 'win32') {
                command = `start "" "${filepath}"`;
            } else {
                console.log(`Please open manually: ${filepath}`);
                return;
            }
            
            execSync(command);
        } catch (error) {
            console.error(`Could not open file automatically: ${error.message}`);
            console.log(`Please open manually: ${filepath}`);
        }
    }
    
    async createWeeklySummary(weekNumber) {
        const filename = `week-${weekNumber.toString().padStart(2, '0')}-summary.md`;
        const filepath = path.join(this.summariesDir, filename);
        
        // Find sessions from this week
        const weekSessions = await this.findWeekSessions(weekNumber);
        
        let template = `# Week ${weekNumber} Learning Summary

**Date Range**: [start date] - [end date]  
**Learning Focus**: [main themes of the week]  
**Sessions Completed**: ${weekSessions.length}

## Overview
[Brief overview of what was accomplished this week]

## Sessions This Week
`;
        
        weekSessions.forEach(session => {
            template += `- [${session}](../sessions/${session})\n`;
        });
        
        template += `
## Key Accomplishments
- [Major milestone 1]
- [Major milestone 2]
- [Major milestone 3]

## Technical Skills Developed
- [Skill 1 with brief description]
- [Skill 2 with brief description]
- [Skill 3 with brief description]

## Code Artifacts Created
- [Files/systems implemented]
- [Tests written]
- [Documentation added]

## Challenges and Solutions
### Challenge 1: [Description]
**Solution**: [How it was resolved]
**Learning**: [What was learned]

### Challenge 2: [Description]
**Solution**: [How it was resolved]
**Learning**: [What was learned]

## Next Week Goals
- [ ] [Specific goal 1]
- [ ] [Specific goal 2]
- [ ] [Specific goal 3]

## Resources That Helped
- [Documentation pages]
- [Tutorial videos]
- [Community discussions]

## Notes for Future Reference
[Important gotchas, patterns, or insights to remember]
`;
        
        await fs.writeFile(filepath, template);
        return filepath;
    }
    
    async findWeekSessions(weekNumber) {
        try {
            const files = await fs.readdir(this.sessionsDir);
            const weekPattern = `week-${weekNumber.toString().padStart(2, '0')}`;
            
            return files
                .filter(file => file.endsWith('.md'))
                .filter(file => file.toLowerCase().includes(weekPattern))
                .sort();
        } catch (error) {
            return [];
        }
    }
}

// Command line argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--topic':
                options.topic = args[++i];
                break;
            case '--phase':
                options.phase = args[++i];
                break;
            case '--focus':
                options.focus = args[++i];
                break;
            case '--interactive':
            case '-i':
                options.interactive = true;
                break;
            case '--list':
            case '-l':
                options.list = true;
                break;
            case '--summary':
                options.summary = true;
                break;
            case '--week':
                options.week = parseInt(args[++i]);
                break;
            case '--project-root':
                options.projectRoot = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }
    
    return options;
}

function showHelp() {
    console.log(`Chat Export Tool for Godot Learning Project

Usage: node export-chat.js [options]

Options:
  --topic <topic>           Session topic
  --phase <phase>           Learning phase (e.g., week-01)
  --focus <focus>           Main learning objective
  --interactive, -i         Interactive mode
  --list, -l               List recent sessions
  --summary                Create weekly summary
  --week <number>          Week number for summary
  --project-root <path>    Project root directory
  --help, -h               Show this help message

Examples:
  node export-chat.js --interactive
  node export-chat.js --topic "player-implementation" --phase "week-01"
  node export-chat.js --summary --week 1
  node export-chat.js --list`);
}

// Main execution
async function main() {
    const options = parseArgs();
    
    if (options.help || Object.keys(options).length === 0) {
        showHelp();
        return;
    }
    
    const exporter = new ChatExporter(options.projectRoot);
    await exporter.init();
    
    try {
        if (options.interactive) {
            await exporter.interactiveSessionCreation();
        } else if (options.list) {
            await exporter.listSessions();
        } else if (options.summary) {
            const week = options.week || 1;
            const filepath = await exporter.createWeeklySummary(week);
            console.log(`Weekly summary created: ${filepath}`);
        } else if (options.topic) {
            const { filepath, sessionNumber } = await exporter.createSessionFile(
                options.topic, 
                options.phase, 
                options.focus
            );
            console.log(`Session file created: ${filepath}`);
            console.log(`Session number: ${sessionNumber.toString().padStart(3, '0')}`);
        } else {
            showHelp();
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { ChatExporter }; 