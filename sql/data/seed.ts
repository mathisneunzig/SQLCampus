import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'

// Load .env.local manually for the seed script
try {
  const envContent = readFileSync('.env.local', 'utf-8')
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch { /* .env.local not required */ }

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
  multipleStatements: true,
})

const lessons = [
  {
    slug: 'select-basics',
    title: 'SQL SELECT Statement',
    category: 'Basics',
    order_index: 1,
    content_mdx: `# SQL SELECT Statement

The \`SELECT\` statement is used to retrieve data from a database table. It is the most fundamental SQL statement.

## Syntax

\`\`\`sql
SELECT column1, column2, ...
FROM table_name;
\`\`\`

To select **all columns**, use the wildcard \`*\`:

\`\`\`sql
SELECT * FROM table_name;
\`\`\`

## Example

Suppose we have a table called \`employees\`:

| id | name  | department  | salary |
|----|-------|-------------|--------|
| 1  | Alice | Engineering | 75000  |
| 2  | Bob   | Marketing   | 60000  |
| 3  | Carol | Engineering | 80000  |

To select all columns:

\`\`\`sql
SELECT * FROM employees;
\`\`\`

To select specific columns:

\`\`\`sql
SELECT name, department FROM employees;
\`\`\`

## Tips

- Column names are **case-insensitive** in SQL.
- Use commas to separate multiple columns.
- The \`FROM\` clause specifies which table to query.`,
    exercises: [
      {
        type: 'sql',
        title: 'Select all employees',
        description: 'Write a query to select ALL columns from the employees table.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice','Engineering',75000),(2,'Bob','Marketing',60000),(3,'Carol','Engineering',80000);`,
          expected_rows: [['1','Alice','Engineering','75000'],['2','Bob','Marketing','60000'],['3','Carol','Engineering','80000']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'fill_blank',
        title: 'Complete the SELECT query',
        description: 'Fill in the blanks to select the name and department columns from employees.',
        order_index: 2,
        config_json: JSON.stringify({
          template: 'SELECT name, ___ FROM ___;',
          blanks: ['department', 'employees'],
          hint: 'The second blank is the table name.',
        }),
      },
      {
        type: 'single_choice',
        title: 'SELECT syntax',
        description: 'Which SQL query selects all columns from the employees table?',
        order_index: 3,
        config_json: JSON.stringify({
          options: [
            'GET * FROM employees;',
            'SELECT * FROM employees;',
            'SELECT employees.*;',
            'FETCH ALL FROM employees;',
          ],
          correct: 1,
        }),
      },
    ],
  },
  {
    slug: 'select-distinct',
    title: 'SELECT DISTINCT',
    category: 'Basics',
    order_index: 2,
    content_mdx: `# SELECT DISTINCT

The \`SELECT DISTINCT\` statement returns only **unique (different) values** — duplicate rows are removed from the result.

## Syntax

\`\`\`sql
SELECT DISTINCT column1, column2, ...
FROM table_name;
\`\`\`

## Example

\`\`\`sql
SELECT DISTINCT department FROM employees;
\`\`\`

Result:

| department  |
|-------------|
| Engineering |
| Marketing   |

Without \`DISTINCT\`, "Engineering" would appear twice.

## When to use DISTINCT

- Finding all unique values in a column (e.g., all countries, all categories)
- Counting unique values: \`SELECT COUNT(DISTINCT department) FROM employees;\``,
    exercises: [
      {
        type: 'sql',
        title: 'Find unique departments',
        description: 'Write a query to get all unique department names from the employees table.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice','Engineering',75000),(2,'Bob','Marketing',60000),(3,'Carol','Engineering',80000),(4,'Dave','Marketing',65000);`,
          expected_rows: [['Engineering'],['Marketing']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'DISTINCT facts',
        description: 'Select ALL statements that are true about SELECT DISTINCT.',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'DISTINCT removes duplicate rows from the result',
            'DISTINCT can be used with multiple columns',
            'DISTINCT sorts the results alphabetically',
            'DISTINCT applies to all selected columns together',
          ],
          correct: [0, 1, 3],
        }),
      },
    ],
  },
  {
    slug: 'where-clause',
    title: 'The WHERE Clause',
    category: 'Basics',
    order_index: 3,
    content_mdx: `# The WHERE Clause

The \`WHERE\` clause filters records based on a condition. Only rows where the condition is **true** are returned.

## Syntax

\`\`\`sql
SELECT column1, column2
FROM table_name
WHERE condition;
\`\`\`

## Comparison Operators

| Operator | Meaning              |
|----------|----------------------|
| =        | Equal                |
| <> or != | Not equal            |
| >        | Greater than         |
| <        | Less than            |
| >=       | Greater than or equal|
| <=       | Less than or equal   |

## Examples

\`\`\`sql
-- Employees in Engineering
SELECT * FROM employees WHERE department = 'Engineering';

-- Employees with salary above 70000
SELECT name, salary FROM employees WHERE salary > 70000;
\`\`\`

## Text Values

Text values must be enclosed in **single quotes**:

\`\`\`sql
WHERE name = 'Alice'   -- correct
WHERE name = "Alice"   -- may work in some DBs, avoid in standard SQL
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Filter by department',
        description: 'Select all columns from employees where the department is \'Engineering\'.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice','Engineering',75000),(2,'Bob','Marketing',60000),(3,'Carol','Engineering',80000);`,
          expected_rows: [['1','Alice','Engineering','75000'],['3','Carol','Engineering','80000']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'single_choice',
        title: 'WHERE syntax',
        description: 'Which query correctly selects employees with a salary over 50000?',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'SELECT * FROM employees WHERE salary > 50000',
            'SELECT * FROM employees HAVING salary > 50000',
            'SELECT * FROM employees FILTER salary > 50000',
            'SELECT * FROM employees WHERE salary ABOVE 50000',
          ],
          correct: 0,
        }),
      },
      {
        type: 'fill_blank',
        title: 'Complete the WHERE clause',
        description: 'Fill in the blanks to select employees from the Marketing department.',
        order_index: 3,
        config_json: JSON.stringify({
          template: "SELECT * FROM employees ___ department = '___';",
          blanks: ['WHERE', 'Marketing'],
          hint: 'First blank: the filtering keyword. Second blank: the department value.',
        }),
      },
    ],
  },
  {
    slug: 'and-or-not',
    title: 'AND, OR, NOT Operators',
    category: 'Basics',
    order_index: 4,
    content_mdx: `# AND, OR, NOT Operators

Combine multiple conditions using **AND**, **OR**, and **NOT**.

## AND

All conditions must be true:

\`\`\`sql
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 70000;
\`\`\`

## OR

At least one condition must be true:

\`\`\`sql
SELECT * FROM employees
WHERE department = 'Engineering' OR department = 'Marketing';
\`\`\`

## NOT

Negates a condition:

\`\`\`sql
SELECT * FROM employees
WHERE NOT department = 'Marketing';
\`\`\`

## Combining with Parentheses

Use parentheses to control evaluation order:

\`\`\`sql
SELECT * FROM employees
WHERE (department = 'Engineering' OR department = 'HR')
  AND salary > 60000;
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'AND operator',
        description: "Select all employees in 'Engineering' with a salary greater than 70000.",
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice','Engineering',75000),(2,'Bob','Marketing',60000),(3,'Carol','Engineering',68000),(4,'Dave','Engineering',82000);`,
          expected_rows: [['1','Alice','Engineering','75000'],['4','Dave','Engineering','82000']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'Logical operators',
        description: 'Which of the following are valid SQL logical operators?',
        order_index: 2,
        config_json: JSON.stringify({
          options: ['AND', 'OR', 'XOR', 'NOT'],
          correct: [0, 1, 3],
        }),
      },
    ],
  },
  {
    slug: 'order-by',
    title: 'ORDER BY',
    category: 'Basics',
    order_index: 5,
    content_mdx: `# ORDER BY

The \`ORDER BY\` clause sorts the result set. By default, sorting is **ascending** (A-Z, lowest first).

## Syntax

\`\`\`sql
SELECT column1, column2
FROM table_name
ORDER BY column1 [ASC | DESC];
\`\`\`

## Examples

\`\`\`sql
-- Sort by salary, lowest first (default ASC)
SELECT name, salary FROM employees ORDER BY salary;

-- Sort by salary, highest first
SELECT name, salary FROM employees ORDER BY salary DESC;

-- Sort by department A-Z, then salary highest first
SELECT * FROM employees ORDER BY department ASC, salary DESC;
\`\`\`

## Multiple Columns

You can sort by multiple columns separated by commas. The second sort column is used as a tiebreaker.`,
    exercises: [
      {
        type: 'sql',
        title: 'Sort by salary',
        description: 'Select the name and salary of all employees, sorted by salary from highest to lowest.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice','Engineering',75000),(2,'Bob','Marketing',60000),(3,'Carol','Engineering',80000);`,
          expected_rows: [['Carol','80000'],['Alice','75000'],['Bob','60000']],
          check_mode: 'rows_match',
        }),
      },
      {
        type: 'single_choice',
        title: 'Default sort order',
        description: 'What is the default sort order of ORDER BY?',
        order_index: 2,
        config_json: JSON.stringify({
          options: ['DESC (descending)', 'ASC (ascending)', 'Alphabetical only', 'The order of insertion'],
          correct: 1,
        }),
      },
    ],
  },
  {
    slug: 'limit-offset',
    title: 'LIMIT and OFFSET',
    category: 'Basics',
    order_index: 6,
    content_mdx: `# LIMIT and OFFSET

Use \`LIMIT\` to restrict how many rows are returned. Use \`OFFSET\` to skip rows (useful for pagination).

## Syntax

\`\`\`sql
SELECT * FROM table_name
LIMIT number;

SELECT * FROM table_name
LIMIT number OFFSET skip;
\`\`\`

## Examples

\`\`\`sql
-- Get the first 5 employees
SELECT * FROM employees LIMIT 5;

-- Get employees 11-20 (skip first 10, take 10)
SELECT * FROM employees LIMIT 10 OFFSET 10;
\`\`\`

## Pagination Pattern

\`\`\`sql
-- Page 1: LIMIT 10 OFFSET 0
-- Page 2: LIMIT 10 OFFSET 10
-- Page 3: LIMIT 10 OFFSET 20
\`\`\`

> **Note:** Always combine \`LIMIT\` with \`ORDER BY\` to get consistent results.`,
    exercises: [
      {
        type: 'sql',
        title: 'Get top 2 salaries',
        description: 'Select the name and salary of the 2 highest-paid employees.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice',75000),(2,'Bob',60000),(3,'Carol',80000),(4,'Dave',55000);`,
          expected_rows: [['Carol','80000'],['Alice','75000']],
          check_mode: 'rows_match',
        }),
      },
      {
        type: 'fill_blank',
        title: 'Pagination query',
        description: 'Complete the query to get 5 records starting from position 10 (skip 10).',
        order_index: 2,
        config_json: JSON.stringify({
          template: 'SELECT * FROM products LIMIT ___ OFFSET ___;',
          blanks: ['5', '10'],
        }),
      },
    ],
  },
  {
    slug: 'insert-into',
    title: 'INSERT INTO',
    category: 'Manipulation',
    order_index: 7,
    content_mdx: `# INSERT INTO

The \`INSERT INTO\` statement adds new rows to a table.

## Syntax

Specify column names:

\`\`\`sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
\`\`\`

Insert into all columns (must match column order exactly):

\`\`\`sql
INSERT INTO table_name
VALUES (value1, value2, ...);
\`\`\`

## Examples

\`\`\`sql
INSERT INTO employees (name, department, salary)
VALUES ('Eve', 'HR', 55000);

-- Insert multiple rows at once
INSERT INTO employees (name, department, salary)
VALUES
  ('Frank', 'Engineering', 78000),
  ('Grace', 'Marketing', 62000);
\`\`\`

## Best Practices

- Always specify column names — it makes queries resilient to schema changes.
- String values go in single quotes.
- NULL can be inserted for optional columns.`,
    exercises: [
      {
        type: 'single_choice',
        title: 'Correct INSERT syntax',
        description: "Which query correctly inserts a new employee named 'Eve' into the HR department with salary 55000?",
        order_index: 1,
        config_json: JSON.stringify({
          options: [
            "INSERT employees (name, department, salary) VALUES ('Eve', 'HR', 55000);",
            "INSERT INTO employees VALUES name='Eve', department='HR', salary=55000;",
            "INSERT INTO employees (name, department, salary) VALUES ('Eve', 'HR', 55000);",
            "ADD INTO employees (name, department, salary) VALUES ('Eve', 'HR', 55000);",
          ],
          correct: 2,
        }),
      },
      {
        type: 'fill_blank',
        title: 'Complete the INSERT',
        description: 'Fill in the blanks to insert a new product.',
        order_index: 2,
        config_json: JSON.stringify({
          template: "___ INTO products (name, price) ___ ('Widget', 9.99);",
          blanks: ['INSERT', 'VALUES'],
        }),
      },
    ],
  },
  {
    slug: 'update',
    title: 'UPDATE Statement',
    category: 'Manipulation',
    order_index: 8,
    content_mdx: `# UPDATE Statement

The \`UPDATE\` statement modifies existing records in a table.

## Syntax

\`\`\`sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
\`\`\`

## Examples

\`\`\`sql
-- Update one employee's salary
UPDATE employees
SET salary = 85000
WHERE name = 'Alice';

-- Update multiple columns
UPDATE employees
SET department = 'Engineering', salary = 80000
WHERE id = 2;
\`\`\`

## WARNING: Always use WHERE!

Without a \`WHERE\` clause, **all rows** will be updated:

\`\`\`sql
UPDATE employees SET salary = 0;  -- Sets ALL salaries to 0!
\`\`\``,
    exercises: [
      {
        type: 'multiple_choice',
        title: 'UPDATE best practices',
        description: 'Which statements about UPDATE are correct?',
        order_index: 1,
        config_json: JSON.stringify({
          options: [
            'You should always use a WHERE clause with UPDATE',
            'UPDATE can modify multiple columns at once',
            'UPDATE without WHERE modifies all rows',
            'UPDATE automatically creates new columns if they don\'t exist',
          ],
          correct: [0, 1, 2],
        }),
      },
      {
        type: 'fill_blank',
        title: 'Complete the UPDATE',
        description: 'Fill in the blanks to give employee with id=3 a salary of 90000.',
        order_index: 2,
        config_json: JSON.stringify({
          template: '___ employees SET salary = 90000 ___ id = 3;',
          blanks: ['UPDATE', 'WHERE'],
        }),
      },
    ],
  },
  {
    slug: 'delete',
    title: 'DELETE Statement',
    category: 'Manipulation',
    order_index: 9,
    content_mdx: `# DELETE Statement

The \`DELETE\` statement removes existing rows from a table.

## Syntax

\`\`\`sql
DELETE FROM table_name
WHERE condition;
\`\`\`

## Examples

\`\`\`sql
-- Delete one specific employee
DELETE FROM employees WHERE id = 5;

-- Delete all employees in Marketing
DELETE FROM employees WHERE department = 'Marketing';
\`\`\`

## Delete ALL rows

Without a WHERE clause, all rows are deleted (table structure remains):

\`\`\`sql
DELETE FROM employees;  -- Deletes ALL rows!
\`\`\`

## DELETE vs DROP TABLE

- \`DELETE\` removes rows but keeps the table.
- \`DROP TABLE\` removes the entire table including its structure.`,
    exercises: [
      {
        type: 'single_choice',
        title: 'DELETE vs DROP',
        description: 'What is the difference between DELETE and DROP TABLE?',
        order_index: 1,
        config_json: JSON.stringify({
          options: [
            'DELETE removes the table, DROP removes rows',
            'DELETE removes rows, DROP removes the entire table',
            'They do the same thing',
            'DELETE is faster than DROP',
          ],
          correct: 1,
        }),
      },
      {
        type: 'fill_blank',
        title: 'Delete with condition',
        description: 'Complete the query to delete all products with price = 0.',
        order_index: 2,
        config_json: JSON.stringify({
          template: '___ FROM products WHERE ___ = 0;',
          blanks: ['DELETE', 'price'],
        }),
      },
    ],
  },
  {
    slug: 'create-table',
    title: 'CREATE TABLE',
    category: 'Schema',
    order_index: 10,
    content_mdx: `# CREATE TABLE

The \`CREATE TABLE\` statement creates a new table in the database.

## Syntax

\`\`\`sql
CREATE TABLE table_name (
  column1 datatype [constraints],
  column2 datatype [constraints],
  ...
);
\`\`\`

## Common Data Types

| Type       | Description             |
|------------|-------------------------|
| INTEGER    | Whole numbers           |
| REAL       | Decimal numbers         |
| TEXT       | Variable-length strings |
| BLOB       | Binary data             |
| NULL       | Represents missing data |

## Example

\`\`\`sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER,
  enrolled_at TEXT DEFAULT (datetime('now'))
);
\`\`\`

## Constraints

- \`PRIMARY KEY\` — unique identifier, cannot be NULL
- \`NOT NULL\` — value is required
- \`UNIQUE\` — all values must be different
- \`DEFAULT\` — default value if none provided
- \`REFERENCES\` — foreign key constraint`,
    exercises: [
      {
        type: 'sql',
        title: 'Create a products table',
        description: 'Create a table called products with columns: id (INTEGER PRIMARY KEY), name (TEXT NOT NULL), and price (REAL).',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: '',
          expected_rows: [],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'Table constraints',
        description: 'Which constraints can be added to a column in CREATE TABLE?',
        order_index: 2,
        config_json: JSON.stringify({
          options: ['PRIMARY KEY', 'NOT NULL', 'UNIQUE', 'REQUIRED'],
          correct: [0, 1, 2],
        }),
      },
    ],
  },
  {
    slug: 'alter-table',
    title: 'ALTER TABLE',
    category: 'Schema',
    order_index: 11,
    content_mdx: `# ALTER TABLE

The \`ALTER TABLE\` statement modifies an existing table structure.

## Add a Column

\`\`\`sql
ALTER TABLE employees ADD COLUMN phone TEXT;
\`\`\`

## Rename a Column

\`\`\`sql
ALTER TABLE employees RENAME COLUMN phone TO mobile;
\`\`\`

## Rename a Table

\`\`\`sql
ALTER TABLE employees RENAME TO staff;
\`\`\`

## Drop a Column (SQLite 3.35.0+)

\`\`\`sql
ALTER TABLE employees DROP COLUMN phone;
\`\`\`

## Notes

- \`ALTER TABLE\` is limited in SQLite compared to other databases.
- In SQLite you **cannot** change a column's data type directly.
- For complex changes, create a new table, copy data, then drop the old one.`,
    exercises: [
      {
        type: 'fill_blank',
        title: 'Add a column',
        description: 'Complete the query to add an email column (TEXT) to the employees table.',
        order_index: 1,
        config_json: JSON.stringify({
          template: '___ TABLE employees ___ COLUMN email TEXT;',
          blanks: ['ALTER', 'ADD'],
        }),
      },
      {
        type: 'single_choice',
        title: 'ALTER TABLE usage',
        description: 'Which operation is supported by ALTER TABLE in standard SQL?',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'Delete rows from the table',
            'Add a new column',
            'Change the database name',
            'Run queries on the table',
          ],
          correct: 1,
        }),
      },
    ],
  },
  {
    slug: 'drop-table',
    title: 'DROP TABLE',
    category: 'Schema',
    order_index: 12,
    content_mdx: `# DROP TABLE

The \`DROP TABLE\` statement **permanently deletes** a table and all its data.

## Syntax

\`\`\`sql
DROP TABLE table_name;
\`\`\`

## Safe Version

\`\`\`sql
DROP TABLE IF EXISTS table_name;
\`\`\`

The \`IF EXISTS\` variant prevents an error if the table doesn't exist.

## Example

\`\`\`sql
DROP TABLE IF EXISTS temp_results;
\`\`\`

## WARNING

- \`DROP TABLE\` is **irreversible** — all data is permanently lost.
- There is no "undo" in SQL (unless you use transactions).
- Always double-check the table name before running!

## Difference from DELETE

| Statement | What it removes |
|-----------|-----------------|
| DELETE    | Rows (data only) |
| DROP TABLE | Entire table (structure + data) |
| TRUNCATE  | All rows quickly (keeps structure) |`,
    exercises: [
      {
        type: 'single_choice',
        title: 'Safe DROP',
        description: 'How do you drop a table without getting an error if it does not exist?',
        order_index: 1,
        config_json: JSON.stringify({
          options: [
            'DROP TABLE table_name;',
            'DROP TABLE IF EXISTS table_name;',
            'REMOVE TABLE IF EXISTS table_name;',
            'DELETE TABLE table_name;',
          ],
          correct: 1,
        }),
      },
    ],
  },
  {
    slug: 'inner-join',
    title: 'INNER JOIN',
    category: 'Joins',
    order_index: 13,
    content_mdx: `# INNER JOIN

\`INNER JOIN\` returns rows where there is a **matching value in both tables**.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
\`\`\`

## Example

Tables:
- **employees**: id, name, department_id
- **departments**: id, department_name

\`\`\`sql
SELECT employees.name, departments.department_name
FROM employees
INNER JOIN departments ON employees.department_id = departments.id;
\`\`\`

Only employees **with a matching department** are returned. Employees without a department and departments without employees are excluded.

## Alias shorthand

\`\`\`sql
SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.id;
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Join employees and departments',
        description: 'Select the employee name and department name for all employees that have a department.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE departments (id INTEGER, name TEXT);
INSERT INTO departments VALUES (1,'Engineering'),(2,'Marketing');
CREATE TABLE employees (id INTEGER, name TEXT, dept_id INTEGER);
INSERT INTO employees VALUES (1,'Alice',1),(2,'Bob',2),(3,'Carol',1),(4,'Dave',NULL);`,
          expected_rows: [['Alice','Engineering'],['Bob','Marketing'],['Carol','Engineering']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'INNER JOIN facts',
        description: 'Which statements about INNER JOIN are correct?',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'INNER JOIN returns only rows with matches in both tables',
            'INNER JOIN can be written as just JOIN',
            'INNER JOIN returns NULL for non-matching rows',
            'INNER JOIN requires an ON condition',
          ],
          correct: [0, 1, 3],
        }),
      },
    ],
  },
  {
    slug: 'left-right-join',
    title: 'LEFT and RIGHT JOIN',
    category: 'Joins',
    order_index: 14,
    content_mdx: `# LEFT and RIGHT JOIN

## LEFT JOIN

Returns **all rows from the left table** and the matching rows from the right table. Non-matching rows get NULL.

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
\`\`\`

Result includes ALL employees, even those without a department (department shows NULL).

## RIGHT JOIN

Returns **all rows from the right table** and matching rows from the left. (Less common — often rewritten as a LEFT JOIN.)

\`\`\`sql
SELECT e.name, d.name AS department
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;
\`\`\`

Result includes all departments, even if no employee is assigned.

## Comparison

| Join Type   | Left table rows | Right table rows |
|-------------|-----------------|------------------|
| INNER JOIN  | Only matching   | Only matching    |
| LEFT JOIN   | All             | Matching only    |
| RIGHT JOIN  | Matching only   | All              |`,
    exercises: [
      {
        type: 'sql',
        title: 'LEFT JOIN with NULLs',
        description: 'Select all employee names and their department names using LEFT JOIN. Employees without a department should also appear.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE departments (id INTEGER, name TEXT);
INSERT INTO departments VALUES (1,'Engineering'),(2,'Marketing');
CREATE TABLE employees (id INTEGER, name TEXT, dept_id INTEGER);
INSERT INTO employees VALUES (1,'Alice',1),(2,'Bob',2),(3,'Carol',NULL);`,
          expected_rows: [['Alice','Engineering'],['Bob','Marketing'],['Carol',null]],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'single_choice',
        title: 'LEFT JOIN behavior',
        description: 'A LEFT JOIN returns rows from the left table even when...',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            '...the right table is empty',
            '...there is no matching row in the right table',
            '...the column values are NULL in the left table',
            '...the left table has more columns',
          ],
          correct: 1,
        }),
      },
    ],
  },
  {
    slug: 'self-join',
    title: 'Self JOIN',
    category: 'Joins',
    order_index: 15,
    content_mdx: `# Self JOIN

A **self join** joins a table to itself. It's used to compare rows within the same table.

## Example: Employee Manager Hierarchy

\`\`\`sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

Here, \`employees\` is joined to itself — once as \`e\` (the employee) and once as \`m\` (the manager).

## Another Example: Find pairs of employees in the same department

\`\`\`sql
SELECT a.name AS employee1, b.name AS employee2, a.department
FROM employees a
JOIN employees b ON a.department = b.department AND a.id < b.id;
\`\`\`

The \`a.id < b.id\` condition prevents duplicate pairs and self-pairs.

## Key Point

You **must use aliases** in a self join to distinguish between the two copies of the table.`,
    exercises: [
      {
        type: 'single_choice',
        title: 'Self join requirement',
        description: 'What is required when writing a self join?',
        order_index: 1,
        config_json: JSON.stringify({
          options: [
            'Two copies of the table must exist in the database',
            'Table aliases must be used to distinguish the two copies',
            'The table must have a UNIQUE constraint',
            'Self joins only work with PRIMARY KEY columns',
          ],
          correct: 1,
        }),
      },
      {
        type: 'fill_blank',
        title: 'Self join syntax',
        description: 'Complete the self join to find each employee and their manager.',
        order_index: 2,
        config_json: JSON.stringify({
          template: 'SELECT e.name, m.name AS manager FROM employees ___ JOIN employees ___ ON e.manager_id = m.id;',
          blanks: ['e', 'm'],
          hint: 'Fill in the aliases for the two copies of the employees table.',
        }),
      },
    ],
  },
  {
    slug: 'group-by',
    title: 'GROUP BY',
    category: 'Aggregates',
    order_index: 16,
    content_mdx: `# GROUP BY

The \`GROUP BY\` clause groups rows with the same values into summary rows. It is always used with **aggregate functions**.

## Syntax

\`\`\`sql
SELECT column, aggregate_function(column)
FROM table_name
GROUP BY column;
\`\`\`

## Example

\`\`\`sql
SELECT department, COUNT(*) AS employee_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
\`\`\`

Result:

| department  | employee_count | avg_salary |
|-------------|----------------|------------|
| Engineering | 3              | 77500      |
| Marketing   | 2              | 61000      |

## Rules

- Every column in SELECT that is not inside an aggregate function must appear in GROUP BY.
- You can group by multiple columns.

\`\`\`sql
SELECT department, role, COUNT(*)
FROM employees
GROUP BY department, role;
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Count per department',
        description: 'Write a query to count how many employees are in each department.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT);
INSERT INTO employees VALUES (1,'Alice','Engineering'),(2,'Bob','Marketing'),(3,'Carol','Engineering'),(4,'Dave','HR'),(5,'Eve','Marketing');`,
          expected_rows: [['Engineering','2'],['HR','1'],['Marketing','2']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'fill_blank',
        title: 'GROUP BY syntax',
        description: 'Complete the query to get the average salary per department.',
        order_index: 2,
        config_json: JSON.stringify({
          template: 'SELECT department, ___(salary) AS avg_salary FROM employees ___ BY department;',
          blanks: ['AVG', 'GROUP'],
        }),
      },
    ],
  },
  {
    slug: 'having',
    title: 'HAVING',
    category: 'Aggregates',
    order_index: 17,
    content_mdx: `# HAVING

The \`HAVING\` clause filters **grouped results** (like WHERE, but for aggregates).

## WHERE vs HAVING

| Clause | Filters        | When        |
|--------|----------------|-------------|
| WHERE  | Individual rows | Before grouping |
| HAVING | Groups         | After grouping  |

## Syntax

\`\`\`sql
SELECT column, aggregate_function(column)
FROM table_name
GROUP BY column
HAVING condition;
\`\`\`

## Example

Find departments with more than 2 employees:

\`\`\`sql
SELECT department, COUNT(*) AS count
FROM employees
GROUP BY department
HAVING COUNT(*) > 2;
\`\`\`

## Combined Example

\`\`\`sql
SELECT department, AVG(salary) AS avg_sal
FROM employees
WHERE salary > 40000          -- filter rows first
GROUP BY department
HAVING AVG(salary) > 70000   -- then filter groups
ORDER BY avg_sal DESC;
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Filter groups',
        description: 'Select departments that have more than 1 employee. Show the department name and count.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT);
INSERT INTO employees VALUES (1,'Alice','Engineering'),(2,'Bob','Marketing'),(3,'Carol','Engineering'),(4,'Dave','HR');`,
          expected_rows: [['Engineering','2']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'single_choice',
        title: 'HAVING vs WHERE',
        description: 'Which clause would you use to filter results AFTER aggregation?',
        order_index: 2,
        config_json: JSON.stringify({
          options: ['WHERE', 'FILTER', 'HAVING', 'GROUP BY'],
          correct: 2,
        }),
      },
    ],
  },
  {
    slug: 'aggregate-functions',
    title: 'COUNT, SUM, AVG, MIN, MAX',
    category: 'Aggregates',
    order_index: 18,
    content_mdx: `# Aggregate Functions

Aggregate functions perform calculations on a set of rows and return a single value.

## Common Functions

| Function    | Description                |
|-------------|----------------------------|
| COUNT(col)  | Number of non-NULL values  |
| COUNT(*)    | Total number of rows       |
| SUM(col)    | Sum of all values          |
| AVG(col)    | Average value              |
| MIN(col)    | Smallest value             |
| MAX(col)    | Largest value              |

## Examples

\`\`\`sql
SELECT
  COUNT(*) AS total_employees,
  SUM(salary) AS total_payroll,
  AVG(salary) AS avg_salary,
  MIN(salary) AS lowest_salary,
  MAX(salary) AS highest_salary
FROM employees;
\`\`\`

## Counting distinct values

\`\`\`sql
SELECT COUNT(DISTINCT department) AS dept_count FROM employees;
\`\`\`

## NULL handling

Aggregate functions **ignore NULL values** (except COUNT(*)).`,
    exercises: [
      {
        type: 'sql',
        title: 'Calculate salary stats',
        description: 'Write a query that returns the total number of employees, the average salary, and the maximum salary.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice',75000),(2,'Bob',60000),(3,'Carol',80000),(4,'Dave',55000);`,
          expected_rows: [['4','67500.0','80000.0']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'Aggregate functions',
        description: 'Which functions are standard SQL aggregate functions?',
        order_index: 2,
        config_json: JSON.stringify({
          options: ['SUM()', 'AVG()', 'MEDIAN()', 'MAX()'],
          correct: [0, 1, 3],
        }),
      },
    ],
  },
  {
    slug: 'subqueries',
    title: 'Subqueries',
    category: 'Advanced',
    order_index: 19,
    content_mdx: `# Subqueries

A **subquery** (or inner query) is a query nested inside another query. It is enclosed in parentheses.

## Subquery in WHERE

Find employees earning above average:

\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

## Subquery in FROM (derived table)

\`\`\`sql
SELECT dept, avg_sal
FROM (
  SELECT department AS dept, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department
) AS dept_averages
WHERE avg_sal > 70000;
\`\`\`

## Subquery in SELECT (scalar subquery)

\`\`\`sql
SELECT name,
  salary,
  (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;
\`\`\`

## Correlated Subquery

The inner query references the outer query:

\`\`\`sql
SELECT name FROM employees e
WHERE salary = (
  SELECT MAX(salary) FROM employees WHERE department = e.department
);
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Above average salary',
        description: 'Select the name and salary of all employees who earn more than the average salary.',
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, salary REAL);
INSERT INTO employees VALUES (1,'Alice',75000),(2,'Bob',60000),(3,'Carol',80000),(4,'Dave',55000);`,
          expected_rows: [['Alice','75000.0'],['Carol','80000.0']],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'single_choice',
        title: 'Subquery location',
        description: 'A subquery can appear in which part of a SELECT statement?',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'Only in the WHERE clause',
            'Only in the FROM clause',
            'In WHERE, FROM, or SELECT',
            'Only in the SELECT clause',
          ],
          correct: 2,
        }),
      },
    ],
  },
  {
    slug: 'null-values',
    title: 'NULL Values and IS NULL',
    category: 'Advanced',
    order_index: 20,
    content_mdx: `# NULL Values and IS NULL

\`NULL\` represents a **missing or unknown value**. It is not the same as 0 or an empty string.

## Checking for NULL

You cannot use \`= NULL\`. Use \`IS NULL\` or \`IS NOT NULL\`:

\`\`\`sql
-- Correct:
SELECT * FROM employees WHERE department IS NULL;
SELECT * FROM employees WHERE department IS NOT NULL;

-- WRONG - never use = NULL:
SELECT * FROM employees WHERE department = NULL;  -- Always returns nothing!
\`\`\`

## NULL in expressions

Any arithmetic with NULL returns NULL:

\`\`\`sql
SELECT 5 + NULL;  -- Result: NULL
SELECT 'hello' || NULL;  -- Result: NULL
\`\`\`

## COALESCE

\`COALESCE\` returns the first non-NULL value:

\`\`\`sql
SELECT name, COALESCE(department, 'No Department') AS dept
FROM employees;
\`\`\`

## NULL in aggregates

Aggregate functions skip NULLs (except COUNT(*)):

\`\`\`sql
SELECT AVG(salary) FROM employees;  -- NULLs are ignored in the average
\`\`\``,
    exercises: [
      {
        type: 'sql',
        title: 'Find NULL departments',
        description: "Select all employees where the department is NULL.",
        order_index: 1,
        config_json: JSON.stringify({
          setup_sql: `CREATE TABLE employees (id INTEGER, name TEXT, department TEXT);
INSERT INTO employees VALUES (1,'Alice','Engineering'),(2,'Bob',NULL),(3,'Carol',NULL),(4,'Dave','Marketing');`,
          expected_rows: [['2','Bob',null],['3','Carol',null]],
          check_mode: 'row_count',
        }),
      },
      {
        type: 'multiple_choice',
        title: 'NULL handling',
        description: 'Which of the following are TRUE about NULL in SQL?',
        order_index: 2,
        config_json: JSON.stringify({
          options: [
            'NULL = NULL returns NULL (not TRUE)',
            'Use IS NULL to check for NULL values',
            'NULL is the same as 0',
            'Arithmetic with NULL results in NULL',
          ],
          correct: [0, 1, 3],
        }),
      },
    ],
  },
]

