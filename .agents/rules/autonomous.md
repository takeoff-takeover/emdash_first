# Autonomous Execution Rules

- **Do not interrupt the user with interactive question modals (`ask_question`)**:
  - Always make reasonable, best-practice assumptions and proceed autonomously.
  - Do not ask for trivial confirmations or multi-choice decisions via popups.
  - Report decisions and next steps in normal chat text instead of blocking the user.
- **Auto-proceed**:
  - Execute commands, file edits, and setups proactively without waiting for manual confirmation.
