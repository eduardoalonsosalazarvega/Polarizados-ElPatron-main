module.exports = (sequelize, type) => {
    return sequelize.define('servicio', {
        Id: {
            type: type.BIGINT(20),
            primaryKey: true,
            autoIncrement: true
        },
        Nombre: {
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
        Id_Categoria: {
            type: type.BIGINT(20),
            allowNull: true,
            references: {
                model: 'categoria', // Nombre de la tabla referenciada
                key: 'Id' // Clave primaria de la tabla Cliente
            }
        },
        Precio:{
            type: type.DECIMAL(10, 2), 
            allowNull: false
        },
        Descripcion:{
            type: type.STRING(80),
            allowNull: false
        },
        Imagen:{
            type: type.STRING(50),
            allowNull: true
        }
    })
};
