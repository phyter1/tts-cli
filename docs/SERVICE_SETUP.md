# Service Setup Guide

This guide helps you set up the various services used for monitoring code quality, security, and coverage.

## 1. Codecov Setup

1. **Sign up** at [codecov.io](https://about.codecov.io/)
2. **Add repository**:
   - Go to https://app.codecov.io/gh
   - Click "Add new repository"
   - Select `phyter1/tts-cli`
3. **Get token**:
   - Click on the repository
   - Go to Settings → General
   - Copy the "Repository Upload Token"
4. **Add to GitHub**:
   - Go to https://github.com/phyter1/tts-cli/settings/secrets/actions
   - Add new secret: `CODECOV_TOKEN` with the token value

## 2. Snyk Setup

1. **Sign up** at [snyk.io](https://snyk.io/) (free for open source)
2. **Connect GitHub**:
   - Click "Import Projects"
   - Select GitHub
   - Authorize Snyk
3. **Add project**:
   - Find `phyter1/tts-cli`
   - Click "Add project"
4. **Get token**:
   - Go to Account Settings → Auth Token
   - Copy the token
5. **Add to GitHub**:
   - Add secret: `SNYK_TOKEN` with the token value
6. **Enable PR checks**:
   - In Snyk project settings
   - Enable "Snyk PR checks"

## 3. CodeClimate Setup

1. **Sign up** at [codeclimate.com](https://codeclimate.com/quality)
2. **Add repository**:
   - Click "Add a repository"
   - Select from GitHub
   - Choose `phyter1/tts-cli`
3. **Get Badge ID**:
   - Go to Repo Settings → Badges
   - Copy the Maintainability Badge markdown
   - Extract the badge ID from the URL
4. **Update README**:
   - Replace `YOUR_BADGE_ID` in README.md with actual ID
5. **Configure GitHub**:
   - In CodeClimate, go to Repo Settings → GitHub
   - Enable Pull Request comments
   - Enable status checks

## 4. FOSSA Setup

1. **Sign up** at [fossa.com](https://app.fossa.com/)
2. **Add project**:
   - Click "Add Project"
   - Choose "GitHub"
   - Select `phyter1/tts-cli`
3. **Configure**:
   - Choose "Quick Import"
   - FOSSA will auto-detect configuration
4. **Get API key**:
   - Go to Settings → API Keys
   - Create new key for CI/CD
5. **Add to GitHub**:
   - Add secret: `FOSSA_API_KEY` with the key value

## 5. Libraries.io Setup

1. **Visit** [libraries.io](https://libraries.io/)
2. **Search** for `github.com/phyter1/tts-cli`
3. It will automatically index your repository
4. No configuration needed - badge will work automatically

## 6. OpenSSF Scorecard

1. **No signup required** - it's automatic for public repos
2. **View scorecard** at:
   https://securityscorecards.dev/viewer/?uri=github.com/phyter1/tts-cli
3. The badge will automatically update

## 7. GitHub Dependabot

Already configured via `.github/dependabot.yml`. To enable:

1. Go to https://github.com/phyter1/tts-cli/settings/security_analysis
2. Enable:
   - Dependabot alerts
   - Dependabot security updates
   - Dependabot version updates

## 8. GitHub Code Scanning

1. Go to https://github.com/phyter1/tts-cli/settings/security_analysis
2. Enable "Code scanning"
3. The CodeQL workflow is already configured

## Required GitHub Secrets

Add these secrets at https://github.com/phyter1/tts-cli/settings/secrets/actions:

| Secret Name | Service | Required |
|------------|---------|----------|
| `CODECOV_TOKEN` | Codecov | Yes |
| `SNYK_TOKEN` | Snyk | Yes |
| `FOSSA_API_KEY` | FOSSA | Optional |
| `CODECLIMATE_TOKEN` | CodeClimate | Optional |

## Verification

After setup, trigger a workflow run:

```bash
git commit --allow-empty -m "test: trigger CI workflows"
git push
```

Then check:
1. GitHub Actions tab for workflow status
2. Each service dashboard for results
3. README badges should start showing real data

## Badge Status

- ✅ **Working immediately**: Platform, Architecture, Bun, TypeScript, License, PRs Welcome
- ⏳ **After first workflow run**: Build Status, Security Scan, Code Quality
- 🔧 **After service setup**: Codecov, Snyk, CodeClimate, FOSSA
- 📊 **After data collection**: Downloads, Contributors, Issues, Dependencies

## Troubleshooting

### Badge shows "unknown" or "not found"
- Service needs to be configured
- Repository might be private (some services require paid plans for private repos)
- First scan hasn't completed yet

### Workflow failing
- Check if secrets are properly set
- Verify service API keys are valid
- Some services need time to index the repository

### Coverage not updating
- Ensure tests are running and generating coverage
- Check Codecov token is correct
- Verify coverage files are being uploaded