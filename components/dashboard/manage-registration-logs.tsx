"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPesertaData } from "@/app/actions/dashboard"
import { useEffect, useState } from "react"
import { UserPlan } from "@prisma/client"

interface User {
  id: string
  name: string | null
  email: string
  plan: UserPlan
  alamat: string | null
  telepon: string | null
  ukuranBaju: string | null
  ukuranSepatu: string | null
  tiket: any[]
  optionalItems: any[]
  bus: any | null
  status: any[]
  tipeAlat: string | null
  createdAt: Date
}

export function ManageRegistrationLogs() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getPesertaData()
        if (response.success && response.data) {
          // Sort users by creation date, newest first
          const sortedUsers = [...response.data].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setUsers(sortedUsers as User[])
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Memuat data...</div>
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tanggal Registrasi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
