/**
 * Helper to compute user credentials / initials from name:
 * - "Anusha Maram" -> "AM"
 * - "Jyothisai Karumajji" -> "JK"
 * - "Rajesh" -> "R"
 * - "Anusha" -> "A"
 * - Defaults to "CP" if no name provided
 */
export function getUserInitials(name) {
  if (!name || typeof name !== 'string') return 'AM';
  const clean = name.trim();
  if (!clean) return 'AM';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AM';

  if (parts.length === 1) {
    // Single name (e.g. "Rajesh" -> "R")
    return parts[0].charAt(0).toUpperCase();
  }

  // Multiple names: First letter of first word + first letter of second word
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

