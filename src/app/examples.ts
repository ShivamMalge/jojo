export const starterCode = `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int first = 7;
    int second = 5;
    int total = add(first, second);

    if (total > 10) {
        printf("Big total: %d\\n", total);
    } else {
        printf("Small total: %d\\n", total);
    }

    return 0;
}
`;
