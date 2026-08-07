# 50 C Programming Questions & Answers
### For 12th Std Students (Slightly Advanced Basics)

---

### Q1. Write a function to add two numbers and call it from main.
```c
#include <stdio.h>
int add(int a, int b) {          // function definition
    return a + b;
}
int main() {
    int result = add(5, 7);      // function call
    printf("%d", result);
    return 0;
}
```

### Q2. Find the factorial of a number using recursion.
```c
#include <stdio.h>
int factorial(int n) {
    if (n == 0)               // base case stops the recursion
        return 1;
    return n * factorial(n - 1); // function calls itself
}
int main() {
    printf("%d", factorial(5));
    return 0;
}
```

### Q3. Check if a number is prime using a function.
```c
#include <stdio.h>
int isPrime(int n) {
    for (int i = 2; i < n; i++)
        if (n % i == 0)
            return 0;          // not prime
    return 1;                 // prime
}
int main() {
    if (isPrime(13))
        printf("Prime");
    else
        printf("Not Prime");
    return 0;
}
```

### Q4. Find the GCD of two numbers using recursion.
```c
#include <stdio.h>
int gcd(int a, int b) {
    if (b == 0)             // base case
        return a;
    return gcd(b, a % b);   // recursive call
}
int main() {
    printf("%d", gcd(24, 36));
    return 0;
}
```

### Q5. Find the GCD of two numbers using a loop.
```c
#include <stdio.h>
int main() {
    int a = 24, b = 36;
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    printf("%d", a); // a now holds the GCD
    return 0;
}
```

### Q6. Compute x raised to the power n using recursion.
```c
#include <stdio.h>
int power(int x, int n) {
    if (n == 0)
        return 1;              // anything ^ 0 = 1
    return x * power(x, n - 1);
}
int main() {
    printf("%d", power(2, 5)); // 2^5 = 32
    return 0;
}
```

### Q7. Print the nth Fibonacci number using recursion.
```c
#include <stdio.h>
int fib(int n) {
    if (n == 0 || n == 1)   // base cases
        return n;
    return fib(n - 1) + fib(n - 2);
}
int main() {
    printf("%d", fib(6));
    return 0;
}
```

### Q8. Write a function that returns the sum and difference of two numbers using pointers.
```c
#include <stdio.h>
void calc(int a, int b, int *sum, int *diff) {
    *sum = a + b;   // store result at the given address
    *diff = a - b;
}
int main() {
    int s, d;
    calc(10, 4, &s, &d);   // pass addresses so function can update them
    printf("Sum=%d Diff=%d", s, d);
    return 0;
}
```

### Q9. Demonstrate basic pointer usage — print the address and value of a variable.
```c
#include <stdio.h>
int main() {
    int a = 25;
    int *p = &a;          // p stores the address of a
    printf("Value = %d\n", *p);   // *p gives the value at that address
    printf("Address = %p", (void*)p);
    return 0;
}
```

### Q10. Show the difference between pass by value and pass by reference.
```c
#include <stdio.h>
void byValue(int x) { x = x + 10; }        // change stays local
void byReference(int *x) { *x = *x + 10; } // change affects original
int main() {
    int a = 5;
    byValue(a);
    printf("After byValue: %d\n", a);   // still 5
    byReference(&a);
    printf("After byReference: %d", a); // becomes 15
    return 0;
}
```

### Q11. Swap two numbers using pointers.
```c
#include <stdio.h>
void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}
int main() {
    int a = 3, b = 8;
    swap(&a, &b);
    printf("a=%d b=%d", a, b);
    return 0;
}
```

### Q12. Show how an array name works like a pointer to its first element.
```c
#include <stdio.h>
int main() {
    int arr[3] = {10, 20, 30};
    printf("%d\n", *arr);      // same as arr[0]
    printf("%d", *(arr + 1));  // same as arr[1]
    return 0;
}
```

### Q13. Traverse an array using pointer arithmetic instead of index numbers.
```c
#include <stdio.h>
int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int *p = arr;
    for (int i = 0; i < 5; i++) {
        printf("%d ", *(p + i)); // move pointer forward instead of arr[i]
    }
    return 0;
}
```

### Q14. Write a function using pointers to find the largest element in an array.
```c
#include <stdio.h>
int largest(int *arr, int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++)
        if (arr[i] > max)
            max = arr[i];
    return max;
}
int main() {
    int arr[5] = {4, 9, 2, 7, 5};
    printf("%d", largest(arr, 5));
    return 0;
}
```

### Q15. Declare a 2D array and print all its elements.
```c
#include <stdio.h>
int main() {
    int mat[2][3] = {{1, 2, 3}, {4, 5, 6}};
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++)
            printf("%d ", mat[i][j]);
        printf("\n");
    }
    return 0;
}
```

