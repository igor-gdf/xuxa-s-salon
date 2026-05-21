import TextInput from '../../../components/ui/TextInput';
import Checkbox from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import SocialButton from '../../../components/ui/SocialButton';

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-6 px-4 shadow-2xl shadow-purple-900/10 sm:rounded-xl sm:px-10 border border-slate-800">
          <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
            <img src="/logo.png" alt="Logotipo" className="w-32 h-32 drop-shadow-md" />
          </div>

          <form className="min-h-[270px] sm:min-h-[270px] overflow-y-auto space-y-4" action="#" method="POST">
            <TextInput id="email" name="email" type="email" label="Endereço de email" required />
            <TextInput id="password" name="password" type="password" label="Senha" required />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <Checkbox id="remember-me" name="remember-me" label="Lembrar de mim" />
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit">Entrar</Button>
            </div>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Ou continue com</span>
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
            Ainda não tem conta?{' '}
            <a href="/register" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}