### Q1. Print a welcome message
```c
#include <stdio.h>
int main() {
    printf("Welcome to C Programming!\n");
    return 0;
}
```

### Q2. Print an integer variable
```c
#include <stdio.h>
int main() {
    int number = 10;
    printf("%d\n", number);
    return 0;
}
```

### Q3. Print a float variable
```c
#include <stdio.h>
int main() {
    float pi = 3.14;
    printf("%f\n", pi);
    return 0;
}
```

### Q4. Print a character variable
```c
#include <stdio.h>
int main() {
    char letter = 'A';
    printf("%c\n", letter);
    return 0;
}
```

### Q5. Read an integer from the user
```c
#include <stdio.h>
int main() {
    int a;
    scanf("%d", &a);
    printf("%d\n", a);
    return 0;
}
```

### Q6. Add two numbers
```c
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", a + b);
    return 0;
}
```

### Q7. Multiply two decimal numbers
```c
#include <stdio.h>
int main() {
    float a, b;
    scanf("%f %f", &a, &b);
    printf("%f\n", a * b);
    return 0;
}
```

### Q8. Calculate the area of a rectangle
```c
#include <stdio.h>
int main() {
    int length, width;
    scanf("%d %d", &length, &width);
    printf("%d\n", length * width);
    return 0;
}
```

### Q9. Find the remainder of division
```c
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", a % b);
    return 0;
}
```

### Q10. Calculate average of three numbers
```c
#include <stdio.h>
int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    float average = (a + b + c) / 3.0;
    printf("%f\n", average);
    return 0;
}
```

### Q11. Check if a number is positive
```c
#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    if (num > 0) {
        printf("Positive\n");
    }
    return 0;
}
```

### Q12. Check if a number is even or odd
```c
#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    if (num % 2 == 0) {
        printf("Even\n");
    } else {
        printf("Odd\n");
    }
    return 0;
}
```

### Q13. Find the maximum of two numbers
```c
#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    if (a > b) {
        printf("%d\n", a);
    } else {
        printf("%d\n", b);
    }
    return 0;
}
```

### Q14. Find the maximum of three numbers
```c
#include <stdio.h>
int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c) {
        printf("%d\n", a);
    } else if (b >= a && b >= c) {
        printf("%d\n", b);
    } else {
        printf("%d\n", c);
    }
    return 0;
}
```

### Q15. Check if a person is eligible to vote
```c
#include <stdio.h>
int main() {
    int age;
    scanf("%d", &age);
    if (age >= 18) {
        printf("Eligible\n");
    } else {
        printf("Not Eligible\n");
    }
    return 0;
}
```

### Q16. Check if a year is a leap year
```c
#include <stdio.h>
int main() {
    int year;
    scanf("%d", &year);
    if (year % 4 == 0) {
        printf("Leap Year\n");
    } else {
        printf("Not Leap Year\n");
    }
    return 0;
}
```

### Q17. Grade calculator based on marks
```c
#include <stdio.h>
int main() {
    int marks;
    scanf("%d", &marks);
    if (marks >= 90) {
        printf("A\n");
    } else if (marks >= 80) {
        printf("B\n");
    } else if (marks >= 70) {
        printf("C\n");
    } else {
        printf("F\n");
    }
    return 0;
}
```

### Q18. Check if a number is positive, negative, or zero
```c
#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    if (num > 0) {
        printf("Positive\n");
    } else if (num < 0) {
        printf("Negative\n");
    } else {
        printf("Zero\n");
    }
    return 0;
}
```

### Q19. Check if a character is a vowel (simple)
```c
#include <stdio.h>
int main() {
    char ch;
    scanf(" %c", &ch);
    if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
        printf("Vowel\n");
    } else {
        printf("Consonant\n");
    }
    return 0;
}
```

### Q20. Login checker (simple pass/fail)
```c
#include <stdio.h>
int main() {
    int pin;
    scanf("%d", &pin);
    if (pin == 1234) {
        printf("Access Granted\n");
    } else {
        printf("Access Denied\n");
    }
    return 0;
}
```

### Q21. Print numbers from 1 to 10
```c
#include <stdio.h>
int main() {
    for (int i = 1; i <= 10; i++) {
        printf("%d\n", i);
    }
    return 0;
}
```

### Q22. Print numbers from 10 down to 1
```c
#include <stdio.h>
int main() {
    for (int i = 10; i >= 1; i--) {
        printf("%d\n", i);
    }
    return 0;
}
```

### Q23. Print the first 10 even numbers
```c
#include <stdio.h>
int main() {
    for (int i = 2; i <= 20; i = i + 2) {
        printf("%d\n", i);
    }
    return 0;
}
```

### Q24. Sum of the first N natural numbers
```c
#include <stdio.h>
int main() {
    int n, sum = 0;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        sum = sum + i;
    }
    printf("%d\n", sum);
    return 0;
}
```

### Q25. Factorial of a number
```c
#include <stdio.h>
int main() {
    int n, fact = 1;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        fact = fact * i;
    }
    printf("%d\n", fact);
    return 0;
}
```

### Q26. Print a multiplication table
```c
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= 10; i++) {
        printf("%d x %d = %d\n", n, i, n * i);
    }
    return 0;
}
```

### Q27. Count digits in a number
```c
#include <stdio.h>
int main() {
    int n, count = 0;
    scanf("%d", &n);
    while (n != 0) {
        n = n / 10;
        count++;
    }
    printf("%d\n", count);
    return 0;
}
```

### Q28. Reverse a number
```c
#include <stdio.h>
int main() {
    int n, rev = 0;
    scanf("%d", &n);
    while (n != 0) {
        rev = rev * 10 + (n % 10);
        n = n / 10;
    }
    printf("%d\n", rev);
    return 0;
}
```

