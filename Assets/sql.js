const mySQL = require('mysql');
const fs = require("fs");

class SQL {
    constructor (reset_db = false) {
        this.parameters = {};
        this.parameters.host = 'localhost';
        this.parameters.port = 3306;
        this.parameters.user = 'developer';
        this.parameters.password = 'password';
        this.parameters.database = '';
        this.parameters.insecureAuth = true;
        this.parameters.multipleStatements = true;

        if (reset_db) {
            this.resetDB();
        } else {
            const query_db_exists = [
                "SELECT SCHEMA_NAME",
                "FROM INFORMATION_SCHEMA.SCHEMATA",
                "WHERE SCHEMA_NAME = 'employee_tracker'"].join(" ");

            const query_tables_exists = [
                "SELECT *",
                "FROM INFORMATION_SCHEMA.TABLES",
                "WHERE TABLE_SCHEMA = 'employee_tracker'",
                "AND (TABLE_NAME = 'employee' OR TABLE_NAME = 'department' OR TABLE_NAME = 'role')"].join(" ");

            const db = this.getdbConnection();
            this.dbOpen(db)
                .then(() => this.sqlQuery(db, query_db_exists))
                .then(result => {
                    if (result.length == 0) {
                        this.dbClose(db);
                        console.log("Database 'employee_tracker' was not found, uploading seed file");
                        this.resetDB();
                        throw new Error("db was not found");
                    }
                    return;
                })
                .then(() => this.sqlQuery(db, query_tables_exists))
                .then(result => {
                    this.dbClose(db);
                    if (result.length == 3) {
                        return;
                    }
                    console.log("The correct tables were not found in 'employee_tracker', uploading seed file");
                    this.resetDB();
                })
                .catch(error => {if (error.message != "db was not found") {console.log(error);}});
        }
    }

    getdbConnection = () => {
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


    getSeedFile = () => {
        return new Promise((resolve, reject) => {
            fs.readFile("./seed.sql", "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    };

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

    resetDB = () => {
        const db = this.getdbConnection();
        this.dbOpen(db)
            .then(() => this.getSeedFile())
            .then(sql_seed_text => this.sqlQuery(db, sql_seed_text))
            .then(() => this.dbClose(db))
            .catch(error => console.log(error));
    };

    // Get all employees
    getAllEmployees() {
        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, this.viewEmployees()))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

    // Get all employees
    getEmployeesWithId() {
        const view_employees = [
            "SELECT employee.id, first_name, nickname, last_name, role_id, manager_id, title",
            "FROM employee_tracker.employee",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "ORDER BY employee.last_name ASC;"
            ].join(" ");
        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_employees))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

            /*
    // View all employees grouped by department
    viewAllEmployeesGroupedByDepartment() {
        await dbOpen();


        const department_array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        for(let i = 0; i < department_array.length; i++) {
            await sqlQuery(await viewEmployees(view_employees_of_department), [department_array[i]]);
        }
        await dbClose();

    }
*/
/*
    // View all employees grouped by manager
    viewAllEmployeesGroupedByManager() {
        const manager_array = [3, 13, 19, 26, 43, 58, 64];
    
        await dbOpen();
        for(let i = 0; i < manager_array.length; i++) {
            await sqlQuery(await viewEmployees(view_employees_of_manager), [manager_array[i]]);
        }
        await dbClose();

    }
*/

    // Get employees by department
    getEmployeesByDepartment(department_id) {
        const view_employees_of_department = {"where": "WHERE department.id = ?", "from": "FROM employee_tracker.employee"};

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, this.viewEmployees(view_employees_of_department), [department_id]))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }
        
    // Get employees by manager
    getEmployeesByManager(manager_id) {
        const view_employees_of_manager = {"where": "WHERE employee.manager_id = ?", "from": "FROM employee_tracker.employee"};
        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, this.viewEmployees(view_employees_of_manager), [manager_id]))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));

    }

    // Get all managers
    getAllManagers() {
        const view_managers = {"where": "", "from": [
                "FROM (SELECT DISTINCT employee.manager_id",
                    "FROM employee_tracker.employee",
                    "WHERE manager_id IS NOT NULL) AS manager_list",
                "LEFT JOIN employee_tracker.employee ON employee.id = manager_list.manager_id"
            ].join(" ")};

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, this.viewEmployees(view_managers)))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));


    }

    // Get all roles
    getAllRoles() {
        const view_roles = [
                "SELECT title AS 'Job Title', CONCAT('$', FORMAT(salary, 2)) AS 'Salary', name AS 'Department Name'",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_roles))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));

    }

    // Get roles with the id
    getRolesWithId() {
        const view_roles = [
                "SELECT title, role.id as id, name",
                "FROM employee_tracker.role",
                "LEFT JOIN employee_tracker.department ON role.department_id = department.id",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_roles))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));

    }

    // Get all departments
    getAllDepartments() {
        const view_departments = [
                "SELECT name AS 'Department Name'",
                "FROM employee_tracker.department",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_departments))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

    // Get departments with the ID
    getDepartmentsWithID() {
        const view_departments = [
                "SELECT name, id",
                "FROM employee_tracker.department",
                "ORDER BY name"
            ].join(" ");

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_departments))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

    // Get total utilized budget by department
    getBudgetByDepartment() {
        const view_budget_by_department = [
            "SELECT department.name as Department, CONCAT('$ ', FORMAT(SUM(role.salary), 2)) AS 'Total Utilized Budget'",
            "FROM employee_tracker.employee ",
            "LEFT JOIN employee_tracker.role ON employee.role_id = role.id",
            "LEFT JOIN employee_tracker.department ON department.id = role.department_id",
            "GROUP BY department.id;"
        ].join(" ");

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_budget_by_department))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

    // Get total utilized budget by manager
    getBudgetByManager() {
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
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, view_budget_by_manager))
            .then(result => {   
                this.dbClose(db);
                return result;
            })
            .catch(error => console.log(error));
    }

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

    insertEmployee(employee_object) {
        const employee_array = [
            employee_object.firstname, 
            employee_object.nickname, 
            employee_object.lastname, 
            employee_object.role_id, 
            employee_object.manager_id];

        const insert_employee = "INSERT INTO employee_tracker.employee (first_name, nickname, last_name, role_id, manager_id) VALUES (?, ?, ?, ?, ?);";

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, insert_employee, employee_array))
            .then(() => {   
                this.dbClose(db);
                return;
            })
            .catch(error => console.log(error));
    }

    updateEmployee(employee_object) {
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
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, update_employee, employee_array))
            .then(() => {   
                this.dbClose(db);
                return;
            })
            .catch(error => console.log(error));
    }

    deleteEmployee(employee_id) {

        const delete_employee = "DELETE FROM employee_tracker.employee WHERE id = ?;";

        const db = this.getdbConnection();
        return this.dbOpen(db)
            .then(() => this.sqlQuery(db, delete_employee, [employee_id]))
            .then(() => {   
                this.dbClose(db);
                return;
            })
            .catch(error => console.log(error));
    }

}

module.exports = SQL;

const SQL_object =  new SQL();