"use client"

import { LoginSchema, RegisterSchema } from "@/schemas"
import { DEFAULT_REDIRECT_URL } from "@/routes"
import { useState } from "react"
import { signIn } from "next-auth/react"

interface AuthFormProps {
  mode: "login" | "register"
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (values: any) => {
    setError(undefined)
    setSuccess(undefined)
    setIsPending(true)

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess("Akun berhasil dibuat!")
          // Auto login setelah register
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          })

          if (result?.error) {
            setError(result.error)
          } else {
            window.location.href = DEFAULT_REDIRECT_URL
          }
        } else {
          setError(data.error || "Terjadi kesalahan saat registrasi")
        }
      } else {
        // Handle login
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          window.location.href = DEFAULT_REDIRECT_URL
        }
      }
    } catch (error) {
      setError("Terjadi kesalahan")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const values = Object.fromEntries(formData)
        onSubmit(values)
      }}>
        <div className="grid gap-4">
          {mode === "register" && (
            <div className="grid gap-2">
              <label htmlFor="name">Nama</label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full p-2 border rounded"
                disabled={isPending}
                required
              />
            </div>
          )}
          <div className="grid gap-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nama@example.com"
              className="w-full p-2 border rounded"
              disabled={isPending}
              required
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full p-2 border rounded"
              disabled={isPending}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded text-white ${
              isPending ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isPending}
          >
            {isPending ? "Memproses..." : mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </form>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
    </div>
  )
}
