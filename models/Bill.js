const mongoose = require('mongoose');

// Bill Schema
const BillSchema = new mongoose.Schema({
    table: { type: String, required: true },
    total: { type: Number, required: true },
    items: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
});

module.exports = mongoose.model('Bill', BillSchema);
