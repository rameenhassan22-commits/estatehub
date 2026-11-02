// Escapes characters that have a special meaning in a regular expression.
// Without this, a search like "(a+)+$" can freeze MongoDB (ReDoS) and "." matches everything.
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");