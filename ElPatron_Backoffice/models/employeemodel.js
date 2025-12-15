module.exports = (sequelize, type) => {
    return sequelize.define('Empleado', {
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
        Apellido1: {
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
        Apellido2: {
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
        Usuario: {
            type: type.STRING(150),
            validate: {
                max: {
                    args: 150,
                }
            }
        },
        Contrasenia: {
            type: type.STRING(20)
        },

        Correo: {
            type: type.STRING(60),
            validate: {
                isEmail: true
            }
        }
    })
};
