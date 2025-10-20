import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"
import imgUG from "../../public/escudohorizontalUGjpg.jpg"
import imgCoffeeAndy from "../../public/coffeeAndyLogo.jpg"

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

      // Redirigir alperfil
      navigate("/profile")
    } catch (error) {
      setMensaje(error.response?.data?.message || "Error al iniciar sesión.")
    }
  }

  // Navegacion al registro
  const handleNavigateToRegister = () => {
    navigate("/register")
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
        {/* Logos */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10">
          <img
            src={imgUG || "/placeholder.svg"}
            alt="Universidad de Guanajuato"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
          <img
            src={imgCoffeeAndy || "/placeholder.svg"}
            alt="Coffee Andy"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Bienvenid@</h1>
          <p className="text-sm sm:text-base text-gray-600">Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
              Correo
            </label>
            <input
              id="email"
              type="email"
              placeholder="Introduce tu correo..."
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors duration-200 text-sm sm:text-base mt-6"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Error message */}
        {mensaje && <p className="mt-4 text-sm sm:text-base text-red-600 text-center">{mensaje}</p>}

        {/* Register section */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-4">¿No tienes cuenta aún?</p>
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            Registrate
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
