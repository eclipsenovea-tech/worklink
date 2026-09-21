import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(DATA_DIR, { recursive: true })
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'worklink-development-secret-change-me'
const DEMO_CODE = process.env.DEMO_CODE || '1234'
const PLATFORM_FEE = 0.10
const categories = ['Cleaning','Gardening','Delivery','Childminding','Tutoring','Moving','Repairs']

const seedJobs = [
  { id:'1', image:'/jobs/garden-cleanup.jpg', title:'Weekend garden cleanup', category:'Gardening', pay:150, distance:1.2, postedAt:'2 hours ago', location:'Khayelitsha, Site C', description:'Need someone to clear an overgrown backyard, cut the grass, and bag the garden waste. Tools provided on site.', duration:'Half day', poster:{name:'Nomsa D.',rating:4.8,jobsPosted:12}, status:'open' },
  { id:'2', image:'/jobs/move-couch.jpg', title:'Move a couch and bed frame', category:'Moving', pay:200, distance:3.4, postedAt:'5 hours ago', location:'Mitchells Plain', description:'Moving from a first-floor flat to a ground-floor unit two streets away. Need two people for about two hours.', duration:'2 hours', poster:{name:'Riedwaan K.',rating:4.6,jobsPosted:4}, status:'open' },
  { id:'3', image:'/jobs/childminding.jpg', title:'After-school childminding', category:'Childminding', pay:120, distance:0.8, postedAt:'Yesterday', location:'Delft South', description:'Looking after two kids (ages 6 and 9) from 2pm to 5pm on weekdays this week. Homework help a bonus.', duration:'3 hours', poster:{name:'Buhle M.',rating:5.0,jobsPosted:21}, status:'open' },
  { id:'4', image:'/jobs/parcel-delivery.jpg', title:'Same-day parcel delivery', category:'Delivery', pay:90, distance:2.1, postedAt:'30 minutes ago', location:'Khayelitsha to Claremont', description:'Small parcel needs to reach Claremont before 5pm today. Own transport preferred but not required.', duration:'1-2 hours', poster:{name:'Local Traders Co-op',rating:4.9,jobsPosted:58}, status:'open' },
  { id:'5', image:'/jobs/deep-clean.jpg', title:'Deep clean before family visit', category:'Cleaning', pay:180, distance:1.9, postedAt:'1 day ago', location:'Mitchells Plain, Beacon Valley', description:'Two bedroom home, needs a full clean including kitchen and bathroom before Saturday.', duration:'Half day', poster:{name:'Aunty Faye',rating:4.7,jobsPosted:9}, status:'open' }
]

function initialDb() {
  return {
    users: [{
      id:'demo-user', name:'John Worker', phone:'0712345678', area:'Khayelitsha',
      memberSince:2024, jobsCompleted:47, jobsPosted:0, rating:4.9, ratingSum:4.9, ratingCount:1,
      badges:{Gardening:33,Cleaning:15,Delivery:7,Repairs:2},
      balance:430, earned:3240,
      reviews:[
        {author:'Nomsa D.',rating:5,comment:'Arrived on time and did a great job with the garden.'},
        {author:'Buhle M.',rating:5,comment:'Very patient with the kids, will book again.'}
      ],
      notificationPrefs:{jobAlerts:true,paymentAlerts:true}
    }],
    jobs: seedJobs.map(j => ({...j, posterId:'seed', workerId:null, createdAt:Date.now()-3600000})),
    transactions:[
      {id:'t1',label:'Garden Cleanup',date:'May 18, 2026',amount:150},
      {id:'t2',label:'Platform Fee',date:'May 18, 2026',amount:-15},
      {id:'t3',label:'Furniture Delivery',date:'May 17, 2026',amount:200}
    ],
    withdrawals:[],
    codes:{}
  }
}
function loadDb(){
  if(!fs.existsSync(DB_FILE)){ const db=initialDb(); saveDb(db); return db }
  try { return JSON.parse(fs.readFileSync(DB_FILE,'utf8')) } catch { const db=initialDb(); saveDb(db); return db }
}
function saveDb(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)) }
let db=loadDb()

const app=express()
app.use(cors())
app.use(express.json({limit:'2mb'}))
app.use('/uploads', express.static(UPLOAD_DIR))
app.use('/jobs', express.static(path.join(ROOT,'public/jobs')))

