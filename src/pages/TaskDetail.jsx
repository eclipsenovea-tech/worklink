import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, Star, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import JobImage from '../components/JobImage.jsx'
import { api } from '../lib/api.js'
export default function TaskDetail(){
 const {id}=useParams(),[job,setJob]=useState(null),[message,setMessage]=useState(''),[loading,setLoading]=useState(false)
 useEffect(()=>{api.job(id).then(d=>setJob(d.job)).catch(e=>setMessage(e.message))},[id])
 async function act(action){setLoading(true);setMessage('');try{const d=await api[action](id);setJob(d.job?d.job:{...job,status:action==='claim'?'claimed':action==='unclaim'?'open':action==='submit'?'submitted':'completed'});setMessage(action==='claim'?'Task claimed.':action==='submit'?'Task submitted for approval.':action==='approve'?'Task approved and payment released.':'Updated.')}catch(e){setMessage(e.message)}finally{setLoading(false)}}
 if(!job)return <div className="text-trust-400 py-10">{message||'Loading task…'}</div>
 return <div><PageHeader title={job.title} subtitle={job.category}/><JobImage job={job} iconSize={56} className="w-full aspect-video md:aspect-[2/1] rounded-2xl mb-4"/>
  <div className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-5 mb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-trust-400 uppercase tracking-wide font-semibold">Pay</p><p className="font-display font-bold text-2xl text-trust-700">R{Number(job.pay).toFixed(2)}</p></div><div className="text-right"><p className="text-xs text-trust-400 uppercase tracking-wide font-semibold">Duration</p><p className="font-semibold text-trust-700">{job.duration}</p></div></div><div className="flex flex-wrap gap-4 mt-4 text-sm text-trust-400"><span className="flex items-center gap-1.5"><MapPin size={16}/>{job.location}</span><span className="flex items-center gap-1.5"><Clock size={16}/>{job.postedAt}</span></div></div>
  <div className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-5 mb-4"><h2 className="font-semibold text-trust-700 mb-2">About this task</h2><p className="text-trust-500 leading-relaxed">{job.description}</p></div>
  <div className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-5 mb-6"><h2 className="font-semibold text-trust-700 mb-3">Posted by</h2><div className="flex items-center justify-between"><div><p className="font-medium text-trust-700">{job.poster.name}</p><p className="text-sm text-trust-400 flex items-center gap-1 mt-0.5"><Star size={14} className="fill-amber-500 text-amber-500"/> {job.poster.rating||0} · {job.poster.jobsPosted||0} tasks posted</p></div><div className="flex items-center gap-1 text-xs text-growth-600 bg-growth-50 rounded-full px-3 py-1.5"><ShieldCheck size={14}/> Verified</div></div></div>
  {message&&<div className="mb-4 rounded-xl bg-growth-50 border border-growth-100 text-growth-600 p-3 text-sm">{message}</div>}
  {job.status==='open'&&<Button variant="growth" onClick={()=>act('claim')} disabled={loading} size="lg" full>{loading?'Working…':'Claim this task'}</Button>}
  {job.status==='claimed'&&<div className="grid grid-cols-2 gap-3"><Button variant="soft" onClick={()=>act('unclaim')} disabled={loading} size="lg">Unclaim</Button><Button variant="growth" onClick={()=>act('submit')} disabled={loading} size="lg">Mark done</Button></div>}
  {job.status==='submitted'&&<div className="bg-growth-50 border border-growth-200 rounded-2xl p-5 text-center"><p className="font-semibold text-growth-600">Waiting for approval</p><p className="text-trust-400 text-sm mt-1">The poster needs to confirm the work is complete.</p></div>}
  {job.status==='completed'&&<div className="bg-growth-50 border border-growth-200 rounded-2xl p-5 text-center"><p className="font-semibold text-growth-600">Task completed</p><p className="text-trust-400 text-sm mt-1">Payment has been released.</p></div>}
 </div>
}