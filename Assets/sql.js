// Modules to include in this file
const mySQL = require('mysql');
const fs = require("fs");

class SQL {
    // reset_db = true when creating the SQL object will force the SQL server to load the seed file and drop any existing data
    constructor (reset_db = false) {
        // Stores all the parameters used in the connection
        this.parameters = {};
        this.parameters.host = 'localhost';
        this.parameters.port = 3306;
        this.parameters.user = 'developer';
        this.parameters.password = 'password';
        this.parameters.database = '';
        this.parameters.insecureAuth = true;
        this.parameters.multipleStatements = true;

        // Checks if forcing a database reset
        if (reset_db) {
            this.resetDB();
        } else {
            // SQL string to check if the database exists on the server
            const query_db_exists = [
                "SELECT SCHEMA_NAME",
                "FROM INFORMATION_SCHEMA.SCHEMATA",
                "WHERE SCHEMA_NAME = 'employee_tracker'"].join(" ");

            // SQL string to check if all 3 of the correct tables are in the database
            const query_tables_exists = [
                "SELECT *",
                "FROM INFORMATION_SCHEMA.TABLES",
                "WHERE TABLE_SCHEMA = 'employee_tracker'",
                "AND (TABLE_NAME = 'employee' OR TABLE_NAME = 'department' OR TABLE_NAME = 'role')"].join(" ");

            // Creates the connection object
            const db = this.getdbConnection();

            // Opens the connection to the server
            this.dbOpen(db)
                // Submits the database check query
                .then(() => this.sqlQuery(db, query_db_exists))
                .then(result => {
                    // If the database exists, the length would be 1
                    if (result.length == 0) {
                        // Closes the connection to the database
                        this.dbClose(db);
                        // Notifies the user the database is being reset
                        console.log("Database 'employee_tracker' was not found, uploading seed file");
                        // Function to reset the database
                        this.resetDB();

                        // Breaks out of the .then loop with an error
                        throw new Error("db was not found");
                    }
                    return;
                })
                // The database exists, checks if the tables all exist
                .then(() => this.sqlQuery(db, query_tables_exists))
                .then(result => {
                    // Closes the server connection
                    this.dbClose(db);
                    // If all 3 tables exists, end the .then chain
                    if (result.length == 3) {
                        return;
                    }
                    // One or more tables are missing, notifies the user and calls the function to upload the seed data
                    console.log("The correct tables were not found in 'employee_tracker', uploading seed file");
                    this.resetDB();
                })
                // Error catching which ignores the break from the db reset
                .catch(error => {if (error.message != "db was not found") {console.log(error);}});
        }
    }

    // Function to get the connection object
    getdbConnection() {
        return mySQL.createConnection({
            host: this.parameters.host,
            port: this.parameters.port,
            user: this.parameters.user,
            password: this.parameters.password,
            database: this.parameters.database,
            insecureAuth: this.parameters.insecureAuth,
            multipleStatements: this.parameters.multipleStatements
        });
    };

