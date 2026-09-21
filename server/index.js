import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import pg from 'pg'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'worklink-development-secret-change-me'
const DEMO_CODE = process.env.DEMO_CODE || '1234'
const PLATFORM_FEE = 0.10
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env locally or to Railway Variables.')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
})

const categories = ['Cleaning','Gardening','Delivery','Childminding','Tutoring','Moving','Repairs']

const seedJobs = [
  { id:'1', image:'/jobs/garden-cleanup.jpg', title:'Weekend garden cleanup', category:'Gardening', pay:150, distance:1.2, location:'Khayelitsha, Site C', description:'Need someone to clear an overgrown backyard, cut the grass, and bag the garden waste. Tools provided on site.', duration:'Half day' },
  { id:'2', image:'/jobs/move-couch.jpg', title:'Move a couch and bed frame', category:'Moving', pay:200, distance:3.4, location:'Mitchells Plain', description:'Moving from a first-floor flat to a ground-floor unit two streets away. Need two people for about two hours.', duration:'2 hours' },
  { id:'3', image:'/jobs/childminding.jpg', title:'After-school childminding', category:'Childminding', pay:120, distance:0.8, location:'Delft South', description:'Looking after two kids (ages 6 and 9) from 2pm to 5pm on weekdays this week. Homework help a bonus.', duration:'3 hours' },
  { id:'4', image:'/jobs/parcel-delivery.jpg', title:'Same-day parcel delivery', category:'Delivery', pay:90, distance:2.1, location:'Khayelitsha to Claremont', description:'Small parcel needs to reach Claremont before 5pm today. Own transport preferred but not required.', duration:'1-2 hours' },
  { id:'5', image:'/jobs/deep-clean.jpg', title:'Deep clean before family visit', category:'Cleaning', pay:180, distance:1.9, location:'Mitchells Plain, Beacon Valley', description:'Two bedroom home, needs a full clean including kitchen and bathroom before Saturday.', duration:'Half day' }
]

function nowMs(){ return Date.now() }
function publicUser(u){
  return {
    id:u.id, name:u.name, phone:u.phone, area:u.area, memberSince:u.memberSince,
    jobsCompleted:u.jobsCompleted, jobsPosted:u.jobsPosted, rating:Number(u.rating||0),
    badges:u.badges||{}, balance:Number(u.balance||0), earned:Number(u.earned||0),
    reviews:u.reviews||[], notificationPrefs:u.notificationPrefs||{jobAlerts:true,paymentAlerts:true}
  }
}
function mapUser(row){
  if (!row) return null
  return {
    id:row.id, name:row.name, phone:row.phone, area:row.area, memberSince:row.member_since,
    jobsCompleted:row.jobs_completed, jobsPosted:row.jobs_posted, rating:Number(row.rating||0),
    ratingSum:Number(row.rating_sum||0), ratingCount:row.rating_count||0,
    badges:row.badges||{}, balance:Number(row.balance||0), earned:Number(row.earned||0),
    reviews:row.reviews||[], notificationPrefs:row.notification_prefs||{jobAlerts:true,paymentAlerts:true}
  }
}
function mapJob(row){
  if (!row) return null
  const createdAt=Number(row.created_at)
  const age=Math.max(0,nowMs()-createdAt)
  const mins=Math.floor(age/60000)
  const postedAt=mins<60?`${Math.max(1,mins)} minutes ago`:mins<1440?`${Math.floor(mins/60)} hours ago`:`${Math.floor(mins/1440)} day${Math.floor(mins/1440)>1?'s':''} ago`
  return {
    id:row.id, image:row.image, title:row.title, category:row.category, pay:Number(row.pay),
    distance:Number(row.distance||0), postedAt, location:row.location, description:row.description,
    duration:row.duration, poster:row.poster, status:row.status, posterId:row.poster_id,
    workerId:row.worker_id, worker:row.worker, paymentStatus:row.payment_status,
    submittedAt:row.submitted_at, completedAt:row.completed_at
  }
}

