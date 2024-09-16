const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// GET: Fetch bill details for a specific table
router.get('/get-bill/:tableId', async (req, res) => {
    const { tableId } = req.params;

    try {
        const bill = await Bill.findOne({ table: tableId });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        res.json(bill);
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({ message: 'Failed to fetch bill' });
    }
});

module.exports = router;
