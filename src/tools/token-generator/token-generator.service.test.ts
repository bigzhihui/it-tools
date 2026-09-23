import { describe, expect, it, vi } from 'vitest';
import { createToken } from './token-generator.service';

describe('token-generator', () => {
  describe('createToken', () => {
    it('should generate an empty string when all params are false', () => {
      const token = createToken({
        withLowercase: false,
        withUppercase: false,
        withNumbers: false,
        withSymbols: false,
        length: 10,
      });

      expect(token).toHaveLength(0);
    });

    it('should generate a random string with the specified length', () => {
      const createTokenWithLength = (length: number) =>
        createToken({
          withLowercase: true,
          withUppercase: true,
          withNumbers: true,
          withSymbols: true,
          length,
        });

      expect(createTokenWithLength(5)).toHaveLength(5);
      expect(createTokenWithLength(10)).toHaveLength(10);
      expect(createTokenWithLength(100)).toHaveLength(100);
    });

    it('should generate a random string with just uppercase if only withUppercase is set', () => {
      const token = createToken({
        withLowercase: false,
        withUppercase: true,
        withNumbers: false,
        withSymbols: false,
        length: 256,
      });

      expect(token).toHaveLength(256);
      expect(token).toMatch(/^[A-Z]+$/);
    });

    it('should generate a random string with just lowercase if only withLowercase is set', () => {
      const token = createToken({
        withLowercase: true,
        withUppercase: false,
        withNumbers: false,
        withSymbols: false,
        length: 256,
      });

      expect(token).toHaveLength(256);
      expect(token).toMatch(/^[a-z]+$/);
    });

    it('should generate a random string with just numbers if only withNumbers is set', () => {
      const token = createToken({
        withLowercase: false,
        withUppercase: false,
        withNumbers: true,
        withSymbols: false,
        length: 256,
      });

      expect(token).toHaveLength(256);
      expect(token).toMatch(/^[0-9]+$/);
    });

    it('should generate a random string with just symbols if only withSymbols is set', () => {
      const token = createToken({
        withLowercase: false,
        withUppercase: false,
        withNumbers: false,
        withSymbols: true,
        length: 256,
      });

      expect(token).toHaveLength(256);
      expect(token).toMatch(/^[.,;:!?./\-"'#{([-|\\@)\]=}*+]+$/);
    });

    it('should generate a random string with just letters (case incensitive) with withLowercase and withUppercase', () => {
      const token = createToken({
        withLowercase: true,
        withUppercase: true,
        withNumbers: false,
        withSymbols: false,
        length: 256,
      });

      expect(token).toHaveLength(256);
      expect(token).toMatch(/^[a-zA-Z]+$/);
    });

    it('can produce every letter, including N and n', () => {
      // The default alphabets used to skip N and n. With 5000 draws from 26
      // letters the chance of any letter being absent by luck is negligible.
      const upper = createToken({ withUppercase: true, withLowercase: false, withNumbers: false, length: 5000 });
      const lower = createToken({ withUppercase: false, withLowercase: true, withNumbers: false, length: 5000 });

      expect(new Set(upper).size).toBe(26);
      expect(new Set(lower).size).toBe(26);
      expect(upper).toContain('N');
      expect(lower).toContain('n');
    });

    it('draws from the cryptographically secure generator', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');

      createToken({ length: 32 });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('only uses characters from a custom alphabet', () => {
      const token = createToken({ length: 512, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' });

      expect(token).toHaveLength(512);
      expect(token).toMatch(/^[A-Z2-7]+$/);
    });
  });
});
