const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Route to handle updating the menu.json
router.post('/update-menu', (req, res) => {
    const updatedMenu = req.body; // Get the new menu from the request body

    // Path to menu.json file
    const menuPath = path.join(__dirname, '../menu.json');

    // Write the updated menu to the menu.json file
    fs.writeFile(menuPath, JSON.stringify(updatedMenu, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error writing to menu.json:', err);
            return res.status(500).send({ message: 'Failed to update menu' });
        }

        res.status(200).send({ message: 'Menu updated successfully!' });
    });
});

module.exports = router;
