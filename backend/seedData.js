// quick seed script
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.create({ name:'Admin', email:'admin@manageease.local', password:'Admin123!', role:'admin' });
  console.log('admin created'); process.exit();
})();
