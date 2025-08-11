# Chat Export System Usage Guide

Complete guide for using the automated chat history export system in your Godot learning project.

## Quick Start

### Export This Conversation

To export the conversation we just had about setting up the chat export system:

```bash
# Option 1: Interactive mode (recommended for first time)
./docs/chat-logs/exports/quick-export.sh interactive

# Option 2: Quick creation
./docs/chat-logs/exports/quick-export.sh quick "chat-export-setup" "week-01" "Setup automated chat documentation system"
```

### Daily Workflow

After each development session with AI:

```bash
# 1. Create session file
./docs/chat-logs/exports/quick-export.sh interactive

# 2. Copy your conversation from Cursor/Claude
# 3. Edit the created file and paste conversation
# 4. Fill in Key Learnings section
# 5. Commit with one command
./docs/chat-logs/exports/quick-export.sh commit
```

## Available Commands

### `status` - Check Project Status
```bash
./docs/chat-logs/exports/quick-export.sh status
```
Shows:
- Current git status
- Recent commits
- Recent chat sessions
- Modified files

### `interactive` - Full Session Creation
```bash
./docs/chat-logs/exports/quick-export.sh interactive
# or shorthand:
./docs/chat-logs/exports/quick-export.sh i
```
**Best for**: First-time users, complex sessions, when you want guidance

Features:
- Shows current project context
- Prompts for session details
- Auto-generates filename with timestamp
- Opens file in default editor
- Offers to commit immediately

### `quick` - Fast Session Creation
```bash
./docs/chat-logs/exports/quick-export.sh quick "topic" "phase" "focus"
```
**Best for**: Experienced users, simple sessions, batch creation

Examples:
```bash
# Basic usage
./docs/chat-logs/exports/quick-export.sh quick "player-movement"

# With learning phase
./docs/chat-logs/exports/quick-export.sh quick "enemy-ai" "week-02"

# With full context
./docs/chat-logs/exports/quick-export.sh quick "save-system" "week-03" "Learn JSON serialization in Godot"
```

### `list` - Show Recent Sessions
```bash
./docs/chat-logs/exports/quick-export.sh list
# or shorthand:
./docs/chat-logs/exports/quick-export.sh ls
```
Shows the 10 most recent session files with timestamps.

### `summary` - Create Weekly Summary
```bash
./docs/chat-logs/exports/quick-export.sh summary 1
```
Creates a structured summary document for the specified week, including:
- Overview of sessions
- Key accomplishments
- Technical skills developed
- Challenges and solutions
- Goals for next week

### `commit` - Git Integration
```bash
./docs/chat-logs/exports/quick-export.sh commit
```
**Features**:
- Auto-stages all chat log changes
- Generates descriptive commit message
- Shows preview before committing
- Offers to push to remote
- Includes session file reference

### `export` - Manual Export Instructions
```bash
./docs/chat-logs/exports/quick-export.sh export
```
Shows step-by-step instructions for manual conversation export.

## File Structure Created

When you run the export tools, they create this structure:

```
docs/chat-logs/
├── README.md                                    # System documentation
├── sessions/                                    # Individual conversations
│   ├── 2025-01-15-session-001-project-init.md
│   ├── 2025-01-15-session-002-chat-export-setup.md
│   └── 2025-01-16-session-003-player-implementation.md
├── summaries/                                   # Weekly/milestone summaries
│   ├── week-01-godot-fundamentals-summary.md
│   └── week-02-game-mechanics-summary.md
└── exports/                                     # Tools and templates
    ├── export-chat.py                          # Python automation script
    ├── quick-export.sh                         # Shell script wrapper
    ├── session_counter.json                    # Auto-incrementing counter
    └── templates/
        └── session-template.md                 # Template for new sessions
```

## Session File Naming Convention

Files are automatically named using this pattern:
```
YYYY-MM-DD-session-NNN-topic-description.md
```

Examples:
- `2025-01-15-session-001-project-initialization.md`
- `2025-01-15-session-002-chat-export-setup.md`
- `2025-01-16-session-003-player-controller-implementation.md`

