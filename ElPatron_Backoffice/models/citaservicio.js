const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Cita_Servicio', {
    cita_servicio_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    Id_Cita: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Cita',   // nombre de la tabla Cita
        key: 'Id_Cita'   // PK real de Cita
      }
    },
    Id_Servicio: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'servicio', // nombre de la tabla Servicio
        key: 'Id_Servicio' // PK real de Servicio
      }
    }
  }, {
    tableName: 'cita_servicio',
    timestamps: false
  });
};