### Q29. Sum of digits of a number
```c
#include <stdio.h>
int main() {
    int n, sum = 0;
    scanf("%d", &n);
    while (n != 0) {
        sum = sum + (n % 10);
        n = n / 10;
    }
    printf("%d\n", sum);
    return 0;
}
```

### Q30. Check if a number is a palindrome
```c
#include <stdio.h>
int main() {
    int n, original, rev = 0;
    scanf("%d", &n);
    original = n;
    while (n != 0) {
        rev = rev * 10 + (n % 10);
        n = n / 10;
    }
    if (original == rev) {
        printf("Palindrome\n");
    } else {
        printf("Not Palindrome\n");
    }
    return 0;
}
```

### Q31. Print a square of stars
```c
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

### Q32. Print a right-angled triangle of stars
```c
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}
```

### Q33. Find the GCD of two numbers using a loop
```c
#include <stdio.h>
int main() {
    int a, b, gcd = 1;
    scanf("%d %d", &a, &b);
    for (int i = 1; i <= a && i <= b; i++) {
        if (a % i == 0 && b % i == 0) {
            gcd = i;
        }
    }
    printf("%d\n", gcd);
    return 0;
}
```

### Q34. Check if a number is prime
```c
#include <stdio.h>
int main() {
    int n, isPrime = 1;
    scanf("%d", &n);
    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            isPrime = 0;
        }
    }
    if (isPrime == 1 && n > 1) {
        printf("Prime\n");
    } else {
        printf("Not Prime\n");
    }
    return 0;
}
```

### Q35. Fibonacci sequence up to N terms
```c
#include <stdio.h>
int main() {
    int n, a = 0, b = 1, next;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        printf("%d ", a);
        next = a + b;
        a = b;
        b = next;
    }
    printf("\n");
    return 0;
}
```

### Q36. Read and print a string
```c
#include <stdio.h>
int main() {
    char word[50];
    scanf("%s", word);
    printf("%s\n", word);
    return 0;
}
```

### Q37. Find the length of a string
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    scanf("%s", word);
    printf("%d\n", strlen(word));
    return 0;
}
```

### Q38. Copy a string
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50], copy[50];
    scanf("%s", word);
    strcpy(copy, word);
    printf("%s\n", copy);
    return 0;
}
```

### Q39. Concatenate two strings
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word1[50], word2[50];
    scanf("%s %s", word1, word2);
    strcat(word1, word2);
    printf("%s\n", word1);
    return 0;
}
```

### Q40. Compare two strings
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word1[50], word2[50];
    scanf("%s %s", word1, word2);
    if (strcmp(word1, word2) == 0) {
        printf("Same\n");
    } else {
        printf("Different\n");
    }
    return 0;
}
```

### Q41. Print a string character by character
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    scanf("%s", word);
    for (int i = 0; i < strlen(word); i++) {
        printf("%c\n", word[i]);
    }
    return 0;
}
```

### Q42. Count vowels in a string
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    int count = 0;
    scanf("%s", word);
    for (int i = 0; i < strlen(word); i++) {
        if (word[i] == 'a' || word[i] == 'e' || word[i] == 'i' || word[i] == 'o' || word[i] == 'u') {
            count++;
        }
    }
    printf("%d\n", count);
    return 0;
}
```

### Q43. Reverse a string manually
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    scanf("%s", word);
    for (int i = strlen(word) - 1; i >= 0; i--) {
        printf("%c", word[i]);
    }
    printf("\n");
    return 0;
}
```

### Q44. Replace characters in a string
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    scanf("%s", word);
    for (int i = 0; i < strlen(word); i++) {
        if (word[i] == 'a') {
            word[i] = '*';
        }
    }
    printf("%s\n", word);
    return 0;
}
```

### Q45. Count the number of spaces in a sentence
```c
#include <stdio.h>
#include <string.h>
int main() {
    char sentence[] = "hello world from c";
    int count = 0;
    for (int i = 0; i < strlen(sentence); i++) {
        if (sentence[i] == ' ') {
            count++;
        }
    }
    printf("%d\n", count);
    return 0;
}
```

### Q46. Convert string to uppercase
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    scanf("%s", word);
    for (int i = 0; i < strlen(word); i++) {
        if (word[i] >= 'a' && word[i] <= 'z') {
            word[i] = word[i] - 32;
        }
    }
    printf("%s\n", word);
    return 0;
}
```

### Q47. Check if a string is a palindrome
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    int isPalindrome = 1;
    scanf("%s", word);
    int len = strlen(word);
    for (int i = 0; i < len / 2; i++) {
        if (word[i] != word[len - 1 - i]) {
            isPalindrome = 0;
        }
    }
    if (isPalindrome == 1) {
        printf("Palindrome\n");
    } else {
        printf("Not Palindrome\n");
    }
    return 0;
}
```

### Q48. Count specific character occurrences
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    char target;
    int count = 0;
    scanf("%s %c", word, &target);
    for (int i = 0; i < strlen(word); i++) {
        if (word[i] == target) {
            count++;
        }
    }
    printf("%d\n", count);
    return 0;
}
```

### Q49. Find the first occurrence of a character
```c
#include <stdio.h>
#include <string.h>
int main() {
    char word[50];
    char target;
    scanf("%s %c", word, &target);
    for (int i = 0; i < strlen(word); i++) {
        if (word[i] == target) {
            printf("%d\n", i);
            break;
        }
    }
    return 0;
}
```

### Q50. Mask a password string
```c
#include <stdio.h>
#include <string.h>
int main() {
    char password[50];
    scanf("%s", password);
    for (int i = 0; i < strlen(password); i++) {
        printf("*");
    }
    printf("\n");
    return 0;
}
```
