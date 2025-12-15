const { DataTypes } = require("sequelize");

module.exports = (sequelize, type) => {
    return sequelize.define('Cita', {
        Id: {
            type: type.BIGINT(20),
            primaryKey: true,
            autoIncrement: true
        },
        Id_Cliente: {
            type: type.BIGINT(20),
            allowNull: false,
            references: {
                model: 'Clientes', // Nombre de la tabla referenciada
                key: 'Id' // Clave primaria de la tabla Cliente
            }
        },
        Fecha_Inicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        Fecha_Final: {
            type: DataTypes.DATE,
            allowNull: false
        },
        Estado: {
            type: type.STRING(50),
            allowNull: false,
            validate: {
                min: {
                    args: 2,
                },
                max: {
                    args: 50,
                }
            }
        },
        Recordatorio_Enviado: { 
            type: type.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        Recordatorio_Fecha: { 
            type: DataTypes.DATE,
            allowNull: true
        }
    });
};
