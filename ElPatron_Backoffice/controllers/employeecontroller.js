const employeeController ={};
const {Empleado} = require('../db');
const jwt = require("jsonwebtoken");
const secretKey = "secret"; // Usa una clave segura y almacénala en variables de entorno


function findOne(username) {

    return Empleado.findOne({
        where: {
            Usuario: username
        }
    });
}



employeeController.createEmployee = (req, res, next) => {

    const {NombreRegister,Apellido1,Apellido2,Email,Username,PasswordRegister,ConfirmPasswordRegister} = req.body


    console.log(req.body.id)
    Empleado.create({Nombre: NombreRegister,Apellido1: Apellido1,Apellido2: Apellido2,Usuario: Username,Contrasenia:PasswordRegister,Correo: Email}).then( u =>res.json(u))
        .catch(next);
};



employeeController.get = (req, res, next) => {

    Empleado.findAll().then(employees => {
        res.json(employees)
    }).catch(next);
};



employeeController.getEmployee = (req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*"); // Permite cualquier origen, puedes cambiar "" por la URL específica
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    //next();

    const { username, password } = req.body;


    if (!username || !password){
        return res.status(400).json({message: "nombre de usuario y contraseña son requeridos"});
    }

    

    findOne(username).then(user => {
        if (user && user.Contrasenia === req.body.password) {

            console.log(user)
            const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

            res.cookie("jwt", token);

            console.log("Autenticación exitosa");
            // Redirigir a la página estática del panel de servicios
            return res.status(200).json({ redirectUrl: "/services2.html" });

        } else {
            console.log(req.body)
            console.log(user)
            return res.status(401).json({ message: "Autenticación fallida" });
        }
    }).catch(error => {
        console.error("Error interno del servidor", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    });
};

/*

employeeController.getUsers = (req, res, next) => {
    const id = req.params.userId;
    findOne(id).then(users => {
        if(users){
            res.json(users)
        } else {
            res.status(404).send();
        }
    }).catch(next);
};

employeeController.editUser = (req, res, next) => {
    const newUser = req.body;
    const id = newUser? newUser.id : undefined;
    findOne(id).then(user => {
        if (user) {
            Object.assign(user, newUser);
            user.save().then(user => res.json(user)).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
};

employeeController.deleteUser = (req, res, next) => {
    const id = req.params.userId;
    findOne(id).then(user => {
        if (user) {
            user.destroy().then(res.status(200).send()).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
};

*/ 


module.exports = employeeController;