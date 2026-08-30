'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 selection:bg-[#F7941D] selection:text-black">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#F7941D] hover:bg-[#FFB25A] text-black font-bold shadow-lg shadow-[#F7941D]/20',
            card: 'bg-[#161616] border border-[#2E2E2E] shadow-2xl rounded-2xl p-6',
            headerTitle: 'text-white font-extrabold text-2xl',
            headerSubtitle: 'text-slate-400 text-xs',
            socialButtonsBlockButton: 'bg-white hover:bg-slate-100 text-slate-900 font-bold border-0 shadow-md',
            socialButtonsBlockButtonText: 'text-slate-900 font-bold',
            footerActionLink: 'text-[#F7941D] hover:underline font-bold',
            formFieldLabel: 'text-slate-300 font-medium text-xs',
            formFieldInput: 'bg-[#0A0A0A] border-[#2E2E2E] text-white focus:border-[#F7941D] text-xs',
            dividerLine: 'bg-[#2E2E2E]',
            dividerText: 'text-slate-500 text-xs uppercase font-semibold',
            identityPreviewText: 'text-slate-200 font-medium',
            identityPreviewEditButtonIcon: 'text-[#F7941D]',
          },
        }}
        routing="path"
        path="/sign-in"
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
