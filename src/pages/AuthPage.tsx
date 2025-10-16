import { useNavigate, Link } from 'react-router-dom'
import logo from '../../public/logos/nwu_acronym.png'

function AuthPage() {
  const navigate = useNavigate()

  function goTo(role: 'student' | 'guest' | 'staff') {
    navigate(`/auth/sign-in?role=${role}`)
  }
  return (
    <div className="flex justify-center items-center h-svh bg-[#6c3d91]">

        <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="logo" className="w-60 h-16" />
            <p className="text-white text-2xl font-[400] uppercase">It all starts here</p>
            {/* SELECTION CONTAINER */}
            <div className="flex flex-col gap-4 bg-[#ffffff] w-[400px] rounded-md p-4">
                <h3 className="text-2xl font-semibold text-center">Sign in as</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => goTo('student')} className="px-4 py-2 rounded-md bg-[#794c9c] text-white">Student</button>
                    <button onClick={() => goTo('guest')} className="px-4 py-2 rounded-md bg-[#794c9c] text-white">Guest</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => goTo('staff')} className="px-4 py-2 rounded-md bg-[#794c9c] text-white">Staff</button>
                </div>
                {/* Forgot password */}
                <p className="text-sm text-center">Forgot password? <span className="text-blue-500">Reset</span></p>
                <p className="text-sm text-center">Don't have an account? <Link to="/auth/register" className="text-blue-500">Register</Link></p>
            </div>
        </div>

    </div>
  )
}

export default AuthPage