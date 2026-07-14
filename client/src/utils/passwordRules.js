// Single source of truth for password rules, shared by Activate and ChangePassword.
// Pure functions only (no React) so they can be unit-tested and mirrored server-side.

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 12;

const HAS_LETTER = /[A-Za-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/;

/**
 * Compute which password conditions are met.
 * @param {{password?: string, passwordConfirm?: string, oldPassword?: string, requireOld?: boolean}} input
 * @returns checks + `allValid` (whether the form may be submitted)
 */
export function validatePassword({
  password = "",
  passwordConfirm = "",
  oldPassword = "",
  requireOld = false,
} = {}) {
  const length = password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
  const oneLetter = HAS_LETTER.test(password);
  const oneNumber = HAS_NUMBER.test(password);
  const oneSpecial = HAS_SPECIAL.test(password);
  // "different from old" only applies when an old password is required
  const different = !requireOld || password !== oldPassword;
  const confirmMatches = password.length > 0 && password === passwordConfirm;

  const allValid =
    length && oneLetter && oneNumber && oneSpecial && different && confirmMatches &&
    (!requireOld || oldPassword.length > 0);

  return { length, oneLetter, oneNumber, oneSpecial, different, confirmMatches, allValid };
}
