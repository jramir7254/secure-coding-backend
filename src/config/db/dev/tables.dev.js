
const GAMES = `
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    max_teams INTEGER,
    time_limit INTEGER,
    is_current INTEGER CHECK (is_current IN (0, 1)),
    started_at TEXT,
    ended_at TEXT
);


`
const TEAMS = `
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    team_name TEXT NOT NULL UNIQUE,
    access_code TEXT,
    CONSTRAINT fk_t_g_id FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
`

const QUESTIONS = `
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    answer TEXT NOT NULL CHECK (answer IN ('compile', 'runtime', 'logic', 'vulnerability')),
    expected_output TEXT,
    editable_ranges TEXT NOT NULL,
    explanation TEXT
)
`

const QUESTION_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS question_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    team_id INTEGER,
    type TEXT DEFAULT 'multiple' CHECK (type IN ('multiple', 'coding')),
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT DEFAULT NULL,
    CONSTRAINT fk_qa_q_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_t_id FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT uq_attempt UNIQUE (question_id, team_id, type)
)
`

const MULTIPLE_CHOICE_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS multiple_choice_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    selected_answer TEXT NOT NULL CHECK (selected_answer IN ('compile', 'runtime', 'logic', 'vulnerability')),
    CONSTRAINT fk_mca_qa_id FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE
)
`

const CODING_ATTEMPTS = `
CREATE TABLE IF NOT EXISTS coding_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    submitted_code TEXT,
    CONSTRAINT fk_ca_qa_id FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE
)
`

const LEADERBOARD = `
CREATE TABLE IF NOT EXISTS leaderboard (
    team_id INTEGER,
    attempt_id INTEGER,
    points INTEGER,
    CONSTRAINT fk_l_qa_id FOREIGN KEY (attempt_id) REFERENCES question_attempts(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, attempt_id)
)
`


const QUESTION_ROWS = [
    {
        code: `public class CompileExample {
    public static void main(String[] args) {
        // Read-only
        System.out.println("Hello, world!")  // missing semicolon
    }
}`,
        answer: 'compile',
        editable_ranges: [4, 1, 4, 30],
        expected_output: "Hello, world!",
        explanation: 'Fix the compile-time error so the code prints "Hello, world!". Add the missing semicolon at the end of the print statement.'
    },
    {
        code: `public class RuntimeExample {
    public static void main(String[] args) {
        String text = null;
        System.out.println(text.length()); // causes NullPointerException
    }
}`,
        answer: 'runtime',
        editable_ranges: [4, 1, 4, 30],
        expected_output: "4",
        explanation: 'Prevent the NullPointerException. Add a null check before using text, or initialize it with a non-null value (e.g., text = "Hello").'
    },
    {
        code: `public class LogicExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int i = 0; i < numbers.length - 1; i++) {
            sum += numbers[i];
        }
        System.out.println("Sum: " + sum);
    }
}`,
        answer: 'logic',
        editable_ranges: [5, 1, 5, 30],
        expected_output: "Sum: 15",
        explanation: 'Fix the logic so the loop sums all numbers correctly. Change the loop condition to i < numbers.length so it includes all elements.'
    },
    {
        code: `import java.sql.*;

public class VulnerabilityExample {
    public static void main(String[] args) throws Exception {
        String userInput = "1 OR 1=1"; // simulated attacker input
        Connection conn = DriverManager.getConnection("jdbc:sqlite:users.db");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + userInput);
        while (rs.next()) {
            System.out.println("User: " + rs.getString("name"));
        }
        conn.close();
    }
}`,
        answer: 'vulnerability',
        editable_ranges: [3, 1, 5, 30],
        expected_output: "",
        explanation: 'Fix the SQL injection vulnerability. Replace string concatenation with a parameterized query using PreparedStatement (e.g., ps.setString(1, userInput)).'
    }
];

const QUESTION_ROWS_HMM = [
    {
        code: `public class CompileExample {
    public static void main(String[] args) {
        // Read-only
        System.out.println("Hello, world!")  // missing semicolon
    }
}`,
        answer: 'compile',
        editable_ranges: [
            { startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 100 }
        ],
        explanation:
            'Fix the compile-time error so the code prints "Hello, world!". Add the missing semicolon at the end of the print statement.'
    },
    {
        code: `public class RuntimeExample {
    public static void main(String[] args) {
        String text = null;
        System.out.println(text.length()); // causes NullPointerException
    }
}`,
        answer: 'runtime',
        editable_ranges: [
            { startLineNumber: 3, startColumn: 1, endLineNumber: 4, endColumn: 100 }
        ],
        explanation:
            'Prevent the NullPointerException. Add a null check before using text, or initialize it with a non-null value (e.g., text = "Hello").'
    },
    {
        code: `public class LogicExample {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int i = 0; i < numbers.length - 1; i++) {
            sum += numbers[i];
        }
        System.out.println("Sum: " + sum);
    }
}`,
        answer: 'logic',
        editable_ranges: [
            { startLineNumber: 5, startColumn: 1, endLineNumber: 7, endColumn: 100 }
        ],
        explanation:
            'Fix the logic so the loop sums all numbers correctly. Change the loop condition to i < numbers.length so it includes all elements.'
    },
    {
        code: `import java.sql.*;

public class VulnerabilityExample {
    public static void main(String[] args) throws Exception {
        String userInput = "1 OR 1=1"; // simulated attacker input
        Connection conn = DriverManager.getConnection("jdbc:sqlite:users.db");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + userInput);
        while (rs.next()) {
            System.out.println("User: " + rs.getString("name"));
        }
        conn.close();
    }
}`,
        answer: 'vulnerability',
        editable_ranges: [
            { startLineNumber: 7, startColumn: 1, endLineNumber: 8, endColumn: 100 }
        ],
        explanation:
            'Fix the SQL injection vulnerability. Replace string concatenation with a parameterized query using PreparedStatement (e.g., PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?"); ps.setString(1, userInput); ResultSet rs = ps.executeQuery();).'
    }
];

module.exports = {
    TEAMS,
    QUESTIONS,
    QUESTION_ROWS,
    QUESTION_ATTEMPTS,
    MULTIPLE_CHOICE_ATTEMPTS,
    GAMES,
    CODING_ATTEMPTS,
    LEADERBOARD
}