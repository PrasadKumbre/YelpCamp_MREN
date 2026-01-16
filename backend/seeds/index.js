const mongoose = require('mongoose');
const Campground = require('../models/campground');
const campground = require('../models/campground');
const city = require('./city');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => { console.log("Database Connected") });

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const filename = (Math.floor(Math.random() * 100000) + 500000);
        const price = Math.floor(Math.random() * 1000) + 500;
        const camp = new campground({
            location: `${city[i].city}, ${city[i].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae voluptatum magni quidem et obcaecati neque omnis alias, quis vel blanditiis modi eius aut voluptatem eum quibusdam, maiores quia debitis ipsum.`,
            price: price,
            author: `688b7711511ac78483035300`,
            geometry: {
                type: "Point",
                coordinates: [
                    city[i].longitude,
                    city[i].latitude,
                ]
            },
            images: [
                {
                    "url": "https://res.cloudinary.com/doidrykx0/image/upload/v1754130811/ulnnbzlo7to9stutypvf.jpg",
                    "filename": filename + `ab`
                },
                {
                    "url": "https://res.cloudinary.com/doidrykx0/image/upload/v1754130813/kp7oqjm5irlytmdtbbwk.jpg",
                    "filename": filename + `bc`,
                },
                {
                    "url": "https://res.cloudinary.com/doidrykx0/image/upload/v1754130813/bhhqotdn8hilx0jn5hax.webp",
                    "filename": filename + `cd`,
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Data Added in DB Successfully :)");
})
    .catch(err => console.log(err));