const upload=multer({
  storage: multer.diskStorage({
    destination:(_,__,cb)=>cb(null,UPLOAD_DIR),
    filename:(_,file,cb)=>cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname)}`)
  }),
  limits:{fileSize:5*1024*1024}
})

function tokenFor(user){ return jwt.sign({sub:user.id},JWT_SECRET,{expiresIn:'30d'}) }
function auth(req,res,next){
  const header=req.headers.authorization||''
  const token=header.startsWith('Bearer ')?header.slice(7):null
  if(!token) return res.status(401).json({error:'Please sign in first.'})
  try { const p=jwt.verify(token,JWT_SECRET); const user=db.users.find(u=>u.id===p.sub); if(!user) throw new Error(); req.user=user; next() }
  catch { return res.status(401).json({error:'Your session has expired. Please sign in again.'}) }
}
function cleanUser(u){ const {balance,earned,...publicUser}=u; return {...publicUser,balance,earned} }
function jobView(j){
  const age=Math.max(0,Date.now()-j.createdAt)
  const mins=Math.floor(age/60000)
  const postedAt=mins<60?`${Math.max(1,mins)} minutes ago`:mins<1440?`${Math.floor(mins/60)} hours ago`:`${Math.floor(mins/1440)} day${Math.floor(mins/1440)>1?'s':''} ago`
  return {...j, postedAt}
}

app.get('/api/health',(_,res)=>res.json({ok:true,service:'worklink',time:new Date().toISOString()}))

app.post('/api/auth/request-code',(req,res)=>{
  const phone=String(req.body.phone||'').replace(/\s+/g,'').trim()
  if(phone.length<9) return res.status(400).json({error:'Enter a valid phone number.'})
  db.codes[phone]={code:DEMO_CODE,expiresAt:Date.now()+10*60*1000}
  saveDb(db)
  res.json({ok:true, demoCode:process.env.NODE_ENV==='production'?undefined:DEMO_CODE})
})

app.post('/api/auth/verify',(req,res)=>{
  const phone=String(req.body.phone||'').replace(/\s+/g,'').trim()
  const code=String(req.body.code||'').trim()
  const name=String(req.body.name||'').trim()
  const record=db.codes[phone]
  if(!record || record.expiresAt<Date.now() || code!==record.code) return res.status(400).json({error:'Invalid or expired verification code.'})
  let user=db.users.find(u=>u.phone===phone)
  if(!user){
    user={id:crypto.randomUUID(),name:name||'WorkLink User',phone,area:'Khayelitsha',memberSince:new Date().getFullYear(),jobsCompleted:0,jobsPosted:0,rating:0,ratingSum:0,ratingCount:0,badges:{},balance:0,earned:0,reviews:[],notificationPrefs:{jobAlerts:true,paymentAlerts:true}}
    db.users.push(user)
  } else if(name) user.name=name
  delete db.codes[phone]
  saveDb(db)
  res.json({token:tokenFor(user),user:cleanUser(user)})
})

app.get('/api/me',auth,(req,res)=>res.json({user:cleanUser(req.user)}))
app.get('/api/categories',(_,res)=>res.json({categories}))

app.get('/api/jobs',(req,res)=>{
  const category=req.query.category
  const q=String(req.query.q||'').toLowerCase()
  let jobs=db.jobs.filter(j=>j.status==='open')
  if(category && category!=='All') jobs=jobs.filter(j=>j.category===category)
  if(q) jobs=jobs.filter(j=>j.title.toLowerCase().includes(q)||j.description.toLowerCase().includes(q))
  res.json({jobs:jobs.map(jobView)})
})
app.get('/api/jobs/:id',(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  if(!job) return res.status(404).json({error:'That task no longer exists.'})
  res.json({job:jobView(job)})
})
app.post('/api/jobs',auth,(req,res)=>{
  const {title,category,description,pay,duration,location}=req.body
  const payNum=Number(pay)
  if(!title||!categories.includes(category)||!description||!duration||!location||!Number.isFinite(payNum)||payNum<20||payNum>5000) return res.status(400).json({error:'Please complete all task fields. Pay must be between R20 and R5,000.'})
  const id=crypto.randomUUID()
  const job={id,title,category,description,pay:Number(payNum.toFixed(2)),duration,location,distance:0,createdAt:Date.now(),postedAt:'just now',status:'open',posterId:req.user.id,poster:{name:req.user.name,rating:req.user.rating||0,jobsPosted:(req.user.jobsPosted||0)+1},workerId:null,image:'/jobs/default.jpg'}
  db.jobs.unshift(job)
  req.user.jobsPosted=(req.user.jobsPosted||0)+1
  saveDb(db)
  res.status(201).json({jobId:id,job:jobView(job)})
})
app.post('/api/jobs/:id/claim',auth,(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  if(!job) return res.status(404).json({error:'That task no longer exists.'})
  if(job.posterId===req.user.id) return res.status(403).json({error:"You can't claim your own task."})
  if(job.status!=='open') return res.status(409).json({error:'Sorry, this task has already been taken.'})
  job.status='claimed'; job.workerId=req.user.id; job.worker={name:req.user.name,rating:req.user.rating||0}
  saveDb(db)
  res.json({ok:true,job:jobView(job)})
})
app.post('/api/jobs/:id/unclaim',auth,(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  if(!job) return res.status(404).json({error:'That task no longer exists.'})
  if(job.workerId!==req.user.id||job.status!=='claimed') return res.status(403).json({error:"You haven't claimed this task."})
  job.status='open'; job.workerId=null; delete job.worker
  saveDb(db); res.json({ok:true})
})
app.post('/api/jobs/:id/submit',auth,(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  if(!job||job.workerId!==req.user.id) return res.status(403).json({error:'You are not the worker for this task.'})
  if(job.status!=='claimed') return res.status(409).json({error:'This task is not ready to be submitted.'})
  job.status='submitted'; job.submittedAt=Date.now(); saveDb(db); res.json({ok:true})
})
app.post('/api/jobs/:id/approve',auth,(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  if(!job||job.posterId!==req.user.id) return res.status(403).json({error:'Only the task poster can approve this task.'})
  if(!['submitted','claimed'].includes(job.status)) return res.status(409).json({error:'This task is not ready for approval.'})
  const worker=db.users.find(u=>u.id===job.workerId)
  if(!worker) return res.status(404).json({error:'Worker not found.'})
  const fee=Number((job.pay*PLATFORM_FEE).toFixed(2)), net=Number((job.pay-fee).toFixed(2))
  worker.balance=Number(((worker.balance||0)+net).toFixed(2)); worker.earned=Number(((worker.earned||0)+net).toFixed(2)); worker.jobsCompleted=(worker.jobsCompleted||0)+1
  job.status='completed'; job.paymentStatus='released'; job.completedAt=Date.now()
  db.transactions.unshift({id:crypto.randomUUID(),label:job.title,date:new Date().toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'}),amount:net,userId:worker.id})
  saveDb(db); res.json({pay:job.pay,fee,net})
})
app.post('/api/jobs/:id/review',auth,(req,res)=>{
  const job=db.jobs.find(j=>j.id===req.params.id)
  const rating=Number(req.body.rating), comment=String(req.body.comment||'')
  if(!job||job.status!=='completed') return res.status(409).json({error:'This task is not complete.'})
  const subjectId=req.user.id===job.posterId?job.workerId:req.user.id===job.workerId?job.posterId:null
  if(!subjectId||rating<1||rating>5) return res.status(400).json({error:'Invalid review.'})
  const subject=db.users.find(u=>u.id===subjectId)
  if(!subject) return res.status(404).json({error:'User not found.'})
  subject.ratingSum=(subject.ratingSum||0)+rating; subject.ratingCount=(subject.ratingCount||0)+1; subject.rating=Math.round(subject.ratingSum/subject.ratingCount*100)/100
  subject.reviews=subject.reviews||[]; subject.reviews.unshift({author:req.user.name,rating,comment})
  saveDb(db); res.json({ok:true,subjectRatingAvg:subject.rating})
})

app.get('/api/wallet',auth,(req,res)=>{
  const tx=db.transactions.filter(t=>!t.userId||t.userId===req.user.id)
  res.json({balance:req.user.balance||0,earned:req.user.earned||0,transactions:tx})
})
app.post('/api/withdraw',auth,(req,res)=>{
  const amount=Number(req.body.amount), method=req.body.method||'ewallet', accountRef=String(req.body.accountRef||'')
  if(amount<50||amount>req.user.balance) return res.status(400).json({error:'Withdrawal must be at least R50 and no more than your available balance.'})
  req.user.balance=Number((req.user.balance-amount).toFixed(2))
  const withdrawal={id:crypto.randomUUID(),userId:req.user.id,amount,method,accountRef,status:'pending',createdAt:Date.now()}
  db.withdrawals.push(withdrawal)
  db.transactions.unshift({id:crypto.randomUUID(),label:'Withdrawal',date:new Date().toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'}),amount:-amount,userId:req.user.id})
  saveDb(db); res.json({withdrawalId:withdrawal.id})
})
app.get('/api/profile',auth,(req,res)=>{
  const reviews=req.user.reviews||[]
  res.json({user:cleanUser(req.user),reviews})
})
app.put('/api/profile',auth,(req,res)=>{
  if(req.body.name!==undefined) req.user.name=String(req.body.name).trim().slice(0,60)
  if(req.body.area!==undefined) req.user.area=String(req.body.area).trim().slice(0,80)
  saveDb(db); res.json({user:cleanUser(req.user)})
})
app.put('/api/settings',auth,(req,res)=>{
  req.user.notificationPrefs={...req.user.notificationPrefs,...req.body}
  saveDb(db); res.json({notificationPrefs:req.user.notificationPrefs})
})
app.post('/api/upload',auth,upload.single('file'),(req,res)=>{
  if(!req.file) return res.status(400).json({error:'No file uploaded.'})
  res.json({path:`/uploads/${req.file.filename}`})
})

// Serve built React app in production.
const dist=path.join(ROOT,'dist')
if(fs.existsSync(dist)){
  app.use(express.static(dist))
  app.get('/{*splat}',(req,res)=>{
    if(req.path.startsWith('/api/')) return res.status(404).json({error:'API route not found'})
    res.sendFile(path.join(dist,'index.html'))
  })
}
app.listen(PORT,()=>console.log(`WorkLink server listening on ${PORT}`))