The session number (NNN) auto-increments and is stored in `session_counter.json`.

## Session File Template

Each session file includes these sections:

```markdown
# Session 001: Chat Export Setup

**Date**: 2025-01-15
**Duration**: [you fill this in]
**Focus**: Setup automated chat documentation system
**Participants**: Human Developer + AI Assistant

## Session Metadata
- **Learning Phase**: Week 01
- **Primary Goal**: [what you aimed to accomplish]
- **Technologies**: [Godot, C#, Python, Shell scripting]
- **Files Modified**: [list of files created/changed]

## Conversation
[Your actual chat conversation goes here]

## Key Learnings
### Technical Insights
- [New concepts you learned]
- [Important gotchas or details]

### Development Process  
- [Workflow improvements]
- [Effective AI collaboration patterns]

### Next Steps
- [ ] [Immediate follow-up tasks]

## Code Changes
- **Files Added**: [list new files]
- **Files Modified**: [list changed files]

## References
- [Documentation consulted]
- [Related sessions]
```

## Manual Git Integration Workflow

### Manual Commit Process

You control all git operations manually:

```bash
# Check what's ready to commit
./docs/chat-logs/exports/quick-export.sh status-git

# Stage and commit chat logs manually
git add docs/chat-logs/
git commit -m "docs: add chat session - [session-name]"
git push
```

### Example Commit Messages

```
docs: add chat session - 2025-01-15-session-002-chat-export-setup

Learning session documenting development progress and AI collaboration.

Chat log: docs/chat-logs/sessions/2025-01-15-session-002-chat-export-setup.md
```

### Feature Development Integration

Include chat logs in your feature commits:

```bash
# After implementing a feature
git add src/Player.cs test/PlayerTests.cs

# Also add the related chat session
git add docs/chat-logs/sessions/2025-01-16-session-003-player-implementation.md

# Commit with reference to chat log
git commit -m "feat: implement basic player movement

- Add CharacterBody2D-based player controller
- Configure WASD input mapping
- Add basic physics and collision detection
- Include comprehensive movement tests

Development process documented in:
docs/chat-logs/sessions/2025-01-16-session-003-player-implementation.md"
```

## Learning Workflow Integration

### Daily Development Routine

1. **Start Development Session**
   ```bash
   ./docs/chat-logs/exports/quick-export.sh status
   ```

2. **During Development**
   - Work with AI assistant in Cursor/Claude
   - Implement features, solve problems
   - Take notes on key insights

3. **After Development Session**
   ```bash
   # Create session file
   ./docs/chat-logs/exports/quick-export.sh interactive
   
   # Copy conversation content
   # Edit file to add learnings and insights
   
   # Commit everything together
   git add .
   git commit -m "feat: implement feature X

   [describe changes]
   
   Chat log: docs/chat-logs/sessions/[session-file].md"
   ```

4. **Weekly Review**
   ```bash
   # Create weekly summary
   ./docs/chat-logs/exports/quick-export.sh summary 1
   
   # Review and commit
   ./docs/chat-logs/exports/quick-export.sh commit
   ```

### Learning Milestone Tracking

Use sessions to track learning progress:

```bash
# Week 1 sessions
./docs/chat-logs/exports/quick-export.sh quick "godot-setup" "week-01" "Initial Godot familiarity"
./docs/chat-logs/exports/quick-export.sh quick "first-csharp-script" "week-01" "Learn Godot C# integration"
./docs/chat-logs/exports/quick-export.sh quick "testing-framework" "week-01" "Setup gdUnit4 testing"

# Week 2 sessions  
./docs/chat-logs/exports/quick-export.sh quick "player-movement" "week-02" "CharacterBody2D movement system"
./docs/chat-logs/exports/quick-export.sh quick "input-system" "week-02" "Configure input mapping"
```

## Searching and Reference

### Find Past Solutions
```bash
# Search by topic
grep -r "CharacterBody2D" docs/chat-logs/

# Search by technology
grep -r "signal" docs/chat-logs/

# Search by learning phase
ls docs/chat-logs/sessions/*week-01*

# Find all sessions about a topic
find docs/chat-logs/ -name "*player*"
```

