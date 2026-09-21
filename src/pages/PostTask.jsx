import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import { api } from '../lib/api.js'
export default function PostTask(){
 const navigate=useNavigate(),[categories,setCategories]=useState([]),[submitted,setSubmitted]=useState(false),[error,setError]=useState('')
 const [form,setForm]=useState({title:'',category:'',pay:'',duration:'',location:'',description:''})
 useEffect(()=>{api.categories().then(d=>{setCategories(d.categories);setForm(f=>({...f,category:f.category||d.categories[0]}))})},[])
 const update=(f,v)=>setForm(p=>({...p,[f]:v}))
 async function handleSubmit(e){e.preventDefault();setError('');try{await api.createJob(form);setSubmitted(true)}catch(err){setError(err.message)}}
 if(submitted)return <div className="flex flex-col items-center text-center py-16"><div className="w-16 h-16 rounded-full bg-growth-50 flex items-center justify-center text-growth-600 text-3xl font-bold mb-4">✓</div><h1 className="text-2xl font-bold text-trust-700">Task posted</h1><p className="text-trust-400 mt-2 max-w-sm">Nearby workers can now see and claim "{form.title}".</p><Button className="mt-6" onClick={()=>navigate('/app/home')}>Back to Home</Button></div>
 return <div><PageHeader title="Post a Task" subtitle="Describe the job, set a fair rate, and go live instantly."/>
  {error&&<div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm p-3">{error}</div>}
  <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
   <label><span className="text-sm font-medium text-trust-600">Task title</span><input required value={form.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. Clear the backyard this weekend" className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3"/></label>
   <label><span className="text-sm font-medium text-trust-600">Category</span><select value={form.category} onChange={e=>update('category',e.target.value)} className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3 bg-white">{categories.map(c=><option key={c}>{c}</option>)}</select></label>
   <div className="grid grid-cols-2 gap-4"><label><span className="text-sm font-medium text-trust-600">Pay (ZAR)</span><input required type="number" min="20" max="5000" value={form.pay} onChange={e=>update('pay',e.target.value)} placeholder="150" className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3"/></label><label><span className="text-sm font-medium text-trust-600">Duration</span><input required value={form.duration} onChange={e=>update('duration',e.target.value)} placeholder="e.g. 2 hours" className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3"/></label></div>
   <label><span className="text-sm font-medium text-trust-600">Location</span><input required value={form.location} onChange={e=>update('location',e.target.value)} placeholder="e.g. Khayelitsha, Site C" className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3"/></label>
   <label><span className="text-sm font-medium text-trust-600">Description</span><textarea required rows="4" value={form.description} onChange={e=>update('description',e.target.value)} placeholder="What needs to be done, and anything a worker should know." className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3 resize-none"/></label>
   <div className="bg-growth-50 border border-growth-100 rounded-xl px-4 py-3 text-sm text-growth-600">No listing fees. Payment is simulated in this Railway prototype.</div>
   <Button type="submit" size="lg" full>Post Task</Button>
  </form>
 </div>
}