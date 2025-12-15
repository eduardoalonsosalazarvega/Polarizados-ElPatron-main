const { sequelize, Cita, Cliente } = require('../db'); // ajusta ruta
const { sendEmailReminder } = require('./emailservice');
const { Op } = require('sequelize');

async function enviarRecordatorios() {
    try {
        const citas = await Cita.findAll({
            where: {
                Estado: 'Pendiente',
                Recordatorio_Enviado: false,
                Fecha_Inicio: {
                    [Op.between]: [
                        sequelize.literal('NOW()'),
                        sequelize.literal('DATE_ADD(NOW(), INTERVAL 24 HOUR)')
                    ]
                }
            },
            include: [{
                model: Cliente,
                attributes: ['Nombre', 'Apellido1', 'Apellido2', 'Correo']
            }]
        });

        for (const cita of citas) {
            const cliente = cita.Cliente;
            const nombreCompleto =
                `${cliente.Nombre} ${cliente.Apellido1} ${cliente.Apellido2 || ''}`.trim();

            const enviado = await sendEmailReminder({
                nombre: nombreCompleto,
                correo: cliente.Correo,
                fechaInicio: cita.Fecha_Inicio,
                fechaFinal: cita.Fecha_Final
            });

            if (enviado) {
                await cita.update({
                    Recordatorio_Enviado: true,
                    Recordatorio_Fecha: new Date()
                });
            }
        }

    } catch (error) {
        console.error('❌ Error enviando recordatorios:', error);
    }
}

module.exports = { enviarRecordatorios };
