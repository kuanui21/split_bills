const express = require('express')
const router = express.Router()

const Member = require('../../models/Member')
const Bill = require('../../models/Bill')

// 取得首頁
router.get('/', (req, res) => {
  Bill.find()
    .lean()
    .sort({ itemDate: 'desc', _id: 'desc' })
    .then(bills => res.render('index', { bills }))
    .catch(error => console.log(error))
})

// 取得結餘頁
router.get('/balance', (req, res) => {
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

          function check1 () {
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
          function check2 () {
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

module.exports = router
