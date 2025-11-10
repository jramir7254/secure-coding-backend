
const GAMES = `
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    max_teams INTEGER,
    time_limit INTEGER,
    is_active INTEGER CHECK (is_active IN (0, 1)),
    started_at TEXT,
    ended_at TEXT
);


`
const TEAMS = `
CREATE TABLE IF NOT EXISTS teams (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NULLABLE,
    team_name TEXT NOT NULL,
    join_code TEXT NOT NULL UNIQUE,
    on_section TEXT NOT NULL DEFAULT 'mcq',
    joined_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    finished_at TEXT,
    CONSTRAINT fk_teams_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    CONSTRAINT uq_team_name UNIQUE (team_name)
);
`

const QUESTIONS = `
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT,
    type TEXT NOT NULL,         
    difficulty TEXT NOT NULL,    
    tags TEXT NOT NULL DEFAULT '[]', 
    description TEXT,
    explanation TEXT
)
`
const CODE_FILES = `
CREATE TABLE IF NOT EXISTS code_files (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    value TEXT NOT NULL,
    editable_ranges TEXT,       
    display_order INTEGER,
    CONSTRAINT fk_code_files_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT uq_code_files_question_display_order UNIQUE (question_id, display_order)
)
`

const QUESTION_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS question_attempts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    started_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    completed_at TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_qa_q_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_t_id FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uq_attempt UNIQUE (question_id, team_id)
)
`

const CEQ_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS mcq_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    submitted_answers TEXT,     
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_mca_qa_id FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE
)
`

const OEQ_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS coding_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    submitted_code TEXT,
    CONSTRAINT fk_ca_qa_id FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE
)
`

const LEADERBOARD = `
CREATE TABLE IF NOT EXISTS leaderboard (
   team_id INTEGER PRIMARY KEY,
    total_points INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_leaderboard_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
)
`
const CEQ_ANSWERS = `
CREATE TABLE IF NOT EXISTS mcq_answers (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    answers TEXT NOT NULL, 
    CONSTRAINT fk_mcq_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT uq_mcq_answers_question UNIQUE (question_id)
)
`
const OEQ_ANSWERS = `
CREATE TABLE IF NOT EXISTS coding_answers  (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT,     
    CONSTRAINT fk_test_cases_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
)
`


const QUESTION_ROWS = [
    {
        "title": "Compile-Time Detective",
        "type": "mcq",
        "mode": "select",
        "intent": "concept",
        "difficulty": "medium",
        "tags": ["compile", "runtime"],
        "description": `
### 🧠 Scenario
You’re given a realistic multi-file Java project that *fails to compile*.  
The problem is buried deep in the codebase and might look like a logical error at first glance.

