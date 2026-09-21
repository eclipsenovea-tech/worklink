import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Briefcase, Star, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import JobCard from '../components/JobCard.jsx'
import Button from '../components/Button.jsx'
import { api, getCachedUser } from '../lib/api.js'

export default function Home(){
 const [user,setUser]=useState(getCachedUser()),[jobs,setJobs]=useState([])
 useEffect(()=>{Promise.all([api.me(),api.jobs()]).then(([m,j])=>{setUser(m.user);localStorage.setItem('worklink_user',JSON.stringify(m.user));setJobs(j.jobs.slice(0,3))}).catch(()=>{})},[])
 if(!user) return null
 const stats=[
  {label:'Jobs done',value:user.jobsCompleted||0,icon:Briefcase,chip:'bg-trust-50 text-trust-500'},
  {label:'Rating',value:user.rating||0,icon:Star,chip:'bg-amber-500/10 text-amber-600'},
  {label:'Wallet',value:`R${Number(user.balance||0).toFixed(2)}`,icon:Wallet,chip:'bg-growth-100 text-growth-600'}
 ]
 return <div>
  <div className="flex items-center justify-between mb-6"><div><p className="text-trust-400">Good morning,</p><h1 className="text-2xl font-bold text-trust-700">{user.name.split(' ')[0]}</h1></div><div className="flex items-center gap-1.5 text-sm text-trust-500 bg-white/80 border border-trust-100 rounded-full px-3 py-1.5"><MapPin size={14}/>{user.area||'Cape Town'}</div></div>
  <div className="grid grid-cols-3 gap-3 mb-8">{stats.map(({label,value,icon:Icon,chip})=><div key={label} className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-4 text-center"><div className={`w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center ${chip}`}><Icon size={18}/></div><p className="font-display font-bold text-xl text-trust-700">{value}</p><p className="text-xs text-trust-400 mt-0.5">{label}</p></div>)}</div>
  <div className="grid sm:grid-cols-2 gap-3 mb-8"><Button as={Link} to="/app/find-work" variant="primary" size="lg" full>Find Work</Button><Button as={Link} to="/app/post-task" variant="secondary" size="lg" full>Post a Task</Button></div>
  <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-trust-700">Jobs near you</h2><Link to="/app/find-work" className="text-sm font-semibold text-trust-600 flex items-center gap-1">See all <ArrowRight size={14}/></Link></div>
  <div className="flex flex-col gap-3">{jobs.map(j=><JobCard key={j.id} job={j}/>)}</div>
 </div>
}