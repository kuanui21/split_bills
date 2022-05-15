const mongoose = require('mongoose')
const Schema = mongoose.Schema

const billSchema = new Schema({
  itemDate: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemPrice: {
    type: Number,
    required: true
  },
  member: {
    type: Array,
    required: true
  },
  paidPrice: {
    type: Array,
    required: true
  },
  toPaidPrice: {
    type: Array,
    required: true
  },
  paidMember: {
    type: Array,
    required: true
  }
})

module.exports = mongoose.model('Bill', billSchema)