### Cross-Reference with Code
Each session should link to:
- Specific git commits made during the session
- Files that were created or modified
- Test cases added
- Documentation updated

Example session linking:
```markdown
## Code Changes
- **Files Added**: 
  - `src/Player.cs` - Basic player controller with CharacterBody2D
  - `test/PlayerTests.cs` - Unit tests for movement mechanics
- **Files Modified**: 
  - `project.godot` - Added input map for WASD controls
- **Git Commits**: 
  - `abc123f` - feat: implement player movement system
  - `def456a` - test: add player movement unit tests

## References
- [Godot CharacterBody2D Documentation](https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html)
- [Previous Session: godot-setup](./2025-01-15-session-001-godot-setup.md)
```

## Tips for Effective Usage

### Best Practices

1. **Export Immediately**: Create session file right after your development session while memory is fresh

2. **Be Specific**: Use descriptive topics and focus statements
   - Good: "player-movement-with-physics"  
   - Bad: "player-stuff"

3. **Include Context**: Add learning phase and specific objective
   ```bash
   ./docs/chat-logs/exports/quick-export.sh quick "save-system" "week-03" "Implement JSON-based game state persistence"
   ```

4. **Link Everything**: Reference related sessions, commits, and documentation

5. **Weekly Summaries**: Create summaries to reinforce learning and track progress

### Common Workflows

**For Learning Sessions:**
```bash
# Before: Check what you've done recently
./docs/chat-logs/exports/quick-export.sh status

# During: Take notes on key insights as you work

# After: Document the session
./docs/chat-logs/exports/quick-export.sh interactive
```

**For Quick Documentation:**
```bash
# Create placeholder session
./docs/chat-logs/exports/quick-export.sh quick "topic" "phase"

# Edit later with conversation content
# Commit when ready
./docs/chat-logs/exports/quick-export.sh commit
```

**For Problem-Solving Sessions:**
```bash
# Document debugging or problem-solving
./docs/chat-logs/exports/quick-export.sh quick "debug-physics-collision" "week-02" "Solve player falling through platforms"
```

## Troubleshooting

### Common Issues

**Python script not found:**
```bash
# Make sure you're in the project root directory
cd /path/to/your/godot-project
./docs/chat-logs/exports/quick-export.sh interactive
```

**Permission denied:**
```bash
# Make scripts executable
chmod +x docs/chat-logs/exports/*.sh
chmod +x docs/chat-logs/exports/*.py
```

**Git integration fails:**
```bash
# Ensure you're in a git repository
git status

# If not, initialize git first
git init
```

**Template not found:**
The script includes a fallback template, but you can create/customize:
```bash
# Edit the template
nano docs/chat-logs/exports/templates/session-template.md
```

### Getting Help

```bash
# Show all available commands
./docs/chat-logs/exports/quick-export.sh help

# Show JavaScript script options
node docs/chat-logs/exports/export-chat.js --help
```

## Integration with Learning Goals

### Week 1: Godot Fundamentals
```bash
# Track basic Godot learning
./docs/chat-logs/exports/quick-export.sh quick "godot-editor-basics" "week-01"
./docs/chat-logs/exports/quick-export.sh quick "scene-tree-concepts" "week-01"
./docs/chat-logs/exports/quick-export.sh quick "csharp-integration" "week-01"
```

### Week 2: Game Mechanics  
```bash
# Document game development progress
./docs/chat-logs/exports/quick-export.sh quick "player-controller" "week-02"
./docs/chat-logs/exports/quick-export.sh quick "collision-detection" "week-02"
./docs/chat-logs/exports/quick-export.sh quick "component-architecture" "week-02"
```

### Milestone Documentation
```bash
# Document major achievements
./docs/chat-logs/exports/quick-export.sh quick "first-playable-demo" "milestone-mvp"
./docs/chat-logs/exports/quick-export.sh quick "combat-system-complete" "milestone-gameplay"
```

This system transforms your AI conversations into a valuable learning archive that grows with your game development skills! 