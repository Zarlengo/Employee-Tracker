const SQL = require("./Assets/sql");
const inquirer = require("inquirer");
const fs = require("fs");
const { printTable } = require('console-table-printer');



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



const what_to_do_question = (default_selection) => {
    return [{
            type: "list",
            name: "what_to_do",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View employees by department",
                "View employees by manager",
                "View all managers",
                "View all roles",
                "View all departments",
                "View total utilized budget by department",
                "View total utilized budget by manager",
                "Add employee",
                "Remove employee",
                "Update employee name",
                "Update employee role",
                "Update employee manager",
                "-- Administration Options --",
                "Exit"
            ],
            default: default_selection
        }];
}

async function choose_a_department (all_departments) {
    const department_list = [];
    let department_object = {};
    all_departments.forEach(department => department_list.push({name: department.name, id: department.id}));
    const department_question =  [{
        type: "list",
        name: "department",
        message: "Please choose a department",
        choices: department_list.map(department => department.name)
    }];
    await inquirer.prompt(department_question)
        .then(response => department_object = response)
        .catch(error => console.log(error));

    return department_list.filter(department => department.name == department_object.department)[0];
}

async function add_an_employee (firstname = "", nickname = "", lastname = "") {
    let employee_object = {};
    const new_employee_questions =  [{
        type: "input",
        name: "firstname",
        message: "Please enter the employee's first name",
        default: firstname,
        validate: (name) => name !== ""
    },{
        type: "input",
        name: "nickname",
        message: "Please enter the employee's prefered name (can leave blank to use the first name)",
        default: nickname,
    },{
        type: "input",
        name: "lastname",
        message: "Please enter the employee's last name",
        default: lastname,
        validate: (name) => name !== ""
    }];

    await inquirer.prompt(new_employee_questions)
        .then(response => {employee_object = response;})
        .catch(error => console.log(error));

    return employee_object;
}

async function choose_a_manager(all_managers) {
    const manager_list = [];
    let manager_object = {};
    all_managers.forEach(manager => manager_list.push({name: `${ manager["First Name"] } ${manager["Last Name"]} (${ manager.Department})`, id: manager["Employee ID"]}));

    const manager_selection =  [{
        type: "list",
        name: "manager_name",
        message: "Please choose the manager",
        choices: manager_list.map(manager => manager.name)
    }];
    await inquirer.prompt(manager_selection)
        .then(response => manager_object = response)
        .catch(error => console.log(error));

    return manager_list.filter(manager => manager.name == manager_object.manager_name)[0];
}

async function choose_a_role(all_roles) {
    const role_list = [];
    let role_object = {};
    all_roles.forEach(role => role_list.push({name: `${role.title} (${role.name})`, id: role.id}));

    const role_selection =  [{
        type: "list",
        name: "role_name",
        message: "Please select the role",
        choices: role_list.map(role => role.name)
    }];
    await inquirer.prompt(role_selection)
        .then(response => role_object = response)
        .catch(error => console.log(error));

    return role_list.filter(role => role.name == role_object.role_name)[0];
}

async function choose_an_employee(all_employees) {
    let employee_object = {};
    const employee_list = [];
    all_employees.forEach(employee => employee_list.push({
        name: `${ employee.first_name } ${employee.last_name} (${ employee.title})`, 
        id: employee.id,
        firstname: employee.first_name, 
        lastname: employee.last_name,
        role_id: employee.role_id,
        manager_id: employee.manager_id
    }));
    const employee_selection =  [{
        type: "list",
        name: "employee_name",
        message: "Please choose the employee",
        choices: employee_list.map(employee => employee.name)
    }];
    await inquirer.prompt(employee_selection)
        .then(response => employee_object = response)
        .catch(error => console.log(error));

    return employee_list.filter(employee => employee.name == employee_object.employee_name)[0];
}

