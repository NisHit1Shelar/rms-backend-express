const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to menu.json
const menuPath = path.join(__dirname, '../menu.json');

// POST: Update the entire menu
router.post('/update-menu', (req, res) => {
    const updatedMenu = req.body;

    // Write the updated menu to menu.json
    fs.writeFile(menuPath, JSON.stringify(updatedMenu, null, 2), (err) => {
        if (err) {
            console.error('Error writing to menu.json:', err);
            return res.status(500).json({ message: 'Error updating menu file' });
        }

        res.json({ message: 'Menu updated successfully' });
    });
});

module.exports = router;
