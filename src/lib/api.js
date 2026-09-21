const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options={}) {
  const headers={...(options.headers||{})}
  const token=localStorage.getItem('worklink_token')
  if(token) headers.Authorization=`Bearer ${token}`
  if(options.body && !(options.body instanceof FormData)) headers['Content-Type']='application/json'
  const res=await fetch(`${API_BASE}${path}`,{...options,headers})
  const data=await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.error||'Something went wrong.')
  return data
}
export const api={
  requestCode:(phone)=>request('/auth/request-code',{method:'POST',body:JSON.stringify({phone})}),
  verify:(payload)=>request('/auth/verify',{method:'POST',body:JSON.stringify(payload)}),
  me:()=>request('/me'),
  categories:()=>request('/categories'),
  jobs:(params={})=>request(`/jobs?${new URLSearchParams(params)}`),
  job:(id)=>request(`/jobs/${id}`),
  createJob:(payload)=>request('/jobs',{method:'POST',body:JSON.stringify(payload)}),
  claim:(id)=>request(`/jobs/${id}/claim`,{method:'POST'}),
  unclaim:(id)=>request(`/jobs/${id}/unclaim`,{method:'POST'}),
  submit:(id)=>request(`/jobs/${id}/submit`,{method:'POST'}),
  approve:(id)=>request(`/jobs/${id}/approve`,{method:'POST'}),
  review:(id,payload)=>request(`/jobs/${id}/review`,{method:'POST',body:JSON.stringify(payload)}),
  wallet:()=>request('/wallet'),
  withdraw:(payload)=>request('/withdraw',{method:'POST',body:JSON.stringify(payload)}),
  profile:()=>request('/profile'),
  updateProfile:(payload)=>request('/profile',{method:'PUT',body:JSON.stringify(payload)}),
  settings:(payload)=>request('/settings',{method:'PUT',body:JSON.stringify(payload)})
}
export function setSession(token,user){ localStorage.setItem('worklink_token',token); localStorage.setItem('worklink_user',JSON.stringify(user)) }
export function clearSession(){ localStorage.removeItem('worklink_token'); localStorage.removeItem('worklink_user') }
export function getCachedUser(){ try{return JSON.parse(localStorage.getItem('worklink_user')||'null')}catch{return null} }
