export interface User {
  email: string
  name: string
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  const userStr = localStorage.getItem("tdt-user")
  return userStr !== null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("tdt-user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return false
    }

    const user = await response.json()
    localStorage.setItem("tdt-user", JSON.stringify(user))
    localStorage.setItem("tdt-auth", "true")
    return true
  } catch (error) {
    console.error("Login error:", error)
    return false
  }
}

export const register = async (
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { success: false, error: data.error || "Registration failed" }
    }

    const user = await response.json()
    localStorage.setItem("tdt-user", JSON.stringify(user))
    localStorage.setItem("tdt-auth", "true")
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred. Please try again." }
  }
}

export const logout = () => {
  localStorage.removeItem("tdt-auth")
  localStorage.removeItem("tdt-user")
}
