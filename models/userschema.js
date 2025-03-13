const mongoose = require('mongoose');
const userschema = mongoose.Schema({
    phone:{
        type: String,
        required: [true, 'Please enter proper phone'],
    },
    name:{
        type: String,
        required: [true, 'Please enter proper name'],
    },
    otp:{
        type: String,
        required: [true, 'Please enter proper otp'],
    },
    email: { 
        type: String, 
        unique: true,
        default: function() { return `user_${Date.now()}@example.com`; } // Assigns a unique default email
    },
    ImageBase64:{
        type: String,
        required: [true, 'Please enter proper images'],
    },
    createdAt: { type: Date, default: Date.now } // Default timestamp

    
});

module.exports = mongoose.model('users', userschema);