async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      area TEXT NOT NULL DEFAULT 'Khayelitsha',
      member_since INTEGER NOT NULL,
      jobs_completed INTEGER NOT NULL DEFAULT 0,
      jobs_posted INTEGER NOT NULL DEFAULT 0,
      rating NUMERIC(4,2) NOT NULL DEFAULT 0,
      rating_sum NUMERIC(10,2) NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      badges JSONB NOT NULL DEFAULT '{}'::jsonb,
      balance NUMERIC(12,2) NOT NULL DEFAULT 0,
      earned NUMERIC(12,2) NOT NULL DEFAULT 0,
      reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
      notification_prefs JSONB NOT NULL DEFAULT '{"jobAlerts":true,"paymentAlerts":true}'::jsonb,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      image TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      pay NUMERIC(12,2) NOT NULL,
      distance NUMERIC(8,2) NOT NULL DEFAULT 0,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL,
      poster JSONB NOT NULL DEFAULT '{}'::jsonb,
      poster_id TEXT NOT NULL,
      worker_id TEXT,
      worker JSONB,
      status TEXT NOT NULL DEFAULT 'open',
      payment_status TEXT,
      created_at BIGINT NOT NULL,
      submitted_at BIGINT,
      completed_at BIGINT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      date TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      user_id TEXT,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      method TEXT NOT NULL,
      account_ref TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at BIGINT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  `)

  const {rows:[countRow]}=await pool.query('SELECT COUNT(*)::int AS count FROM users')
  if(countRow.count===0){
    const demoUser={
      id:'demo-user', name:'John Worker', phone:'0712345678', area:'Khayelitsha',
      memberSince:2024, jobsCompleted:47, jobsPosted:0, rating:4.9, ratingSum:4.9, ratingCount:1,
      badges:{Gardening:33,Cleaning:15,Delivery:7,Repairs:2}, balance:430, earned:3240,
      reviews:[
        {author:'Nomsa D.',rating:5,comment:'Arrived on time and did a great job with the garden.'},
        {author:'Buhle M.',rating:5,comment:'Very patient with the kids, will book again.'}
      ]
    }
    await pool.query(
      `INSERT INTO users (id,name,phone,area,member_since,jobs_completed,jobs_posted,rating,rating_sum,rating_count,badges,balance,earned,reviews,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [demoUser.id,demoUser.name,demoUser.phone,demoUser.area,demoUser.memberSince,demoUser.jobsCompleted,demoUser.jobsPosted,demoUser.rating,demoUser.ratingSum,demoUser.ratingCount,JSON.stringify(demoUser.badges),demoUser.balance,demoUser.earned,JSON.stringify(demoUser.reviews),nowMs()]
    )
  }

  const {rows:[jobCount]}=await pool.query('SELECT COUNT(*)::int AS count FROM jobs')
  if(jobCount.count===0){
    const demoPoster={name:'WorkLink',rating:4.8,jobsPosted:12}
    for(const j of seedJobs){
      await pool.query(
        `INSERT INTO jobs (id,image,title,category,pay,distance,location,description,duration,poster,poster_id,status,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'open',$12)`,
        [j.id,j.image,j.title,j.category,j.pay,j.distance,j.location,j.description,j.duration,JSON.stringify(demoPoster),'seed',nowMs()-3600000]
      )
    }
  }

  const {rows:[txCount]}=await pool.query('SELECT COUNT(*)::int AS count FROM transactions')
  if(txCount.count===0){
    const rows=[
      ['t1','Garden Cleanup','May 18, 2026',150,'demo-user'],
      ['t2','Platform Fee','May 18, 2026',-15,'demo-user'],
      ['t3','Furniture Delivery','May 17, 2026',200,'demo-user']
    ]
    for(const [id,label,date,amount,userId] of rows){
      await pool.query('INSERT INTO transactions (id,label,date,amount,user_id,created_at) VALUES ($1,$2,$3,$4,$5,$6)',[id,label,date,amount,userId,nowMs()])
    }
  }
}

