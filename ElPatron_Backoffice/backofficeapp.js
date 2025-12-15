//librerias
const express = require("express"); //libreria para crear un server express
const path = require("path"); // libreria para gestionar rutas de carpetas y archivos
const cors = require("cors");
 // Esto habilita CORS automáticamente para que el navegador fuera de nuestro origen de aplicacion pueda enviar solicitudes http
//console.log(db)
const jwt = require("jsonwebtoken");
const { Cliente } = require("./db");

const cookieParser = require('cookie-parser'); //se hace uso para gestionar las cookies


const secretKey = "MI_LLAVE_SECRETA_SUPER_SEGURA"; 


const app = express()

app.use(express.static("public"));

app.use(cors({
    origin: 'http://127.0.0.1:5501',
    credentials: true
}));

app.use(cookieParser()); 

require('./jobs/recordatorio-job');

app.use(express.json()); 

// Middleware para analizar datos de formularios URL-encoded 
// (si la solicitud viene de un formulario HTML o similar)
app.use(express.urlencoded({ extended: true }));

app.listen(8087,(req,res)=> {

    console.log("escuchango en el puerto 8087")

})

app.get("/", (req,res) =>{
    return res.status(200).sendFile(path.join(__dirname,"/public/Login.html"))
})



app.post("/users/auth", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Nombre de usuario y contraseña requeridos"
            });
        }

        // Buscar usuario en DB
        const user = await Cliente.findOne({ where: { Nombre: username, Contrasenia: password} });

        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        // Validar contraseña con bcrypt

        // Crear token
        const token = jwt.sign(
            { 
                userId: user.Id, 
                username: user.Username,
                role: user.Role 
            }, 
            secretKey, 
            { expiresIn: "1h" }
        );

        return res.json({
            success: true,
            token: token,
            redirectUrl: "/login/"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});








const citaRoter = require ('./routes/citaroutes')

const categoriaRouter = require('./routes/categoriaroute')

const employeeRoter = require('./routes/employeeroutes')


const servicioRouter = require('./routes/serviceroute')

const userRouter = require ('./routes/useroutes')

app.use('/',citaRoter, categoriaRouter, servicioRouter, userRouter, employeeRoter)
