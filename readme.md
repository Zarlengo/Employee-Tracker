# Employee Management Interface
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Description
A node based CLI to manage an organization employee database, including heirarchy for employee / manager relationships

## Table of Contents

1. [Installation](#1-installation)
2. [Usage](#2-usage)
3. [License](#3-license)
4. [Contributing](#4-contributing)
5. [Tests](#5-tests)
6. [Questions](#6-questions)

## 1 Installation
1. Download repository
```
https://github.com/Zarlengo/Employee-Tracker
```

2. Install dependencies
```
npm install
```

## 2 Usage
![Welcome](./Images/welcome.jpg)

Menu options
* [View all employees](#view-all-employees)
* [View all employees grouped by role](#view-all-employees-grouped-by-role)
* [View all employees grouped by department](#view-all-employees-grouped-by-department)
* [View all employees grouped by manager](#view-all-employees-grouped-by-manager)
* [View employees in a role](#view-employees-in-a-role)
* [View employees in a department](#view-employees-in-a-department)
* [View employees under a manager](#view-employees-under-a-manager)
* [View all managers](#view-all-managers)
* [View all roles](#view-all-roles)
* [View all roles grouped by department](#view-all-roles-grouped-by-department)
* [View all departments](#view-all-departments)
* [View total utilized budget by department](#view-total-utilized-budget-by-department)
* [View total utilized budget by manager](#view-total-utilized-budget-by-manager)
* [Add employee](#add-employee)
* [Remove employee](#remove-employee)
* [Update employee name](#update-employee-name)
* [Update employee role](#update-employee-role)
* [Update employee manager](#update-employee-manager)

Administration Menu Options

![Administration Menu Options](./Images/admin.jpg)
* [Add role](#add-role)
* [Remove role](#remove-role)
* [Update role title and salary](#update-role-title-and-salary)
* [Update role's department](#update-roles-department)
* [Add department](#add-department)
* [Remove department](#remove-department)
* [Update department name](#update-department-name)

***
#### View all employees
![View all employees](./Images/view_all_employees.jpg)

Shows all employees within the company in order alphabetically by last name
![All employees](./Images/all_employees.jpg)
***
#### View all employees grouped by role
![View all employees grouped by role](./Images/view_all_employees_role.jpg)

Shows all employees within the company split out by their role
![All employees by role](./Images/all_employees_role.jpg)
***
#### View all employees grouped by department
![View all employees grouped by department](./Images/view_all_employees_department.jpg)

Shows all employees within the company split out by department
![All employees by department](./Images/all_employees_department.jpg)
***
#### View all employees grouped by manager
![View all employees grouped by manager](./Images/view_all_employees_manager.jpg)

Shows all employees within the company split out by direct manager
![All employees by manager](./Images/all_employees_manager.jpg)
***
#### View employees in a role
![View all employees in a role](./Images/view_all_employees_in_role.jpg)

Shows all employees who are in a specific role
![Employees in a role](./Images/employee_role.gif)
***
#### View employees in a department
![View all employees in a department](./Images/view_all_employees_in_department.jpg)

Shows all employees who are in a specific department
![Employees in a department](./Images/employee_department.gif)
***
#### View employees under a manager
![View all employees under a manager](./Images/view_all_employees_under_manager.jpg)

Shows all employees who are direct reports for a specific manager
![Employees with a department](./Images/employee_manager.gif)
***
#### View all managers
![View all managers](./Images/view_all_managers.jpg)

Shows all managers within the company
![All managers](./Images/all_managers.jpg)
***
#### View all roles
![View all roles](./Images/view_all_roles.jpg)

Shows all roles available within the company in order alphabetically by department
![All roles](./Images/all_roles.jpg)
***
#### View all roles grouped by department
![View all roles grouped by department](./Images/view_all_roles_department.jpg)

Shows all roles grouped by which department they belong
![All roles by department](./Images/all_roles_department.jpg)
***
#### View all departments
![View all departments](./Images/view_all_departments.jpg)

Shows all departments available within the company
![All departments](./Images/all_departments.jpg)
***
#### View total utilized budget by department
![View total utilized budget by department](./Images/view_budget_department.jpg)

Shows the total utilized budget for each department
![Budget by departments](./Images/budget_department.jpg)
***
#### View total utilized budget by manager
![View total utilized budget by manager](./Images/view_budget_manager.jpg)

Shows the total utilized budget for each manager
![Budget by manager](./Images/budget_manager.jpg)
***
#### Add employee
![Add employee](./Images/add_employee.jpg)

Allows adding an employee to the database
![Add employee](./Images/add_employee.gif)
***
#### Remove employee
![Remove employee](./Images/remove_employee.jpg)

Allows the removal of an employee from the database
![Remove employee](./Images/remove_employee.gif)

```diff
- Employees can only be removed if they are not currently a manager
```
![Remove employee error](./Images/remove_employee_error.jpg)
***
#### Update employee name
![Update employee name](./Images/update_employee_name.jpg)

Allows the updating of an employee's name. Current name shows as default and will be utilized if hitting return without including an entry
![Update employee name](./Images/update_employee_name.gif)
***
#### Update employee role
![Update employee role](./Images/update_employee_role.jpg)

Allows the updating of an employee's role
![Update employee role](./Images/update_employee_role.gif)
***
#### Update employee manager
![Update employee manager](./Images/update_employee_manager.jpg)

Allows the updating of an employees manager
![Update employee manager](./Images/update_employee_manager.gif)
***
#### Add role
![Add role](./Images/add_role.jpg)

Allows adding a role to the database
![Add role](./Images/add_role.gif)
***
#### Remove role
![Remove role](./Images/remove_role.jpg)

Allows the removal of a role from the database
![Remove role](./Images/remove_role.gif)

```diff
- Roles can only be removed if they do not currently belong to an employee
```
![Remove role error](./Images/remove_role_error.jpg)
***
#### Update role title and salary
![Update role title and salary](./Images/update_role_title.jpg)

Allows the updating of a role's title and/or salary. Current title and salary shows as default and will be utilized if hitting return without including an entry
![Update role title and salary](./Images/update_role_title.gif)
***
#### Update role's department
![Update role's department](./Images/update_role_department.jpg)

Allows updating which department the role belongs
![Update role's department](./Images/update_role_department.gif)
***
#### Add department
![Add department](./Images/add_department.jpg)

Allows the adding of a department
![Add department](./Images/add_department.gif)
***
#### Remove department
![Remove department](./Images/remove_department.jpg)

Allows the removal of a department
![Remove department](./Images/remove_department.gif)

```diff
- Departments can only be removed if they do not currently belong to a role
```
![Remove department error](./Images/remove_department_error.jpg)
***
#### Update department name
![Update department name](./Images/update_department.jpg)

Allows updating of a departments name. Current name shows as default and will be utilized if hitting return without including an entry
![Update department name](./Images/update_department.gif)
***


## 3 License
    Copyright © 2020 Chris Zarlengo
    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## 4 Contributing
* [Zarlengo](https://github.com/Zarlengo)


## 5 Tests
1. Test stuff

## 6 Questions
* [Github Profile for Zarlengo](https://github.com/Zarlengo)
* [Send email to christopher@zarlengo.net](mailto:christopher@zarlengo.net)
* [File an issue](https://github.com/Zarlengo/Employee-Tracker/issues)
