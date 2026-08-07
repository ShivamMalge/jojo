# 50 C Programming Questions (12th Std Level)
### With Explanation for Each

---

**Q1. Write a function to add two numbers and call it from main.**
Explanation: Introduces the basic idea of writing a separate function and calling it, instead of putting all logic inside `main()`.

**Q2. Find the factorial of a number using recursion.**
Explanation: Classic first recursion problem — shows how a function can call itself and how a "base case" stops it from running forever.

**Q3. Check if a number is prime using a function.**
Explanation: Practice writing a function that returns a true/false-style answer (1 or 0) based on a loop check.

**Q4. Find the GCD of two numbers using recursion.**
Explanation: Introduces the Euclidean algorithm and shows recursion being used for something more than just counting down.

**Q5. Find the GCD of two numbers using a loop.**
Explanation: Same problem as Q4, solved without recursion — good for comparing recursive vs iterative (loop-based) thinking.

**Q6. Compute x raised to the power n using recursion.**
Explanation: Reinforces recursion with a mathematical pattern (multiplying x by itself n times).

**Q7. Print the nth Fibonacci number using recursion.**
Explanation: A well-known example where a function calls itself twice — useful for understanding how recursive calls branch out.

**Q8. Write a function that returns the sum and difference of two numbers using pointers.**
Explanation: Shows how a function can "return" more than one value by writing directly into the caller's variables through pointers.

**Q9. Demonstrate basic pointer usage — print the address and value of a variable.**
Explanation: The first proper introduction to pointers — what an address is and how `*` gets the value stored there.

**Q10. Show the difference between pass by value and pass by reference.**
Explanation: A key concept — clarifies why changes inside a function sometimes affect the original variable and sometimes don't.

**Q11. Swap two numbers using pointers.**
Explanation: A practical use of pointers — swapping only works properly across functions when addresses are passed, not values.

**Q12. Show how an array name works like a pointer to its first element.**
Explanation: Connects arrays and pointers — a core C concept that many students find confusing at first.

**Q13. Traverse an array using pointer arithmetic instead of index numbers.**
Explanation: Builds comfort with moving a pointer forward through memory instead of always writing `arr[i]`.

**Q14. Write a function using pointers to find the largest element in an array.**
Explanation: Combines functions, arrays, and pointers together in one practical example.

**Q15. Declare a 2D array and print all its elements.**
Explanation: Introduces the idea of a "grid" of values (rows and columns) instead of a single line of values.

**Q16. Add two matrices using a function.**
Explanation: Extends 2D array knowledge into a real mathematical operation, using nested loops.

**Q17. Multiply two 2x2 matrices.**
Explanation: A step up from addition — introduces the row-by-column multiplication logic used in matrix math.

**Q18. Find the transpose of a matrix (swap rows and columns).**
Explanation: Reinforces 2D array indexing by flipping data from `mat[i][j]` to `mat[j][i]`.

**Q19. Find the sum of the diagonal elements of a square matrix.**
Explanation: A neat pattern-recognition exercise — diagonal elements always have the same row and column index.

**Q20. Create a structure to store a student's name and marks, then print it.**
Explanation: First introduction to `struct` — grouping different types of data (text and number) under one name.

**Q21. Store details of 3 students using an array of structures.**
Explanation: Shows how structures and arrays combine to store a list of records, like a mini database.

**Q22. Pass a structure to a function and display its data.**
Explanation: Demonstrates that structures, like normal variables, can be sent into functions.

**Q23. Demonstrate a nested structure (a structure inside another structure).**
Explanation: Shows how real-world data (like a date of birth inside a student record) is naturally represented with structures inside structures.

**Q24. Demonstrate a union and how its members share the same memory.**
Explanation: Introduces `union`, and highlights the key difference from `struct` — members share the same memory space instead of having separate space.

**Q25. Write your own version of strcpy using pointers (without the library function).**
Explanation: Helps understand what string library functions are actually doing behind the scenes.

**Q26. Find the length of a string without using strlen().**
Explanation: Reinforces that a C string is just characters ending in a special `\0` marker.

**Q27. Reverse a string in place using pointers.**
Explanation: Combines pointers and strings — uses two pointers moving toward each other from opposite ends.

**Q28. Write a function to check if a string is a palindrome.**
Explanation: Applies string comparison logic inside a reusable function.

**Q29. Count the vowels and consonants in a string.**
Explanation: Basic character-by-character string processing using conditions inside a loop.

**Q30. Sort an array using the bubble sort method.**
Explanation: First proper introduction to sorting algorithms — repeatedly swapping neighboring out-of-order elements.

**Q31. Sort an array using the selection sort method.**
Explanation: A second sorting technique to compare against bubble sort — repeatedly picks the smallest remaining element.

**Q32. Search for a number in an array using linear search.**
Explanation: The simplest searching method — check each element one by one until found.

**Q33. Search for a number in a sorted array using binary search.**
Explanation: A faster searching method that only works on sorted data — repeatedly cuts the search area in half.

**Q34. Find the second largest element in an array.**
Explanation: A slightly trickier array logic problem — needs careful tracking of two values instead of one.

**Q35. Remove duplicate elements from a sorted array (print only unique values).**
Explanation: Shows a simple technique for skipping repeated values when data is already sorted.

**Q36. Merge two arrays into a third array.**
Explanation: Practice copying values between arrays and understanding index offsets.

**Q37. Insert an element into an array at a given position.**
Explanation: Shows how to shift elements to make room for a new value, since arrays have fixed size.

**Q38. Delete an element from an array at a given position.**
Explanation: The reverse of insertion — shows shifting elements left to close the gap left behind.

**Q39. Reverse a number using recursion.**
Explanation: Applies recursion to a digit-manipulation problem, carrying a partial answer through each call.

**Q40. Check if a number is a palindrome using recursion.**
Explanation: Reuses the recursive reverse logic from Q39 to solve a related problem.

**Q41. Demonstrate a static variable that keeps its value between function calls.**
Explanation: Introduces `static` — a variable that remembers its value the next time the function runs, unlike normal local variables.

**Q42. Show the difference between a global variable and a local variable.**
Explanation: Clarifies scope — where a variable can be "seen" and used from different parts of a program.

**Q43. Build a simple menu-driven calculator using switch and functions.**
Explanation: Combines everything so far — user input, switch-case, and functions — into one small interactive program.

**Q44. Allocate memory for an array at runtime using malloc.**
Explanation: First introduction to dynamic memory — creating space for data while the program is running, instead of fixing the size in advance.

**Q45. Write a function that uses pointers to find the sum of array elements.**
Explanation: Reinforces pointer arithmetic while solving a familiar array problem.

**Q46. Store and print a list of names using an array of strings.**
Explanation: Introduces 2D character arrays as a way to store multiple strings together.

**Q47. Write data to a text file.**
Explanation: First introduction to file handling — saving program output outside the program itself.

**Q48. Read and print data from a text file.**
Explanation: The reverse of Q47 — shows how a program can read back previously saved data.

**Q49. Count the number of lines in a text file.**
Explanation: Combines file reading with a simple counter, a common real-world file-processing task.

**Q50. Combine structures and functions to store and display marks of multiple students.**
Explanation: A final wrap-up question that brings together structures, arrays, and functions in one practical program.
