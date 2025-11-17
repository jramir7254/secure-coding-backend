


const QUESTION_ROWS = [
    {
        "title": "Compile-Time Detective",
        "type": "mcq",
        "mode": "select",
        "intent": "concept",
        "difficulty": "medium",
        "tags": ["compile", "runtime"],
        "description": ''
    },
    {
        "title": "🧩 Work Order #1427 — Checkout System Incident Report",
        "type": "coding",
        "difficulty": "medium",
        "tags": "security, validation, business-logic",
        "value": "\n## 🧾 Work Order #2047 — Convenience Store Cart System Bug Report\n\n### Overview\n\nQA testers have reported **intermittent crashes and incorrect totals** in the **Shopping Cart** module of our Convenience Store app.\nUnder certain input conditions, the application terminates abruptly or calculates totals incorrectly.\n\nReports indicate that this occurs when:\n\n- Customers enter **invalid or negative quantities**\n- They attempt to **add non-existent products** (e.g. item number out of range)\n- The user presses **Enter without typing anything**\n\nWe’ve attached the following files:\n\n- `ConvenienceStore.java`\n- `Product.java`\n- `ShoppingCart.java`\n- `CartItem.java`\n\n### Your Task\n\nInvestigate `ConvenienceStore.java`, specifically the section handling **user input and cart updates**.\n\nIdentify why the application crashes or shows incorrect behavior, then apply a **robust fix** that safely handles invalid user inputs **without changing the main business logic**.\n\n#### Requirements\n\nYour patch must:\n\n1. **Prevent runtime exceptions** when users enter:\n\n   - Non-numeric input (e.g. `\"apple\"` instead of `\"1\"`)\n   - Negative or zero quantities\n   - Invalid product indices (e.g. selecting item #10 when only 5 exist)\n   - Empty input lines\n\n2. **Gracefully handle bad input**\n   Print a clear warning message (e.g. `\"⚠️ Invalid input. Please try again.\"`) and re-prompt the user.\n3. **Maintain correct totals** for valid purchases only.\n4. **Do not modify** other source files (`Product.java`, `ShoppingCart.java`, etc.).\n5. Ensure that checkout (`0` to exit) still works correctly.\n\n### Context\n\nThe **Convenience Store** application simulates a basic point-of-sale system.\nIt lists available products, allows customers to select items by number, and keeps a running total in the cart.\n\nCurrently, invalid terminal input (especially strings or negative numbers) can cause the program to crash due to unhandled exceptions in `Scanner.nextInt()` or logic errors when indexing the product list.\n\n### Example of Problematic Behavior\n\n```\nSelect an item by number (or 0 to checkout): apple\nException in thread \"main\" java.util.InputMismatchException\n\nSelect an item by number (or 0 to checkout): 7\nIndexOutOfBoundsException: Index 6 out of bounds for length 5\n```\n\n### Deliverables\n\nYour fix should:\n\n- Eliminate all runtime crashes for invalid input\n- Display user-friendly error messages\n- Allow continuous input until checkout\n- Produce correct total at the end\n"
    },
    // {
    //     "title": "💥 Work Order #1623 — Transaction Processor Crash Report",
    //     "type": "coding",
    //     "difficulty": "medium",
    //     "tags": "runtime, input-validation, robustness",
    //     "description": "### Overview\nOur **Transaction Processing** module has been intermittently crashing in production.  \nQA testers noticed that the system sometimes halts or prints stack traces when invalid or empty transaction amounts are entered.\n\nWe’ve attached the last reported transactions (`transactions.txt`) and the relevant source code files.\n\n---\n\n### Your Task\n- Investigate `TransactionProcessor.java`.\n- Identify **why the program crashes** or **prints incorrect totals**.\n- Patch the code to **safely handle bad or missing inputs**, including:\n  - Non-numeric strings (e.g. `abc`)\n  - Empty or null lines\n  - Negative or zero amounts\n- Prevent runtime exceptions while preserving intended behavior.\n\n---\n\n### Context\nThis module reads user inputs from the terminal and aggregates them into a running balance.  \nSee `TransactionValidator.java` and `Formatter.java` for reference helpers.\n\n⚠️ **Do not modify** any file except the editable region inside `TransactionProcessor.java`.  \nOnce fixed, re-run the app with the sample data from `transactions.txt`.\n\n---\n\n### Deliverables\nYour fix should:\n- Eliminate crashes for all input types\n- Gracefully skip invalid transactions\n- Maintain accurate totals\n\n---\n\n### Hint\nBe careful where and how you parse input.  \nCheck for empty lines and non-numeric data **before** converting to `double`.  \nAlso ensure the list of transactions isn’t corrupted by null or invalid entries."
    // },

    // {
    //     "title": "🔐 Work Order #1778 — Login Anomaly Investigation",
    //     "type": "interactive",
    //     "difficulty": "hard",
    //     "tags": "vulnerability, auth, logic",
    //     "description": "### Overview\nSecurity monitoring has flagged unusual successful logins to the admin account from simple or partial passwords. The authentication module is legacy-heavy and noisy; QA suspects a logic error in the auth utility.\n\n---\n\n### Your Task\nAs the assigned engineer, investigate the login flow and identify how the `admin` account can be authenticated without the full password. You will not change source files — this is an interactive investigation. Use the login UI (or stdin) to submit username + password attempts and observe program output.\n\n---\n\n### Context\nThe small login app reads a username and password from stdin and calls `AuthUtils.authenticate(user, pass)`. The flag is stored in `data/flag.txt` and printed only on success.\n\n**Do not edit source files.** Your job is to discover an input pair that triggers authentication and reveals the flag. Treat this like an internal security lab exercise: read the code, reason about legacy checks, and craft inputs accordingly.\n\n---\n\n### Deliverables\n- A username + password input that results in stdout containing a line with `FLAG{...}`.\n- A short explanation (in your submission notes) of which logic in `AuthUtils` made the bypass possible.\n\n---\n\n### Hints\n- Look for legacy shortcuts and special-case string operations (prefix checks, substring checks, length-based checks). They often introduce bypasses.\n- The user store contains several similar usernames to add noise.\n\nThis is an interactive challenge — provide the username and password via the UI. The platform should run `LoginApp` with those two lines as stdin."
    // }

];


