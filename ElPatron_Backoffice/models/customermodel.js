module.exports = (sequelize, type) => {
    return sequelize.define('Clientes', {
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
            allowNull: true,
            validate: {
                max: {
                    args: 150,
                }
            }
        },
        Contrasenia: {
            allowNull: true,
            type: type.STRING(20)
        },
        
        Correo: {
            allowNull: false,
            type: type.STRING(60),
            validate: {
                isEmail: true
            }
        },
        Telefono: {
            type: type.STRING(10),
        }
    })
};