const app=express()
app.use(cors())
app.use(express.json({limit:'2mb'}))
app.use('/uploads',express.static(UPLOAD_DIR))
app.use('/jobs',express.static(path.join(ROOT,'public/jobs')))

const upload=multer({
  storage:multer.diskStorage({
    destination:(_,__,cb)=>cb(null,UPLOAD_DIR),
    filename:(_,file,cb)=>cb(null,`${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname)}`)
  }),
  limits:{fileSize:5*1024*1024}
})

function tokenFor(user){ return jwt.sign({sub:user.id},JWT_SECRET,{expiresIn:'30d'}) }

async function auth(req,res,next){
  const header=req.headers.authorization||''
  const token=header.startsWith('Bearer ')?header.slice(7):null
  if(!token) return res.status(401).json({error:'Please sign in first.'})
  try{
    const p=jwt.verify(token,JWT_SECRET)
    const {rows}=await pool.query('SELECT * FROM users WHERE id=$1',[p.sub])
    const user=mapUser(rows[0])
    if(!user) throw new Error()
    req.user=user
    next()
  }catch{
    return res.status(401).json({error:'Your session has expired. Please sign in again.'})
  }
}

app.get('/api/health',async(_,res)=>{
  try{ await pool.query('SELECT 1'); res.json({ok:true,service:'worklink',database:'postgresql',time:new Date().toISOString()}) }
  catch(err){ res.status(503).json({ok:false,error:'Database unavailable.'}) }
})

app.post('/api/auth/request-code',async(req,res)=>{
  try{
    const phone=String(req.body.phone||'').replace(/\s+/g,'').trim()
    if(phone.length<9) return res.status(400).json({error:'Enter a valid phone number.'})
    await pool.query(
      `INSERT INTO verification_codes(phone,code,expires_at) VALUES($1,$2,$3)
       ON CONFLICT(phone) DO UPDATE SET code=EXCLUDED.code,expires_at=EXCLUDED.expires_at`,
      [phone,DEMO_CODE,nowMs()+10*60*1000]
    )
    res.json({ok:true,demoCode:process.env.NODE_ENV==='production'?undefined:DEMO_CODE})
  }catch(err){ console.error(err); res.status(500).json({error:'Could not send verification code.'}) }
})

