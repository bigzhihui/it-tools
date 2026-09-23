const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '.,;:!?./-"\'#{([-|\\@)]=}*+';

// Largest multiple of `size` that fits in a 32-bit unsigned integer. Random
// values at or above it are discarded, so every character is equally likely
// instead of the first few being favoured by the modulo wrap-around.
function rejectionLimit(size: number) {
  return Math.floor(0x100000000 / size) * size;
}

export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
}: {
  withUppercase?: boolean
  withLowercase?: boolean
  withNumbers?: boolean
  withSymbols?: boolean
  length?: number
  alphabet?: string
}) {
  const source = alphabet ?? [
    withUppercase ? UPPERCASE : '',
    withLowercase ? LOWERCASE : '',
    withNumbers ? NUMBERS : '',
    withSymbols ? SYMBOLS : '',
  ].join('');

  // Deduplicate so a character listed twice is not twice as likely.
  const characters = [...new Set(source)];

  if (characters.length === 0 || length <= 0) {
    return '';
  }

  // Tokens here end up as passwords, API keys and TOTP secrets, so they are
  // drawn from the browser's cryptographically secure generator rather than
  // Math.random, whose output is predictable.
  const limit = rejectionLimit(characters.length);
  const buffer = new Uint32Array(Math.max(length, 16));
  let token = '';

  while (token.length < length) {
    crypto.getRandomValues(buffer);

    for (const value of buffer) {
      if (value < limit) {
        token += characters[value % characters.length];

        if (token.length === length) {
          break;
        }
      }
    }
  }

  return token;
}
