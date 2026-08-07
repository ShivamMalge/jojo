# C Programming Cheat Sheet
### Quick Reference for the 50 Basic Programs

This sheet explains **what each piece of code means**, **when to use it**, and **common mistakes** to avoid. Keep it next to you while practicing.

---

## 1. The Basic Structure (Every Program Needs This)
```c
#include <stdio.h>   // gives you printf, scanf
int main() {
    // your code goes here
    return 0;
}
```
✅ Always add:
- `#include <stdio.h>` at the top (if you use printf/scanf)
- `int main() { ... }` — this is where your program starts and ends
- `return 0;` at the end of main — tells the computer "program finished OK"

❌ Don't forget:
- The curly braces `{ }` must always come in pairs
- Every line of code (except after `{` or `}`) ends with a semicolon `;`

---

## 2. printf — Showing Output
```c
printf("Hello");        // prints plain text
printf("%d", age);      // prints a variable's value
printf("Hi %s", name);  // prints text + variable together
```
| Symbol | Used for |
|--------|----------|
| `%d` | integers (whole numbers) |
| `%f` | float / decimal numbers |
| `%c` | a single character |
| `%s` | a string (word/text) |
| `\n` | move to next line |

❌ Common mistake: using `%d` to print a decimal number (use `%f` instead), or forgetting the `%` sign.

---

## 3. scanf — Taking Input
```c
int a;
scanf("%d", &a);   // the & is REQUIRED for normal variables
```
✅ Always put `&` before the variable name in scanf (except for strings — see below).
❌ Forgetting `&` is the #1 beginner mistake — the program won't crash but will give wrong answers.

For strings, don't use `&`:
```c
char name[20];
scanf("%s", name);   // no & needed for strings/arrays
```

---

## 4. Variables & Data Types
```c
int age = 15;        // whole numbers
float price = 99.5;  // decimal numbers
char grade = 'A';     // single character (use single quotes)
char name[20] = "Ravi"; // text (use double quotes, needs [] for size)
```
✅ Pick the type that matches what you're storing.
❌ Don't store a decimal value in an `int` — it will chop off everything after the point.
❌ Don't forget the `[size]` when declaring a string, e.g. `char word[20]`.

---

## 5. Operators (Doing Math)
| Operator | Meaning | Example |
|----------|---------|---------|
| `+` `-` `*` `/` | add, subtract, multiply, divide | `a + b` |
| `%` | remainder (modulus) | `10 % 3` → `1` |
| `==` | is equal to (comparison) | `a == b` |
| `!=` | not equal to | `a != b` |
| `>` `<` `>=` `<=` | greater/less than | `a > b` |
| `&&` | AND (both conditions true) | `a>0 && b>0` |
| `\|\|` | OR (either condition true) | `a>0 \|\| b>0` |
| `++` | increase by 1 | `i++` |
| `--` | decrease by 1 | `i--` |

❌ Biggest trap: `=` vs `==`.
- `=` **assigns** a value (`a = 5` puts 5 into a)
- `==` **compares** two values (`a == 5` checks if a is 5)
Mixing these up is the most common bug for beginners!

---

## 6. if / else if / else — Making Decisions
```c
if (condition) {
    // runs if condition is true
} else if (anotherCondition) {
    // runs if that one is true
} else {
    // runs if none above are true
}
```
✅ Condition always goes in `( )`.
✅ Code to run goes in `{ }`.
❌ Don't put a semicolon right after `if(condition)` — it breaks the logic:
```c
if (a > b);   // ❌ WRONG — this does nothing, ends the if here
{ printf("bigger"); }  // this will run no matter what
```

---

## 7. switch-case — Choosing from Many Options
```c
switch (variable) {
    case 1: printf("One"); break;
    case 2: printf("Two"); break;
    default: printf("Other");
}
```
✅ Always add `break;` at the end of each case — otherwise it will run all the cases below it too ("fall-through").
✅ `default` handles any value not listed above — good practice to always include it.

---

## 8. Loops — Repeating Code

**for loop** — use when you know how many times to repeat:
```c
for (int i = 1; i <= 10; i++) {
    printf("%d", i);
}
// i=1 (start) | i<=10 (keep going while true) | i++ (step)
```

**while loop** — use when you repeat until a condition becomes false:
```c
int i = 1;
while (i <= 10) {
    printf("%d", i);
    i++;   // ❌ forgetting this = infinite loop!
}
```

**do-while loop** — like while, but always runs at least once:
```c
int i = 1;
do {
    printf("%d", i);
    i++;
} while (i <= 10);
```

❌ Always double check your loop has a way to stop (like `i++`), or your program will hang forever (infinite loop).

---

## 9. Arrays — Storing Many Values Together
```c
int marks[5] = {80, 90, 70, 60, 100};
printf("%d", marks[0]);  // prints 80 — first item!
```
✅ Counting starts from **0**, not 1. `marks[0]` is the 1st item, `marks[4]` is the 5th (last) item.
❌ Don't try to access `marks[5]` in a 5-item array — the valid spots are only `marks[0]` to `marks[4]`.

Looping through an array:
```c
for (int i = 0; i < 5; i++)
    printf("%d ", marks[i]);
```

---

## 10. Strings — Working with Text
```c
#include <string.h>          // needed for string functions
char word[20] = "school";

strlen(word);        // gives the length → 6
strcpy(dest, src);   // copies src into dest
strcat(a, b);        // joins b onto the end of a
strcmp(a, b);        // returns 0 if a and b are exactly equal
```
❌ Don't forget `#include <string.h>` when using these functions.
❌ Remember: `strcmp` returns **0 when strings ARE equal** — this confuses a lot of beginners (0 usually means "false", but not here!).

---

## 11. Functions — Reusable Blocks of Code
```c
int add(int a, int b) {   // function definition
    return a + b;
}

int main() {
    int result = add(4, 5);  // function call
    printf("%d", result);
    return 0;
}
```
✅ A function needs: a return type (`int`), a name, and `( )` for inputs (parameters).
✅ `return` sends the answer back to wherever the function was called.
❌ If a function returns something (like `int`), don't forget the `return` statement.

---

## 12. Quick "Add / Don't Add" Checklist

| Always add ✅ | Don't forget to avoid ❌ |
|----------------|---------------------------|
| `#include <stdio.h>` at the top | Missing semicolons `;` |
| `return 0;` at the end of main | Using `=` instead of `==` in conditions |
| `&` before variable names in `scanf` (not for strings) | Forgetting `i++` inside while loops |
| `break;` after each `case` in switch | Accessing an array index that doesn't exist |
| Matching curly braces `{ }` | Mixing up `%d`, `%f`, `%c`, `%s` |
| `#include <string.h>` for string functions | Forgetting `[size]` when declaring a string |

---

## 13. How to Read Any Program (Simple Method)
1. Find `main()` — that's where the program starts.
2. Read top to bottom, line by line.
3. When you see a loop, imagine running it step-by-step on paper.
4. When you see `if`, ask: "is this true or false right now?"
5. Trust `printf` output — it shows exactly what the program is thinking.

Practice by changing the numbers in these 50 programs and guessing the output *before* you run them!
