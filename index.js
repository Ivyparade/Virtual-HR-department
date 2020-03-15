const mysql = require('mysql');
const inquire = require('inquirer');

const actions = [ {
    type: 'list',
    name: 'keyword',
    message: 'What would you like to do?',
    choices: ['view', 'add', 'update employee role','exit']
}];

const mainMenu = [
    {
        type: 'list',
        message: 'please select a topic',
        name: 'topic',
        choices: [
            {
                name: 'department',
                value: {
                    field: 'department',
                    nombre: 'department_name',
                    viewArr: 'SELECT first_name, last_name, title FROM employees INNER JOIN roles ON employees.role_id = roles.id WHERE roles.department_id =',
                    viewArr2: 'SELECT title, salary FROM roles WHERE roles.department_id ='
                }
            }, 
            {
                name: 'roles',
                value: {
                    field: 'roles',
                    nombre: 'title',
                    viewArr: 'SELECT first_name, last_name, title FROM employees INNER JOIN roles ON employees.role_id = roles.id WHERE roles.id =',
                    viewArr2: false
                }
            }, 
            {
                name:'employees',
                value: {
                    field: 'employees',
                    nombre: 'CONCAT(first_name, " ", last_name)',
                    viewArr: 'SELECT first_name, last_name, title, salary, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN department ON roles.department_id = department.id WHERE employees.id =',
                    viewArr2: false
                }
            }
        ]
    }
];

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootroot',
  database: 'employee_db'
});

function dbIdInquiry(nombre, field, limited, cb){
    connection.query(
        'SELECT '+ nombre +' n, id FROM ' + field,
        function(err, res) {
            if(err) throw err;
            let arr;
            if(limited){
                arr = [];
            } else {
                arr = [{name: 'all', value: false}];
            }
            for(const obj in res) {
                arr.push({name: res[obj].n, value: res[obj].id});
            };
            cb(arr);
        }
    );
};

function tableAll(nombre, field) {
    connection.query(
        'SELECT ' + nombre + ' name FROM ' + field,
        function(err, res) {
            if(err) throw err;
            console.table(res);
            afterconnection();
        }
    );
};

function constructInquiry(arr, message) {
    return [{
        type: 'list',
        name: 'id',
        message: message,
        choices: arr
    }]
}

function makeTables(arr, arr2, id) {
    connection.query(
        arr + id,
        function(err, res) {
            if(err) throw err;
            console.table(res);
            if(arr2) {
                makeTables(arr2, false, id)
            } else afterconnection();
        }
    );
}

function updateEmployee(){
    dbIdInquiry('CONCAT(first_name, " ", last_name)', 'employees', true, function(res){
        inquire.prompt(constructInquiry(res, 'Select employee'))
            .then((emp) => {
                dbIdInquiry('title', 'roles', true, function(res){
                    inquire.prompt(constructInquiry(res, 'Select new role'))
                        .then((role) =>{
                            connection.query(
                            'UPDATE employees SET role_id = "'+ role.id +'" WHERE id = "' + emp.id + '"',
                            function(err){
                            if(err) throw err;
                            console.log('success!');
                            afterconnection();
                        }
                    )
                })
            })
        })
    })
}

function viewData() {
    inquire.prompt(mainMenu)
    .then(res => {
        let { viewArr, viewArr2, nombre, field } = res.topic;
        dbIdInquiry(nombre, field, false, function(arr){
            inquire.prompt(constructInquiry(arr, 'Select '+ field))
            .then((res) => {
                console.log(res.id);
                if(res.id){
                let id = res.id.toString()
                makeTables(viewArr, viewArr2, id);
                } else {tableAll(nombre, field)};
            })
        })
    })
};

function handleAdditions() {
    inquire.prompt(mainMenu)
    .then(res => {
        switch(res.topic.field){
            case 'department':
                addDepartment();
            break;
            case 'roles':
                addRole();
            break;
            case 'employees':
                addEmployee();
        }
    })
};

function addDepartment(){
    inquire.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter department name',
            validate: function(input){
                if (isNaN(input)) return true;
                else return 'Department name cannot be a number and cannot be blank';
            }
        }
    ])
    .then(res => {
        connection.query(
            "INSERT INTO department SET ?",
            [{department_name: res.name}],
            function(err, result){
                if (err) throw err;
                console.log('success!');
                afterconnection();
            }
        )
    })
};

function addRole(){
    dbIdInquiry('department_name', 'department', true, function(arr){
        inquire.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter role name',
            validate: function(input){
                if (isNaN(input)) return true;
                else return 'Role name cannot use numbers and cannot be blank';
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter salary',
            validate: function(input){
                if (isNaN(parseInt(input))) return 'Salary must be a number (no $)';
                else return true;
            }
        },
        {
            type: 'list',
            name: 'department',
            message: 'Select department',
            choices: arr
        }
        ])
        .then(res => {
            connection.query(
                "INSERT INTO roles SET ?",
                [{
                    title: res.name,
                    salary: res.salary,
                    department_id: res.department
                }],
                function(err){
                    if (err) throw err;
                    console.log('success!');
                    afterconnection();
                }
            )
        });
    });
};

function addEmployee() {
    dbIdInquiry('title', 'roles', true, function(arr){
        inquire.prompt([
            {
                type: 'input',
                name: 'first',
                message: 'Enter first name',
                validate: function(input){
                    if (isNaN(input)) return true;
                    else return 'First name cannot be a number and cannot be blank';
                }
            },
            {
                type: 'input',
                name: 'last',
                message: 'Enter last name',
                validate: function(input){
                    if (isNaN(input)) return true;
                    else return 'Last name cannot be a number and cannot be blank';
                }
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is their job?',
                choices: arr
            }
        ])
        .then(res => {
            connection.query(
                "INSERT INTO employees SET ?",
                [{
                    first_name: res.first,
                    last_name: res.last,
                    role_id: res.role
                }],
                function(err){
                    if (err) throw err;
                    console.log('success!');
                    afterconnection();
                }
            )
        })
    })
}

connection.connect((err) => {
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
    afterconnection();
});

function afterconnection() {
    inquire.prompt(actions)
    .then(action => {
        switch(action.keyword){
            case 'update employee role':
                updateEmployee();
            break;
            case 'exit':
                connection.end()
                break;
            case 'add':
                handleAdditions();
                break;
            case 'view':
                viewData();
        }
    })
}