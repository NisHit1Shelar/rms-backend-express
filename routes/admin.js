const express = require('express');
const Printer = require('../models/Printer');
const router = express.Router();

// Add a new printer
router.post('/add-printer', async (req, res) => {
    const { name, ipAddress } = req.body;
    try {
        const printer = new Printer({ name, ipAddress });
        await printer.save();
        res.json({ success: true, message: 'Printer added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add printer', error });
    }
});

// Get the current printer info
router.get('/get-printer', async (req, res) => {
    try {
        const printer = await Printer.findOne();
        res.json(printer);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get printer', error });
    }
});

// Update printer
router.put('/update-printer/:id', async (req, res) => {
    try {
        const printer = await Printer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(printer);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update printer', error });
    }
});

// Send order to printer (KOT)
router.post('/send-to-printer', async (req, res) => {
    const { orderDetails } = req.body;
    // Logic to send to printer using the current printer settings
    res.json({ success: true, message: 'Order sent to printer' });
});

module.exports = router;
