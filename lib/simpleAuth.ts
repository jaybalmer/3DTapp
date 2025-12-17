export const isAuthenticated = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("tdt-auth") === "true"
}

export const login = (password: string) => {
  if (password === process.env.NEXT_PUBLIC_APP_ACCESS_PASSWORD) {
    localStorage.setItem("tdt-auth", "true")
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem("tdt-auth")
}