### Q16. Add two matrices using a function.
```c
#include <stdio.h>
void addMatrix(int a[2][2], int b[2][2], int c[2][2]) {
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            c[i][j] = a[i][j] + b[i][j];
}
int main() {
    int a[2][2] = {{1, 2}, {3, 4}};
    int b[2][2] = {{5, 6}, {7, 8}};
    int c[2][2];
    addMatrix(a, b, c);
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++)
            printf("%d ", c[i][j]);
        printf("\n");
    }
    return 0;
}
```

### Q17. Multiply two 2x2 matrices.
```c
#include <stdio.h>
int main() {
    int a[2][2] = {{1, 2}, {3, 4}};
    int b[2][2] = {{5, 6}, {7, 8}};
    int c[2][2] = {0};
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++)
                c[i][j] += a[i][k] * b[k][j]; // multiply-and-add rule
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 2; j++)
            printf("%d ", c[i][j]);
        printf("\n");
    }
    return 0;
}
```

### Q18. Find the transpose of a matrix (swap rows and columns).
```c
#include <stdio.h>
int main() {
    int mat[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int trans[3][2];
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 3; j++)
            trans[j][i] = mat[i][j]; // flip row/column position
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 2; j++)
            printf("%d ", trans[i][j]);
        printf("\n");
    }
    return 0;
}
```

### Q19. Find the sum of the diagonal elements of a square matrix.
```c
#include <stdio.h>
int main() {
    int mat[3][3] = {{1,2,3},{4,5,6},{7,8,9}};
    int sum = 0;
    for (int i = 0; i < 3; i++)
        sum += mat[i][i]; // row index == column index
    printf("%d", sum);
    return 0;
}
```

### Q20. Create a structure to store a student's name and marks, then print it.
```c
#include <stdio.h>
struct Student {
    char name[20];
    int marks;
};
int main() {
    struct Student s1 = {"Anita", 88};
    printf("%s scored %d", s1.name, s1.marks);
    return 0;
}
```

### Q21. Store details of 3 students using an array of structures.
```c
#include <stdio.h>
struct Student {
    char name[20];
    int marks;
};
int main() {
    struct Student list[3] = {
        {"Amit", 78}, {"Bina", 92}, {"Chetan", 65}
    };
    for (int i = 0; i < 3; i++)
        printf("%s: %d\n", list[i].name, list[i].marks);
    return 0;
}
```

### Q22. Pass a structure to a function and display its data.
```c
#include <stdio.h>
struct Point {
    int x, y;
};
void show(struct Point p) {  // structure passed as parameter
    printf("(%d, %d)", p.x, p.y);
}
int main() {
    struct Point p1 = {3, 7};
    show(p1);
    return 0;
}
```

### Q23. Demonstrate a nested structure (a structure inside another structure).
```c
#include <stdio.h>
struct Date {
    int day, month, year;
};
struct Student {
    char name[20];
    struct Date dob; // structure inside a structure
};
int main() {
    struct Student s1 = {"Rohit", {15, 8, 2007}};
    printf("%s was born on %d-%d-%d", s1.name, s1.dob.day, s1.dob.month, s1.dob.year);
    return 0;
}
```

### Q24. Demonstrate a union and how its members share the same memory.
```c
#include <stdio.h>
union Data {
    int i;
    float f;
};
int main() {
    union Data d;
    d.i = 10;
    printf("i = %d\n", d.i);
    d.f = 5.5;                 // overwrites the same memory used by i
    printf("f = %.1f", d.f);
    return 0;
}
```

### Q25. Write your own version of strcpy using pointers (without the library function).
```c
#include <stdio.h>
void myStrCopy(char *dest, char *src) {
    while (*src != '\0') {      // stop at the end of the string
        *dest = *src;
        dest++;
        src++;
    }
    *dest = '\0'; // terminate the copied string
}
int main() {
    char src[] = "College";
    char dest[20];
    myStrCopy(dest, src);
    printf("%s", dest);
    return 0;
}
```

### Q26. Find the length of a string without using strlen().
```c
#include <stdio.h>
int myStrLen(char str[]) {
    int count = 0;
    while (str[count] != '\0') // count until the end marker
        count++;
    return count;
}
int main() {
    char str[] = "Hello";
    printf("%d", myStrLen(str));
    return 0;
}
```

### Q27. Reverse a string in place using pointers.
```c
#include <stdio.h>
#include <string.h>
int main() {
    char str[] = "college";
    int len = strlen(str);
    char *start = str, *end = str + len - 1;
    while (start < end) {
        char temp = *start;
        *start = *end;
        *end = temp;
        start++;
        end--;
    }
    printf("%s", str);
    return 0;
}
```

