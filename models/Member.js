const mongoose = require('mongoose')
const Schema = mongoose.Schema

const memberSchema = new Schema({
  memberName: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Member', memberSchema)
