def edit_distance(str1: str, str2: str) -> int:
    """
    Compute the edit distance between two strings using dynamic programming.

    The edit distance is the minimum number of operations (insertions, deletions, substitutions)
    required to transform str1 into str2.

    Args:
    - str1 (str): The first string.
    - str2 (str): The second string.

    Returns:
    - int: The edit distance between str1 and str2.
    """

    # Initialise memoization table
    memo = [[float("inf") for _ in range(len(str2) + 1)] for _ in range(len(str1) + 1)]

    # Base case, $D(0,0) = 0$, $D(i,0) = i$, $D(0,j) = j$
    memo[0][0] = 0
    for i in range(1, len(str1) + 1):
        memo[i][0] = i
    for j in range(1, len(str2) + 1):
        memo[0][j] = j

    # See above recurrence relation
    for i in range(1, len(str1) + 1):
        for j in range(1, len(str2) + 1):
            insert = memo[i - 1][j] + 1
            delete = memo[i][j - 1] + 1
            substitute = memo[i - 1][j - 1] + (0 if str1[i - 1] == str2[j - 1] else 1)

            memo[i][j] = min(insert, delete, substitute)
    return memo[-1][-1]
