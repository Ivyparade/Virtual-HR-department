const mysql = require('mysql');
const inquire = require('inquirer');

const mainMenu = [
    {
        type: 'list',
        name: 'keyword',
        message: 'What would you like to do?',
        choices: ['view', 'add', 'go back', 'exit']
    },
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





function handleError(err){
    console.log(err);
    connection.end();
}

function dbIdInquiry(nombre, field, cb){
    connection.query(
        'SELECT '+ nombre +' n, id FROM ' + field,
        function(err, res) {
            if(err) throw err;
            let arr = [{name: 'all', value: false}];
            for(const obj in res) {
                arr.push({name: res[obj].n, value: res[obj].id});
            };
            inquire.prompt(constructInquiry('Select '+ field, arr))
            .then((res) => {
                let id = (res.id)
                cb(id);
            })
        }
    );
};

function getAll(nombre, field) {
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

function quest(arr, arr2, id) {
    connection.query(
        arr + id,
        function(err, res) {
            if(err) throw err;
            console.table(res);
            if (arr2) {
                quest(arr2, false, id)
            } else afterconnection();
        }
    );
}

connection.connect((err) => {
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
    afterconnection()
});

function afterconnection() {
    inquire.prompt(mainMenu)
    .then(res => {
        let { viewArr, viewArr2, nombre, field } = res.topic
    switch(res.keyword) {
        case 'add':
            console.log('not implemented yet sorry')
            afterconnection();
            break;
        case 'view':
            dbIdInquiry(nombre, field, function(res){
                if(res){
                    let id = res.toString()
                    quest(viewArr, viewArr2, id);
                } else getAll(nombre, field);
            })
            break;
        case 'go back':
            afterconnection();
            break;
        case 'exit':
            connection.end();
        }
    })
};



// afterconnection()

