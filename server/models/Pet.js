const mongoose = require("mongoose");

// Function to get default image URL based on pet type
const getDefaultImageForType = function(type) {
    const defaultImages = {
        'Dog': 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3',
        'Cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3',
        'Bird': 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?ixlib=rb-4.0.3',
        'Fish': 'https://images.unsplash.com/photo-1520302519878-3fba5b003eed?ixlib=rb-4.0.3',
        'Rabbit': 'https://images.unsplash.com/photo-1535241749838-299277b6305f?ixlib=rb-4.0.3'
    };
    
    return defaultImages[type] || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3';
};

const petSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit']
    },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    gender: { 
        type: String, 
        required: true,
        enum: ['Male', 'Female']
    },
    price: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Sold', 'Reserved'],
        default: 'Available'
    },
    imageUrl: { 
        type: String,
        default: function() {
            return getDefaultImageForType(this.type);
        }
    },
    description: { type: String },
    medicalHistory: { type: String },
}, { timestamps: true });

// Make the default image function available outside the schema
petSchema.statics.getDefaultImageForType = getDefaultImageForType;

module.exports = mongoose.model("Pet", petSchema);