### Q28. Write a function to check if a string is a palindrome.
```c
#include <stdio.h>
#include <string.h>
int isPalindrome(char str[]) {
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++)
        if (str[i] != str[len - 1 - i])
            return 0;
    return 1;
}
int main() {
    char str[] = "madam";
    if (isPalindrome(str))
        printf("Palindrome");
    else
        printf("Not Palindrome");
    return 0;
}
```

### Q29. Count the vowels and consonants in a string.
```c
#include <stdio.h>
#include <string.h>
int main() {
    char str[] = "programming";
    int vowels = 0, consonants = 0;
    for (int i = 0; i < strlen(str); i++) {
        char c = str[i];
        if (c=='a'||c=='e'||c=='i'||c=='o'||c=='u')
            vowels++;
        else
            consonants++;
    }
    printf("Vowels=%d Consonants=%d", vowels, consonants);
    return 0;
}
```

### Q30. Sort an array using the bubble sort method.
```c
#include <stdio.h>
int main() {
    int arr[5] = {5, 2, 8, 1, 9};
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4 - i; j++)
            if (arr[j] > arr[j+1]) {         // swap if out of order
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
    for (int i = 0; i < 5; i++)
        printf("%d ", arr[i]);
    return 0;
}
```

### Q31. Sort an array using the selection sort method.
```c
#include <stdio.h>
int main() {
    int arr[5] = {5, 2, 8, 1, 9};
    for (int i = 0; i < 4; i++) {
        int minIndex = i;
        for (int j = i+1; j < 5; j++)
            if (arr[j] < arr[minIndex])
                minIndex = j;         // remember position of smallest
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
    for (int i = 0; i < 5; i++)
        printf("%d ", arr[i]);
    return 0;
}
```

### Q32. Search for a number in an array using linear search.
```c
#include <stdio.h>
int main() {
    int arr[5] = {4, 8, 15, 16, 23};
    int key = 15, found = -1;
    for (int i = 0; i < 5; i++)
        if (arr[i] == key) {
            found = i;
            break;
        }
    if (found != -1)
        printf("Found at index %d", found);
    else
        printf("Not found");
    return 0;
}
```

### Q33. Search for a number in a sorted array using binary search.
```c
#include <stdio.h>
int main() {
    int arr[6] = {2, 4, 6, 8, 10, 12};
    int key = 8, low = 0, high = 5, mid, found = -1;
    while (low <= high) {
        mid = (low + high) / 2;
        if (arr[mid] == key) { found = mid; break; }
        else if (arr[mid] < key) low = mid + 1; // search right half
        else high = mid - 1;                    // search left half
    }
    if (found != -1)
        printf("Found at index %d", found);
    else
        printf("Not found");
    return 0;
}
```

### Q34. Find the second largest element in an array.
```c
#include <stdio.h>
int main() {
    int arr[5] = {12, 45, 2, 41, 31};
    int first = arr[0], second = -1;
    for (int i = 1; i < 5; i++) {
        if (arr[i] > first) {
            second = first;
            first = arr[i];
        } else if (arr[i] > second && arr[i] != first) {
            second = arr[i];
        }
    }
    printf("%d", second);
    return 0;
}
```

### Q35. Remove duplicate elements from a sorted array (print only unique values).
```c
#include <stdio.h>
int main() {
    int arr[7] = {1, 1, 2, 3, 3, 4, 5};
    printf("%d ", arr[0]);
    for (int i = 1; i < 7; i++)
        if (arr[i] != arr[i-1]) // only print if different from previous
            printf("%d ", arr[i]);
    return 0;
}
```

### Q36. Merge two arrays into a third array.
```c
#include <stdio.h>
int main() {
    int a[3] = {1, 2, 3};
    int b[3] = {4, 5, 6};
    int c[6];
    for (int i = 0; i < 3; i++) c[i] = a[i];      // copy first array
    for (int i = 0; i < 3; i++) c[i+3] = b[i];    // append second array
    for (int i = 0; i < 6; i++) printf("%d ", c[i]);
    return 0;
}
```

### Q37. Insert an element into an array at a given position.
```c
#include <stdio.h>
int main() {
    int arr[6] = {1, 2, 4, 5, 6}; // one empty slot at the end
    int n = 5, pos = 2, value = 3;
    for (int i = n; i > pos; i--)
        arr[i] = arr[i-1]; // shift elements right to make space
    arr[pos] = value;
    for (int i = 0; i <= n; i++)
        printf("%d ", arr[i]);
    return 0;
}
```

