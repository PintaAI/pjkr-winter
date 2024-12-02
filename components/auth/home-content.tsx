"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { LogoutButton } from "@/components/auth/logout-button"

export const HomeContent = () => {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <Image
            className="dark:invert mb-6"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-600 text-center">
            {session ? "Anda sudah login" : "Silakan pilih opsi di bawah ini"}
          </p>
        </div>

        <div className="space-y-4">
          {session ? (
            <div className="flex items-center justify-center">
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link 
                href="/auth/login"
                className="flex items-center justify-center w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </Link>
              
              <Link 
                href="/auth/register"
                className="flex items-center justify-center w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Register
              </Link>
            </>
          )}
          
          <Link 
            href="/dashboard"
            className="flex items-center justify-center w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Dibuat dengan Next.js dan NextAuth
          </p>
        </div>
      </div>
    </div>
  )
}
