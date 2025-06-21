    # Testing GitHub Actions Workflows
    This file tests the newly implemented Claude integration workflows.
    ## Test Function
    Here's a function with an intentional bug for Claude to catch:
    ```javascript
    function calculateTotal(items) {
      let total = 0;
      for (let i = 0; i <= items.length; i++) { // This line has a bug
        total += items[i].price;
      }
      return total;
    }
    ```
    ```
5.  Make sure you are committing to the **`claude-workflows`** branch.
6.  Click **Commit changes...**.

---

Once you've done this, the `claude-workflows` branch will exist on GitHub with both new files. You can then go to the "Pull requests" tab and create a new pull request from `claude-workflows` into `master` to finally test the integration
