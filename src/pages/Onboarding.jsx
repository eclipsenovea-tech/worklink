import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Search, Handshake, Wallet } from 'lucide-react'
import Button from '../components/Button.jsx'
import { Mark } from '../components/Logo.jsx'

const slides = [
  {
    icon: Search,
    title: 'Browse tasks near you',
    body: 'See jobs posted by people in your area — cleaning, gardening, deliveries, and more. No experience document needed.',
    accent: 'bg-white shadow-card text-trust-700'
  },
  {
    icon: Handshake,
    title: 'Claim it, do the work',
    body: 'Pick a task that suits you, agree the pay upfront, and get it done. Build skill badges as you complete more jobs.',
    accent: 'bg-white shadow-card text-teal-500'
  },
  {
    icon: Wallet,
    title: 'Get paid the same day',
    body: 'Payment lands straight in your WorkLink wallet once the job is confirmed complete. No waiting for payday.',
    accent: 'bg-white shadow-card text-growth-600'
  }
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const intent = location.state?.intent ?? 'find'

  const isLast = step === slides.length - 1
  const slide = slides[step]
  const Icon = slide.icon

  function next() {
    if (isLast) {
      navigate('/auth', { state: { intent } })
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-6 md:px-16 lg:px-24">
        <Mark size={100} />
        {!isLast && (
          <button
            onClick={() => navigate('/auth', { state: { intent } })}
            className="text-trust-400 font-medium text-sm hover:text-trust-600"
          >
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 lg:px-24">
        <div className="w-full max-w-sm md:max-w-md text-center">
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-8 ${slide.accent}`}>
            <Icon size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-trust-700">{slide.title}</h1>
          <p className="text-trust-400 mt-3 leading-relaxed">{slide.body}</p>
        </div>
      </div>

      <div className="px-6 pb-10 md:px-16 lg:px-24 md:pb-16">
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-6 bg-trust-700' : 'w-1.5 bg-cloud-300'
              }`}
            />
          ))}
        </div>
        <div className="max-w-sm mx-auto md:max-w-md">
          <Button onClick={next} size="lg" full>
            {isLast ? 'Create your account' : 'Next'}
          </Button>
          {isLast && (
            <p className="text-center text-trust-400 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/auth" state={{ intent }} className="font-semibold text-trust-700">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
