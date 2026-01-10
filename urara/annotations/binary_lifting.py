def binary_lift(root: TreeNode[T], N: int) -> list[list[int]]:
    """
    Perform binary lifting on the given tree rooted at `root`.

    Args:
    - node (TreeNode[T]): The starting node.
    - N (int): The number of nodes in the tree.

    Returns:
    - list[list[int]]: The binary lifting table.
    """
    # The number of levels required
    L = math.ceil(math.log2(N)) + 1

    # $\text{memo}[v][i]$ = $2^v$-th ancestor of node $i$
    memo = [[-1 for _ in range(N + 1)] for _ in range(L)]  # Take -1 to be null

    def dfs(current: TreeNode[T]):
        # Do a DFS to populate $\text{memo}[0][i]$
        if current.left is None and current.right is None:
            return
        else:
            if current.left is not None:
                memo[0][current.left.val] = current.val
                dfs(current.left)
            if current.right is not None:
                memo[0][current.right.val] = current.val
                dfs(current.right)

    dfs(root)

    """
    $\text{memo}[j][i] = \text{memo}[j-1][\text{memo}[j-1][i]]$

    If there is no ancestor i.e -1, keep it as -1
    """
    for j in range(1, L):
        for i in range(1, N + 1):
            ancestor = memo[j - 1][i]  # 2^(j-1)th ancestor of i
            if ancestor != -1:
                memo[j][i] = memo[j - 1][ancestor]  # 2^jth overall

    return memo


def get_kth_ancestor(node: int, k: int) -> int:
    """
    Downstream application to get the k-th ancestor of a node using the binary lift table.
    """

    current = node
    """
    Look through the binary representation of k, and jump
    when the $2^i$ bit is set. Stop if we reach -1 (null ancestor).
    """
    for i in range(self.L):
        if k & (1 << i):
            current = self.memo[i][current]
            if current == -1:
                return current
    return current
