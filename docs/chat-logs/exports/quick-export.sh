#!/bin/bash
# Quick Chat Export Script
# 
# This script provides shortcuts for common chat export operations
# and integrates with git for easy commit inclusion.

set -e  # Exit on any error

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
EXPORT_SCRIPT="$SCRIPT_DIR/export-chat.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository!"
        exit 1
    fi
}

# Show current project status
show_status() {
    log_info "Current project status:"
    echo
    
    # Git status
    if git status --porcelain | grep -q .; then
        log_info "Modified files:"
        git status --porcelain | sed 's/^/  /'
    else
        log_info "No modified files"
    fi
    
    echo
    log_info "Recent commits:"
    git log --oneline -3 | sed 's/^/  /'
    
    echo
    log_info "Recent chat sessions:"
    if [ -d "$PROJECT_ROOT/docs/chat-logs/sessions" ]; then
        ls -1t "$PROJECT_ROOT/docs/chat-logs/sessions"/*.md 2>/dev/null | head -3 | while read -r file; do
            echo "  $(basename "$file")"
        done
    else
        echo "  No previous sessions found"
    fi
}

# Interactive session creation
create_session() {
    log_info "Starting interactive session creation..."
    echo
    
    cd "$PROJECT_ROOT"
    node "$EXPORT_SCRIPT" --interactive
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Session file created successfully!"
        
        # Session created successfully - user can commit manually when ready
        echo
        log_info "Session file created. Use './docs/chat-logs/exports/quick-export.sh commit' to commit when ready."
    else
        log_error "Failed to create session file"
        exit $exit_code
    fi
}

# Quick session creation with parameters
quick_session() {
    local topic="$1"
    local phase="$2"
    local focus="$3"
    
    if [ -z "$topic" ]; then
        log_error "Topic is required for quick session creation"
        log_info "Usage: $0 quick <topic> [phase] [focus]"
        exit 1
    fi
    
    log_info "Creating session: $topic"
    
    cd "$PROJECT_ROOT"
    local cmd="node \"$EXPORT_SCRIPT\" --topic \"$topic\""
    
    if [ -n "$phase" ]; then
        cmd="$cmd --phase \"$phase\""
    fi
    
    if [ -n "$focus" ]; then
        cmd="$cmd --focus \"$focus\""
    fi
    
    eval "$cmd"
    
    if [ $? -eq 0 ]; then
        log_success "Quick session created: $topic"
        log_info "Don't forget to edit the file and add your conversation content!"
    else
        log_error "Failed to create quick session"
        exit 1
    fi
}

# Commit session changes
commit_session() {
    log_info "Committing session changes..."
    
    cd "$PROJECT_ROOT"
    
    # Check if there are any chat log changes to commit
    if ! git status --porcelain | grep -q "docs/chat-logs/"; then
        log_warning "No chat log changes to commit"
        return 0
    fi
    
    # Stage chat log files
    git add docs/chat-logs/
    
    # Get the most recent session file for commit message
    local recent_session=""
    if [ -d "docs/chat-logs/sessions" ]; then
        recent_session=$(ls -1t docs/chat-logs/sessions/*.md 2>/dev/null | head -1)
    fi
    
    if [ -n "$recent_session" ]; then
        local session_name=$(basename "$recent_session" .md)
        local commit_msg="docs: add chat session - $session_name

Learning session documenting development progress and AI collaboration.

Chat log: $recent_session"
    else
        local commit_msg="docs: update chat logs

Update learning documentation and session records."
    fi
    
    # Show what will be committed
    log_info "Files to be committed:"
    git status --porcelain | grep "docs/chat-logs/" | sed 's/^/  /'
    
    echo
    log_info "Committing chat log changes..."
    
    git commit -m "$commit_msg"
    log_success "Session committed successfully!"
    
    log_info "Use 'git push' to push changes to remote repository when ready."
}

# List recent sessions
list_sessions() {
    log_info "Recent chat sessions:"
    cd "$PROJECT_ROOT"
    node "$EXPORT_SCRIPT" --list
}

# Create weekly summary
create_summary() {
    local week="$1"
    
    if [ -z "$week" ]; then
        log_error "Week number is required"
        log_info "Usage: $0 summary <week_number>"
        exit 1
    fi
    
    log_info "Creating weekly summary for week $week..."
    
    cd "$PROJECT_ROOT"
    node "$EXPORT_SCRIPT" --summary --week "$week"
    
    if [ $? -eq 0 ]; then
        log_success "Weekly summary created for week $week"
        
        # Auto-commit summaries without prompting
        echo
        log_info "Summary created successfully. Use './docs/chat-logs/exports/quick-export.sh commit' to commit when ready."
    else
        log_error "Failed to create weekly summary"
        exit 1
    fi
}

# Export current conversation (placeholder for manual process)
export_current() {
    log_info "To export your current conversation:"
    echo
    echo "1. Copy your chat conversation from Cursor/Claude interface"
    echo "2. Run: $0 interactive"
    echo "3. Follow the prompts to create a session file"
    echo "4. Paste your conversation into the created file"
    echo "5. Fill in the learning sections"
    echo "6. Commit the changes"
    echo
    log_info "For quick creation: $0 quick \"topic-name\" \"week-01\" \"learning objective\""
}

# Show help
show_help() {
    echo "Chat Export Tool - Quick Commands"
    echo
    echo "Usage: $0 <command> [arguments]"
    echo
    echo "Commands:"
    echo "  status                    Show current project and git status"
    echo "  interactive, i            Start interactive session creation"
    echo "  quick <topic> [phase] [focus]  Quick session creation"
    echo "  list, ls                  List recent sessions"
    echo "  summary <week>            Create weekly summary"
    echo "  commit                    Commit chat log changes"
    echo "  export                    Show manual export instructions"
    echo "  help, h                   Show this help message"
    echo
    echo "Examples:"
    echo "  $0 interactive"
    echo "  $0 quick \"player-implementation\" \"week-01\" \"Learn CharacterBody2D\""
    echo "  $0 summary 1"
    echo "  $0 commit"
    echo
    echo "The script will guide you through the process and integrate with git."
}

# Main script logic
main() {
    check_git_repo
    
    case "$1" in
        "status")
            show_status
            ;;
        "interactive"|"i")
            create_session
            ;;
        "quick")
            quick_session "$2" "$3" "$4"
            ;;
        "list"|"ls")
            list_sessions
            ;;
        "summary")
            create_summary "$2"
            ;;
        "commit")
            commit_session
            ;;
        "export")
            export_current
            ;;
        "help"|"h"|""|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 