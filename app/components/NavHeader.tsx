"use client"

import Link from "next/link"
import { logout } from "@/lib/simpleAuth"
import { useRouter } from "next/navigation"

export default function NavHeader() {
  const router = useRouter()

  const handleLogout = () => {
  logout()
  router.replace("/")
}

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #eee",
        marginBottom: 32,
      }}
    >
      <nav style={{ display: "flex", gap: 16 }}>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>

      <button onClick={handleLogout}>Logout</button>
    </header>
  )
}
