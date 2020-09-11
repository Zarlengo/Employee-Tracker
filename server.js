// Load external modules
const SQL = require("./Assets/sql");
const inquirer = require("inquirer");
const fs = require("fs");
const { printTable } = require('console-table-printer');


/*
-- Administration Options --
Add department
Remove department
Update department name

Add role
Remove role
Update role title
Update role salary

*/


// Primary question bank for the menu options, default is set to the last selected choice
const what_to_do_question = (default_selection) => {
    return [{
            type: "list",
            name: "what_to_do",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all employees grouped by department",
                "View all employees grouped by manager",
                "View employees in a department",
                "View employees under a manager\n",
                "View all managers",
                "View all roles",
                "View all departments\n",
                "View total utilized budget by department",
                "View total utilized budget by manager\n",
                "Add employee",
                "Remove employee",
                "Update employee name",
                "Update employee role",
                "Update employee manager\n",
                "-- Administration Options --",
                "Exit\n"
            ],
            default: default_selection
        }];
}

// Function to ask questions for a new employees
const add_an_employee = async (firstname = "", nickname = "", lastname = "") => {
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
    try {
        return await inquirer.prompt(new_employee_questions);
    } catch (error) {
        console.log(error);
    }
}

// Function to ask the user to select an existing employee
const choose_an_employee = async (all_employees) => {
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
    try {
        const employee_object = await inquirer.prompt(employee_selection);
        return employee_list.filter(employee => employee.name == employee_object.employee_name)[0];
    } catch (error) {
        console.log(error);
    }

}

// Function to ask the user to select an existing role
const choose_a_role = async (all_roles) => {
    const role_list = [];
    all_roles.forEach(role => role_list.push({name: `${role.title} (${role.name})`, id: role.id}));
    const role_selection =  [{
        type: "list",
        name: "role_name",
        message: "Please select the role",
        choices: role_list.map(role => role.name)
    }];
    try {
        const role_object = await inquirer.prompt(role_selection);
        return role_list.filter(role => role.name == role_object.role_name)[0];
    } catch (error) {
        console.log(error);
    }
}

// Function to ask the user to select an existing department
const choose_a_department = async (all_departments) => {
    const department_list = [];
    all_departments.forEach(department => department_list.push({name: department.name, id: department.id}));
    const department_question =  [{
        type: "list",
        name: "department",
        message: "Please choose a department",
        choices: department_list.map(department => department.name)
    }];
    try {
        const department_object = await inquirer.prompt(department_question);
        return department_list.filter(department => department.name == department_object.department)[0];
    } catch (error) {
        console.log(error);
    }
}

// Function to ask the user to select an existing manager
const choose_a_manager = async (all_managers) => {
    const manager_list = [];
    all_managers.forEach(manager => manager_list.push({name: `${ manager["First Name"] } ${manager["Last Name"]} (${ manager.Department})`, id: manager["Employee ID"]}));
    const manager_selection =  [{
        type: "list",
        name: "manager_name",
        message: "Please choose the manager",
        choices: manager_list.map(manager => manager.name)
    }];
    try {
        const manager_object = await inquirer.prompt(manager_selection);
        return manager_list.filter(manager => manager.name == manager_object.manager_name)[0];
    } catch (error) {
        console.log(error);
    }
}

// Initial function to run when loading the program
const init = async () => {

    // Loads the SQL class as an object SQL(true) will force a reset and load seed file to the database
    const SQL_object =  new SQL();

    try {
        // Welcome graphics on program start
        console.log(load_welcome());
    } catch (error) {   
        return console.log(error);
    }

    // Variable used to repeat question bank before terminating session
    let run_loop = true;

    // First choice on menu option, each sequential loop will use the previous selection as the default choice
    let default_selection = "View All Employees"
    while (run_loop) {
        try {
            const response = await inquirer.prompt(what_to_do_question(default_selection));
        
            // Initialize variables used through various switch cases
            let all_employees;
            let all_roles;
            let all_departments;
            let all_managers;

            let employee;
            let role;
            let department;
            let manager;

            let employee_object;

            // Saving the default for the next question loop
            default_selection = response.what_to_do;
            switch(default_selection) {
                case "View all employees":
                    printTable(await SQL_object.getAllEmployees());
                    break;

                case "View all employees grouped by department":
                    all_departments = await SQL_object.getDepartmentsWithID();
                    for (let i = 0; i < all_departments.length; i++) {
                        printTable(await SQL_object.getEmployeesByDepartment(all_departments[i].id));
                    }
                    break;

                case "View all employees grouped by manager":
                    all_managers = await SQL_object.getAllManagers();
                    for (let i = 0; i < all_managers.length; i++) {
                        printTable(await SQL_object.getEmployeesByManager(all_managers[i]["Employee ID"]));
                    }
                    break;

                case "View employees in a department":
                    all_departments = await SQL_object.getDepartmentsWithID()
                    department = await choose_a_department(all_departments);
                    printTable(await SQL_object.getEmployeesByDepartment(department.id));
                    break;

                case "View employees under a manager\n":
                    all_managers = await SQL_object.getAllManagers();
                    manager = await choose_a_manager(all_managers);
                    printTable(await SQL_object.getEmployeesByManager(manager.id));
                    break;

                case "View all managers":
                    printTable(await SQL_object.getAllManagers());
                    break;

                case "View all roles":
                    printTable(await SQL_object.getAllRoles());
                    break;

                case "View all departments\n":
                    printTable(await SQL_object.getAllDepartments());
                    break;

                case "View total utilized budget by department":
                    printTable(await SQL_object.getBudgetByDepartment());
                    break;

                case "View total utilized budget by manager\n":
                    printTable(await SQL_object.getBudgetByManager());
                    break;

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
                    console.log(`${employee.firstname} ${employee.lastname} has been added to the system.\n`);
                    break;

                case "Remove employee":
                    all_employees = await SQL_object.getEmployeesWithId();
                    all_managers = await SQL_object.getAllManagers();
                    employee = await choose_an_employee(all_employees);

                    // Managers are foreign keys to employees, deleting a manager will result in a SQL error
                    if (all_managers.filter(manager => manager["Employee ID"]  == employee.id).length == 0) {
                        await SQL_object.deleteEmployee(employee.id);
                        printTable(await SQL_object.getAllEmployees());
                        console.log(`${employee.name} has been removed from the system.\n`);
                    } else {
                        printTable(await SQL_object.getEmployeesByManager(employee.id));
                        console.log(`${employee.name} is a manager and was not removed from the system. To delete this person, please change the current manager for all employees under ${employee.name}, see table.\n`);
                    }
                    break;

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
                    console.log(`${employee.name} has been updated in the system to ${new_name.firstname} ${new_name.lastname}.\n`);
                    break;

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
                    console.log(`${employee.name} has been updated in the system with role ${new_role.name}.\n`);
                    break;

                case "Update employee manager\n":
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
                    console.log(`${employee.name} has been updated in the system with manager ${new_manager.name}.\n`);
                    break;

                case "-- Administration Options --":
                    break;

                case "Exit\n":
                default:
                    run_loop = false;
                    console.log("Thank you for using this program, your session has been terminated.\n")
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

// Function to load text file with the welcome logo
const load_welcome = () => {
    try {
        return fs.readFileSync("./Assets/welcome.txt", "utf8");
    } catch (error) {
        console.log(error);
    }
}

init();