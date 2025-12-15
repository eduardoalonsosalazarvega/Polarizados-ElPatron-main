const ServiceController ={};
const {Servicio} = require('../db');

const multer = require("multer");
const path = require("path");



const storage = multer.diskStorage({
    destination: "./public/images", // Carpeta donde se guardarán las imágenes
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Genera un nombre único
    }
});

const upload = multer({ storage });


function findOne(id) {
    return Servicio.findOne({
        where: {
            id
        }
    });
}


function findServiceCategory(id) {
    return Servicio.findAll({
        where: {
            Id_Categoria: id
        }
    });
}



ServiceController.createService = (req, res, next) => {
    upload.single("imagen")(req, res, function (err) {
        if (err) return res.status(400).json({ error: "Error al subir imagen" });

        const { NombreService, Precio, Id_Categoria,Descripcion } = req.body;
        const imagenUrl = req.file ? `/images/${req.file.filename}` : null; 

        Servicio.create({ 
            Nombre: NombreService,
            Id_Categoria: Id_Categoria, 
            Precio: Precio, 
            Descripcion: Descripcion,
            Imagen: imagenUrl 
        })
        .then(service => res.json(service))
        .catch(next);
    });
};



ServiceController.get = (req, res, next) => {

    Servicio.findAll().then(services => {
        res.json(services)
    }).catch(next);
};


ServiceController.editService = (req, res, next) => {
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





ServiceController.deleteService = (req, res, next) => {
    const id = req.body.id
    findOne(id).then(user => {
        if (user) {
            user.destroy().then(res.status(200).send()).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
};


ServiceController.getServiceCategory = async (req, res, next) => {
    try {
        const { id } = req.body; // Asegurarse de que el ID venga en el cuerpo de la solicitud
        
        if (!id) {
            return res.status(400).json({ error: "El ID es requerido" });
        }

        const service = await findServiceCategory(id);
        
        if (!service) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json(service);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
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


module.exports = ServiceController;