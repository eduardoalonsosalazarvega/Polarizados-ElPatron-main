module.exports = (sequelize, type) => {
    return sequelize.define('categoria', {
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
        }
    })
};
