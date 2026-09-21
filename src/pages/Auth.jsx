import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ShieldCheck } from 'lucide-react'
import Button from '../components/Button.jsx'
import { Mark } from '../components/Logo.jsx'
import { api, setSession } from '../lib/api.js'

export default function Auth() {
  const [mode,setMode]=useState('signup'), [stage,setStage]=useState('phone')
  const [name,setName]=useState(''), [phone,setPhone]=useState(''), [code,setCode]=useState('')
  const [error,setError]=useState(''), [loading,setLoading]=useState(false), [demoCode,setDemoCode]=useState('')
  const navigate=useNavigate()

  async function requestCode(e){
    e.preventDefault(); setError('')
    if(mode==='signup' && name.trim().length<2) return setError('Please enter your full name.')
    setLoading(true)
    try { const data=await api.requestCode(phone); setDemoCode(data.demoCode||''); setStage('code') }
    catch(err){setError(err.message)} finally{setLoading(false)}
  }
  async function verifyCode(e){
    e.preventDefault(); setError(''); setLoading(true)
    try { const data=await api.verify({phone,code,name}); setSession(data.token,data.user); navigate('/app/home',{replace:true}) }
    catch(err){setError(err.message)} finally{setLoading(false)}
  }
  return <div className="min-h-screen flex items-center justify-center px-6 py-10">
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-0"><Mark size={150} className="-mb-[30px]" />
        <h1 className="text-2xl font-bold text-trust-700 mt-4">{stage==='phone'?(mode==='signup'?'Create your account':'Welcome back'):'Verify your number'}</h1>
        <p className="text-trust-400 text-center mt-2">{stage==='phone'?'All you need is a phone number — no CV or documents required.':`We sent a 4-digit code to ${phone}`}</p>
      </div>
      <div className="bg-white rounded-3xl border border-trust-100/70 shadow-card p-6">
        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm p-3">{error}</div>}
        {stage==='phone' ? <>
          <div className="flex bg-cloud-100 rounded-full p-1 mb-6">
            <button onClick={()=>setMode('signup')} className={`flex-1 py-2 rounded-full text-sm font-semibold ${mode==='signup'?'bg-white text-trust-700 shadow-card':'text-trust-400'}`}>Sign up</button>
            <button onClick={()=>setMode('signin')} className={`flex-1 py-2 rounded-full text-sm font-semibold ${mode==='signin'?'bg-white text-trust-700 shadow-card':'text-trust-400'}`}>Sign in</button>
          </div>
          <form onSubmit={requestCode} className="flex flex-col gap-4">
            {mode==='signup' && <label className="block"><span className="text-sm font-medium text-trust-600">Full name</span><input value={name} onChange={e=>setName(e.target.value)} type="text" required placeholder="e.g. Thandiwe Nkosi" className="mt-1.5 w-full rounded-xl border border-cloud-300 px-4 py-3"/></label>}
            <label className="block"><span className="text-sm font-medium text-trust-600">Phone number</span><div className="mt-1.5 flex items-center rounded-xl border border-cloud-300 px-4"><Phone size={18} className="text-trust-300"/><input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="071 234 5678" className="w-full py-3 px-3 outline-none"/></div></label>
            <Button type="submit" size="lg" full>{loading?'Sending…':'Send verification code'}</Button>
          </form>
          <p className="text-center text-xs text-trust-300 mt-6 leading-relaxed">For this Railway build, SMS is simulated. The demo verification code is <strong>1234</strong>.</p>
        </> : <>
          <form onSubmit={verifyCode} className="flex flex-col gap-4">
            <label className="block"><span className="text-sm font-medium text-trust-600">Verification code</span><div className="mt-1.5 flex items-center rounded-xl border border-cloud-300 px-4"><ShieldCheck size={18} className="text-trust-300"/><input autoFocus type="text" inputMode="numeric" required value={code} onChange={e=>setCode(e.target.value)} placeholder="1234" maxLength={4} className="w-full py-3 px-3 outline-none tracking-[0.5em] font-semibold"/></div></label>
            {demoCode && <p className="text-xs text-trust-400">Demo code: <strong>{demoCode}</strong></p>}
            <Button type="submit" size="lg" full>{loading?'Signing in…':'Verify and continue'}</Button>
            <button type="button" onClick={()=>setStage('phone')} className="text-trust-400 text-sm font-medium mx-auto">Use a different number</button>
          </form>
        </>}
      </div>
    </div>
  </div>
}