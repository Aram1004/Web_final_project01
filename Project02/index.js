var express = require('express')
var app = express()

var bp = require('body-parser')
app.use(bp.urlencoded({extended: true}))
app.use(bp.json())

var expressSession = require('express-session');

app.use(expressSession({
    secret: 'login',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
    //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: true,
    saveUninitialized: true
}));

const uri = "mongodb+srv://user1:L68Wq7NnkVxnWh9@cluster0-wgesx.gcp.mongodb.net/test?retryWrites=true&w=majority"

const mongoose = require('mongodb');
const MongoClient = mongoose.MongoClient;
var users;
var tour;
MongoClient.connect(uri, {useUnifiedTopology: true}, (e, db) => {
    if (e)
        console.log(e)
    else {
        console.log('DB Connected')
        var dbo = db.db('db')
        users = dbo.collection('users')
        tour = dbo.collection('tour')
    }
})

app.set("view engine", 'pug')
app.set("views", './views')


app.get('/', async (req, res) => {
    const s = {stat: '로그인 안됨'}

    s.stat = '로그인정보'

    if (req.session.user) {
        s.stat = req.session.user.id + ' 로 로그인 됨'
    }

    res.render('index', s)
})
app.get('/register', (req, res) => {
    res.render('register')
})
app.post('/register_com', async (req, res) => {
    let q = {id: req.body.id, pw: req.body.pw, group: 0,tour_list:[]}//0:users, 1:manager 2:admin
    let st = {stat: ""}
    let s = 'register'
    try {

        let r = await users.countDocuments({id: req.body.id})

        if (r == 0) {
            s = 'register_com'
            st.stat = "회원가입 성공!"
            st.id = q.id
            st.pw = q.pw
            users.insertOne(q)
        } else
            st.stat = "회원가입 실패!(이미 존재하는 아이디)"

    } catch (e) {
        console.log(e)
        st.stat = "회원가입 실패!(알 수 없는 오류)"
    }
    res.render(s, st)
})
app.get('/login', async (req, res) => {
    if (req.session && req.session.user && req.session.user.id)
        res.render('index', {stat: req.session.user.id + ' 로 로그인 됨'})
    else
        res.render('login')
})
app.get('/login_com', async (req, res) => {
    const s = {stat: "로그인 실패(존재하지 않는 계정)"}
    let r = await users.countDocuments({"id": req.query.id})
    if (r != 0) {
        s.stat = '비밀번호가 틀렸습니다'
        let v = await users.findOne({"id": req.query.id})
        if (v.id == req.query.id && v.pw == req.query.pw) {
            s.stat = '로그인 성공' + v.group
            req.session.user = {
                id: v.id,
                pw: v.pw,
                g: v.group
            }
            // res.redirect('/')
        }
    }
    res.render('index', s)
})
app.get('/admin', async (req, res) => {


    if (req.session.user && req.session.user.g != 0) {
        let v = {list: []}
        let r = await users.find().toArray()
        v.list.push(r)
        res.render('admin', v);
    } else res.send("관리자만 볼 수 있습니다!")
})
app.post('/admin_set', async (req, res) => {
    console.log('들어오긴 했어!')
    let t = req.body.target
    let id = req.body.id
    let pw = req.body.pw
    let g = req.body.g
    users.updateOne({id: t}, {$set: {id: id, pw: pw, group: Number(g)}})
    res.render('admin_set', {t: t, id: id, pw: pw, g: Number(g)})
})
app.post('/admin_remove', async (req, res) => {
    let t = req.body.target
    await users.deleteOne({id: t})
    res.send("데이터 삭제 완료")
})
app.get('/register_tour', (req, res) => {
    if (req.session.user && req.session.user.g != 0) {
        res.render('register_tour')
    } else res.send("관리자만 볼 수 있습니다!")
})
app.post('/register_tour_com', async (req, res) => {
    v = {
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        dis: req.body.dis,
        c: req.body.c
    }
    await tour.insertOne(v)
    res.render('register_tour_com', v)
})


app.get('/tour_set', async (req, res) => {
    if (req.session.user && req.session.user.g != 0) {
        let v = {list: []}
        let r = await tour.find().toArray()
        v.list.push(r)
        res.render('tour_set', v)
    } else res.send("관리자만 볼 수 있습니다!")
})
app.get('/tour_list', async (req, res) => {
    if (req.session && req.session.user && req.session.user.id) {
        let v = {list: []}
        let r = await tour.find().toArray()
        v.list.push(r)
        res.render('tour_list', v)
    }
    else
        res.render('index', {stat:'로그인이 필요합니다'})
})
app.get('/info_tour', (req, res) => {
    v = {
        id: req.query.id,
        name: req.query.name,
        price: req.query.price,
        dis: req.query.dis,
        c: req.query.c
    }
    res.render('tour_info', v)
})
app.post('/tour_com', (req, res) => {
    let j = {
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        dis: req.body.dis,
        c: req.body.c
    }

    tour.updateOne({id: j.id}, {$set: j})
    res.render('tour_com', j)
})
app.post('/tour_reservation', (req, res) => {
    let j = {
        id: req.body.id,
        name: req.body.name,
        price: req.body.price,
        dis: req.body.dis,
        c: req.body.c
    }
    res.render('tour_reservation',j)
})
app.post('/tour_reservation_com', async(req, res) => {
    let j = {
        name: req.body.id,
        p: req.body.p,
        date: req.body.date,
        num: req.body.num
    }
    let u=await users.findOne({id: req.session.user.id})
    u.tour_list.push(j)
    await users.updateOne({id: req.session.user.id}, {$set:u})

    res.render('tour_reservation_com',j)
})
app.get('/tour_reservation_view', async(req, res) => {

    if (req.session && req.session.user && req.session.user.id) {
        let u=await users.findOne({id: req.session.user.id})
        console.log(u.tour_list)
        res.render('tour_reservation_view',{list:u.tour_list})
    }
    else
        res.render('index', {stat:'로그인이 필요합니다'})


})
app.listen(1000, () => {
    console.log('Server Start')
})