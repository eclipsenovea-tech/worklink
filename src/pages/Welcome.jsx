import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Button from '../components/Button.jsx'

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel (desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-trust-100/80 via-trust-50 to-growth-100/70 border-r border-trust-200/70 flex-col justify-between gap-10 p-12 lg:p-14">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md text-center">
            {/* Logo sits just above the words, centred over them */}
            <Logo size={400} className="-mb-[60px]" />
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-trust-700">
              Everyday work, same-day pay.
            </h1>
            <p className="text-trust-600 mt-4 max-w-sm mx-auto text-lg">
              WorkLink connects Cape Town's township communities to nearby paid
              work — no CV, no fees, no waiting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto text-center">
          <div className="bg-white shadow-card rounded-xl2 p-4">
            <p className="font-display text-2xl font-bold text-trust-700">R0</p>
            <p className="text-trust-400 text-sm mt-1">to join</p>
          </div>
          <div className="bg-white shadow-card rounded-xl2 p-4">
            <p className="font-display text-2xl font-bold text-trust-700">Same day</p>
            <p className="text-trust-400 text-sm mt-1">payment</p>
          </div>
          <div className="bg-white shadow-card rounded-xl2 p-4">
            <p className="font-display text-2xl font-bold text-trust-700">7+</p>
            <p className="text-trust-400 text-sm mt-1">job categories</p>
          </div>
        </div>
      </div>

            {/* Right panel / mobile screen */}
      <div className="flex-1 flex flex-col justify-between px-6 py-10 md:justify-center md:px-16 lg:px-24">
        <div className="flex-1 flex flex-col items-center justify-center md:hidden">
          <Logo size={300} />
        </div>

        <div className="md:max-w-sm w-full mx-auto">
          <div className="hidden md:block mb-8 text-center">
            <h2 className="text-3xl font-bold">Get started</h2>
            <p className="text-trust-500 mt-2">Post a task or find work near you today.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button as={Link} to="/onboarding" state={{ intent: 'find' }} variant="primary" size="lg" full>
              Find Work
            </Button>
            <Button as={Link} to="/onboarding" state={{ intent: 'post' }} variant="secondary" size="lg" full>
              Post a Task
            </Button>
          </div>

          <p className="text-center text-trust-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/auth" className="font-semibold text-trust-700 underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}