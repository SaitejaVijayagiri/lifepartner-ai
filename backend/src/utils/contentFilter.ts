
/**
 * Revenue Protection Filter
 * Detects and masks contact information to prevent platform leakage.
 */

export function sanitizeContent(text: string): string {
    if (!text) return "";

    let sanitized = text;

    // 1. Email Regex
    // Matches: test@gmail.com, name.surname@co.in, etc.
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    sanitized = sanitized.replace(emailRegex, "[Hidden Contact - Upgrade to Share]");

    // 2. Phone Number Regex
    // Matches: 
    // 9876543210 (10 digits)
    // +91 98765 43210 (International + spaces)
    // 987-654-3210 (Hyphens)
    // Minimum 10 digits to avoid masking IDs or prices easily.
    // This is a heuristic.
    const phoneRegex = /(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}|\b\d{10}\b/g;
    sanitized = sanitized.replace(phoneRegex, "[Hidden Contact - Upgrade to Share]");

    return sanitized;
}
