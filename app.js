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

// 修改項目
app.put('/split-bills/:id', (req, res) => {
  const id = req.params.id
  const { itemDate, itemName, itemPrice, paidPrice, toPaidPrice } = req.body
  console.log(paidPrice)
  console.log(toPaidPrice)

  return Bill.findById(id)
    .then(bill => {
      bill.itemDate = itemDate
      bill.itemName = itemName
      bill.itemPrice = itemPrice
      bill.paidPrice = paidPrice
      bill.toPaidPrice = toPaidPrice
      return bill.save()
    })
    .then(() => res.redirect(`/split-bills/${id}`))
    .catch(error => console.log(error))
})

// 取得結餘頁
app.get('/balance', (req, res) => {
  let memberList = []

  let backList = []
  let backNameList = []
  let giveList = []
  let giveNameList = []
  let newBackList = []
  let newGiveList = []

  let giveMember = []
  let backMember = []
  let giveMoney = []

  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => {
      members.forEach(member => {
        memberList = memberList.concat(member.memberName)
      })

      Bill.find()
        .lean()
        .then(bill => {
          // 計算每個人的先付和應付
          let paidTotal = 0
          let toPaidTotal = 0
          let paidTotalList = []
          let toPaidTotalList = []

          for (let x = 0; x < memberList.length; x++) {
            for (let i = 0; i < bill.length; i++) {
              for (let j = 0; j < memberList.length; j++) {
                if (bill[i].member[j] === memberList[x]) {
                  paidTotal += Number(bill[i].paidPrice[j])
                  toPaidTotal += Number(bill[i].toPaidPrice[j])
                }
              }
            }
            paidTotalList = paidTotalList.concat(paidTotal)
            toPaidTotalList = toPaidTotalList.concat(toPaidTotal)
            paidTotal = 0
            toPaidTotal = 0
          }

          // 計算每個人的差額
          for (let i = 0; i < memberList.length; i++) {
            const needPaid = toPaidTotalList[i] - paidTotalList[i]

            if (needPaid < 0) {
              backList = backList.concat(Math.abs(needPaid))
              newBackList = newBackList.concat(Math.abs(needPaid))
              backNameList = backNameList.concat(memberList[i])
            }
            if (needPaid > 0) {
              giveList = giveList.concat(needPaid)
              newGiveList = newGiveList.concat(needPaid)
              giveNameList = giveNameList.concat(memberList[i])
            }
          }
        })

        .then(() => {
          // 計算誰要付多少錢給誰
          let i = 0
          let j = 0
          check1()

          function check1() {
            while ((newBackList[i] - newGiveList[j] > 0)) {
              const restBack = newBackList[i] - newGiveList[j]

              giveMember = giveMember.concat(giveNameList[j])
              backMember = backMember.concat(backNameList[i])
              giveMoney = giveMoney.concat(newGiveList[j])

              newBackList[i] = restBack
              newGiveList[j] = 0
              j++
              check2()
            }
          }
          function check2() {
            while ((newBackList[i] - newGiveList[j] <= 0)) {
              const restGive = newGiveList[j] - newBackList[i]
              newGiveList[j] = newBackList[i]
              giveMember = giveMember.concat(giveNameList[j])
              backMember = backMember.concat(backNameList[i])
              giveMoney = giveMoney.concat(newGiveList[j])

              newGiveList[j] = restGive
              newBackList[i] = 0
              i++
              check1()
            }
          }
        })
        .then(() => {
          res.render('balance', { backNameList, backList, giveNameList, giveList, giveMember, backMember, giveMoney })
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
