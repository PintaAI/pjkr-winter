"use client"

import { DEFAULT_REDIRECT_URL } from "@/routes"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthFormProps {
  mode?: "login" | "register"
}

export const AuthForm = ({ mode = "login" }: AuthFormProps) => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (values: any, mode: "login" | "register") => {
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
    <Tabs defaultValue={mode} className="w-full max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login Panitia</CardTitle>
            <CardDescription>
              Masuk ke dashboard panitia PJKR Winter Event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const values = Object.fromEntries(formData)
              onSubmit(values, "login")
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <Input
                  id="password-login"
                  name="password"
                  type="password"
                  disabled={isPending}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Register Panitia</CardTitle>
            <CardDescription>
              Daftar sebagai panitia PJKR Winter Event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const values = Object.fromEntries(formData)
              onSubmit(values, "register")
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  disabled={isPending}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <Input
                  id="password-register"
                  name="password"
                  type="password"
                  disabled={isPending}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </Tabs>
  )
}
