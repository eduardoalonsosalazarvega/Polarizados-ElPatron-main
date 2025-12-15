const UserController ={};
const {Cliente} = require('../db');


function findOne(id) {

    console.log(id)
    return Cliente.findOne({
        where: {
            Id: id
        }
    });
}

UserController.createUser = (req, res, next) => {


    const {Nombre,Apellido1,Apellido2,Username,Contrasenia,Email,Telefono} = req.body


    console.log(req.body)
    Cliente.create({Nombre: Nombre,Apellido1: Apellido1,Apellido2: Apellido2,Usuario: Username,Contrasenia: Contrasenia,Correo: Email, Telefono: Telefono}).then( u =>res.json(u))
        .catch(next);
};



UserController.get = (req, res, next) => {

    Cliente.findAll().then(clientes => {
        res.json(clientes)
    }).catch(next);
};


UserController.getUser = (req, res, next) => {
    const id = req.body.userId;
    findOne(id).then(user => {
        res.json(user)
    }).catch(next);
};
/*



employeeController.getEmployee = (req, res, next) => {

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
            return res.status(200).json({ redirectUrl: "http://localhost:8087/services" });

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


module.exports = UserController;