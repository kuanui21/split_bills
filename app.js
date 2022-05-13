const express = require('express')
const exphbs = require('express-handlebars')

const mongoose = require('mongoose')
const Member = require('./models/Member')
const Bill = require('./models/Bill')
const methodOverride = require('method-override')

const app = express()
const port = 3000

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// 取得首頁
app.get('/', (req, res) => {
  Bill.find()
    .lean()
    .sort({ itemDate: 'desc', _id: 'desc' })
    .then(bills => res.render('index', { bills }))
    .catch(error => console.log(error))
})

// 取得成員頁
app.get('/split-bills/member', (req, res) => {
  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => res.render('member', { members }))
    .catch(error => console.log(error))
})

// 新增成員
app.post('/split-bills/member', (req, res) => {
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
app.delete('/split-bills/member/:id', (req, res) => {
  const id = req.params.id

  return Member.findById(id)
    .then(member => member.remove())
    .then(() => res.redirect('back'))
    .catch(error => console.log(error))
})

// 取得新增項目頁
app.get('/split-bills/new', (req, res) => {
  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => res.render('new', { members }))
    .catch(error => console.log(error))
})

// 新增項目
app.post('/split-bills/', (req, res) => {
  const { itemDate, itemName, itemPrice } = req.body
  const { paidPrice, toPaidPrice } = req.body

  // let paidList = []
  // let toPaidList = []
  // let paid = []
  // let toPaid = []
  // let i = 0
  // for (let i = 0; i < paidMember.length; i++) {
  //   for (let j = 0; j < paidPrice.length; i++) {
  //     paid = paidMember[i].connect(paidPrice[j])
  //   }
  // }

  // const averageCost = Math.round(itemPrice / (toPaidMember.length) * 10) / 10
  // const averageCost = 0
  // console.log(averageCost)

  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => {
      let memberList = []
      members.forEach(member => {
        // paid = member.memberName.concat(',', paidPrice[i])
        // toPaid = member.memberName.concat(',', toPaidPrice[i])
        // paidList = paidList.concat(paid)
        // toPaidList = toPaidList.concat(toPaid)
        memberList = memberList.concat(member.memberName)
        // i++
      })

      let paidMember = []

      for (let i = 0; i < members.length; i++) {
        // let paidMember = paidList[i].slice(0, paidList[i].indexOf(','))
        // let paidMemberPrice = paidList[i].slice(paidList[i].indexOf(',') + 1, paidList[i].length)
        // console.log('先付的人', paidMember)
        // console.log('先付的錢', paidMemberPrice)
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
app.get('/split-bills/:id', (req, res) => {
  const id = req.params.id

  return Bill.findById(id)
    .lean()
    .then(bill => res.render('detail', { bill, member: bill.member, paidPrice: bill.paidPrice, toPaidPrice: bill.toPaidPrice }))
    .catch(error => console.log(error))
})

// 刪除項目
app.delete('/split-bills/:id', (req, res) => {
  const id = req.params.id
  return Bill.findById(id)
    .then(bill => bill.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// .then(bill => {

//   console.log(bill)
//   console.log(bill.paidList)
//   console.log(bill.toPaidList)
// })
// .then((bill, members) => {
//   Member.find()
//     .lean()
//     .sort({ _id: 'asc' })
// .then(members => {
//   for (let i = 0; i < members.length; i++) {
//     console.log(members[i].memberName)
// let A = []
// A = A.concat(members[i].memberName)
// return A
// }
// console.log('陣列:', A)
// const paid = members.includes(bill)
// if (paid) {
//   console.log('有重複值')
// } else {
//   console.log('沒有')
// }
// })

// .then(members => res.render('detail', { bill, members }))
// })

// let paidMember = []
// let paidMemberPrice = []
// let paidMemberList = []
// let paidMemberPriceList = []
// for (let i = 0; i < bill.paidList.length; i++) {
//   let paidList = bill.paidList[i]
//   let paidMember = paidList.slice(0, paidList.indexOf(','))
//   let paidMemberPrice = paidList.slice(paidList.indexOf(',') + 1, paidList.length)

//   paidMemberList = paidMemberList.concat(paidMember)
//   paidMemberPriceList = paidMemberPriceList.concat(paidMemberPrice)
// }
// console.log(paidMemberList[0])
// console.log(paidMemberPriceList)

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