### 🧩 Challenge
Inspect the provided code files (e.g., \`MainApp.java\`, \`Calculator.java\`, and \`Helper.java\`) and select **all** applicable error types.

**Hint:** The issue may seem logical but also triggers a compilation failure — choose all categories that apply.

### ✅ Focus
- Reading & scanning multi-file projects
- Recognizing compiler vs logic errors
`,
        "explanation": `
The \`compute()\` method in **Calculator.java** is missing a \`return\` statement and contains an invalid expression (\`a + b;\`).  
This triggers a **compile-time** error, but it's also a **logic flaw**, since the developer likely intended to return the result.`
    },


    {
        "title": "Work Order #1427 — Checkout System Incident Report",
        "mode": "code",
        "type": "coding",
        "intent": "repair",
        "difficulty": "medium",
        "tags": ["logic", "vulnerability"],
        "description": "### Overview\nThe **Checkout Service** for our online shop has been producing inconsistent order totals.  \nOccasionally, users report totals that don't align with item prices or quantities, and some discount cases behave unpredictably.  \n\nQA logged several incidents where totals appeared incorrect, sometimes even negative, or promo codes stacked improperly.\n\n---\n\n### Your Task\nYou're the assigned developer to **audit and patch** the checkout system.\n\n- Investigate the issue in `CartUtils.java`.\n- Identify why totals are miscalculated under specific conditions.\n- Apply input validation and safe arithmetic handling.\n- Ensure the output remains consistent and never produces invalid totals.\n\n---\n\n### Context\nThe main application (`ShoppingCart.java`) reads item data and sends it to the calculation function.  \nRefer to the included `data/products.txt` for reference SKU and price data, and review `PromoEngine.java` for how discounts are applied.\n\n**You may NOT modify any file except inside the editable region of `CartUtils.java`.**\n\n---\n\n### Deliverables\nOnce fixed, re-run the checkout with several input combinations to confirm:\n- Totals are accurate\n- Invalid inputs are handled gracefully\n- Discounts no longer break calculations\n\n---\n\n### Hint\nSome values may appear harmless but lead to business-logic vulnerabilities when unchecked.  \nThink like a QA engineer — find the edge cases, protect against them, and produce secure totals.",
        "explanation": `
Participants must implement validation for \`price > 0\` and \`quantity >= 1\`.  
They must also ensure discounts don’t cause negative totals and use proper rounding to two decimals.`
    },
    {
        "title": "Crash the App",
        "mode": "code",
        "type": "coding",
        "intent": "debug",
        "difficulty": "medium",
        "tags": ["runtime", "logic"],
        "description": `
### 💥 Scenario
A simple ATM-like console app crashes when users enter bad input — for example, letters instead of numbers.  
The cause is unsafe parsing and missing exception handling.

### ⚙️ Challenge
Modify \`InputHandler.parseAmount()\` to:
- Safely parse integers and decimals
- Reject negative or malformed input by returning \`-1\`
- Prevent the app from crashing under any input

### 🧩 Example Behavior
\`\`\`
Input: 100      → Withdrawal successful: $100
Input: abc      → Invalid amount
Input: -50      → Invalid amount
Input: 100.75   → Withdrawal successful: $100
\`\`\`

### ✅ Focus
- Defensive programming  
- Handling exceptions gracefully  
- Secure input sanitization
`,
        "explanation": `
The original code used \`Integer.parseInt()\` without validation, leading to \`NumberFormatException\`.  
Participants must implement safe parsing and error handling to prevent runtime crashes.`
    },
    {
        "title": "Exploit Login Form",
        "mode": "interactive",
        "type": "coding",
        "intent": "exploit",
        "difficulty": "hard",
        "tags": ["vulnerability", "auth"],
        "description": `
### 🔐 Scenario
This mock login program hides a secret flag.  
Authentication is handled by \`AuthUtils.authenticate()\`, which contains a subtle **logic vulnerability**.

### ⚙️ Challenge
Use the login UI to bypass authentication and reveal the flag.  
The backend uses weak string comparison methods like \`startsWith()\` and unsafe prefix checks.

### 🧩 Example Interaction
\`\`\`
Username: admin
Password: super
→ Welcome admin! FLAG{auth_bypass_2025}
\`\`\`

### ✅ Focus
- Identifying insecure authentication logic  
- Exploiting weak string comparisons  
- Understanding how logic flaws lead to real security issues
`,
        "explanation": `
\`AuthUtils\` compares passwords using \`startsWith()\` and short-circuit logic, allowing prefix-based bypasses.  
Supplying a password like "super" authenticates successfully even without the full secret.`
    }
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
        editable_ranges: ["readonly"],
        display_order: 0
    },

    {
        question_id: 1,
        name: "MainApp.java",
        language: "java",
        value: `package app;
y
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
        editable_ranges: ["readonly"],
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
        editable_ranges: ["readonly"],
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
        editable_ranges: ["readonly"],
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
        editable_ranges: ["readonly"],
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
        editable_ranges: ["readonly"],
        display_order: 5
    },

    {
        question_id: 2,
        name: "ShoppingCart.java",
        language: "java",
        value: `
import java.util.*;

public class ShoppingCart {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter price: ");
        String priceRaw = sc.nextLine().trim();

        System.out.print("Enter quantity: ");
        String quantityRaw = sc.nextLine().trim();

        double price = PriceParser.parsePrice(priceRaw);
        int quantity = PriceParser.parseQuantity(quantityRaw);

        double total = CartUtils.calculateTotal(price, quantity);
        if (total == -1)
            System.out.println("Invalid input");
        else
            System.out.println("Total: " + total);
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 1
    },

    {
        question_id: 2,
        name: "CartUtils.java",
        language: "java",
        value: `


public class CartUtils {
    public static double calculateTotal(double price, int quantity) {
        // TODO: Add validation for inputs
        // and prevent negative or zero totals

        double subtotal = price * quantity;
        double discount = PromoEngine.getDiscountFor(quantity, price);
        double total = subtotal - discount;

        total = Math.round(total * 100.0) / 100.0;
        return total;
    }
}`,
        editable_ranges: [7, 5, 14, 5],
        display_order: 2
    },

    {
        question_id: 2,
        name: "PriceParser.java",
        language: "java",
        value: `

public class PriceParser {
    public static double parsePrice(String s) {
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    public static int parseQuantity(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 3
    },

    {
        question_id: 2,
        name: "PromoEngine.java",
        language: "java",
        value: `

public class PromoEngine {
    public static double getDiscountFor(int quantity, double price) {
        double subtotal = quantity * price;
        if (quantity > 10)
            return subtotal * 0.10;
        if (subtotal > 100)
            return subtotal * 0.05;
        return 0.0;
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 4
    },

    {
        question_id: 2,
        name: "CartUnitStub.java",
        language: "java",
        value: `


public class CartUnitStub {
    public static void main(String[] args) {
        System.out.println(CartUtils.calculateTotal(10, 2));
        System.out.println(CartUtils.calculateTotal(-5, 2));
        System.out.println(CartUtils.calculateTotal(10, -2));
        System.out.println(CartUtils.calculateTotal(0, 5));
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 5
    },

    {
        question_id: 3,
        name: "TransactionApp.java",
        language: "java",
        value: `


import java.util.*;

public class TransactionApp {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        TransactionProcessor processor = new TransactionProcessor();

        System.out.println("Enter transaction amounts (type END to stop):");
        while (true) {
            String input = sc.nextLine();
            if (input.equalsIgnoreCase("END")) break;
            processor.processTransaction(input);
        }

        processor.printSummary();
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 1
    },

    {
        question_id: 3,
        name: "TransactionProcessor.java",
        language: "java",
        value: `

import java.util.*;

/*
 * Students should only modify the body of processTransaction(...) between
 * the marked editable lines (editable_ranges).
 */
public class TransactionProcessor {
    private List<Double> transactions = new ArrayList<>();

    public void processTransaction(String input) {
        // Participants edit only inside the method body below
        // ----------------- EDITABLE START -----------------
        try {
            double amount = Double.parseDouble(input);
            if (TransactionValidator.isValid(amount)) {
                transactions.add(amount);
                System.out.println("Transaction Added: $" + amount);
            } else {
                System.out.println("Invalid transaction");
            }
        } catch (Exception e) {
            System.out.println("Invalid transaction");
        }
        // ------------------ EDITABLE END ------------------
    }

    public void printSummary() {
        if (transactions == null || transactions.isEmpty()) {
            System.out.println("No transaction");
            return;
        }

        double total = 0;
        for (Double val : transactions) total += val;
        System.out.println("Total Recorded: $" + total);
    }
}`,
        // editable range covers the method body lines above; adjust if you change file
        editable_ranges: [7, 5, 19, 9],
        display_order: 2
    },

    {
        question_id: 3,
        name: "TransactionValidator.java",
        language: "java",
        value: `

public class TransactionValidator {
    public static boolean isValid(Double value) {
        if (value == null) return false;
        return value > 0;
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 3
    },

    {
        question_id: 3,
        name: "Formatter.java",
        language: "java",
        value: `

import java.text.DecimalFormat;

public class Formatter {
    public static String format(double val) {
        DecimalFormat df = new DecimalFormat("0.00");
        return df.format(val);
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 4
    },

    {
        question_id: 3,
        name: "TransactionProcessorTest.java",
        language: "java",
        value: `
public class TransactionProcessorTest {
    public static void main(String[] args) {
        TransactionProcessor p = new TransactionProcessor();
        p.processTransaction("100");
        p.processTransaction("abc");
        p.processTransaction("-50");
        p.processTransaction("");
        p.printSummary();
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 5
    },
    {
        question_id: 4,
        name: ".env",
        language: "plaintext",
        value: `FLAG=FLAG{auth_bypass_lab_long_2025}`,
        editable_ranges: ["readonly"],
        display_order: 2
    },

    {
        question_id: 4,
        name: "LoginApp.java",
        language: "java",
        value: `

import java.util.*;

public class LoginApp {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Username: ");
        String user = sc.nextLine();

        System.out.print("Password: ");
        String pass = sc.nextLine();

        boolean ok = AuthUtils.authenticate(user, pass);
        if (ok) {
            System.out.println("Welcome " + user + "! " + System.getenv("FLAG"));
        } else {
            System.out.println("Access denied");
        }
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 1
    },

    {
        question_id: 4,
        name: "AuthUtils.java",
        language: "java",
        value: `

import store.UserStore;

public class AuthUtils {

    public static boolean authenticate(String user, String pass) {
        // load stored password for user
        String stored = UserStore.getPasswordFor(user);
        if (stored == null) return false;

        // legacy special-case: guest blocked
        if ("guest".equals(user)) return false;

        // BUG: insecure prefix check
        if (stored.startsWith(pass)) {
            return true;
        }

        // legacy condition: accept if provided password length equals 5
        // and matches first 5 chars
        if (pass != null && pass.length() == 5) {
            try {
                if (stored.substring(0, 5).equals(pass))
                    return true;
            } catch (Exception e) { /* ignore */ }
        }

        // final fallback: exact match
        if (stored.equals(pass))
            return true;

        return false;
    }

    // helper (noise)
    public static String debugHint() {
        return "Use prefix matching carefully";
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 3
    },

    {
        question_id: 4,
        name: "UserStore.java",
        language: "java",
        value: `

import java.util.*;

public class UserStore {
    private static Map<String, String> store = new HashMap<>();

    static {
        store.put("alice", "alice2025!");
        store.put("bob", "bobsafe");
        store.put("charlie", "charlie_pw");
        store.put("admin", "supersecret");

        // many fake users to create noise for scanning
        for (int i = 0; i < 120; i++) {
            store.put("user" + i, "pw" + i + "#x");
        }

        // similar prefixes to confuse searches
        store.put("adm", "super");
        store.put("administrator", "supersecretadmin");
        store.put("ad", "sup");
    }

    public static String getPasswordFor(String username) {
        return store.get(username);
    }

    public static boolean userExists(String u) {
        return store.containsKey(u);
    }

    public static int countUsers() {
        return store.size();
    }

    public static List<String> listUsers() {
        return new ArrayList<>(store.keySet());
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 4
    },

    {
        question_id: 4,
        name: "NoiseHelper.java",
        language: "java",
        value: `

public class NoiseHelper {
    public static void doNothing() {
        for (int i = 0; i < 3; i++) {
            System.out.println("noop");
        }
    }

    public static String confuse(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}`,
        editable_ranges: ["readonly"],
        display_order: 5
    }

];


const CEQ_ANSWERS_ROWS = [
    {
        question_id: 1,
        answers: ['compile']
    }
]
const OEQ_ANSWERS_ROWS = [
    {
        "question_id": 2,
        "input": ["10\\n2\\n", "-5\\n2\\n", "10\\n-2\\n", "0\\n5\\n"],
        "expected_output": ["Total: 20.0", "Invalid input", "Invalid input", "Invalid input"]
    },
    {
        "question_id": 3,
        "input": ["100\\nabc\\n-50\\n\\nEND\\n"],
        "expected_output": ["Transaction Added: $100.0", "Invalid transaction", "Invalid transaction", "No transaction"]
    }
];




module.exports = {
    TEAMS,
    QUESTIONS,
    QUESTION_ROWS,
    QUESTION_ATTEMPTS,
    CEQ_ANSWERS,
    CODE_FILES,
    CEQ_ATTEMPTS,
    OEQ_ANSWERS,
    OEQ_ATTEMPTS,
    GAMES,
    LEADERBOARD,
    CODE_FILES_ROWS,
    CEQ_ANSWERS_ROWS,
    OEQ_ANSWERS_ROWS
}



//  },
//     {
//         code: `public class RuntimeExample {
//     public static void main(String[] args) {
//         String text = null;
//         System.out.println(text.length()); // causes NullPointerException
//     }
// }`,
//         answer: 'runtime',
//         editable_ranges: [4, 1, 4, 30],
//         expected_output: "4",
//         explanation: 'Prevent the NullPointerException. Add a null check before using text, or initialize it with a non-null value (e.g., text = "Hello").'
//     },
//     {
//         code: `public class LogicExample {
//     public static void main(String[] args) {
//         int[] numbers = {1, 2, 3, 4, 5};
//         int sum = 0;
//         for (int i = 0; i < numbers.length - 1; i++) {
//             sum += numbers[i];
//         }
//         System.out.println("Sum: " + sum);
//     }
// }`,
//         answer: 'logic',
//         editable_ranges: [5, 1, 5, 30],
//         expected_output: "Sum: 15",
//         explanation: 'Fix the logic so the loop sums all numbers correctly. Change the loop condition to i < numbers.length so it includes all elements.'
//     },
//     {
//         code: `import java.sql.*;

// public class VulnerabilityExample {
//     public static void main(String[] args) throws Exception {
//         String userInput = "1 OR 1=1"; // simulated attacker input
//         Connection conn = DriverManager.getConnection("jdbc:sqlite:users.db");
//         Statement stmt = conn.createStatement();
//         ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + userInput);
//         while (rs.next()) {
//             System.out.println("User: " + rs.getString("name"));
//         }
//         conn.close();
//     }
// }`,
//         answer: 'vulnerability',
//         editable_ranges: [3, 1, 5, 30],
//         expected_output: "",
//         explanation: 'Fix the SQL injection vulnerability. Replace string concatenation with a parameterized query using PreparedStatement (e.g., ps.setString(1, userInput)).'
//     }