    // Function to open a connection to the server
    dbOpen(db) {
        return new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    // Function to close the connection to the server
    dbClose(db) {
        return new Promise((resolve, reject) => {
            db.end((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    // Function to open the seed file and provide the contents to the program
    getSeedFile() {
        return new Promise((resolve, reject) => {
            fs.readFile("./Assets/seed.sql", "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };

    // Function to make a SQL query to the server
    sqlQuery (db, sql_string, parameters = []) {
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

    // Function to reset the database from the seed file
    async resetDB() {
        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const sql_seed_text = await this.getSeedFile();
            await this.sqlQuery(db, sql_seed_text);
            this.dbClose(db)
        } catch (error) {
            return console.log(error);
        }
    };

    // Function to get all employees in a printable format
    async getAllEmployees() {
        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, this.viewEmployees());
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get all employees for usage in data manipulation
    async getEmployeesWithId() {
        const view_employees = [
            "SELECT employee.id, first_name, nickname, last_name, role_id, manager_id, title",
            "FROM employee_tracker.employee",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "ORDER BY employee.last_name ASC;"
            ].join(" ");
        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_employees);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get employees from a specific department
    async getEmployeesByDepartment(department_id) {
        const view_employees_of_department = {"where": "WHERE department.id = ?", "from": "FROM employee_tracker.employee"};

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, this.viewEmployees(view_employees_of_department), [department_id]);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }
        
    // Function to get employees under a specific manager
    async getEmployeesByManager(manager_id) {
        const view_employees_of_manager = {"where": "WHERE employee.manager_id = ?", "from": "FROM employee_tracker.employee"};
        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, this.viewEmployees(view_employees_of_manager), [manager_id]);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }

    }

    // Function to get all of the managers (an array of all id's which show up in the manager_id column)
    async getAllManagers() {
        const view_managers = {"where": "", "from": [
                "FROM (SELECT DISTINCT employee.manager_id",
                    "FROM employee_tracker.employee",
                    "WHERE manager_id IS NOT NULL) AS manager_list",
                "LEFT JOIN employee_tracker.employee ON employee.id = manager_list.manager_id"
            ].join(" ")};

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, this.viewEmployees(view_managers));
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }


    }

    // Function to get all the roles in the company in a printable format
    async getAllRoles() {
        const view_roles = [
                "SELECT title AS 'Job Title', CONCAT('$', FORMAT(salary, 2)) AS 'Salary', name AS 'Department Name'",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_roles);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }

    }

    // Function to get all the roles with the id's for data manipulation 
    async getRolesWithId() {
        const view_roles = [
                "SELECT title, role.id as id, name",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_roles);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }

    }

    // Function to get all the departments in the company in a printable format
    async getAllDepartments() {
        const view_departments = [
                "SELECT name AS 'Department Name'",
                "FROM employee_tracker.department",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_departments);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get all the departments in a company with the ID for use in data manipulation
    async getDepartmentsWithID() {
        const view_departments = [
                "SELECT name, id",
                "FROM employee_tracker.department",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_departments);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get the total utilized budget grouped by department
    async getBudgetByDepartment() {
        const view_budget_by_department = [
            "SELECT department.name as Department, CONCAT('$ ', FORMAT(SUM(role.salary), 2)) AS 'Total Utilized Budget'",
            "FROM employee_tracker.employee ",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
            "GROUP BY department.id;"
        ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_budget_by_department);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get the total utilized budget grouped by manager
    async getBudgetByManager() {
        const view_budget_by_manager = [
            "SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', CONCAT('$ ', FORMAT(SUM(role.salary), 2)) AS 'Total Utilized Budget'",
            "FROM employee_tracker.employee ",
            "LEFT JOIN employee_tracker.employee AS manager ON employee.manager_id = manager.id",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
            "WHERE employee.manager_id IS NOT NULL",
            "GROUP BY employee.manager_id;"
        ].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            const result = await this.sqlQuery(db, view_budget_by_manager);
            this.dbClose(db);
            return result;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to get the sql format for the printable version of the employee's information. Keeps it consistent and in 1 place for any SQL query
    viewEmployees = (clauses = {"where": "", "from": "FROM employee_tracker.employee"}) => {
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

    // Function to add a new employee to the database
    async insertEmployee(employee_object) {
        const employee_array = [
            employee_object.firstname, 
            employee_object.nickname, 
            employee_object.lastname, 
            employee_object.role_id, 
            employee_object.manager_id];

        const insert_employee = "INSERT INTO employee_tracker.employee (first_name, nickname, last_name, role_id, manager_id) VALUES (?, ?, ?, ?, ?);";

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            await this.sqlQuery(db, insert_employee, employee_array);
            this.dbClose(db);
            return;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to update an existing employee in the database
    async updateEmployee(employee_object) {
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
            "WHERE id = ?"].join(" ");

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            await this.sqlQuery(db, update_employee, employee_array);
            this.dbClose(db);
            return;
        } catch (error) {
            return console.log(error);
        }
    }

    // Function to delete an employee from the database
    async deleteEmployee(employee_id) {

        const delete_employee = "DELETE FROM employee_tracker.employee WHERE id = ?;";

        const db = this.getdbConnection();
        try {
            await this.dbOpen(db);
            await this.sqlQuery(db, delete_employee, [employee_id]);
            this.dbClose(db);
            return;
        } catch (error) {
            return console.log(error);
        }
    }

}

module.exports = SQL;
