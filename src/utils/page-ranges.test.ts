import { describe, expect, it } from 'vitest';
import { parsePageRanges } from './page-ranges';

function pages(input: string, pageCount = 10) {
  const result = parsePageRanges(input, pageCount);
  return result.ok ? result.pages : result.error;
}

describe('page-ranges', () => {
  describe('parsePageRanges', () => {
    it('reads single pages and ranges', () => {
      expect(pages('1-3, 5, 8-10')).toEqual([1, 2, 3, 5, 8, 9, 10]);
      expect(pages('4')).toEqual([4]);
      expect(pages('2-2')).toEqual([2]);
    });

    it('keeps the order written, including backwards ranges and repeats', () => {
      expect(pages('3,1,2')).toEqual([3, 1, 2]);
      expect(pages('5-3')).toEqual([5, 4, 3]);
      expect(pages('1,1')).toEqual([1, 1]);
    });

    it('runs an open range to the last page', () => {
      expect(pages('7-', 9)).toEqual([7, 8, 9]);
      expect(pages('9-', 9)).toEqual([9]);
    });

    it('accepts full-width input and stray whitespace', () => {
      expect(pages('1－3，5、7')).toEqual([1, 2, 3, 5, 7]);
      expect(pages('１—３；５')).toEqual([1, 2, 3, 5]);
      expect(pages('2~4')).toEqual([2, 3, 4]);
      expect(pages(' 1 - 2 ,\t4　')).toEqual([1, 2, 4]);
      expect(pages('1,,2,')).toEqual([1, 2]);
    });

    it('reports empty input', () => {
      expect(pages('')).toBe('empty');
      expect(pages('   ')).toBe('empty');
      expect(pages(',，')).toBe('empty');
    });

    it('reports input it cannot read', () => {
      expect(pages('abc')).toBe('syntax');
      expect(pages('1-2-3')).toBe('syntax');
      expect(pages('1.5')).toBe('syntax');
      expect(pages('-3')).toBe('syntax');
      expect(pages('1, x')).toBe('syntax');
    });

    it('reports pages the document does not have', () => {
      expect(pages('0')).toBe('outOfRange');
      expect(pages('11')).toBe('outOfRange');
      expect(pages('8-12')).toBe('outOfRange');
      expect(pages('3-0')).toBe('outOfRange');
      expect(pages('7-', 5)).toBe('outOfRange');
    });
  });
});
