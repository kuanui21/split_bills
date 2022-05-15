const express = require('express')
const router = express.Router()
const home = require('./modules/home')
const splitBiills = require('./modules/split-biills')

router.use('/', home)
router.use('/split-bills', splitBiills)

module.exports = router
