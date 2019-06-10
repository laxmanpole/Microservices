const mongoose = require('mongoose');

// create instance of Schema
const mongoSchema = mongoose.Schema;
const userSchema = new mongoSchema({
    'firstname': { type: String, required: [true, 'First name is required'] },
    'lastname': { type: String, required: [true, 'LastName is required'] },
    'email': { type: String, required: [true, 'Email is required'] },
    'password': { type: String, required: [true, 'password is required'] },
}, {
    timestamps: true
});
const user = mongoose.model('user', userSchema);
module.exports = mongoose.model('user', userSchema);