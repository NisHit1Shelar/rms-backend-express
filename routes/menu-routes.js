const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to menu.json
const menuPath = path.join(__dirname, '../menu.json');

// GET: Fetch the menu
router.get('/menu', (req, res) => {
    res.sendFile(menuPath);
});

// POST: Add a new menu item
router.post('/update-menu', (req, res) => {
    const { category, subCategory, item } = req.body;

    // Read the existing menu.json
    fs.readFile(menuPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading menu.json:', err);
            return res.status(500).json({ message: 'Error reading menu file' });
        }

        const menu = JSON.parse(data);

        // Add new item to the correct category and subcategory
        menu[category][subCategory].push({ ...item, id: Date.now() });

        // Write the updated menu back to menu.json
        fs.writeFile(menuPath, JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error('Error writing to menu.json:', err);
                return res.status(500).json({ message: 'Error writing to menu file' });
            }

            res.json({ message: 'Menu updated successfully' });
        });
    });
});

// DELETE: Remove a menu item
router.delete('/update-menu', (req, res) => {
    const { id, category, subCategory } = req.body;

    // Read the existing menu.json
    fs.readFile(menuPath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading menu.json:', err);
            return res.status(500).json({ message: 'Error reading menu file' });
        }

        const menu = JSON.parse(data);

        // Remove the item by id
        menu[category][subCategory] = menu[category][subCategory].filter(item => item.id !== id);

        // Write the updated menu back to menu.json
        fs.writeFile(menuPath, JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error('Error writing to menu.json:', err);
                return res.status(500).json({ message: 'Error writing to menu file' });
            }

            res.json({ message: 'Menu updated successfully' });
        });
    });
});

module.exports = router;
