import type { TestCase } from './grader';

/**
 * Hidden test cases, keyed by question id. These live in the Worker on purpose
 * so the expected answers never ship in the browser bundle.
 *
 * Inputs are chosen so the expected result is not itself one of the inputs —
 * otherwise a program that merely echoes its input could pass by accident.
 */
export const TEST_CASES: Record<number, TestCase[]> = {
  1: [{ label: 'prints the welcome message', stdin: '', mode: 'contains', expect: 'Welcome to C Programming' }],

  2: [{ label: 'prints 10', stdin: '', mode: 'numbers', expect: '10' }],

  3: [{ label: 'prints 3.14', stdin: '', mode: 'numbers', expect: '3.14' }],

  4: [{ label: 'prints the letter A', stdin: '', mode: 'contains', expect: 'A', cs: true }],

  5: [
    { label: 'positive number', stdin: '42', mode: 'numbers', expect: '42' },
    { label: 'negative number', stdin: '-7', mode: 'numbers', expect: '-7' },
    { label: 'zero', stdin: '0', mode: 'numbers', expect: '0' },
  ],

  6: [
    { label: 'two positives', stdin: '12 7', mode: 'numbers', expect: '19' },
    { label: 'one negative', stdin: '-5 8', mode: 'numbers', expect: '3' },
    { label: 'equal values', stdin: '25 25', mode: 'numbers', expect: '50' },
  ],

  7: [
    { label: 'decimal times whole', stdin: '2.5 4', mode: 'numbers', expect: '10' },
    { label: 'two decimals', stdin: '1.5 1.5', mode: 'numbers', expect: '2.25' },
    { label: 'fraction', stdin: '0.5 8', mode: 'numbers', expect: '4' },
  ],

  8: [
    { label: 'rectangle', stdin: '7 6', mode: 'numbers', expect: '42' },
    { label: 'square', stdin: '3 3', mode: 'numbers', expect: '9' },
    { label: 'wide rectangle', stdin: '12 5', mode: 'numbers', expect: '60' },
  ],

  9: [
    { label: 'leaves a remainder', stdin: '23 7', mode: 'numbers', expect: '2' },
    { label: 'remainder of 1', stdin: '100 9', mode: 'numbers', expect: '1' },
    { label: 'divides evenly', stdin: '5 5', mode: 'numbers', expect: '0' },
  ],

  10: [
    { label: 'average is not a whole number', stdin: '10 20 31', mode: 'numbers', expect: '20.333333' },
    { label: 'small numbers', stdin: '2 4 9', mode: 'numbers', expect: '5' },
    { label: 'whole-number average', stdin: '6 7 11', mode: 'numbers', expect: '8' },
  ],

  11: [
    { label: 'positive number', stdin: '7', mode: 'contains', expect: 'Positive' },
    { label: 'negative stays silent', stdin: '-3', mode: 'contains', expect: '', forbid: 'positive' },
    { label: 'zero stays silent', stdin: '0', mode: 'contains', expect: '', forbid: 'positive' },
  ],

  12: [
    { label: 'even number', stdin: '8', mode: 'contains', expect: 'Even' },
    { label: 'odd number', stdin: '7', mode: 'contains', expect: 'Odd' },
    { label: 'zero is even', stdin: '0', mode: 'contains', expect: 'Even' },
    // Catches the classic `n % 2 == 1` bug: in C that is false for -3,
    // because the remainder keeps the sign of the left operand.
    { label: 'negative odd number', stdin: '-3', mode: 'contains', expect: 'Odd' },
  ],

  13: [
    { label: 'first is larger', stdin: '12 7', mode: 'numbers', expect: '12' },
    { label: 'second is larger', stdin: '4 19', mode: 'numbers', expect: '19' },
    { label: 'both equal', stdin: '6 6', mode: 'numbers', expect: '6' },
  ],

  14: [
    { label: 'middle is largest', stdin: '3 9 5', mode: 'numbers', expect: '9' },
    { label: 'first is largest', stdin: '10 2 4', mode: 'numbers', expect: '10' },
    { label: 'last is largest', stdin: '1 2 8', mode: 'numbers', expect: '8' },
  ],

  15: [
    { label: 'adult', stdin: '20', mode: 'contains', expect: 'Eligible', forbid: 'not eligible' },
    { label: 'minor', stdin: '15', mode: 'contains', expect: 'Not Eligible' },
    { label: 'exactly 18', stdin: '18', mode: 'contains', expect: 'Eligible', forbid: 'not eligible' },
  ],

  16: [
    { label: 'leap year', stdin: '2024', mode: 'contains', expect: 'Leap Year', forbid: 'not leap' },
    { label: 'common year', stdin: '2023', mode: 'contains', expect: 'Not Leap Year' },
    { label: 'year 2000', stdin: '2000', mode: 'contains', expect: 'Leap Year', forbid: 'not leap' },
  ],

  17: [
    { label: 'grade A', stdin: '95', mode: 'contains', expect: 'A', cs: true },
    { label: 'grade B', stdin: '85', mode: 'contains', expect: 'B', cs: true },
    { label: 'grade C', stdin: '75', mode: 'contains', expect: 'C', cs: true },
    { label: 'grade F', stdin: '60', mode: 'contains', expect: 'F', cs: true },
  ],

  18: [
    { label: 'positive', stdin: '5', mode: 'contains', expect: 'Positive' },
    { label: 'negative', stdin: '-5', mode: 'contains', expect: 'Negative' },
    { label: 'zero', stdin: '0', mode: 'contains', expect: 'Zero' },
  ],

  19: [
    { label: 'vowel e', stdin: 'e', mode: 'contains', expect: 'Vowel', forbid: 'consonant' },
    { label: 'consonant z', stdin: 'z', mode: 'contains', expect: 'Consonant' },
    { label: 'vowel a', stdin: 'a', mode: 'contains', expect: 'Vowel', forbid: 'consonant' },
  ],

  20: [
    { label: 'correct pin', stdin: '1234', mode: 'contains', expect: 'Access Granted', forbid: 'denied' },
    { label: 'wrong pin', stdin: '9999', mode: 'contains', expect: 'Access Denied' },
    { label: 'another wrong pin', stdin: '1111', mode: 'contains', expect: 'Access Denied' },
  ],

  21: [{ label: 'counts 1 to 10', stdin: '', mode: 'numbers', expect: '1 2 3 4 5 6 7 8 9 10' }],

  22: [{ label: 'counts 10 down to 1', stdin: '', mode: 'numbers', expect: '10 9 8 7 6 5 4 3 2 1' }],

  23: [{ label: 'first 10 even numbers', stdin: '', mode: 'numbers', expect: '2 4 6 8 10 12 14 16 18 20' }],

  24: [
    { label: 'sum to 10', stdin: '10', mode: 'numbers', expect: '55' },
    { label: 'sum to 1', stdin: '1', mode: 'numbers', expect: '1' },
    { label: 'sum to 100', stdin: '100', mode: 'numbers', expect: '5050' },
  ],

  25: [
    { label: 'factorial of 5', stdin: '5', mode: 'numbers', expect: '120' },
    { label: 'factorial of 1', stdin: '1', mode: 'numbers', expect: '1' },
    { label: 'factorial of 7', stdin: '7', mode: 'numbers', expect: '5040' },
  ],

  26: [
    { label: 'table of 5', stdin: '5', mode: 'numbers', expect: '5 10 15 20 25 30 35 40 45 50' },
    { label: 'table of 3', stdin: '3', mode: 'numbers', expect: '3 6 9 12 15 18 21 24 27 30' },
  ],

  27: [
    { label: 'four digits', stdin: '4567', mode: 'numbers', expect: '4' },
    { label: 'single digit', stdin: '7', mode: 'numbers', expect: '1' },
    { label: 'six digits', stdin: '100000', mode: 'numbers', expect: '6' },
  ],

  28: [
    { label: 'four digits', stdin: '1234', mode: 'numbers', expect: '4321' },
    { label: 'trailing zero', stdin: '120', mode: 'numbers', expect: '21' },
    { label: 'single digit', stdin: '7', mode: 'numbers', expect: '7' },
  ],

  29: [
    { label: 'four digits', stdin: '1234', mode: 'numbers', expect: '10' },
    { label: 'contains a zero', stdin: '505', mode: 'numbers', expect: '10' },
    { label: 'single digit', stdin: '9', mode: 'numbers', expect: '9' },
  ],

  30: [
    { label: 'palindrome', stdin: '121', mode: 'contains', expect: 'Palindrome', forbid: 'not palindrome' },
    { label: 'not a palindrome', stdin: '123', mode: 'contains', expect: 'Not Palindrome' },
    { label: 'single digit', stdin: '7', mode: 'contains', expect: 'Palindrome', forbid: 'not palindrome' },
  ],

  31: [
    { label: '3 x 3 square', stdin: '3', mode: 'exact', expect: ['***', '***', '***'] },
    { label: '1 x 1 square', stdin: '1', mode: 'exact', expect: ['*'] },
  ],

  32: [
    { label: 'triangle of 4', stdin: '4', mode: 'exact', expect: ['*', '**', '***', '****'] },
    { label: 'triangle of 1', stdin: '1', mode: 'exact', expect: ['*'] },
  ],

  33: [
    { label: 'common factor 12', stdin: '24 36', mode: 'numbers', expect: '12' },
    { label: 'no common factor', stdin: '17 5', mode: 'numbers', expect: '1' },
    { label: 'larger numbers', stdin: '100 75', mode: 'numbers', expect: '25' },
  ],

  34: [
    { label: 'prime number', stdin: '13', mode: 'contains', expect: 'Prime', forbid: 'not prime' },
    { label: 'composite number', stdin: '15', mode: 'contains', expect: 'Not Prime' },
    { label: 'smallest prime', stdin: '2', mode: 'contains', expect: 'Prime', forbid: 'not prime' },
  ],

  35: [
    { label: 'seven terms', stdin: '7', mode: 'numbers', expect: '0 1 1 2 3 5 8' },
    { label: 'five terms', stdin: '5', mode: 'numbers', expect: '0 1 1 2 3' },
    { label: 'one term', stdin: '1', mode: 'numbers', expect: '0' },
  ],

  36: [
    { label: 'lowercase word', stdin: 'hello', mode: 'contains', expect: 'hello', cs: true },
    { label: 'mixed case word', stdin: 'Jojo', mode: 'contains', expect: 'Jojo', cs: true },
  ],

  37: [
    { label: 'long word', stdin: 'programming', mode: 'numbers', expect: '11' },
    { label: 'single letter', stdin: 'a', mode: 'numbers', expect: '1' },
    { label: 'five letters', stdin: 'hello', mode: 'numbers', expect: '5' },
  ],

  38: [
    { label: 'copies a word', stdin: 'banana', mode: 'contains', expect: 'banana', cs: true },
    { label: 'copies mixed case', stdin: 'Xyz', mode: 'contains', expect: 'Xyz', cs: true },
  ],

  39: [
    { label: 'joins two words', stdin: 'hello world', mode: 'contains', expect: 'helloworld', cs: true },
    { label: 'joins short words', stdin: 'abc def', mode: 'contains', expect: 'abcdef', cs: true },
  ],

  40: [
    { label: 'identical words', stdin: 'abc abc', mode: 'contains', expect: 'Same', forbid: 'different' },
    { label: 'different words', stdin: 'abc abd', mode: 'contains', expect: 'Different' },
    { label: 'identical mixed case', stdin: 'Hi Hi', mode: 'contains', expect: 'Same', forbid: 'different' },
  ],

  41: [
    { label: 'three letters', stdin: 'cat', mode: 'exact', expect: ['c', 'a', 't'] },
    { label: 'two letters', stdin: 'hi', mode: 'exact', expect: ['h', 'i'] },
  ],

  42: [
    { label: 'five vowels', stdin: 'education', mode: 'numbers', expect: '5' },
    { label: 'no vowels', stdin: 'rhythm', mode: 'numbers', expect: '0' },
    { label: 'all vowels', stdin: 'aeiou', mode: 'numbers', expect: '5' },
  ],

  43: [
    { label: 'reverses a word', stdin: 'hello', mode: 'contains', expect: 'olleh', cs: true },
    { label: 'reverses three letters', stdin: 'abc', mode: 'contains', expect: 'cba', cs: true },
  ],

  44: [
    { label: 'several a characters', stdin: 'banana', mode: 'contains', expect: 'b*n*n*', cs: true },
    { label: 'leading a', stdin: 'apple', mode: 'contains', expect: '*pple', cs: true },
  ],

  45: [{ label: 'counts the spaces', stdin: '', mode: 'numbers', expect: '3' }],

  46: [
    { label: 'lowercase word', stdin: 'hello', mode: 'contains', expect: 'HELLO', cs: true },
    { label: 'three letters', stdin: 'abc', mode: 'contains', expect: 'ABC', cs: true },
  ],

  47: [
    { label: 'palindrome', stdin: 'racecar', mode: 'contains', expect: 'Palindrome', forbid: 'not palindrome' },
    { label: 'not a palindrome', stdin: 'hello', mode: 'contains', expect: 'Not Palindrome' },
    { label: 'two same letters', stdin: 'aa', mode: 'contains', expect: 'Palindrome', forbid: 'not palindrome' },
  ],

  48: [
    { label: 'three matches', stdin: 'banana a', mode: 'numbers', expect: '3' },
    { label: 'two matches', stdin: 'hello l', mode: 'numbers', expect: '2' },
    { label: 'no matches', stdin: 'abc z', mode: 'numbers', expect: '0' },
  ],

  49: [
    { label: 'found in the middle', stdin: 'hello l', mode: 'numbers', expect: '2' },
    { label: 'found near the end', stdin: 'world d', mode: 'numbers', expect: '4' },
    { label: 'found at the start', stdin: 'abc a', mode: 'numbers', expect: '0' },
  ],

  50: [
    { label: 'six characters', stdin: 'secret', mode: 'exact', expect: ['******'] },
    { label: 'two characters', stdin: 'ab', mode: 'exact', expect: ['**'] },
  ],
};

export function testCasesFor(questionId: number): TestCase[] {
  return TEST_CASES[questionId] || [];
}
