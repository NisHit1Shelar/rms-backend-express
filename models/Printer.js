const mongoose = require('mongoose');

const printerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ipAddress: { type: String, required: true },
    status: { type: String, default: 'active' },
});

module.exports = mongoose.model('Printer', printerSchema);
