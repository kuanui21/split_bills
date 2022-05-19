const express = require('express')
const router = express.Router()

const Member = require('../../models/Member')
const Bill = require('../../models/Bill')

// 取得成員頁
router.get('/member', (req, res) => {
  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => res.render('member', { members }))
    .catch(error => console.log(error))
})

// 新增成員
router.post('/member', (req, res) => {
  const memberName = req.body.memberName

  if (memberName) {
    return Member.create({ memberName })
      .then(() => res.redirect('member'))
      .catch(error => console.log(error))
  } else {
    res.redirect('member')
  }
})

// 刪除成員
router.delete('/member/:id', (req, res) => {
  const id = req.params.id

  return Member.findById(id)
    .then(member => member.remove())
    .then(() => res.redirect('back'))
    .catch(error => console.log(error))
})

// 取得新增項目頁
router.get('/new', (req, res) => {
  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => res.render('new', { members }))
    .catch(error => console.log(error))
})

// 新增項目
router.post('/', (req, res) => {
  const { itemDate, itemName, itemPrice, paidPrice, toPaidPrice } = req.body

  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => {
      let memberList = []
      members.forEach(member => {
        memberList = memberList.concat(member.memberName)
      })

      let paidMember = []

      for (let i = 0; i < members.length; i++) {
        if (paidPrice[i] > 0) {
          paidMember = paidMember.concat(memberList[i])
        }
      }

      Bill.create({
        itemDate,
        itemName,
        itemPrice,
        member: memberList,
        paidPrice,
        toPaidPrice,
        paidMember
      })
    })
    .then(() => res.redirect('/')) // 新增完成後導回首頁
    .catch(error => console.log(error))
})

// 取得詳細內容頁
router.get('/:id', (req, res) => {
  const id = req.params.id

  return Bill.findById(id)
    .lean()
    .then(bill => res.render('detail', { bill, member: bill.member, paidPrice: bill.paidPrice, toPaidPrice: bill.toPaidPrice }))
    .catch(error => console.log(error))
})

// 刪除項目
router.delete('/:id', (req, res) => {
  const id = req.params.id
  return Bill.findById(id)
    .then(bill => bill.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// 修改項目
router.put('/:id', (req, res) => {
  const id = req.params.id
  const { itemDate, itemName, itemPrice, paidPrice, toPaidPrice } = req.body

  return Bill.findById(id)
    .then(bill => {
      bill.itemDate = itemDate
      bill.itemName = itemName
      bill.itemPrice = itemPrice
      bill.paidPrice = paidPrice
      bill.toPaidPrice = toPaidPrice
      return bill.save()
    })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router