### Q38. Delete an element from an array at a given position.
```c
#include <stdio.h>
int main() {
    int arr[5] = {10, 20, 30, 40, 50};
    int n = 5, pos = 2;
    for (int i = pos; i < n-1; i++)
        arr[i] = arr[i+1]; // shift elements left to fill the gap
    n--;
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    return 0;
}
```

### Q39. Reverse a number using recursion.
```c
#include <stdio.h>
int reverse(int n, int rev) {
    if (n == 0)
        return rev;
    return reverse(n / 10, rev * 10 + n % 10); // build reversed number step by step
}
int main() {
    printf("%d", reverse(1234, 0));
    return 0;
}
```

### Q40. Check if a number is a palindrome using recursion.
```c
#include <stdio.h>
int reverse(int n, int rev) {
    if (n == 0)
        return rev;
    return reverse(n / 10, rev * 10 + n % 10);
}
int main() {
    int n = 121;
    if (n == reverse(n, 0))
        printf("Palindrome");
    else
        printf("Not Palindrome");
    return 0;
}
```

### Q41. Demonstrate a static variable that keeps its value between function calls.
```c
#include <stdio.h>
void counter() {
    static int count = 0; // keeps its value across calls, unlike a normal local variable
    count++;
    printf("%d ", count);
}
int main() {
    counter();
    counter();
    counter(); // prints 1 2 3, not 1 1 1
    return 0;
}
```

### Q42. Show the difference between a global variable and a local variable.
```c
#include <stdio.h>
int x = 100; // global variable, visible everywhere in the file
void show() {
    int x = 5; // local variable, only exists inside this function
    printf("Local x = %d\n", x);
}
int main() {
    show();
    printf("Global x = %d", x); // main sees the global one
    return 0;
}
```

### Q43. Build a simple menu-driven calculator using switch and functions.
```c
#include <stdio.h>
int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int main() {
    int choice, a = 10, b = 5;
    printf("1. Add  2. Subtract\n");
    scanf("%d", &choice);
    switch (choice) {
        case 1: printf("%d", add(a, b)); break;
        case 2: printf("%d", sub(a, b)); break;
        default: printf("Invalid choice");
    }
    return 0;
}
```

### Q44. Allocate memory for an array at runtime using malloc.
```c
#include <stdio.h>
#include <stdlib.h>
int main() {
    int n = 5;
    int *arr = (int*) malloc(n * sizeof(int)); // request memory for 5 integers
    for (int i = 0; i < n; i++)
        arr[i] = i * 2;
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    free(arr); // release the memory when done
    return 0;
}
```

### Q45. Write a function that uses pointers to find the sum of array elements.
```c
#include <stdio.h>
int sumArray(int *arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum += *(arr + i); // pointer version of arr[i]
    return sum;
}
int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    printf("%d", sumArray(arr, 5));
    return 0;
}
```

### Q46. Store and print a list of names using an array of strings.
```c
#include <stdio.h>
int main() {
    char names[3][20] = {"Aarav", "Diya", "Kabir"}; // 3 rows, 20 characters each
    for (int i = 0; i < 3; i++)
        printf("%s\n", names[i]);
    return 0;
}
```

### Q47. Write data to a text file.
```c
#include <stdio.h>
int main() {
    FILE *fp = fopen("data.txt", "w"); // open file in write mode
    if (fp == NULL) {
        printf("Could not open file");
        return 1;
    }
    fprintf(fp, "Hello, this is stored in a file.");
    fclose(fp); // always close the file when done
    return 0;
}
```

### Q48. Read and print data from a text file.
```c
#include <stdio.h>
int main() {
    char buffer[100];
    FILE *fp = fopen("data.txt", "r"); // open file in read mode
    if (fp == NULL) {
        printf("Could not open file");
        return 1;
    }
    while (fgets(buffer, 100, fp) != NULL) // read line by line
        printf("%s", buffer);
    fclose(fp);
    return 0;
}
```

### Q49. Count the number of lines in a text file.
```c
#include <stdio.h>
int main() {
    char buffer[100];
    int lines = 0;
    FILE *fp = fopen("data.txt", "r");
    if (fp == NULL) {
        printf("Could not open file");
        return 1;
    }
    while (fgets(buffer, 100, fp) != NULL)
        lines++; // one line read = one line counted
    fclose(fp);
    printf("%d", lines);
    return 0;
}
```

### Q50. Combine structures and functions to store and display marks of multiple students.
```c
#include <stdio.h>
struct Student {
    char name[20];
    int marks;
};
void display(struct Student list[], int n) {
    for (int i = 0; i < n; i++)
        printf("%s: %d\n", list[i].name, list[i].marks);
}
int main() {
    struct Student list[3] = {
        {"Neha", 91}, {"Karan", 84}, {"Priya", 77}
    };
    display(list, 3); // pass whole array of structures to a function
    return 0;
}
```
