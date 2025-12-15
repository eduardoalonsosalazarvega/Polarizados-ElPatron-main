const cron = require('node-cron');
const { enviarRecordatorios } = require('../services/recordatorio');

cron.schedule('0 * * * *', async () => {
    console.log('🔔 Verificando recordatorios...');
    await enviarRecordatorios();
});