app.post('/api/auth/verify',async(req,res)=>{
  try{
    const phone=String(req.body.phone||'').replace(/\s+/g,'').trim()
    const code=String(req.body.code||'').trim()
    const name=String(req.body.name||'').trim()
    const {rows:codes}=await pool.query('SELECT * FROM verification_codes WHERE phone=$1',[phone])
    const record=codes[0]
    if(!record||Number(record.expires_at)<nowMs()||code!==record.code) return res.status(400).json({error:'Invalid or expired verification code.'})

    const {rows:existing}=await pool.query('SELECT * FROM users WHERE phone=$1',[phone])
    let user=mapUser(existing[0])
    if(!user){
      user={id:crypto.randomUUID(),name:name||'WorkLink User',phone,area:'Khayelitsha',memberSince:new Date().getFullYear(),jobsCompleted:0,jobsPosted:0,rating:0,ratingSum:0,ratingCount:0,badges:{},balance:0,earned:0,reviews:[],notificationPrefs:{jobAlerts:true,paymentAlerts:true}}
      await pool.query(
        `INSERT INTO users(id,name,phone,area,member_since,badges,reviews,notification_prefs,created_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [user.id,user.name,user.phone,user.area,user.memberSince,JSON.stringify(user.badges),JSON.stringify(user.reviews),JSON.stringify(user.notificationPrefs),nowMs()]
      )
    }else if(name){
      user.name=name
      await pool.query('UPDATE users SET name=$1 WHERE id=$2',[name,user.id])
    }
    await pool.query('DELETE FROM verification_codes WHERE phone=$1',[phone])
    res.json({token:tokenFor(user),user:publicUser(user)})
  }catch(err){ console.error(err); res.status(500).json({error:'Could not verify your number.'}) }
})

app.get('/api/me',auth,(req,res)=>res.json({user:publicUser(req.user)}))
app.get('/api/categories',(_,res)=>res.json({categories}))

app.get('/api/jobs',async(req,res)=>{
  try{
    const category=req.query.category
    const q=String(req.query.q||'').toLowerCase()
    const params=[]
    const where=['status=$1']; params.push('open')
    if(category&&category!=='All'){params.push(category);where.push(`category=$${params.length}`)}
    if(q){params.push(`%${q}%`);where.push(`(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`)}
    const {rows}=await pool.query(`SELECT * FROM jobs WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,params)
    res.json({jobs:rows.map(mapJob)})
  }catch(err){ console.error(err); res.status(500).json({error:'Could not load tasks.'}) }
})

app.get('/api/jobs/:id',async(req,res)=>{
  try{
    const {rows}=await pool.query('SELECT * FROM jobs WHERE id=$1',[req.params.id])
    if(!rows[0]) return res.status(404).json({error:'That task no longer exists.'})
    res.json({job:mapJob(rows[0])})
  }catch(err){res.status(500).json({error:'Could not load that task.'})}
})

app.post('/api/jobs',auth,async(req,res)=>{
  const {title,category,description,pay,duration,location}=req.body
  const payNum=Number(pay)
  if(!title||!categories.includes(category)||!description||!duration||!location||!Number.isFinite(payNum)||payNum<20||payNum>5000) return res.status(400).json({error:'Please complete all task fields. Pay must be between R20 and R5,000.'})
  const id=crypto.randomUUID()
  const poster={name:req.user.name,rating:req.user.rating||0,jobsPosted:(req.user.jobsPosted||0)+1}
  try{
    const {rows}=await pool.query(
      `INSERT INTO jobs(id,title,category,description,pay,duration,location,distance,created_at,status,poster_id,poster,worker_id,image)
       VALUES($1,$2,$3,$4,$5,$6,$7,0,$8,'open',$9,$10,NULL,'/jobs/default.jpg') RETURNING *`,
      [id,title,category,description,Number(payNum.toFixed(2)),duration,location,nowMs(),req.user.id,JSON.stringify(poster)]
    )
    await pool.query('UPDATE users SET jobs_posted=jobs_posted+1 WHERE id=$1',[req.user.id])
    res.status(201).json({jobId:id,job:mapJob(rows[0])})
  }catch(err){ console.error(err); res.status(500).json({error:'Could not post the task.'}) }
})

app.post('/api/jobs/:id/claim',auth,async(req,res)=>{
  try{
    const {rows}=await pool.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[req.params.id])
    const job=rows[0]
    if(!job) return res.status(404).json({error:'That task no longer exists.'})
    if(job.poster_id===req.user.id) return res.status(403).json({error:"You can't claim your own task."})
    if(job.status!=='open') return res.status(409).json({error:'Sorry, this task has already been taken.'})
    const worker={name:req.user.name,rating:req.user.rating||0}
    const {rows:updated}=await pool.query('UPDATE jobs SET status=$1,worker_id=$2,worker=$3 WHERE id=$4 RETURNING *',['claimed',req.user.id,JSON.stringify(worker),job.id])
    res.json({ok:true,job:mapJob(updated[0])})
  }catch(err){ console.error(err); res.status(500).json({error:'Could not claim this task.'}) }
})

app.post('/api/jobs/:id/unclaim',auth,async(req,res)=>{
  try{
    const {rows}=await pool.query('SELECT * FROM jobs WHERE id=$1',[req.params.id])
    const job=rows[0]
    if(!job) return res.status(404).json({error:'That task no longer exists.'})
    if(job.worker_id!==req.user.id||job.status!=='claimed') return res.status(403).json({error:"You haven't claimed this task."})
    const {rows:updated}=await pool.query("UPDATE jobs SET status='open',worker_id=NULL,worker=NULL WHERE id=$1 RETURNING *",[job.id])
    res.json({ok:true,job:mapJob(updated[0])})
  }catch(err){res.status(500).json({error:'Could not release this task.'})}
})

app.post('/api/jobs/:id/submit',auth,async(req,res)=>{
  try{
    const {rows}=await pool.query('SELECT * FROM jobs WHERE id=$1',[req.params.id])
    const job=rows[0]
    if(!job||job.worker_id!==req.user.id) return res.status(403).json({error:'You are not the worker for this task.'})
    if(job.status!=='claimed') return res.status(409).json({error:'This task is not ready to be submitted.'})
    await pool.query("UPDATE jobs SET status='submitted',submitted_at=$1 WHERE id=$2",[nowMs(),job.id])
    res.json({ok:true})
  }catch(err){res.status(500).json({error:'Could not submit this task.'})}
})

app.post('/api/jobs/:id/approve',auth,async(req,res)=>{
  const client=await pool.connect()
  try{
    await client.query('BEGIN')
    const {rows}=await client.query('SELECT * FROM jobs WHERE id=$1 FOR UPDATE',[req.params.id])
    const job=rows[0]
    if(!job||job.poster_id!==req.user.id) { await client.query('ROLLBACK'); return res.status(403).json({error:'Only the task poster can approve this task.'}) }
    if(!['submitted','claimed'].includes(job.status)) { await client.query('ROLLBACK'); return res.status(409).json({error:'This task is not ready for approval.'}) }
    const {rows:workers}=await client.query('SELECT * FROM users WHERE id=$1 FOR UPDATE',[job.worker_id])
    const worker=workers[0]
    if(!worker){await client.query('ROLLBACK');return res.status(404).json({error:'Worker not found.'})}
    const fee=Number((Number(job.pay)*PLATFORM_FEE).toFixed(2))
    const net=Number((Number(job.pay)-fee).toFixed(2))
    await client.query('UPDATE users SET balance=balance+$1,earned=earned+$1,jobs_completed=jobs_completed+1 WHERE id=$2',[net,worker.id])
    await client.query("UPDATE jobs SET status='completed',payment_status='released',completed_at=$1 WHERE id=$2",[nowMs(),job.id])
    await client.query(
      'INSERT INTO transactions(id,label,date,amount,user_id,created_at) VALUES($1,$2,$3,$4,$5,$6)',
      [crypto.randomUUID(),job.title,new Date().toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'}),net,worker.id,nowMs()]
    )
    await client.query('COMMIT')
    res.json({pay:Number(job.pay),fee,net})
  }catch(err){await client.query('ROLLBACK');console.error(err);res.status(500).json({error:'Could not approve this task.'})}
  finally{client.release()}
})

app.post('/api/jobs/:id/review',auth,async(req,res)=>{
  const rating=Number(req.body.rating), comment=String(req.body.comment||'')
  if(rating<1||rating>5) return res.status(400).json({error:'Invalid review.'})
  try{
    const {rows}=await pool.query('SELECT * FROM jobs WHERE id=$1',[req.params.id])
    const job=rows[0]
    if(!job||job.status!=='completed') return res.status(409).json({error:'This task is not complete.'})
    const subjectId=req.user.id===job.poster_id?job.worker_id:req.user.id===job.worker_id?job.poster_id:null
    if(!subjectId) return res.status(400).json({error:'You cannot review this task.'})
    const {rows:subjects}=await pool.query('SELECT * FROM users WHERE id=$1',[subjectId])
    const subject=subjects[0]
    if(!subject) return res.status(404).json({error:'User not found.'})
    const ratingSum=Number(subject.rating_sum||0)+rating
    const ratingCount=Number(subject.rating_count||0)+1
    const reviews=Array.isArray(subject.reviews)?subject.reviews:[]
    reviews.unshift({author:req.user.name,rating,comment})
    const newRating=Math.round(ratingSum/ratingCount*100)/100
    await pool.query('UPDATE users SET rating_sum=$1,rating_count=$2,rating=$3,reviews=$4 WHERE id=$5',[ratingSum,ratingCount,newRating,JSON.stringify(reviews),subjectId])
    res.json({ok:true,subjectRatingAvg:newRating})
  }catch(err){console.error(err);res.status(500).json({error:'Could not save the review.'})}
})

app.get('/api/wallet',auth,async(req,res)=>{
  try{
    const {rows}=await pool.query('SELECT id,label,date,amount,user_id FROM transactions WHERE user_id IS NULL OR user_id=$1 ORDER BY created_at DESC',[req.user.id])
    res.json({balance:req.user.balance||0,earned:req.user.earned||0,transactions:rows.map(t=>({...t,amount:Number(t.amount)}))})
  }catch(err){res.status(500).json({error:'Could not load your wallet.'})}
})

app.post('/api/withdraw',auth,async(req,res)=>{
  const amount=Number(req.body.amount), method=req.body.method||'ewallet', accountRef=String(req.body.accountRef||'')
  if(!Number.isFinite(amount)||amount<50||amount>req.user.balance) return res.status(400).json({error:'Withdrawal must be at least R50 and no more than your available balance.'})
  const client=await pool.connect()
  try{
    await client.query('BEGIN')
    const {rows}=await client.query('SELECT balance FROM users WHERE id=$1 FOR UPDATE',[req.user.id])
    const balance=Number(rows[0]?.balance||0)
    if(amount>balance){await client.query('ROLLBACK');return res.status(400).json({error:'Insufficient balance.'})}
    const withdrawalId=crypto.randomUUID()
    await client.query('UPDATE users SET balance=balance-$1 WHERE id=$2',[amount,req.user.id])
    await client.query('INSERT INTO withdrawals(id,user_id,amount,method,account_ref,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[withdrawalId,req.user.id,amount,method,accountRef,'pending',nowMs()])
    await client.query('INSERT INTO transactions(id,label,date,amount,user_id,created_at) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),'Withdrawal',new Date().toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'}),-amount,req.user.id,nowMs()])
    await client.query('COMMIT')
    res.json({withdrawalId})
  }catch(err){await client.query('ROLLBACK');res.status(500).json({error:'Could not process the withdrawal.'})}
  finally{client.release()}
})

