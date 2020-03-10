const mysql = require('mysql');
const inquire = require('inquirer');

const actions = [ {
        type: 'list',
        name: 'keyword',
        message: 'What would you like to do?',
        choices: ['view', 'add', 'go back', 'update employee role','exit']
    }]

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
                    addParams: '(department_name)',
                    viewArr: 'SELECT first_name, last_name, title FROM employees INNER JOIN roles ON employees.role_id = roles.id WHERE roles.department_id =',
                    viewArr2: 'SELECT title, salary FROM roles WHERE roles.department_id ='
                }
            }, 
            {
                name: 'roles',
                value: {
                    field: 'roles',
                    nombre: 'title',
                    addParams: '(title, salary, department_id)',
                    viewArr: 'SELECT first_name, last_name, title FROM employees INNER JOIN roles ON employees.role_id = roles.id WHERE roles.id =',
                    viewArr2: false
                }
            }, 
            {
                name:'employees',
                value: {
                    field: 'employees',
                    nombre: 'CONCAT(first_name, " ", last_name)',
                    addParams: '(first_name, last_name, role_id, manager_id)',
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

function dbIdInquiry(nombre, field, cb){
    connection.query(
        'SELECT '+ nombre +' n, id FROM ' + field,
        function(err, res) {
            if(err) throw err;
            let arr = [{name: 'all', value: false}];
            for(const obj in res) {
                arr.push({name: res[obj].n, value: res[obj].id});
            };
            cb(arr);
        }
    );
};

function tableAll(nombre, field) {
    // console.log('hello?');
    // console.log(nombre, field);
    connection.query(
        'SELECT ' + nombre + ' name FROM ' + field,
        function(err, res) {
            if(err) throw err;
            console.table(res);
            afterconnection();
        }
    );
};

function constructInquiry(message, arr) {
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
                dbIdInquiry('CONCAT(first_name, " ", last_name)', 'employees', function(res){
                    inquire.prompt(constructInquiry('Select employees', res))
                    .then((emp) => {
                        dbIdInquiry('title', 'roles', function(res){
                            inquire.prompt(constructInquiry('Select new role', res))
                            .then((role) =>{
                                connection.query(
                                'UPDATE employees SET role_id = "'+ role.id +'" WHERE id = "' + emp.id + '"',
                                function(err, res){
                                    if(err) throw err;
                                    console.log('success!');
                                    afterconnection();
                                }
                            )
                        })
                    })
                })
            })
            break;
            case 'exit':
                connection.end()
                break;
            case 'go back':
                afterconnection()
                break;
            case 'add':
                console.log('add not implemented yet sorry')
                afterconnection();
                break;
            case 'view':
                inquire.prompt(mainMenu)
                .then(res => {
                    let { viewArr, viewArr2, nombre, field } = res.topic;
                    dbIdInquiry(nombre, field, function(arr){
                        inquire.prompt(constructInquiry('Select '+ field, arr))
                        .then((res) => {
                            console.log(res.id);
                            if(res.id){
                                let id = res.id.toString()
                                makeTables(viewArr, viewArr2, id);
                        } else {tableAll(nombre, field)};
                    })
                })
            })
        }
    })
}