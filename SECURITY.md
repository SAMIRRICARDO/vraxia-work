# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x | ✅ |

---

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Please report security issues by emailing: **security@vraxia.dev** (or open a private GitHub Security Advisory).

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix

You will receive an acknowledgement within 48 hours and a resolution timeline within 7 days.

---

## Security Considerations for Users

### Credentials

VRAXIA Work handles sensitive credentials (LinkedIn, Anthropic API key). Follow these practices:

- **Never commit `.env`** — it is in `.gitignore` by default
- **Use environment variables** — never hardcode credentials in source
- **Rotate API keys** regularly via [console.anthropic.com](https://console.anthropic.com)
- **LinkedIn credentials** — use an account you control; be aware that automated activity may trigger platform security checks

### Data Storage

- Job application data is stored locally in SQLite (`.vraxia-work/` directory)
- This directory contains PII (job titles, companies, application state) — do not commit it or share it
- The `.gitignore` excludes `.vraxia-work/` by default

### API Key Exposure

- The Anthropic API key is only used locally — it is never sent to VRAXIA servers (there are none)
- Cost caps: set `ANTHROPIC_MONTHLY_BUDGET` in `.env` to prevent runaway spend

### Platform Terms of Service

Users are responsible for complying with the Terms of Service of any job platform they automate against (LinkedIn, Gupy, Catho, etc.). VRAXIA Work provides the framework; usage decisions are the user's responsibility.

---

## Dependency Security

Run `npm audit` regularly. Critical vulnerabilities in dependencies will be patched in a hotfix release.