app.get('/api/profile',auth,(req,res)=>res.json({user:publicUser(req.user),reviews:req.user.reviews||[]}))

app.put('/api/profile',auth,async(req,res)=>{
  if(req.body.name!==undefined) req.user.name=String(req.body.name).trim().slice(0,60)
  if(req.body.area!==undefined) req.user.area=String(req.body.area).trim().slice(0,80)
  try{
    await pool.query('UPDATE users SET name=$1,area=$2 WHERE id=$3',[req.user.name,req.user.area,req.user.id])
    res.json({user:publicUser(req.user)})
  }catch(err){res.status(500).json({error:'Could not update your profile.'})}
})

app.put('/api/settings',auth,async(req,res)=>{
  req.user.notificationPrefs={...req.user.notificationPrefs,...req.body}
  try{
    await pool.query('UPDATE users SET notification_prefs=$1 WHERE id=$2',[JSON.stringify(req.user.notificationPrefs),req.user.id])
    res.json({notificationPrefs:req.user.notificationPrefs})
  }catch(err){res.status(500).json({error:'Could not update settings.'})}
})

app.post('/api/upload',auth,upload.single('file'),(req,res)=>{
  if(!req.file) return res.status(400).json({error:'No file uploaded.'})
  res.json({path:`/uploads/${req.file.filename}`})
})

const dist=path.join(ROOT,'dist')
if(fs.existsSync(dist)){
  app.use(express.static(dist))
  app.get('/{*splat}',(req,res)=>{
    if(req.path.startsWith('/api/')) return res.status(404).json({error:'API route not found'})
    res.sendFile(path.join(dist,'index.html'))
  })
}

async function start(){
  await initDb()
  await pool.query('SELECT 1')
  app.listen(PORT,()=>console.log(`WorkLink server listening on ${PORT}`))
}
start().catch(err=>{console.error('Failed to start WorkLink:',err);process.exit(1)})