const CODE_FILES_ROWS = [
    // --- Question 1 (compile-time example) ---
    {
        question_id: 1,
        name: "README.md",
        language: "markdown",
        value: `## Compile-Time Detective

### Scenario
You’ve been given a messy Java project full of unrelated classes and filler code.

One of the files contains a **compile-time error** that prevents the project from building.

### Objective
Identify the **type** of error hidden in the code.

You don’t need to fix it — just select whether it’s a compile-time, runtime, logic, or vulnerability issue.

> Hint: Read carefully! Some files include misleading or unused code.`,
        editable_ranges: [],
        display_order: 0
    },

    {
        question_id: 1,
        name: "MainApp.java",
        language: "java",
        value: `package app;
import utils.Helper;
import services.Calculator;
import models.Record;
import java.util.*;

public class MainApp {
    public static void main(String[] args) {
        System.out.println("Starting App...");

        List<Record> records = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            records.add(new Record("user" + i, i * 10));
        }

        Calculator calc = new Calculator();
        try {
            int sum = calc.sumValues(records);
            System.out.println("Sum: " + sum);
        } catch (Exception e) {
            System.out.println("Error computing sum: " + e.getMessage());
        }

        System.out.println(Helper.renderBanner("Demo"));
        Helper.unusedUtility();
    }
}`,
        editable_ranges: [],
        display_order: 1
    },

    {
        question_id: 1,
        name: "Record.java",
        language: "java",
        value: `package models;

public class Record {
    private String id;
    private int value;
    private boolean active;

    public Record(String id, int value) {
        this.id = id;
        this.value = value;
        this.active = true;
    }

    public String getId() { return id; }
    public int getValue() { return value; }
    public boolean isActive() { return active; }

    public void flipActive() {
        this.active = !this.active;
    }

    public String dump() {
        return id + ":" + value + ":" + (active ? "A" : "I");
    }
}`,
        editable_ranges: [],
        display_order: 2
    },

    {
        question_id: 1,
        name: "Helper.java",
        language: "java",
        value: `package utils;

import java.util.*;

public class Helper {
    public static String renderBanner(String title) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== ").append(title).append(" ===");
        return sb.toString();
    }

    public static void unusedUtility() {
        for (int i = 0; i < 5; i++) {
            System.out.println("noop " + i);
        }
    }

    public static int[] generateSequence(int n) {
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = i;
        return arr;
    }
}`,
        editable_ranges: [],
        display_order: 3
    },

    {
        question_id: 1,
        name: "Calculator.java",
        language: "java",
        value: `package services;

import models.Record;
import java.util.*;

public class Calculator {
    public int sumValues(List<Record> records) {
        int total = 0;
        for (Record r : records) {
            if (r == null) continue;
            total += r.getValue();
        }
        return total;
    }

    public int compute(int a, int b) {
        if (a > b) {
            a + b;  // <-- Compile-time error: statement has no effect
        } else {
            return a - b;
        }
    }

    public String format(int v) {
        return "v=" + v;
    }
}`,
        editable_ranges: [],
        display_order: 4
    },

    {
        question_id: 1,
        name: "LegacyAdapter.java",
        language: "java",
        value: `package services;

public class LegacyAdapter {
    public static void adapt() {
        // Legacy placeholder
    }
}`,
        editable_ranges: [],
        display_order: 5
    },
    {
        question_id: 1,
        "name": "Main2.java",
        "value": "package store;\r\n\r\nimport java.util.Arrays;\r\nimport java.util.List;\r\nimport java.util.Scanner;\r\n\r\npublic class KircleC {\r\n    public static void main(String[] args) {\r\n        Scanner scanner = new Scanner(System.in);\r\n\r\n        // Sample products\r\n        List<Product> products = Arrays.asList(\r\n                new Product(\"Three dollar meal deal\", \"Something to get you by\", 1.50),\r\n                new Product(\"four dollar meal deal\", \"Something to get you going\", 1.50),\r\n                new Product(\"Five dollar meal deal\", \"Something to get you by\", 1.50));\r\n\r\n        ShoppingCart cart = new ShoppingCart();\r\n\r\n        System.out.println(\"Welcome to the Neighborhood Convenience Store!\");\r\n        boolean shopping = true;\r\n\r\n        while (shopping) {\r\n            System.out.println(\"\\nAvailable Products:\");\r\n            for (int i = 0; i < products.size(); i++) {\r\n                System.out.println((i + 1) + \". \" + products.get(i));\r\n            }\r\n\r\n            System.out.print(\"Select an item by number (or 0 to checkout): \");\r\n            int choice = scanner.nextInt();\r\n\r\n            if (choice == 0) {\r\n                shopping = false;\r\n                break;\r\n            }\r\n\r\n            if (choice > 0 && choice <= products.size()) {\r\n                System.out.print(\"Enter quantity: \");\r\n                int qty = scanner.nextInt();\r\n\r\n                Product selected = products.get(choice - 1);\r\n                cart.addItem(selected, qty);\r\n                System.out.println(qty + \" x \" + selected.getName() + \" added to your cart.\");\r\n            } else {\r\n                System.out.println(\"Invalid selection. Please try again.\");\r\n            }\r\n        }\r\n\r\n        // Checkout summary\r\n        cart.displayCart();\r\n        System.out.println(\"\\n💳 Thank you for shopping with us!\");\r\n        scanner.close();\r\n    }\r\n}\r\n",
        language: "java",
        editable_ranges: [],
        display_order: 6
    },
















    {
        "question_id": 2,
        "name": "CartItem.java",
        "language": "java",
        "editable_ranges": "[[1,2], [4,5]]",
        "display_order": "2",
        "value": "// CartItem.java// ============================================================// Tiny class — simple enough but still hides small traps// ============================================================public class CartItem {    private Product product;    private int qty;    public CartItem(Product product, int qty) {        this.product = product;        this.qty = qty;    }    /**     * =========================== [START EDITABLE AREA] ===========================     */    public double getTotal() {        double price = product.getPrice();        double total = price * qty;        return total;    }    // unnecessary formatting method    private String randomPadding() {        return \"###\" + product.getName().length();    }    /**     * =========================== [END EDITABLE AREA] ===========================     */    @Override    public String toString() {        return product.getName() + \" x\" + qty + \" = $\" + String.format(\"%.2f\", getTotal()) + \" \" + randomPadding();    }}"
    },
    {
        "question_id": 2,
        "name": "instructions.md",
        "language": "markdown",
        "editable_ranges": "[]",
        "display_order": "4",
        "value": "## 🧾 Work Order #2047 — Convenience Store Cart System Bug Report### OverviewQA testers have reported **intermittent crashes and incorrect totals** in the **Shopping Cart** module of our Convenience Store app.Under certain input conditions, the application terminates abruptly or calculates totals incorrectly.Reports indicate that this occurs when:- Customers enter **invalid or negative quantities**- They attempt to **add non-existent products** (e.g. item number out of range)- The user presses **Enter without typing anything**We’ve attached the following files:- `ConvenienceStore.java`- `Product.java`- `ShoppingCart.java`- `CartItem.java`### Your TaskInvestigate `ConvenienceStore.java`, specifically the section handling **user input and cart updates**.Identify why the application crashes or shows incorrect behavior, then apply a **robust fix** that safely handles invalid user inputs **without changing the main business logic**.#### RequirementsYour patch must:1. **Prevent runtime exceptions** when users enter:   - Non-numeric input (e.g. `\"apple\"` instead of `\"1\"`)   - Negative or zero quantities   - Invalid product indices (e.g. selecting item #10 when only 5 exist)   - Empty input lines2. **Gracefully handle bad input**   Print a clear warning message (e.g. `\"⚠️ Invalid input. Please try again.\"`) and re-prompt the user.3. **Maintain correct totals** for valid purchases only.4. **Do not modify** other source files (`Product.java`, `ShoppingCart.java`, etc.).5. Ensure that checkout (`0` to exit) still works correctly.### ContextThe **Convenience Store** application simulates a basic point-of-sale system.It lists available products, allows customers to select items by number, and keeps a running total in the cart.Currently, invalid terminal input (especially strings or negative numbers) can cause the program to crash due to unhandled exceptions in `Scanner.nextInt()` or logic errors when indexing the product list.### Example of Problematic Behavior```Select an item by number (or 0 to checkout): appleException in thread \"main\" java.util.InputMismatchExceptionSelect an item by number (or 0 to checkout): 7IndexOutOfBoundsException: Index 6 out of bounds for length 5```### DeliverablesYour fix should:- Eliminate all runtime crashes for invalid input- Display user-friendly error messages- Allow continuous input until checkout- Produce correct total at the end"
    },
    {
        "question_id": 2,
        "name": "KircleC.java",
        "language": "java",
        "editable_ranges": [[1, 2], [4, 5]],
        "display_order": "0",
        "value": "import java.util.Arrays;import java.util.List;import java.util.Scanner;public class KircleC {    public static void main(String[] args) {        Scanner scanner = new Scanner(System.in);        // Sample products        List<Product> products = Arrays.asList(                new Product(\"Three dollar meal deal\", \"Something to get you by\", 1.50),                new Product(\"four dollar meal deal\", \"Something to get you going\", 1.50),                new Product(\"Five dollar meal deal\", \"Something to get you by\", 1.50));        ShoppingCart cart = new ShoppingCart();        System.out.println(\"Welcome to the Neighborhood Convenience Store!\");        boolean shopping = true;        while (shopping) {            System.out.println(\"\\nAvailable Products:\");            for (int i = 0; i < products.size(); i++) {                System.out.println((i + 1) + \". \" + products.get(i));            }            System.out.print(\"Select an item by number (or 0 to checkout): \");            int choice = scanner.nextInt();            if (choice == 0) {                shopping = false;                break;            }            if (choice > 0 && choice <= products.size()) {                System.out.print(\"Enter quantity: \");                int qty = scanner.nextInt();                Product selected = products.get(choice - 1);                cart.addItem(selected, qty);                System.out.println(qty + \" x \" + selected.getName() + \" added to your cart.\");            } else {                System.out.println(\"Invalid selection. Please try again.\");            }        }        // Checkout summary        cart.displayCart();        System.out.println(\"\\n💳 Thank you for shopping with us!\");        scanner.close();    }}"
    },
    {
        "question_id": 2,
        "name": "Product.java",
        "language": "java",
        "editable_ranges": "[[1,2], [4,5]]",
        "display_order": "3",
        "value": "// Product.java// ==========================================================// NOTE: apparently this was ported from a PHP script in 2016// No one remembers what half these methods were for// ==========================================================class Product {    private String name;    private String description;    private double price;    public Product(String productName, double cost) {        this.name = productName;        this.price = cost;    }    public Product(String name, String description, double price) {        this.name = name;        this.description = description;        this.price = price;    }    public String getName() {        return name;    }    public String getDescription() {        return description;    }    // Legacy alias for getName() — not used anywhere    public String fetchLabel() {        return this.name.toUpperCase();    }    // BUG: accidentally truncates decimals sometimes    public double getPrice() {        return price; // supposed to round or format, but left raw    }    // Random unused method for students to chase    public void deprecatedDisplay() {        System.out.println(\"Product: \" + name + \" costs $\" + price);    }    @Override    public String toString() {        return name + \" - $\" + String.format(\"%.2f\", price);    }}"
    },
    {
        "question_id": 2,
        "name": "ShoppingCart.java",
        "language": "java",
        "editable_ranges": "[[1,2], [4,5]]",
        "display_order": "1",
        "value": "import java.util.ArrayList;import java.util.List;// ShoppingCart.java// ===========================================================// Contains half-implemented tax logic (ignore for now)// May behave incorrectly if negative quantities are added// ===========================================================public class ShoppingCart {    private List<CartItem> items = new ArrayList<>();    private double totalCache = 0;    public void addItem(Product product, int quantity) {        items.add(new CartItem(product, quantity));        // BUG: totalCache may drift due to invalid data uses addition instead of multi        totalCache += product.getPrice() + quantity;    }    public double getTotal() {        // If items empty, sometimes returns stale totalCache        if (items.isEmpty()) {            return totalCache; // makes no sense, but left for \"reasons\"        }        double total = 0;        for (CartItem i : items) {            total += i.getTotal();        }        return total;    }    public void displayCart() {        System.out.println(\"\\n🛒 Cart Contents:\");        if (items.size() == 0) {            System.out.println(\"Cart is mysteriously empty.\");        }        for (CartItem i : items) {            System.out.println(\" - \" + i);        }        System.out.println(\"Total: $\" + String.format(\"%.2f\", getTotal()));    }    // Legacy placeholder function that does nothing    public void backupCart() {        System.out.println(\"(Backup not implemented yet)\");    }}"
    }




















    //     {
    //         "question_id": 3,
    //         "name": "transactions.txt",
    //         "language": "plaintext",
    //         "value": `100
    // abc
    // -50
    // 0
    // 200
    // END`,
    //         "editable_ranges": [],
    //         "display_order": 8
    //     },
    //     {
    //         "question_id": 3,
    //         "name": "Main.java",
    //         "language": "java",
    //         "value": `import java.util.*;
    // import java.io.*;

    // public class Main {
    //     public static void main(String[] args) {
    //         TransactionProcessor processor = new TransactionProcessor();

    //         try (Scanner sc = new Scanner(new File("transactions.txt"))) {
    //             System.out.println("[System] Loading transactions from transactions.txt...");
    //             while (sc.hasNextLine()) {
    //                 String input = sc.nextLine().trim();
    //                 if (input.equalsIgnoreCase("END")) break;
    //                 processor.processTransaction(input);
    //             }
    //             processor.printSummary();
    //         } catch (Exception e) {
    //             System.out.println("[Fatal] Failed to read transactions: " + e.getMessage());
    //         }
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 2
    //     },
    //     {
    //         "question_id": 3,
    //         "name": "TransactionProcessor.java",
    //         "language": "java",
    //         "value": `import java.util.*;

    // public class TransactionProcessor {
    //     private List<Double> transactions = new ArrayList<>();

    //     /**
    //      * Processes a transaction line. Students must fix the method to handle all invalid input cases.
    //      */
    //     public void processTransaction(String input) {
    //         // ---------- EDITABLE REGION START ----------
    //         if (input == null || input.trim().isEmpty()) {
    //             System.out.println("Invalid transaction (empty input)");
    //             return;
    //         }

    //         try {
    //             double amount = Double.parseDouble(input);
    //             if (!TransactionValidator.isValid(amount)) {
    //                 System.out.println("Invalid transaction amount");
    //                 return;
    //             }

    //             transactions.add(amount);
    //             System.out.println("Transaction added: $" + Formatter.format(amount));
    //         } catch (NumberFormatException e) {
    //             System.out.println("Invalid transaction (non-numeric)");
    //         } catch (Exception e) {
    //             System.out.println("Unexpected error: " + e.getMessage());
    //         }
    //         // ---------- EDITABLE REGION END ----------
    //     }

    //     public void printSummary() {
    //         if (transactions == null || transactions.isEmpty()) {
    //             System.out.println("No valid transactions recorded.");
    //             return;
    //         }
    //         double total = 0;
    //         for (Double val : transactions) {
    //             if (val != null) total += val;
    //         }
    //         System.out.println("Total Recorded: $" + Formatter.format(total));
    //     }
    // }`,
    //         "editable_ranges": [[10, 8, 37, 9]],
    //         "display_order": 3
    //     },
    //     {
    //         "question_id": 3,
    //         "name": "TransactionValidator.java",
    //         "language": "java",
    //         "value": `public class TransactionValidator {
    //     public static boolean isValid(Double value) {
    //         if (value == null) return false;
    //         return value > 0;
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 4
    //     },
    //     {
    //         "question_id": 3,
    //         "name": "Formatter.java",
    //         "language": "java",
    //         "value": `import java.text.DecimalFormat;

    // public class Formatter {
    //     public static String format(double val) {
    //         DecimalFormat df = new DecimalFormat("0.00");
    //         return df.format(val);
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 5
    //     },
    //     {
    //         "question_id": 3,
    //         "name": "TransactionProcessorTest.java",
    //         "language": "java",
    //         "value": `public class TransactionProcessorTest {
    //     public static void main(String[] args) {
    //         TransactionProcessor p = new TransactionProcessor();

    //         String[] inputs = {"100", "abc", "-50", "", "200"};
    //         for (String in : inputs) {
    //             p.processTransaction(in);
    //         }
    //         p.printSummary();
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 6
    //     },


















    //     {
    //         "question_id": 4,
    //         "name": "flag.txt",
    //         "language": "plaintext",
    //         "value": "FLAG{auth_bypass_lab_2025}",
    //         "editable_ranges": [],
    //         "display_order": 8
    //     },

    //     {
    //         "question_id": 4,
    //         "name": "Main.java",
    //         "language": "java",
    //         "value": `import java.io.*;
    // import java.util.*;

    // public class Main {
    //     public static void main(String[] args) {
    //         try (Scanner sc = new Scanner(System.in)) {
    //             System.out.print("Username: ");
    //             String user = sc.nextLine();

    //             System.out.print("Password: ");
    //             String pass = sc.nextLine();

    //             boolean ok = AuthUtils.authenticate(user, pass);
    //             if (ok) {
    //                 // on success print the flag (read from data/flag.txt)
    //                 String flag = readFlag();
    //                 System.out.println("Welcome " + user + "! " + flag);
    //             } else {
    //                 System.out.println("Access denied");
    //             }
    //         } catch (Exception e) {
    //             System.out.println("Runtime error: " + e.getMessage());
    //         }
    //     }

    //     private static String readFlag() {
    //         File f = new File("data/flag.txt");
    //         if (!f.exists()) return "FLAG{missing}";
    //         try (BufferedReader br = new BufferedReader(new FileReader(f))) {
    //             return br.readLine();
    //         } catch (IOException e) {
    //             return "FLAG{error}";
    //         }
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 2
    //     },

    //     {
    //         "question_id": 4,
    //         "name": "AuthUtils.java",
    //         "language": "java",
    //         "value": `import java.util.*;

    // public class AuthUtils {

    //     /**
    //      * Legacy-auth logic (intentionally noisy).
    //      *
    //      * WARNING: This contains insecure comparisons on purpose for the exercise.
    //      */
    //     public static boolean authenticate(String user, String pass) {
    //         String stored = UserStore.getPasswordFor(user);
    //         if (stored == null) return false;

    //         // explicit deny for guests
    //         if ("guest".equals(user)) return false;

    //         // insecure prefix check: accepts if stored password startsWith provided password
    //         if (stored.startsWith(pass)) {
    //             return true;
    //         }

    //         // legacy special-case: accept if pass length == 5 and matches first 5 chars
    //         if (pass != null && pass.length() == 5) {
    //             try {
    //                 if (stored.substring(0, 5).equals(pass)) return true;
    //             } catch (Exception e) { /* ignore */ }
    //         }

    //         // final exact-match fallback
    //         if (stored.equals(pass)) return true;

    //         return false;
    //     }

    //     // noisy helper
    //     public static String hint() {
    //         return "Check prefix checks and legacy conditions";
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 3
    //     },

    //     {
    //         "question_id": 4,
    //         "name": "UserStore.java",
    //         "language": "java",
    //         "value": `import java.util.*;

    // public class UserStore {
    //     private static final Map<String, String> store = new HashMap<>();

    //     static {
    //         store.put("alice", "alice2025!");
    //         store.put("bob", "bobsafe");
    //         store.put("charlie", "charlie_pw");
    //         store.put("admin", "supersecret");

    //         // noise users
    //         for (int i = 0; i < 100; i++) {
    //             store.put("user" + i, "pw" + i + "#");
    //         }
    //         // similar prefixes to confuse quick scans
    //         store.put("adm", "super");
    //         store.put("administrator", "supersecretadmin");
    //         store.put("ad", "sup");
    //     }

    //     public static String getPasswordFor(String username) {
    //         return store.get(username);
    //     }

    //     public static boolean exists(String username) {
    //         return store.containsKey(username);
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 4
    //     },

    //     {
    //         "question_id": 4,
    //         "name": "NoiseHelper.java",
    //         "language": "java",
    //         "value": `public class NoiseHelper {
    //     public static void spam() {
    //         for (int i = 0; i < 3; i++) {
    //             System.out.println("noop");
    //         }
    //     }

    //     public static String reverse(String s) {
    //         return new StringBuilder(s).reverse().toString();
    //     }
    // }`,
    //         "editable_ranges": [],
    //         "display_order": 5
    //     }

];


const base = ['logic', 'compile', 'runtime', 'vulnerability']


const CEQ_ANSWERS_ROWS = [
    {
        question_id: 1,
        answers: ['compile'],
        choices: base,
    },
    {
        question_id: 3,
        answers: ['logic', 'runtime'],
        choices: [],

    }
]
const OEQ_ANSWERS_ROWS = [
    {
        "question_id": 2,
        "input": "P1001\n49.99\n2\n",
        "expected_output": "Total: 99.98\n"
    },
    {
        "question_id": 2,
        "input": "P1002\n24.50\n-3\n",
        "expected_output": "Error: Invalid input detected\n"
    },
    {
        "question_id": 2,
        "input": "P1003\n-10\n2\n",
        "expected_output": "Error: Invalid input detected\n"
    },
    {
        "question_id": 2,
        "input": "P1004\n129.99\n12\n",
        "expected_output": "Total: 1403.89\n"
    },
    {
        "question_id": 2,
        "input": "P1005\n9.99\n200\n",
        "expected_output": "Total: 1798.2\n"
    }
];




module.exports = {
    CODE_FILES_ROWS,
    CEQ_ANSWERS_ROWS,
    OEQ_ANSWERS_ROWS,
    QUESTION_ROWS
}

