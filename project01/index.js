var express= require('express')
var app=express()

var bp=require('body-parser')
app.use(bp.urlencoded({extended:true}))
app.use(bp.json())

var expressSession = require('express-session');

app.use(expressSession({
	secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
                                //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
	resave: true,
	saveUninitialized:true
}));

const uri="mongodb+srv://user1:L68Wq7NnkVxnWh9@cluster0-wgesx.gcp.mongodb.net/test?retryWrites=true&w=majority"

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true});
client.connect(err => {
	console.log("#ERROR "+err)
	if(err!=null)
		client.close();
});

app.set("view engine",'pug')
app.set("views",'./views')


app.get('/',(req,res)=>{
	res.render('index')
})
app.get('/register',(req,res)=>{
	res.render('register')
})
app.post('/register_com',async (req,res)=>{
	const collection = client.db("db").collection("users")
	let q={id:req.body.id,pw:req.body.pw,group:0}//0:users, 1:manager 2:admin
	let st={stat:""}
	let s='register'
	try{
		let r=await collection.countDocuments({"id":q.id})
		if(r==0){
			s='register_com'
			st.stat="회원가입 성공!"
			collection.insertOne(q)
		}
		else
			st.stat="회원가입 실패!(이미 존재하는 아이디)"

	}catch(e){
		console.log(e)
		st.stat="회원가입 실패!(알 수 없는 오류)"
	}
	res.render(s,st)
})
app.get('/login',async (req,res)=>{

	res.render('login')
})
app.get('/admin',(req,res)=>{
	res.render('admin')
})
app.get('/register_tour',(req,res)=>{
	res.render('register_tour')
})
app.get('/info_tour',(req,res)=>{
	res.render('info_tour')
})
app.get('/setting_tour',(req,res)=>{
	res.render('register')
})
app.get('/reservation_tour',(req,res)=>{
	res.render('reservation_tour')
})
app.listen(1000,()=>{
	console.log('Server Start')
})