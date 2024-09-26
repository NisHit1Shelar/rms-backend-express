const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    table: { type: String, required: true },
    items: [
        {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