async function init () {
    const SQL_object =  new SQL();
    await load_welcome()
        .then(data => console.log(data))
        .catch(error => console.log(error));

    let run_loop = true;
    let default_selection = "View All Employees"
    while (run_loop) {
        // What would you like to do?
        await inquirer.prompt(what_to_do_question(default_selection))
            .then(async function (response) {
                let all_employees;
                let all_roles;
                let all_departments;
                let all_managers;

                let employee;
                let role;
                let department;
                let manager;

                let employee_object;


                default_selection = response.what_to_do;
                switch(default_selection) {
                    case "View all employees":
                        printTable(await SQL_object.getAllEmployees());
                        return;

                    case "View employees by department":
                        all_departments = await SQL_object.getDepartmentsWithID()
                        department = await choose_a_department(all_departments);
                        console.log(department);
                        printTable(await SQL_object.getEmployeesByDepartment(department.id));
                        return;

                    case "View employees by manager":
                        all_managers = await SQL_object.getAllManagers();
                        manager = await choose_a_manager(all_managers);
                        printTable(await SQL_object.getEmployeesByManager(manager.id));
                        return;

                    case "View all managers":
                        printTable(await SQL_object.getAllManagers());
                        return;

                    case "View all roles":
                        printTable(await SQL_object.getAllRoles());
                        return;

                    case "View all departments":
                        printTable(await SQL_object.getAllDepartments());
                        return;

                    case "View total utilized budget by department":
                        printTable(await SQL_object.getBudgetByDepartment());
                        return;

                    case "View total utilized budget by manager":
                        printTable(await SQL_object.getBudgetByManager());
                        return;

                    case "Add employee":
                        all_managers = await SQL_object.getAllManagers();
                        all_roles = await SQL_object.getRolesWithId();
                        employee = await add_an_employee();
                        role = await choose_a_role(all_roles);
                        manager = await choose_a_manager(all_managers);
                        employee.role_id = role.id;
                        employee.manager_id = manager.id;
                        await SQL_object.insertEmployee(employee);
                        printTable(await SQL_object.getAllEmployees());
                        console.log(`${employee.firstname} ${employee.lastname} has been added to the system.`);
                        return;

                    case "Remove employee":
                        all_employees = await SQL_object.getEmployeesWithId();
                        all_managers = await SQL_object.getAllManagers();
                        employee = await choose_an_employee(all_employees);

                        // Managers are foreign keys to employees, deleting a manager will result in a SQL error
                        if (all_managers.filter(manager => manager["Employee ID"]  == employee.id).length == 0) {
                            await SQL_object.deleteEmployee(employee.id);
                            printTable(await SQL_object.getAllEmployees());
                            console.log(`${employee.name} has been removed from the system.`);
                            return;
                        } else {
                            printTable(await SQL_object.getEmployeesByManager(employee.id));
                            console.log(`${employee.name} is a manager and was not removed from the system. To delete this person, please change the current manager for all employees under ${employee.name}, see table.`);
                            return;
                        }

                    case "Update employee name":
                        all_employees = await SQL_object.getEmployeesWithId();
                        employee = await choose_an_employee(all_employees);
                        const new_name = await add_an_employee(employee.firstname, "", employee.lastname);
                        employee_object = {
                            id: employee.id,
                            firstname: new_name.firstname,
                            nickname: new_name.nickname,
                            lastname: new_name.lastname,
                            role_id: employee.role_id,
                            manager_id:employee.manager_id
                        };
                        await SQL_object.updateEmployee(employee_object);
                        printTable(await SQL_object.getAllEmployees());
                        console.log(`${employee.name} has been updated in the system to ${new_name.firstname} ${new_name.lastname}.`);
                        return;

                    case "Update employee role":
                        all_employees = await SQL_object.getEmployeesWithId();
                        all_roles = await SQL_object.getRolesWithId();
                        employee = await choose_an_employee(all_employees);
                        const new_role = await choose_a_role(all_roles);
                        console.log(new_role);
                        employee_object = {
                            id: employee.id,
                            firstname: employee.firstname,
                            nickname: employee.nickname,
                            lastname: employee.lastname,
                            role_id: new_role.id,
                            manager_id:employee.manager_id
                        };
                        console.log(employee_object);
                        await SQL_object.updateEmployee(employee_object);
                        printTable(await SQL_object.getAllEmployees());
                        console.log(`${employee.name} has been updated in the system with role ${new_role.name}.`);
                        return;

                    case "Update employee manager":
                        all_employees = await SQL_object.getEmployeesWithId();
                        all_managers = await SQL_object.getAllManagers();
                        employee = await choose_an_employee(all_employees);
                        const new_manager = await choose_a_manager(all_managers);
                        console.log(new_manager);
                        employee_object = {
                            id: employee.id,
                            firstname: employee.firstname,
                            nickname: employee.nickname,
                            lastname: employee.lastname,
                            role_id: employee.role_id,
                            manager_id:new_manager.id
                        };

                        await SQL_object.updateEmployee(employee_object);
                        printTable(await SQL_object.getAllEmployees());
                        console.log(`${employee.name} has been updated in the system with manager ${new_manager.name}.`);
                        return;

                    case "-- Administration Options --":

                    case "Exit":
                    default:
                        run_loop = false;
                        console.log("Thank you for using this program, your session has been terminated.")
                        break;
                }
            })
            .catch(error => console.log(error));
    }
}

const load_welcome = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./Assets/welcome.txt", "utf8", (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });

}

init();