async function main() {
  console.log('Seeding database...')
  const conn = await pool.getConnection()

  try {
    // Create tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student','teacher') NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        teacher_id INT NOT NULL,
        join_code VARCHAR(10) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS class_members (
        class_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (class_id, user_id),
        INDEX idx_members_class (class_id),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(120) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        content_mdx MEDIUMTEXT NOT NULL,
        order_index INT NOT NULL DEFAULT 0,
        category VARCHAR(80) NOT NULL,
        INDEX idx_lessons_slug (slug),
        INDEX idx_lessons_order (order_index)
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        type ENUM('sql','multiple_choice','single_choice','fill_blank') NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        config_json MEDIUMTEXT NOT NULL DEFAULT '{}',
        order_index INT NOT NULL DEFAULT 0,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id),
        INDEX idx_exercises_lesson (lesson_id, order_index)
      )
    `)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id INT NOT NULL,
        exercise_id INT NOT NULL,
        completed_at DATETIME NULL DEFAULT NULL,
        attempts INT NOT NULL DEFAULT 1,
        last_answer TEXT NOT NULL DEFAULT '',
        PRIMARY KEY (user_id, exercise_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        INDEX idx_progress_user (user_id)
      )
    `)

    // Clear existing lesson/exercise data
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    await conn.query('DELETE FROM user_progress')
    await conn.query('DELETE FROM exercises')
    await conn.query('DELETE FROM lessons')
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')

    // Insert lessons and exercises
    for (const lesson of lessons) {
      const [lessonResult] = await conn.query(
        'INSERT INTO lessons (slug, title, content_mdx, order_index, category) VALUES (?, ?, ?, ?, ?)',
        [lesson.slug, lesson.title, lesson.content_mdx, lesson.order_index, lesson.category]
      )
      const lessonId = (lessonResult as { insertId: number }).insertId
      for (const ex of lesson.exercises) {
        await conn.query(
          'INSERT INTO exercises (lesson_id, type, title, description, config_json, order_index) VALUES (?, ?, ?, ?, ?, ?)',
          [lessonId, ex.type, ex.title, ex.description ?? '', ex.config_json, ex.order_index]
        )
      }
    }

    // Create demo accounts if they don't exist
    const demoAccounts = [
      { username: 'teacher', password: 'teacher123', role: 'teacher' },
      { username: 'student', password: 'student123', role: 'student' },
    ]
    for (const account of demoAccounts) {
      const [rows] = await conn.query('SELECT id FROM users WHERE username = ?', [account.username])
      if ((rows as unknown[]).length === 0) {
        const hash = await bcrypt.hash(account.password, 10)
        await conn.query(
          'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
          [account.username, hash, account.role]
        )
        console.log(`Created demo account: ${account.username} / ${account.password}`)
      }
    }

    const totalExercises = lessons.reduce((acc, l) => acc + l.exercises.length, 0)
    console.log(`Seeded ${lessons.length} lessons with ${totalExercises} exercises.`)
  } finally {
    conn.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
