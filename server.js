// Load external modules
const SQL = require("./Assets/sql");
const inquirer = require("inquirer");
const fs = require("fs");
const { printTable } = require('console-table-printer');

// Primary question bank for the menu options, default is set to the last selected choice
const what_to_do_question = (default_selection) => {
    return [{
            type: "list",
            name: "what_to_do",
            message: "What would you like to do?",
            choices: [
                "View all employees",
                "View all employees grouped by role",
                "View all employees grouped by department",
                "View all employees grouped by manager\n",
                "View employees in a role",
                "View employees in a department",
                "View employees under a manager\n",
                "View all managers",
                "View all roles",
                "View all roles grouped by department",
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

// Administration question bank
const administration_questions = (default_selection) => {
    return [{
            type: "list",
            name: "what_to_do",
            message: "Administration options: What would you like to do?",
            choices: [
                "Add role",
                "Remove role",
                "Update role title and salary",
                "Update role's department\n",
                "Add department",
                "Remove department",
                "Update department name\n",
                "Return to the previous menu\n"
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
        nickname: employee.nickname,
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

// Function to ask questions for a new role
const add_a_role = async (title = "", salary = "") => {
    const new_role_questions =  [{
        type: "input",
        name: "title",
        message: "Please enter the title for the role",
        default: title,
        validate: (name) => name !== ""
    },{
        type: "input",
        name: "salary",
        message: "Please enter the salary for the role",
        default: salary,
        validate: (name) => name !== ""
    }];
    try {
        return await inquirer.prompt(new_role_questions);
    } catch (error) {
        console.log(error);
    }
}

// Function to ask the user to select an existing role
const choose_a_role = async (all_roles) => {
    const role_list = [];
    all_roles.forEach(role => role_list.push({name: `${role.title} (${role.name})`, id: role.id, title: role.title, salary: role.salary, department_id: role.department_id}));
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

// Function to ask questions for a new role
const add_a_department = async (department_name = "") => {
    const new_department_questions =  [{
        type: "input",
        name: "department_name",
        message: "Please enter a name for the department",
        default: department_name,
        validate: (name) => name !== ""
    }];
    try {
        return await inquirer.prompt(new_department_questions);
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

    // Loads the SQL class as an object
    const SQL_object =  new SQL();

    try {
        // SQL_object.resetDB(); will force a reset and load seed file to the database
        // SQL_object.checkDB(); verifies the SQL structure is correct
        await SQL_object.checkDB();

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
                    printTable(await SQL_object.employees.all());
                    break;

                case "View all employees grouped by role":
                    all_roles = await SQL_object.roles.data();
                    for (let i = 0; i < all_roles.length; i++) {
                        printTable(await SQL_object.employees.withRole(all_roles[i].id));
                    }
                    break;

                case "View all employees grouped by department":
                    all_departments = await SQL_object.departments.data();
                    for (let i = 0; i < all_departments.length; i++) {
                        printTable(await SQL_object.employees.withDepartment(all_departments[i].id));
                    }
                    break;

                case "View all employees grouped by manager\n":
                    all_managers = await SQL_object.managers.all();
                    for (let i = 0; i < all_managers.length; i++) {
                        printTable(await SQL_object.employees.withManager(all_managers[i]["Employee ID"]));
                    }
                    break;

                case "View employees in a role":
                    all_roles = await SQL_object.roles.data();
                    role = await choose_a_role(all_roles);
                    printTable(await SQL_object.employees.withRole(role.id));
                    break;

                case "View employees in a department":
                    all_departments = await SQL_object.departments.data();
                    department = await choose_a_department(all_departments);
                    printTable(await SQL_object.employees.withDepartment(department.id));
                    break;

                case "View employees under a manager\n":
                    all_managers = await SQL_object.managers.all();
                    manager = await choose_a_manager(all_managers);
                    printTable(await SQL_object.employees.withManager(manager.id));
                    break;

                case "View all managers":
                    printTable(await SQL_object.managers.all());
                    break;

                case "View all roles":
                    printTable(await SQL_object.roles.all());
                    break;

                case "View all roles grouped by department":
                    all_departments = await SQL_object.departments.data();
                    for (let i = 0; i < all_departments.length; i++) {
                        printTable(await SQL_object.roles.withDepartment(all_departments[i].id));
                    }
                    break;

                case "View all departments\n":
                    printTable(await SQL_object.departments.all());
                    break;

                case "View total utilized budget by department":
                    printTable(await SQL_object.budget.byDepartment());
                    break;

                case "View total utilized budget by manager\n":
                    printTable(await SQL_object.budget.byManager());
                    break;

                case "Add employee":
                    all_managers = await SQL_object.managers.all();
                    all_roles = await SQL_object.roles.data();
                    employee = await add_an_employee();
                    role = await choose_a_role(all_roles);
                    manager = await choose_a_manager(all_managers);
                    employee.role_id = role.id;
                    employee.manager_id = manager.id;
                    await SQL_object.employees.insert(employee);
                    printTable(await SQL_object.employees.all());
                    console.log(`${employee.firstname} ${employee.lastname} has been added to the system.\n`);
                    break;

                case "Remove employee":
                    all_employees = await SQL_object.employees.data();
                    all_managers = await SQL_object.managers.all();
                    employee = await choose_an_employee(all_employees);

                    // Managers are foreign keys to employees, deleting a manager will result in a SQL error
                    if (all_managers.filter(manager => manager["Employee ID"]  == employee.id).length == 0) {
                        await SQL_object.employees.delete(employee.id);
                        printTable(await SQL_object.employees.all());
                        console.log(`${employee.name} has been removed from the system.\n`);
                    } else {
                        printTable(await SQL_object.employees.withManager(employee.id));
                        console.log(`${employee.name} is a manager and was not removed from the system. To delete this person, please change the current manager for all employees under ${employee.name}, see table.\n`);
                    }
                    break;

                case "Update employee name":
                    all_employees = await SQL_object.employees.data();
                    employee = await choose_an_employee(all_employees);
                    const new_name = await add_an_employee(employee.firstname, employee.nickname, employee.lastname);
                    employee_object = {
                        id: employee.id,
                        firstname: new_name.firstname,
                        nickname: new_name.nickname,
                        lastname: new_name.lastname,
                        role_id: employee.role_id,
                        manager_id:employee.manager_id
                    };
                    await SQL_object.employees.update(employee_object);
                    printTable(await SQL_object.employees.all());
                    console.log(`${employee.name} has been updated in the system to ${new_name.firstname} ${new_name.lastname}.\n`);
                    break;

                case "Update employee role":
                    all_employees = await SQL_object.employees.data();
                    all_roles = await SQL_object.roles.data();
                    employee = await choose_an_employee(all_employees);
                    const new_role = await choose_a_role(all_roles);
                    employee_object = {
                        id: employee.id,
                        firstname: employee.firstname,
                        nickname: employee.nickname,
                        lastname: employee.lastname,
                        role_id: new_role.id,
                        manager_id:employee.manager_id
                    };
                    await SQL_object.employees.update(employee_object);
                    printTable(await SQL_object.employees.all());
                    console.log(`${employee.name} has been updated in the system with role ${new_role.name}.\n`);
                    break;

                case "Update employee manager\n":
                    all_employees = await SQL_object.employees.data();
                    all_managers = await SQL_object.managers.all();
                    employee = await choose_an_employee(all_employees);
                    const new_manager = await choose_a_manager(all_managers);
                    employee_object = {
                        id: employee.id,
                        firstname: employee.firstname,
                        nickname: employee.nickname,
                        lastname: employee.lastname,
                        role_id: employee.role_id,
                        manager_id:new_manager.id
                    };
                    await SQL_object.employees.update(employee_object);
                    printTable(await SQL_object.employees.all());
                    console.log(`${employee.name} has been updated in the system with manager ${new_manager.name}.\n`);
                    break;

                case "-- Administration Options --":
                    await admin(SQL_object);
                    break;

                case "Exit\n":
                default:
                    run_loop = false;
                    console.log("Thank you for using this program, your session has been terminated.\n");
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

// Administration function
const admin = async (SQL_object) => {

    // Variable used to repeat question bank before terminating admin loop
    let run_loop = true;

    // First choice on menu option, each sequential loop will use the previous selection as the default choice
    let default_selection = "Add role"
    while (run_loop) {
        try {
            const response = await inquirer.prompt(administration_questions(default_selection));
        
            // Initialize variables used through various switch cases
            let all_employees;
            let all_roles;
            let all_departments;

            let role;
            let department;

            let department_object;
            let role_object;
            let new_department;

            // Saving the default for the next question loop
            default_selection = response.what_to_do;
            switch(default_selection) {
                case "Add role":
                    all_departments = await SQL_object.departments.data();
                    role = await add_a_role();
                    department = await choose_a_department(all_departments);
                    role.department_id = department.id;
                    await SQL_object.roles.insert(role);
                    printTable(await SQL_object.roles.all());
                    console.log(`${role.title} (${department.name}) has been added to the system with a salary of $ ${role.salary}.\n`);
                    break;

                case "Remove role":
                    all_roles = await SQL_object.roles.data();
                    all_employees = await SQL_object.employees.data();
                    role = await choose_a_role(all_roles);

                    // Roles are foreign keys to employees, deleting a role with an existing employee will result in a SQL error
                    if (all_employees.filter(employee => employee.role_id  == role.id).length == 0) {
                        await SQL_object.roles.delete(role.id);
                        printTable(await SQL_object.roles.all());
                        console.log(`Role ${role.name} has been removed from the system.\n`);
                    } else {
                        printTable(await SQL_object.employees.withRole(role.id));
                        console.log(`${role.name} was not removed from the system as employees belong to this group. To delete this role, please change the current role for all employees under ${role.name}, see table.\n`);
                    }
                    break;

                case "Update role title and salary":
                    all_roles = await SQL_object.roles.data();
                    role = await choose_a_role(all_roles);
                    const new_role = await add_a_role(role.title, role.salary);
                    role_object = {
                        id: role.id,
                        title: new_role.title,
                        salary: new_role.salary,
                        department_id: role.department_id
                    };
                    await SQL_object.roles.update(role_object);
                    printTable(await SQL_object.roles.all());
                    console.log(`Role ${role.title} has been updated in the system to ${new_role.title} with a salary of $ ${new_role.salary}.\n`);
                    break;

                case "Update role's department\n":
                    all_roles = await SQL_object.roles.data();
                    all_departments = await SQL_object.departments.data();
                    role = await choose_a_role(all_roles);
                    new_department = await choose_a_department(all_departments);
                    role_object = {
                        id: role.id,
                        title: role.title,
                        salary: role.salary,
                        department_id: new_department.id
                    };
                    await SQL_object.roles.update(role_object);
                    printTable(await SQL_object.roles.all());
                    console.log(`Role ${role.name} has been updated in the system to department ${new_department.name}.\n`);
                    break;

                case "Add department":
                    department = await add_a_department();
                    await SQL_object.departments.insert(department);
                    printTable(await SQL_object.departments.all());
                    console.log(`${department.department_name} has been added to the system.\n`);
                    break;

                case "Remove department":
                    all_departments = await SQL_object.departments.data();  
                    all_roles = await SQL_object.roles.data();
                    department = await choose_a_department(all_departments);

                    // Departments are foreign keys to roles, deleting a department with an existing role will result in a SQL error
                    if (all_roles.filter(role => role.department_id  == department.id).length == 0) {
                        await SQL_object.departments.delete(department.id);
                        printTable(await SQL_object.departments.all());
                        console.log(`Department ${department.name} has been removed from the system.\n`);
                    } else {
                        printTable(await SQL_object.roles.withDepartment(department.id));
                        console.log(`Department ${department.name} was not removed from the system as roles belong to this group. To delete this department, please change the current department for roles under ${department.name}, see table.\n`);
                    }
                    break;

                case "Update department name\n":
                    all_departments = await SQL_object.departments.data(); 
                    department = await choose_a_department(all_departments);
                    new_department = await add_a_department(department.name);
                    department_object = {
                        id: department.id,
                        name: new_department.department_name
                    };
                    await SQL_object.departments.update(department_object);
                    printTable(await SQL_object.departments.all());
                    console.log(`Department ${department.name} has been updated in the system to ${new_department.department_name}.\n`);
                    break;

                case "Return to the previous menu\n":
                default:
                    run_loop = false;
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