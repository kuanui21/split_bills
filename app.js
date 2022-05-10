const express = require('express')
const exphbs = require('express-handlebars')

const mongoose = require('mongoose')
const Member = require('./models/Member')
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

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/split-bills/member', (req, res) => {
  Member.find()
    .lean()
    .sort({ _id: 'asc' })
    .then(members => res.render('member', { members }))
    .catch(error => console.log(error))
})

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

app.delete('/split-bills/member/:id', (req, res) => {
  const id = req.params.id

  return Member.findById(id)
    .then(member => member.remove())
    .then(() => res.redirect('back'))
    .catch(error => console.log(error))
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})

//     Member.findOne({ memberName })
//       .lean()
//       .then(haveMembers => {
//         if (!haveMembers) {
//           console.log('沒有重複的')
//   console.log('有重複')
//   res.redirect('/')
// } else {
//   console.log('沒有重複的')
//   return Member.create({
//     memberName: memberName
//   })

// .catch(error => console.log(error))

// })
// }
//   })
// })

//     Member.findOne({ memberName: member })
//       .then(haveMembers => {
//         if (haveMembers) {
//           return
//         }
// else {
//   return
// }
// if (haveMembers) {
//   const result = memberName.filter(function (element, index, memberName) {
//     return memberName.indexOf(element) === index
//   })
//   memberList = result
// } else {
//   return memberList
// }
// })
//   .lean()
//   .then(haveMembers => console.log(haveMembers))
//   .then(() => res.redirect('/'))
//   .catch(error => console.log(error))

// .then(haveMembers => {
//   if (haveMembers) {
//     return res.redirect('/')
//   } else {
//     return Member.create({
//       memberName: member
//     })
//       .then(() => res.redirect('/'))
//       .catch(error => console.log(error))
//   }
// })
//   }
//   return Member.create({
//     memberName: member
//   })
//     .then(() => res.redirect('/'))
//     .catch(error => console.log(error))
