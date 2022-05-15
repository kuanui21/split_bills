const Member = require('../Member')
const memberList = require('./member.json')
const db = require('../../config/mongoose')

db.once('open', () => {
  memberList.results.forEach(memberSeed => {
    Member.create({
      memberName: memberSeed.memberName
    })
  })
  console.log('done')
})
