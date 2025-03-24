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
        required: [true, "Pet type is required"],
        enum: {
            values: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit'],
            message: "{VALUE} is not a valid pet type"
        }
    },
    breed: { 
        type: String, 
        required: [true, "Breed is required"],
        trim: true,
        minlength: [2, "Breed must be at least 2 characters long"],
        maxlength: [50, "Breed cannot exceed 50 characters"]
    },
    age: { 
        type: Number, 
        required: [true, "Age is required"],
        min: [0, "Age cannot be negative"],
        max: [15, "Age value is too high"]
    },
    weight: { 
        type: Number, 
        required: [true, "Weight is required"],
        min: [0, "Weight cannot be negative"],
        max: [100, "Weight value is too high"]
    },
    gender: { 
        type: String, 
        required: [true, "Gender is required"],
        enum: {
            values: ['Male', 'Female'],
            message: "{VALUE} is not a valid gender"
        }
    },
    price: { 
        type: Number, 
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: {
            values: ['Available', 'Sold', 'Reserved'],
            message: "{VALUE} is not a valid status"
        },
        default: 'Available'
    },
    imageUrl: { 
        type: String,
        default: function() {
            return getDefaultImageForType(this.type);
        }
    },
    description: { 
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    medicalHistory: { 
        type: String,
        trim: true,
        maxlength: [1000, "Medical history cannot exceed 1000 characters"]
    },
}, { timestamps: true });

// Make the default image function available outside the schema
petSchema.statics.getDefaultImageForType = getDefaultImageForType;

module.exports = mongoose.model("Pet", petSchema);
