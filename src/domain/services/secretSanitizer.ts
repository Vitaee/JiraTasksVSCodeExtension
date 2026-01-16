import { DiffSnapshot } from "../ports/gitPort";

type SecretRule = {
  label: string;
  pattern: RegExp;
  replace?: (match: string, ...groups: string[]) => string;
};

const SECRET_RULES: SecretRule[] = [
  {
    label: "PRIVATE_KEY",
    pattern:
      /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    label: "OPENAI_KEY",
    pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g,
  },
  {
    label: "ANTHROPIC_KEY",
    pattern: /\bsk-ant-[A-Za-z0-9_-]{16,}\b/g,
  },
  {
    label: "GROQ_KEY",
    pattern: /\bgsk_[A-Za-z0-9_-]{16,}\b/g,
  },
  {
    label: "GITHUB_TOKEN",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  },
  {
    label: "GITHUB_PAT",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    label: "GITLAB_TOKEN",
    pattern: /\bglpat-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    label: "SLACK_TOKEN",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    label: "STRIPE_SECRET",
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{10,}\b/g,
  },
  {
    label: "GOOGLE_API_KEY",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    label: "AWS_ACCESS_KEY",
    pattern: /\b(AKIA|ASIA)[A-Z0-9]{16}\b/g,
  },
  {
    label: "AWS_SECRET_KEY",
    pattern: /(\baws_secret_access_key\s*[:=]\s*['"]?)([^'"\s]+)/gi,
    replace: (match, prefix) => `${prefix}<REDACTED:AWS_SECRET_KEY>`,
  },
  {
    label: "BEARER_TOKEN",
    pattern:
      /(\bAuthorization:\s*Bearer\s+)([A-Za-z0-9-._~+/]+=*)/gi,
    replace: (match, prefix) => `${prefix}<REDACTED:BEARER_TOKEN>`,
  },
];

export class SecretSanitizer {
  sanitizeSnapshot(snapshot: DiffSnapshot): DiffSnapshot {
    return {
      ...snapshot,
      files: snapshot.files.map((file) => ({
        ...file,
        diff: file.diff ? this.sanitizeText(file.diff) : file.diff,
      })),
    };
  }

  sanitizeText(text: string): string {
    let sanitized = text;

    for (const rule of SECRET_RULES) {
      if (rule.replace) {
        sanitized = sanitized.replace(rule.pattern, (...args) => {
          const replaced = rule.replace?.(...args);
          return replaced ?? args[0];
        });
        continue;
      }

      sanitized = sanitized.replace(
        rule.pattern,
        this.replacement(rule.label)
      );
    }

    return sanitized;
  }

  private replacement(label: string): string {
    return `<REDACTED:${label}>`;
  }
}
