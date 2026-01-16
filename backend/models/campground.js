const mongoose = require('mongoose');
const Review = require('./review');
const { coordinates } = require('@maptiler/client');
const { type } = require('express/lib/response');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_150');
})



const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    images: [ImageSchema],
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            require: true
        },
        coordinates: {
            type: [Number],
            require: true
        }
    },
}, opts, { timestamps: true } );

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    <p>${this.description.substring(0,20)}....</p>`;
})



CampgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
