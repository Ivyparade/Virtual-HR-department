const mysql = require('mysql');
const inquire = require('inquirer');

const mainMenu = [
    {
        type: 'list',
        message: 'please select a topic',
        name: 'topic',
        choices: [
            {name:'Employees', value: 'employee'}, 
            {name:'Departments', value: 'department'}, 
            {name:'Roles', value: 'role'}
        ]
        
    }
];

const addOrView = (res) => {
return [
        {
            type: 'list',
            name: 'do',
            message: 'What would you like to do?',
            choices: [
                {
                    name: `View ${res.topic}s`,
                    value: {selectedFunction(topic) {return getBasicInfo(topic)}}
                },
                {
                    name: `Add ${res.topic}`,
                    value: {selectedFunction(topic) {return addA(topic)}}
                },
                {
                    name: 'Go back',
                    value: false
                }
            ]
        }
    ];
};

const getBasicInfo = (topic) => {
    let QUERY;
    
}

function getItemList(){
    connection.query(
        "SELECT name FROM bids",
        function(err, res) {
            let arr = [];
            if(err) throw err;
            for(const obj in res){
                arr.push(res[obj].name);
            }
            return arr;
        }
    );
};

function departmentChoices(arr) {
    return [{
        type: 'list',
        name: 'department',
        message: 'which department is this role for?',
        choices: arr
    }]
}

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootroot',
  database: 'employee_db'
});

connection.connect((err) => {
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
    afterconnection()
});

const afterconnection = () => {
    connection.query(
        'SELECT * FROM department',
        function(err, res) {
            if(err) throw err;
            let arr = [];
            for(const obj in res) {
                arr.push({name: res[obj].department_name, value: res[obj].id});
            };
            inquire.prompt(departmentChoices(arr))
            .then(() => connection.end())
        }
    );  
};

// .then(arr => {
//     inquire.prompt([
//         {
//             type: 'list',
//             name: 'department',
//             message: 'select a department',
//             choices: arr
//         }
//     ]).then(res => {
//         console.log(res);
//         
//     });
// })

function getAll() {
    connection.query(
        "SELECT first_name, last_name, title, salary, department_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN department ON roles.department_id = department.id",
        function(err, res) {
            if(err) throw err;
            console.table(res);
        }
    );
}
