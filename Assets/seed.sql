-- Initial setup to create / reset database
DROP DATABASE IF EXISTS employee_tracker;
CREATE DATABASE employee_tracker;
USE employee_tracker;

-- Create the department table
CREATE TABLE department (
	id INT AUTO_INCREMENT,
	name VARCHAR(30),
	PRIMARY KEY (id)
);

-- Populate the department table with generic data
INSERT INTO department (id, NAME) VALUE
(1, "Sales"),
(2, "Engineering"),
(3, "Finance"),
(4, "Legal"),
(5, "Customer Service"),
(6, "Human Resources"),
(7, "Purchasing"),
(8, "Marketing"),
(9, "Operations"),
(10, "Quality"),
(11, "Executive");


-- Create the roles table
CREATE TABLE role (
	id INT AUTO_INCREMENT,
	title VARCHAR(30),
	salary DECIMAL,
	department_id INT,
	PRIMARY KEY (id),
	FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Populate the roles with generic data, salary pulled from national average on salary.com
INSERT INTO role (id, title, salary, department_id) VALUE
(1, "Sales Lead", 118000, 1),
(2, "Salesperson", 68000, 1),
(3, "Sales Manager", 118000, 1),
(4, "Lead Engineer", 133000, 2),
(5, "Software Engineer", 110000, 2),
(6, "Engineer Manager", 140000, 2),
(7, "Accountant", 63000, 3),
(8, "Legal Team Lead", 77000, 4),
(9, "Lawyer", 130000, 4),
(10, "Account Manager", 120000, 5),
(11, "Human Resources Generalist", 69000, 6),
(12, "Human Resources Manager", 104000, 6),
(13, "Buyer", 56000, 7),
(14, "Commodity Manager", 104000, 7),
(15, "Social Media Specialist", 82000, 8),
(16, "Marketing Manager", 105000, 8),
(17, "Assembly Technician", 37000, 9),
(18, "Operations Supervisor", 62000, 9),
(19, "Quality Control Inspector", 48000, 10),
(20, "Quality Assurance Manager", 111000, 10),
(21, "CEO", 819000, 11);

CREATE TABLE employee (
	id INT AUTO_INCREMENT,
	first_name VARCHAR(30),
	nickname VARCHAR(30),
	last_name VARCHAR(30),
	role_id INT,
	manager_id INT,
	PRIMARY KEY (id),
	FOREIGN KEY (role_id) REFERENCES role(id),	
	CONSTRAINT employees_ibfk_1 FOREIGN KEY (manager_id) REFERENCES employee(id)
);

-- Populate the employees table with randomly generated names
INSERT INTO employee (id, first_name, nickname, last_name, role_id, manager_id) VALUES 
(19,"Ted","","Allen",21,NULL),
(2,"Layla","","Moore",13,19),
(3,"Nathaniel","","Hall",16,19),
(4,"Jenson","Jack","Howard",13,19),
(8,"Willie","","Thompson",7,19),
(13,"Adil","","Lewis",20,19),
(21,"Ria","","Williams",13,19),
(24,"Antonia","Tonya","Martin",7,19),
(26,"Katherine","Karah","Wilson",12,19),
(29,"Jonathan","Jon","Mitchell",10,19),
(43,"Francis","Pacho","Scott",6,19),
(48,"Bradley","Brad","Robinson",14,19),
(49,"Rachael","","Lee",10,19),
(52,"Floyd","","Reyes",13,19),
(53,"Kenneth","Ken","Reed",9,19),
(54,"Ashley","","Gomez",10,19),
(58,"Irene","Rina","Brown",18,19),
(60,"Rita","","Gonzales",13,19),
(61,"Peter","Pete","Diaz",8,19),
(63,"Haider","","Campbell",14,19),
(64,"Kieron","","Edwards",3,19),
(68,"Hazel","","Jones",10,19),
(15,"Lara","","Morales",11,26),
(42,"Imran","","Morgan",11,26),
(59,"Julian ","Jules","Collins",11,26),
(6,"Ivan","Jack","Nguyen",4,43),
(10,"Noah","","Clark",4,43),
(11,"Adam","","Roberts",4,43),
(14,"Oscar","","Wright",5,43),
(17,"Xander","","Ramirez",5,43),
(18,"Dexter","","Green",5,43),
(20,"John","Jax","Torres",5,43),
(22,"Monica","","Thomas",5,43),
(23,"Jerry","","Phillips",5,43),
(27,"Eleanor","Ellie","White",5,43),
(28,"Sienna","","Rodriguez",5,43),
(30,"Myles","","Carter",5,43),
(32,"Nicole","Niki","Davis",5,43),
(35,"Willard","Lyam","Baker",5,43),
(36,"Osian","","Parker",5,43),
(39,"Henry","Hank","Evans",5,43),
(41,"Isabel","","Perez",5,43),
(44,"Erica","","Murphy",5,43),
(46,"Lowri","","Smith",5,43),
(47,"Kane","","Rivera",5,43),
(50,"Ebony","","Kelly",5,43),
(51,"Charlie","Chaz","Cooper",5,43),
(57,"Omar","","Ortiz",5,43),
(62,"Nathan","","Rogers",5,43),
(66,"India","","Martinez",5,43),
(67,"Spencer","","Morris",5,43),
(69,"Tomos","","Adams",5,43),
(73,"Gemma","","Anderson",5,43),
(7,"Francesca","Franki","Harris",17,58),
(31,"Alexia","Sandra","Miller",17,58),
(34,"Chad","","Nelson",17,58),
(38,"Andrew","Andy","Turner",17,58),
(55,"Millie","","Taylor",17,58),
(65,"Jean","Jack","Cruz",17,58),
(70,"Dominic","","King",17,58),
(71,"Tommy","Tomek","Sanchez",17,58),
(1,"Yahya","","Gutierrez",2,64),
(5,"Molly","","Johnson",2,64),
(9,"Muhammed","","Hill",1,64),
(12,"Nicholas","Nick","Walker",2,64),
(16,"Eugene","Gene","Peterson",1,64),
(33,"Savannah","","Lopez",2,64),
(37,"Sana","","Cook",2,64),
(45,"Isabella","Isie","Hernandez",2,64),
(56,"Damien","","Young",2,64),
(72,"Yasmin","","Garcia",2,64),
(75,"Dean","","Bailey",2,64),
(25,"Saul","","Stewart",15,3),
(40,"Ffion","","Jackson",19,13),
(74,"Harris","","Flores",19,13);