const DbConfig = require('./config').db;
const { Sequelize } = require('sequelize');
const logger = require('debug')('SERVER:sequelize');
const appointmentModel = require('./models/citaModel')
const categoriaModel = require('./models/categoriesmodel')
const servicioModel = require('./models/servicemodel')
const userModel = require('./models/customermodel')
const EmployeeModel = require('./models/employeemodel')
const citaServicioModel = require('./models/citaservicio')


/**
 * DB connection setup
 */
const sequelize = new Sequelize(DbConfig.name, DbConfig.user, DbConfig.password, {
    host: DbConfig.host,
    port: DbConfig.port,
    dialect: DbConfig.dialect,

    define: {
        timestamps: false
    },

    // 🔥 Para evitar que Sequelize convierta DATETIME a UTC
    timezone: '-06:00', // Zona horaria local (México, CST)

    dialectOptions: {
        useUTC: false,          // Evita conversión automática UTC
        dateStrings: true,      // Evita que agregue la "Z"
        typeCast: function (field, next) {
            if (field.type === "DATETIME") {
                // Devuelve la fecha EXACTA sin cambiar zona
                return field.string();
            }
            return next();
        }
    },

    logging: msg => logger(msg)
});



const Cita = appointmentModel(sequelize,Sequelize)

const Categoria = categoriaModel(sequelize,Sequelize)

const Servicio = servicioModel(sequelize,Sequelize)

const Cliente = userModel(sequelize, Sequelize)

const Empleado = EmployeeModel(sequelize, Sequelize);

const Cita_Servicio = citaServicioModel(sequelize, Sequelize);


/**
 * Uncomment this in order to generate table
 */
sequelize.sync().then(logger('DB is synced'));

module.exports = {Cita, Categoria, Servicio, Cliente, Empleado, Cita_Servicio};