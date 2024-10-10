const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // To set up server for socket.io
const socketIo = require('socket.io');
const path = require('path'); // Import to handle static file serving



// Import the Bill model
const Bill = require('./models/Bill'); 

// Initialize Express
const app = express();
const server = http.createServer(app); // Create an HTTP server

require('dotenv').config();

// Initialize socket.io
const io = socketIo(server, {
    cors: {
        origin: "*" // Allow all origins (you can restrict this if needed)
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend-backend communication


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', require('./routes/update-bill'));
app.use('/api', require('./routes/get-bill'));
app.use('/api', require('./routes/menu-routes'));


// Serve static files, including menu.json
app.use(express.static(path.join(__dirname)));

// Handle socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // When a waiter places an order, notify the admin
    socket.on('orderPlaced', (data) => {
        console.log('Order received from waiter:', data);

        // Broadcast the order to all admin clients
        io.emit('newOrder', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// PATCH route to update the bill
app.patch('/api/update-bill/:tableId', async (req, res) => {
    const { tableId } = req.params;
    const { items, total } = req.body;

    console.log("Received request to update bill for table:", tableId);
    console.log("Items received:", items);
    console.log("New total received:", total);

    try {
        const existingOrder = await Bill.findOne({ table: tableId });
        if (!existingOrder) {
            console.log("Order not found for table:", tableId);
            return res.status(404).json({ message: 'Order not found' });
        }

        // Append new items or update quantity
        items.forEach(newItem => {
            const existingItem = existingOrder.items.find(item => item.id === newItem.id);
            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                existingOrder.items.push(newItem);
            }
        });

        existingOrder.total += parseFloat(total);
        await existingOrder.save();

        console.log("Updated order for table:", tableId);
        res.json(existingOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: 'Error updating bill', error });
    }
});

// Endpoint to serve menu.json
app.get('/menu.json', (req, res) => {
    const menuPath = path.join(__dirname, 'menu.json');
    fs.access(menuPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Menu file not found:', err);
            return res.status(404).json({ message: 'Menu file not found' });
        }
        res.sendFile(menuPath);
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
