import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets.js"

function Login() {
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [mensaje, setMensaje] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post("/auth/login", { correo, password })

      // Guardar el token en localStorage
      localStorage.setItem("token", response.data.token)

      // Aquí ya le puse que fuera al menú :p
      navigate("/menu")
    } catch (error) {
      setMensaje(error.response?.data?.message || "Error al iniciar sesión.")
    }
  }

  // Navegacion al registro
  const handleNavigateToRegister = () => {
    navigate("/register")
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${assets.fondo})` }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-[#F5C827] rounded-xl shadow-2xl w-full max-w-md p-8 sm:p-10 text-white">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img
              src={assets.escudo}
              alt="Universidad de Guanajuato"
              className="h-16 w-auto mr-4"
            />
            <img
              src={assets.logo_azul}
              alt="Coffee Andy"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-[#F5C827] mb-2">
            Inicio de sesión
          </h1>
          <p className="text-sm text-gray-200">
            Ingresa tus datos para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-[#F5C827]">
              Correo
            </label>
            <input
              id="email"
              type="email"
              placeholder="Introduce tu correo..."
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/20 border border-[#F5C827] placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-[#F5C827]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-[#F5C827]">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/20 border border-[#F5C827] placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-[#F5C827]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#F5C827] text-white font-semibold py-3 rounded-md hover:bg-[#755a2f] transition-colors duration-200"
          >
            Acceder
          </button>
        </form>

        {/* Mensaje de error */}
        {mensaje && (
          <p className="mt-4 text-sm text-red-400 text-center">{mensaje}</p>
        )}

        {/* Registro */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-200 mb-2">
            ¿No tienes cuenta aún?
          </p>
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="w-full bg-[#154C7D] hover:bg-[#0a2847] text-[#F5C827] font-semibold py-3 rounded-md transition-colors duration-100"
          >
            Regístrate
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login