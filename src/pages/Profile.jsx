import { Link } from 'react-router-dom'
import { Star, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import SkillBadge from '../components/SkillBadge.jsx'
import { api } from '../lib/api.js'
export default function Profile(){
 const [user,setUser]=useState(null)
 useEffect(()=>{api.profile().then(d=>setUser(d.user))},[])
 if(!user)return <div className="text-trust-400">Loading…</div>
 const badges=Object.entries(user.badges||{})
 return <div><div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-trust-700">My Profile</h1><Link to="/app/settings" aria-label="Settings" className="w-10 h-10 flex items-center justify-center rounded-full border border-trust-100 bg-white text-trust-500 shadow-card"><Settings size={18}/></Link></div>
  <div className="flex flex-col items-center text-center mb-6"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-trust-100 to-growth-100 border-2 border-white shadow-card flex items-center justify-center font-display font-bold text-2xl text-trust-700">{user.name.split(' ').map(n=>n[0]).join('')}</div><h2 className="text-xl font-bold text-trust-700 mt-3">{user.name}</h2><p className="text-trust-400 text-sm">Member since {user.memberSince}</p></div>
  <div className="grid grid-cols-3 gap-3 mb-8">{[['Jobs',user.jobsCompleted||0],['Rating',user.rating||0],['Earned',`R${Number(user.earned||0).toFixed(2)}`]].map(([label,value])=><div key={label} className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-4 text-center"><p className="font-display font-bold text-xl text-trust-700">{value}</p><p className="text-xs text-trust-400 mt-0.5">{label}</p></div>)}</div>
  <h3 className="text-lg font-bold text-trust-700 mb-3">Skill Badges</h3><div className="grid grid-cols-2 gap-3 mb-8">{badges.map(([category,jobs])=><SkillBadge key={category} category={category} jobs={jobs}/>)}</div>
  <h3 className="text-lg font-bold text-trust-700 mb-3">Recent Reviews</h3><div className="flex flex-col gap-3">{(user.reviews||[]).map((review,i)=><div key={i} className="bg-white rounded-2xl border border-trust-100/70 shadow-card p-4"><div className="flex items-center justify-between"><p className="font-semibold text-trust-700">{review.author}</p><div className="flex gap-0.5">{Array.from({length:review.rating}).map((_,idx)=><Star key={idx} size={14} className="fill-amber-500 text-amber-500"/>)}</div></div><p className="text-trust-400 text-sm mt-1.5">{review.comment}</p></div>)}</div>
 </div>
}