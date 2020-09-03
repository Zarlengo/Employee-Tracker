
const test_mode = false;

const mySQL = require('mysql');
const fs = require("fs");
const { printTable } = require('console-table-printer');


const db = mySQL.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'developer',
    password: 'password',
    database: '',
    insecureAuth : true,
    multipleStatements: true
});

const dbOpen = () => {
    db.connect((err) => {
        if (err) {
            throw err;
        }
    });
};

const dbClose = () => {
    db.end();
};

function sqlQuery (sql_string, parameters = []) {
    db.query(sql_string, parameters, (err, result, fields) => {
        if (err) throw err;
        printTable(result);
    });
}

async function init() {
    await dbOpen();

    if (test_mode) {

        const sql_seed_text = fs.readFileSync("./seed.sql", "utf8", (error, data) => {
            if (error) throw error;
        });

        await sqlQuery(sql_seed_text, []);

    }
/*
// EXTRA: View all employees grouped by manager
    for(let i = 0; i < manager_array.length; i++) {
        await sqlQuery(await viewEmployees(view_employees_of_manager), [manager_array[i]]);
    }
*/

// EXTRA: View all employees grouped by department
    for(let i = 0; i < department_array.length; i++) {
        await sqlQuery(await viewEmployees(view_employees_of_department), [department_array[i]]);
    }  
    



// View all employees
    // await sqlQuery(await viewEmployees(), []);

// View employees by department
    // await sqlQuery(await viewEmployees(view_employees_of_department), [2]);
    
// View employees by manager
    // await sqlQuery(await viewEmployees(view_employees_of_manager), [19]);

// View all managers
    // await sqlQuery(await viewEmployees(view_managers), []);

// View all roles
    // await sqlQuery(view_roles, []);

// View all departments
    // await sqlQuery(view_departments, []);

// View total utilized budget by department
    // await sqlQuery(view_budget_by_department, []);

// View total utilized budget by manager
    // await sqlQuery(view_budget_by_manager, []);



    await dbClose();

}
/* MENU OPTIONS
View all employees
View employees by department
View employees by manager
View all managers
View all roles
View all departments
View total utilized budget by department
View total utilized budget by manager

Add employee
Remove employee

Update employee name
Update employee role
Update employee manager

-- Administration Options --
Add department
Remove department
Update department name

Add role
Remove role
Update role title
Update role salary

*/

const viewEmployees = (clauses = {"where": "", "from": "FROM employee_tracker.employee"}) => {
    return [
        "SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.name AS Department, CONCAT('$ ', FORMAT(role.salary, 2)) AS Salary, CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'",
        `${ clauses.from }`,
        "LEFT JOIN employee_tracker.employee AS manager ON employee.manager_id = manager.id",
        "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
        "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
        `${ clauses.where }`,
        "ORDER BY employee.last_name ASC;"
    ].join(" ");
}

// View employees by department
const department_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const view_employees_of_department = {"where": "WHERE department.id = ?", "from": "FROM employee_tracker.employee"};

// View employees by manager
const manager_array = [3, 13, 19, 26, 43, 58, 64];
const view_employees_of_manager = {"where": "WHERE employee.manager_id = ?", "from": "FROM employee_tracker.employee"};

// View all managers
const view_managers = {"where": "", "from": [
        "FROM (SELECT DISTINCT employee.manager_id",
            "FROM employee_tracker.employee",
            "WHERE manager_id IS NOT NULL) AS manager_list",
        "LEFT JOIN employee_tracker.employee ON employee.id = manager_list.manager_id"
    ].join(" ")};

// View all roles
const view_roles = [
        "SELECT title AS 'Job Title', CONCAT('$', FORMAT(salary, 2)) AS 'Salary', name AS 'Department Name'",
        "FROM employee_tracker.role",
        "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
        "ORDER BY name"
    ].join(" ");

// View all departments
const view_departments = [
        "SELECT name AS 'Department Name'",
        "FROM employee_tracker.department",
        "ORDER BY name"
    ].join(" ");


// View total utilized budget by department
const view_budget_by_department = [
    "SELECT department.name as Department, CONCAT('$ ', FORMAT(role.salary, 2)) AS 'Total Utilized Budget'",
    "FROM employee_tracker.employee ",
    "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
    "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
    "GROUP BY department.id;"
].join(" ");

// View total utilized budget by manager
const view_budget_by_manager = [
    "SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', CONCAT('$ ', FORMAT(role.salary, 2)) AS 'Total Utilized Budget'",
    "FROM employee_tracker.employee ",
    "LEFT JOIN employee_tracker.employee AS manager ON employee.manager_id = manager.id",
    "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
    "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
    "WHERE employee.manager_id IS NOT NULL",
    "GROUP BY employee.manager_id;"
].join(" ");

init();