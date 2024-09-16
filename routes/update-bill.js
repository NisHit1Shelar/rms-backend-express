const express = require('express');
const router = express.Router();

// Define schema for your bill model (adjust accordingly)
const Bill = require('../models/Bill');

// Update bill route
router.post('/update-bill/:tableId', async (req, res) => {
    const tableId = req.params.tableId;
    const { total, items } = req.body;

    try {
        // Find or create bill for the table
        let bill = await Bill.findOne({ table: tableId });
        if (!bill) {
            bill = new Bill({ table: tableId, total, items });
        } else {
            bill.total = total;
            bill.items = items;
        }

        // Save the bill
        await bill.save();
        res.json({ message: 'Bill updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update bill' });
    }
});

module.exports = router;
