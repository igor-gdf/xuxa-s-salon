"use client";

import { useState } from 'react';
import TextInput from '../../../components/ui/TextInput';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import SocialButton from '../../../components/ui/SocialButton';

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const steps = ['Dados', 'Senha', 'Confirmação'];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function canNext() {
    if (step === 0) return form.name.trim() !== '' && form.email.trim() !== '';
    if (step === 1) return form.password.length >= 6 && form.password === form.confirmPassword;
    return step < steps.length - 1;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    // Placeholder: aqui você chamaria a API para criar usuário
    console.log('submit', form);
    // Reset ou redirecionar
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-6 px-4 shadow-2xl shadow-purple-900/10 sm:rounded-xl sm:px-10 border border-slate-800">
          <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
            <img src="/logo.png" alt="Logotipo" className="w-32 h-32 drop-shadow-md" />
          </div>

          {/* Step indicator */}
          <div className="mt-4 mb-6 flex items-center justify-center gap-3">
            {steps.map((s, i) => (
              <div key={s} className={`text-sm px-3 py-1 rounded-full ${i === step ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="min-h-[144px] sm:min-h-[144px] max-h-[260px] overflow-y-auto space-y-3">
              {step === 0 && (
                <>
                  <TextInput id="name" name="name" label="Nome completo" value={form.name} onChange={(e) => update('name', e.target.value)} required />
                  <TextInput id="email" name="email" type="email" label="Endereço de email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                </>
              )}

              {step === 1 && (
                <>
                  <TextInput id="password" name="password" type="password" label="Senha (mín. 6 caracteres)" value={form.password} onChange={(e) => update('password', e.target.value)} required />
                  <TextInput id="confirm-password" name="confirm-password" type="password" label="Confirme a senha" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-sm text-slate-300">Revise seus dados antes de confirmar:</div>
                  <div className="mt-2 text-slate-200">
                    <div><strong>Nome:</strong> {form.name}</div>
                    <div><strong>Email:</strong> {form.email}</div>
                  </div>
                  <div className="pt-3">
                    <Checkbox id="terms" name="terms" label="Aceito os termos e políticas" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} className="w-1/2">
                Voltar
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="w-1/2" disabled={!canNext()}>
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={!form.terms} className="w-1/2">
                  Criar conta
                </Button>
              )}
            </div>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Ou crie com</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <SocialButton href="#">Google</SocialButton>
              </div>
              <div>
                <SocialButton href="#">GitHub</SocialButton>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Já tem uma conta?{' '}
            <a href="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}