# Git Workflow Documentation

## Commit Message Convention

We follow the Conventional Commits specification for commit messages. This enables automatic versioning and changelog generation.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc

### Scope

The scope provides additional contextual information:

- `auth`: Authentication related changes
- `api`: API related changes
- `ui`: UI components
- `deps`: Dependencies
- `config`: Configuration changes

### Examples

```
feat(auth): implement JWT authentication
fix(api): resolve user data fetch error
docs(readme): update installation instructions
```

## Pull Request Template

Create a `.github/pull_request_template.md` file with the following content:

```markdown
## Description

[Provide a brief description of the changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

[Describe the tests you ran]

## Checklist:

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All existing tests pass locally

## Screenshots (if applicable):

## Additional Notes:
```

## Branch Naming Convention

```
<type>/<ticket-number>-<short-description>

Examples:
feat/PROJ-123-add-user-authentication
fix/PROJ-456-resolve-api-error
```

## Setup Instructions

### 1. Install Required Dependencies

```bash
# Install Husky and related tools
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged prettier eslint
```

### 2. Configure Husky

Initialize Husky:

```bash
npx husky install
npm pkg set scripts.prepare="husky install"
```

### 3. Add Commit Message Linting

Create `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 100],
    'subject-case': [2, 'always', ['lower-case']],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'],
    ],
  },
};
```

Add commit-msg hook:

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### 4. Configure Lint-Staged

Create `.lintstagedrc.js`:

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml}': ['prettier --write'],
};
```

Add pre-commit hook:

```bash
npx husky add .husky/pre-commit 'npx lint-staged'
```

## Workflow Steps

### Making Changes

1. Create a new branch following the naming convention
2. Make your changes
3. Stage files: `git add .`
4. Commit using conventional format: `git commit -m "type(scope): description"`
5. Push changes: `git push origin branch-name`

### Creating a Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Request reviews from team members
6. Address any feedback and make necessary changes

### Code Review Process

1. Reviewers should check:
   - Code quality and standards
   - Test coverage
   - Documentation updates
   - Performance implications
2. Use GitHub's review features to provide feedback
3. Approve or request changes as needed

## Enforcement

### Automated Checks

- Husky enforces commit message format
- Lint-staged runs ESLint and Prettier on staged files
- GitHub Actions can be set up for additional CI checks

### Manual Checks

- PR template ensures consistent information
- Required reviewers ensure code quality
- Branch protection rules can be set in GitHub repository settings

## Troubleshooting

### Common Issues

1. Husky hooks not running:
   - Run `npm run prepare`
   - Check if `.husky` directory exists
2. Commit rejected:

   - Ensure commit message follows convention
   - Check ESLint and Prettier errors

3. PR template not loading:
   - Verify `.github/pull_request_template.md` exists
   - Check repository settings

For additional help, consult the team lead or documentation maintainers.
