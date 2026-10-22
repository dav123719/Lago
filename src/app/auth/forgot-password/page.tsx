import { Suspense } from 'react'
import ForgotPasswordForm from './ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-lago-black" />}><ForgotPasswordForm /></Suspense>
}
