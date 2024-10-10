// menu-routes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to menu.json
const menuPath = path.join(__dirname, '../menu.json');

// POST: Update the entire menu
router.post('/update-menu', (req, res) => {
    const updatedMenu = req.body;

    // Check if the updatedMenu is in the correct format
    if (!updatedMenu || typeof updatedMenu !== 'object') {
        return res.status(400).json({ message: 'Invalid menu format' });
    }

    // Write the updated menu to menu.json
    fs.writeFile(menuPath, JSON.stringify(updatedMenu, null, 2), (err) => {
        if (err) {
            console.error('Error writing to menu.json:', err);
            return res.status(500).json({ message: 'Error updating menu file' });
        }

        console.log('Menu updated successfully.');
        res.json({ message: 'Menu updated successfully' });
    });
});

// Endpoint to get the menu for viewing
router.get('/menu', (req, res) => {
    fs.readFile(menuPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading menu.json:', err);
            return res.status(500).json({ message: 'Error reading menu file' });
        }
        res.json(JSON.parse(data));
    });
});

module.exports = router;
