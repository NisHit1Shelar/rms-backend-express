require('dotenv').config(); // Load environment variables first
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mqtt = require('mqtt'); // Add MQTT library

const updateMenuRoute = require('./routes/menu-routes');
const Bill = require('./models/Bill'); // Import the Bill model

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit on MongoDB connection failure
    });

// MQTT Setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL); // Replace with your broker URL

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to topics
    mqttClient.subscribe(['restaurant/waiter', 'restaurant/bill'], (err) => {
        if (err) {
            console.error('Failed to subscribe to topics:', err);
        } else {
            console.log('Subscribed to topics: restaurant/waiter, restaurant/bill');
        }
    });
});

// Listen for incoming MQTT messages
mqttClient.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}:`, message.toString());

    let alertType = '';
    if (topic === 'restaurant/waiter') {
        alertType = 'Waiter Requested';
    } else if (topic === 'restaurant/bill') {
        alertType = 'Bill Requested';
    }

    // Emit the alert to all connected clients
    if (alertType) {
        io.emit('mqttMessage', { type: alertType, message: message.toString() });
        console.log(`Alert broadcasted: ${alertType}`);
    }
});

// Routes
app.use('/api', require('./routes/update-bill'));
app.use('/api', require('./routes/get-bill'));
app.use('/api', updateMenuRoute);

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

// Handle socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // When a waiter places an order, notify the admin
    socket.on('orderPlaced', (data) => {
        console.log('Order received from waiter:', data);
        io.emit('newOrder', data); // Broadcast the order to all admin clients
    });

    // Listen for button press from ESP32
    socket.on('buttonPress', (data) => {
        console.log('Button press received:', data);
        io.emit('buttonAlert', data); // Forward the button press event to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// New endpoint for receiving alerts from ESP32
app.post('/api/alerts', (req, res) => {
    const alertMessage = req.body.alert;
    const timestamp = new Date().toISOString();

    // Broadcast alert with timestamp to all connected clients
    io.emit('buttonAlert', { message: alertMessage, timestamp: timestamp });
    console.log('Alert received and broadcasted:', alertMessage, timestamp);

    res.status(200).json({ message: 'Alert sent to all clients' });
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

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
