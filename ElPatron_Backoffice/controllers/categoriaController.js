const CategoryController ={};
const {Categoria} = require('../db');

function findOne(id) {
    return Categoria.findOne({
        where: {
            Id: id
        }
    });
}



CategoryController.createCategory = (req, res, next) => {

    const {Nombre} = req.body

    Categoria.create({Nombre: Nombre}).then( u =>res.json(u))
        .catch(next);
};



CategoryController.get = (req, res, next) => {

    Categoria.findAll().then(services => {
        res.json(services)
    }).catch(next);
};

CategoryController.getCategory = async (req, res, next) => {
    try {
        const { id } = req.body; // Asegurarse de que el ID venga en el cuerpo de la solicitud
        
        if (!id) {
            return res.status(400).json({ error: "El ID es requerido" });
        }

        const categoria = await findOne(id);
        
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json(categoria);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


CategoryController.editCategory = (req, res, next) => {
    const newService = req.body;
    const id = newService? newService.id : undefined;
    findOne(id).then(user => {
        if (user) {
            Object.assign(user, newService);
            user.save().then(user => res.json(user)).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
};





CategoryController.deleteCategory = (req, res, next) => {
    const id = req.body.id
    findOne(id).then(user => {
        if (user) {
            user.destroy().then(res.status(200).send()).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
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


module.exports = CategoryController;