// Modules to include in this file
const mySQL = require('mysql');
const fs = require("fs");

class SQL {
    constructor () {
        // Stores all the parameters used in the connection
        this.parameters = {};
        this.parameters.host = 'localhost';
        this.parameters.port = 3306;
        this.parameters.user = 'root';
        this.parameters.password = 'password';
        this.parameters.database = '';
        this.parameters.insecureAuth = true;
        this.parameters.multipleStatements = true;

        // Set container handlers for SQL queries
        this.employees = {};
        this.managers = {};
        this.budget = {};
        this.roles = {};
        this.departments = {};

        /*****   EMPLOYEE RELATED SQL QUERIES   *****/
        // Function to get all employees in a printable format
        this.employees.all = () => {
            return this.sqlQuery(this.viewEmployees());
        }

        // Function to get all employees for usage in data manipulation
        this.employees.data = () => {
            const view_employees = [
                "SELECT employee.id, first_name, nickname, last_name, role_id, manager_id, title",
                "FROM employee_tracker.employee",
                "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
                "ORDER BY employee.last_name ASC;"].join(" ");
            return this.sqlQuery(view_employees);
        }

        // Function to get employees with a specific
        this.employees.withRole = (role_id) => {
            const view_employees_of_role = {"where": "WHERE role.id = ?", "from": "FROM employee_tracker.employee"};
            return this.sqlQuery(this.viewEmployees(view_employees_of_role), [role_id]);
        }

        // Function to get employees from a specific department
        this.employees.withDepartment = (department_id) => {
            const view_employees_of_department = {"where": "WHERE department.id = ?", "from": "FROM employee_tracker.employee"};
            return this.sqlQuery(this.viewEmployees(view_employees_of_department), [department_id]);
        }
                
        // Function to get employees under a specific manager
        this.employees.withManager = (manager_id) => {
            const view_employees_of_manager = {"where": "WHERE employee.manager_id = ?", "from": "FROM employee_tracker.employee"};
            return this.sqlQuery(this.viewEmployees(view_employees_of_manager), [manager_id]);
        }

        // Function to add a new employee to the database
        this.employees.insert = (employee_object) => {
            if (employee_object.nickname == "") {
                employee_object.nickname = null;
            }
            const employee_array = [
                employee_object.firstname, 
                employee_object.nickname, 
                employee_object.lastname, 
                employee_object.role_id, 
                employee_object.manager_id];

            const insert_employee = "INSERT INTO employee_tracker.employee (first_name, nickname, last_name, role_id, manager_id) VALUES (?, ?, ?, ?, ?);";
            return this.sqlQuery(insert_employee, employee_array);
        }

        // Function to update an existing employee in the database
        this.employees.update = (employee_object) => {
            if (employee_object.nickname == "") {
                employee_object.nickname = null;
            }

            const employee_array = [
                employee_object.firstname, 
                employee_object.nickname, 
                employee_object.lastname, 
                employee_object.role_id, 
                employee_object.manager_id,
                employee_object.id];

            const update_employee = [
                "UPDATE employee_tracker.employee",
                "SET first_name = ?, nickname = ?, last_name = ?, role_id = ?, manager_id = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlQuery(update_employee, employee_array);
        }

        // Function to delete an employee from the database
        this.employees.delete = (employee_id) => {
            const delete_employee = "DELETE FROM employee_tracker.employee WHERE id = ?;";
            return this.sqlQuery(delete_employee, [employee_id]);
        }

        /*****   MANAGER RELATED SQL QUERIES   *****/
        // Function to get all of the managers (an array of all id's which show up in the manager_id column)
        this.managers.all = () => {
            const view_managers = {"where": "", "from": [
                "FROM (SELECT DISTINCT employee.manager_id",
                    "FROM employee_tracker.employee",
                    "WHERE manager_id IS NOT NULL) AS manager_list",
                "LEFT JOIN employee_tracker.employee ON employee.id = manager_list.manager_id"].join(" ")};
            return this.sqlQuery(this.viewEmployees(view_managers));
        }

        /*****   BUDGET RELATED SQL QUERIES   *****/
        // Function to get the total utilized budget grouped by department
        this.budget.byDepartment = () => {
            const view_budget_by_department = [
                "SELECT department.name as Department, CONCAT('$ ', FORMAT(SUM(role.salary), 2)) AS 'Total Utilized Budget'",
                "FROM employee_tracker.employee ",
                "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
                "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
                "GROUP BY department.id;"].join(" ");
            return this.sqlQuery(view_budget_by_department);
        }

        // Function to get the total utilized budget grouped by manager
        this.budget.byManager = () => {
            const view_budget_by_manager = [
                "SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', CONCAT('$ ', FORMAT(SUM(role.salary), 2)) AS 'Total Utilized Budget'",
                "FROM employee_tracker.employee ",
                "LEFT JOIN employee_tracker.employee AS manager ON employee.manager_id = manager.id",
                "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
                "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
                "WHERE employee.manager_id IS NOT NULL",
                "GROUP BY employee.manager_id;"].join(" ");
            return this.sqlQuery(view_budget_by_manager);
        }


        /*****   ROLE RELATED SQL QUERIES   *****/
        // Function to get all the roles in the company in a printable format
        this.roles.all = () => {
            const view_roles = [
                "SELECT title AS 'Job Title', CONCAT('$', FORMAT(salary, 2)) AS 'Salary', name AS 'Department Name'",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name;"].join(" ");
            return this.sqlQuery(view_roles);
        }

        // Function to get all the roles with the id's for data manipulation 
        this.roles.data = () => {
            const view_roles = [
                "SELECT title, role.id as id, name, department_id, salary",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name;"].join(" ");
            return this.sqlQuery(view_roles);
        }

        // Function to get roles in a specific department for data manipulation 
        this.roles.withDepartment = (department_id) => {
            const view_roles = [
                "SELECT title as Title, name as Department",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "WHERE department_id = ?",
                "ORDER BY name;"].join(" ");
            return this.sqlQuery(view_roles, [department_id]);
        }

        // Function to add a new role to the database
        this.roles.insert = (role_object) => {
            const role_array = [
                role_object.title, 
                role_object.salary,
                role_object.department_id];

            const insert_role = "INSERT INTO employee_tracker.role (title, salary, department_id) VALUES (?, ?, ?);";
            return this.sqlQuery(insert_role, role_array);
        }

        // Function to update a role in the database
        this.roles.update = (role_object) => {
            const role_array = [
                role_object.title, 
                role_object.salary,
                role_object.department_id,
                role_object.id];

            const update_role = [
                "UPDATE employee_tracker.role",
                "SET title = ?, salary = ?, department_id = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlQuery(update_role, role_array);
        }

        // Function to delete a role from the database
        this.roles.delete = (role_id) => {
            const delete_role = "DELETE FROM employee_tracker.role WHERE id = ?;";
            return this.sqlQuery(delete_role, [role_id]);
        }

        /*****   DEPARTMENT RELATED SQL QUERIES   *****/
        // Function to get all the departments in the company in a printable format
        this.departments.all = () => {
            const view_departments = [
                    "SELECT name AS 'Department Name'",
                    "FROM employee_tracker.department",
                    "ORDER BY name;"].join(" ");

            return this.sqlQuery(view_departments);
        }

        // Function to get all the departments in a company with the ID for use in data manipulation
        this.departments.data = () => {
            const view_departments = [
                    "SELECT name, id",
                    "FROM employee_tracker.department",
                    "ORDER BY name;"].join(" ");
            return this.sqlQuery(view_departments);
        }

        // Function to add a new department to the database
        this.departments.insert = (department_object) => {
            const department_array = [
                department_object.department_name];

            const insert_department = "INSERT INTO employee_tracker.department (name) VALUES (?);";
            return this.sqlQuery(insert_department, department_array);
        }

        // Function to update a department in the database
        this.departments.update = (department_object) => {
            const department_array = [
                department_object.name,
                department_object.id];

            const update_department = [
                "UPDATE employee_tracker.department",
                "SET name = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlQuery(update_department, department_array);
        }

        // Function to delete a department from the database
        this.departments.delete = (department_id) => {
            const delete_department = "DELETE FROM employee_tracker.department WHERE id = ?;";
            return this.sqlQuery(delete_department, [department_id]);
       }

    }

    // Function to open a connection to the server
    dbOpen = (db) => {
        return new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    // Function to make a SQL query to the server
    dbQuery = (db, sql_string, parameters = []) => {
        return new Promise((resolve, reject) => {
            try {db.query(sql_string, parameters, (err, result, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            })}
            catch (err) {
                reject(err);
            }
        });
    }

    // Function to close the connection to the server
    dbClose = (db) => {
        return new Promise((resolve, reject) => {
            db.end((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    // Function to manage a SQL query
    sqlQuery = async (sql_string, parameters = []) => {
        const db = mySQL.createConnection({
            host: this.parameters.host,
            port: this.parameters.port,
            user: this.parameters.user,
            password: this.parameters.password,
            database: this.parameters.database,
            insecureAuth: this.parameters.insecureAuth,
            multipleStatements: this.parameters.multipleStatements
        });

        try {
            await this.dbOpen(db);
            const response = await this.dbQuery(db, sql_string, parameters);
            await this.dbClose(db);
            return response;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to open the seed file and provide the contents to the program
    getSeedFile = () => {
        return new Promise((resolve, reject) => {
            try {
                resolve(fs.readFileSync("./Assets/seed.sql", "utf8"))
            } catch (error) {
                reject(error);
            }
        });
    };

    // Function to reset the database from the seed file
    resetDB = () => {
        return new Promise(async (resolve, reject) => {
            const sql_seed_text = await this.getSeedFile();
            try {
                resolve(await this.sqlQuery(sql_seed_text));
            } catch (error) {
                reject(error);
            }
        });
    };

    // Function to check the database for the correct structure
    checkDB = () => {
        return new Promise(async (resolve, reject) => {
            // SQL string to check if the database exists on the server
            const query_db_exists = [
                "SELECT SCHEMA_NAME",
                "FROM INFORMATION_SCHEMA.SCHEMATA",
                "WHERE SCHEMA_NAME = 'employee_tracker'"].join(" ");
            let response = await this.sqlQuery(query_db_exists);

            // If the database exists, the length would be 1
            if (response.length == 0) {
                // Notifies the user the database is being reset
                console.log("Database 'employee_tracker' was not found, uploading seed file");

                // Function to reset the database
                resolve(this.resetDB());
            } else {
                // SQL string to check if all 3 of the correct tables are in the database
                const query_tables_exists = [
                    "SELECT *",
                    "FROM INFORMATION_SCHEMA.TABLES",
                    "WHERE TABLE_SCHEMA = 'employee_tracker'",
                    "AND (TABLE_NAME = 'employee' OR TABLE_NAME = 'department' OR TABLE_NAME = 'role')"].join(" ");
                response = await this.sqlQuery(query_tables_exists);

                // If all 3 tables exists then the structure is good
                if (response.length != 3) {
                    // One or more tables are missing, notifies the user and calls the function to upload the seed data
                    console.log("The correct tables were not found in 'employee_tracker', uploading seed file");

                    // Function to reset the database
                    resolve(this.resetDB());
                }
            }
            resolve(true);
        });
    }


    // Function to get the sql format for the printable version of the employee's information. Keeps it consistent and in 1 place for any SQL query
    viewEmployees = (clauses = {"where": "", "from": "FROM employee_tracker.employee"}) => {
        return [
            "SELECT employee.id AS 'Employee ID', COALESCE(CONCAT(employee.first_name, ' (', employee.nickname, ')'), employee.first_name) AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.name AS Department, CONCAT('$ ', FORMAT(role.salary, 2)) AS Salary, CONCAT(COALESCE(CONCAT(manager.first_name, ' (', manager.nickname, ')'), manager.first_name), ' ', manager.last_name) AS 'Manager'",
            `${ clauses.from }`,
            "LEFT JOIN employee_tracker.employee AS manager ON employee.manager_id = manager.id",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
            `${ clauses.where }`,
            "ORDER BY employee.last_name ASC;"
        ].join(" ");
    }
}

module.exports = SQL;
