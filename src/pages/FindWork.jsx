import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import JobCard from '../components/JobCard.jsx'
import { api } from '../lib/api.js'
export default function FindWork(){
 const [query,setQuery]=useState(''),[activeCategory,setActiveCategory]=useState('All'),[jobs,setJobs]=useState([]),[categories,setCategories]=useState([])
 useEffect(()=>{api.categories().then(d=>setCategories(d.categories));},[])
 useEffect(()=>{const t=setTimeout(()=>api.jobs({q:query,category:activeCategory}).then(d=>setJobs(d.jobs)).catch(()=>setJobs([])),150);return()=>clearTimeout(t)},[query,activeCategory])
 return <div><h1 className="text-2xl font-bold text-trust-700 mb-1">Find Work</h1><p className="text-trust-400 mb-5">{jobs.length} tasks available</p>
  <div className="flex items-center rounded-xl border border-cloud-300 bg-white px-4 mb-4 focus-within:border-trust-400"><Search size={18} className="text-trust-300"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks" className="w-full py-3 px-3 outline-none"/></div>
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">{['All',...categories].map(cat=><button key={cat} onClick={()=>setActiveCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border ${activeCategory===cat?'bg-trust-700 text-white border-trust-700':'bg-white text-trust-500 border-cloud-300'}`}>{cat}</button>)}</div>
  <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">{jobs.map(job=><JobCard key={job.id} job={job}/>)}{jobs.length===0&&<p className="text-trust-400 text-center py-12 md:col-span-2">No tasks match that search yet.</p>}</div>
 </div>
}