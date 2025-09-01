# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TTS CLI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:
- Open a public GitHub issue for security vulnerabilities
- Post about the vulnerability on social media

### Please DO:
- Email us at: security@your-domain.com
- Include the word "SECURITY" in the subject line
- Provide detailed steps to reproduce the vulnerability
- Include the impact and potential attack scenarios

### What to expect:
- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Timeline**: Depends on severity
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: 60 days

## Security Measures

### Code Security
- ✅ Regular dependency updates
- ✅ Automated vulnerability scanning via GitHub Actions
- ✅ CodeQL static analysis
- ✅ SAST (Static Application Security Testing)
- ✅ Secret scanning with TruffleHog and Gitleaks
- ✅ OWASP dependency checks
- ✅ License compliance verification

### Build Security
- ✅ Signed releases
- ✅ Reproducible builds
- ✅ Supply chain security via SLSA
- ✅ Container scanning with Trivy
- ✅ SBOM (Software Bill of Materials) generation

### Runtime Security
- ✅ No network requests except to Microsoft TTS API
- ✅ No telemetry or data collection
- ✅ Minimal permissions required
- ✅ Sandboxed execution
- ✅ Input validation and sanitization

## Security Best Practices for Users

1. **Download from Official Sources**
   - Only download from GitHub releases or official package managers
   - Verify checksums when provided

2. **Keep Updated**
   - Regularly update to the latest version
   - Enable automatic updates if available

3. **Minimal Permissions**
   - Run with minimal required permissions
   - Avoid running as root/administrator unless necessary

4. **API Security**
   - Keep any API keys secure
   - Use environment variables for sensitive configuration
   - Never commit credentials to version control

## Security Tools Integration

This project uses the following security tools:

- **GitHub Security**
  - Dependabot for dependency updates
  - Code scanning alerts
  - Secret scanning
  - Security advisories

- **Third-party Tools**
  - Snyk for vulnerability scanning
  - CodeQL for static analysis
  - Semgrep for pattern-based security checks
  - TruffleHog for secret detection
  - Trivy for comprehensive security scanning

## Compliance

This project aims to comply with:
- OWASP Top 10
- CWE Top 25
- NIST Cybersecurity Framework
- SLSA Level 3

## Security Scorecard

View our current security posture:
- [OpenSSF Scorecard](https://securityscorecards.dev/viewer/?uri=github.com/your-username/tts-cli)
- [Snyk Vulnerability Report](https://snyk.io/test/github/your-username/tts-cli)

## Contact

For security concerns, please contact:
- Email: security@your-domain.com
- GPG Key: [Public Key ID]

## Acknowledgments

We thank the security researchers who have responsibly disclosed vulnerabilities:
- _List will be updated as vulnerabilities are reported and fixed_