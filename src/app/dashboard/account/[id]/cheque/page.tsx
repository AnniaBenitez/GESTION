"use client"

import obtenerBancos from '@/lib/banco/obtenerBancos'
import obtenerChequesFiltros from '@/lib/cheque/obtenerChequesFiltros'
import { ChequeDetails } from '@/lib/definitions'
import { ArrowDownLeftIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid'
import { type Cheque, estadoCheque, Banco } from '@prisma/client'
import Link from 'next/link'
import React, { useEffect } from 'react'

export default function Cheque({ params }: { params: { id: string } }) {

  const { id } = params

  const [cheques, setCheques] = React.useState<ChequeDetails[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [bancos, setBancos] = React.useState<Banco[]>([])

  const [filtro, setFiltro] = React.useState<{
    upTo: number,
    skip: number,
    cuentaId: string,
    fechaDesde?: string,
    fechaHasta?: string,
    bancoChequeId?: string
    estado?: estadoCheque
  }>({
    upTo: 4,
    skip: 0,
    cuentaId: id,
  }
  )

  const obtenerChequesEffect = async () => {
    const response = await obtenerChequesFiltros(filtro)

    const bancosRes = await obtenerBancos()

    if (typeof (response) === 'string' || response === undefined) {
      setError(response || "Error al obtener los cheques")
      setLoading(false)
      return
    }

    if (typeof (bancosRes) === 'string' || bancosRes === undefined) {
      setError(bancosRes || "Error al obtener los bancos para el filtro")
      setLoading(false)
      return
    }

    setCheques(response.data)
    setBancos(bancosRes.data)
    setLoading(false)
  }

  useEffect(() => {

    obtenerChequesEffect()

  }, [filtro])

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltro({
      ...filtro,
      [name]: value === "" ? undefined : value
    })
  }

  if (loading) return <h1>Loading...</h1>

  if (error) return <h1>{error}</h1>

  return (
    <div className="flex flex-col h-full -mt-8">
      <header className="flex gap-3 justify-between items-center flex-wrap px-8 py-4 w-full rounded-md bg-primary-800 text-white">
        <h1 className="text-2xl font-bold">Cheques</h1>

        <nav className="flex flex-wrap items-center gap-6">

          <div className="flex items-center gap-3">
            <h3 className="mr-2">Bancos</h3>
            <select
              className="bg-gray-800 text-white py-1 px-2 rounded-md"
              name='bancoChequeId'
              onChange={handleOnChange}
            >
              <option value={""}>Todos</option>
              {
                bancos.map((banco, index) => <option key={index} value={banco.id}>{banco.nombre}</option>)
              }
            </select>
          </div>

          <div className="flex items-center gap-3">
            <h3 className="mr-2">Estado</h3>
            <select
              className="bg-gray-800 text-white py-1 px-2 rounded-md"
              name='estado'
              onChange={handleOnChange}
            >
              <option value={""}>Todos</option>
              {
                Object.values(estadoCheque).map((estadoCheque, index) => <option key={index} value={estadoCheque}>{estadoCheque}</option>)
              }
            </select>
          </div>

        </nav>
        <Link className='bg-gray-800 hover:bg-gray-900 text-white  py-2 px-4 rounded' href="/dashboard/account">Atras</Link>
      </header>

      <h2 className="text-xl font-bold my-4">Lista de Cheques</h2>

      <div className="flex-grow bg-gray-800 rounded-md p-5 flex flex-row">
        {
          cheques.length != 0 ? (
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Operacion</span></th>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Fecha</span></th>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Banco</span></th>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Estado</span></th>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Monto</span></th>
                  <th><span className='text-md mt-1 text-primary-400 font-normal'>Accion</span></th>
                </tr>
              </thead>
              <tbody>
                {
                  cheques.map((cheque) => (
                    <tr key={cheque.id}>
                      <td className="py-2">
                        <div className="w-7 h-7 ml-5">
                          {!cheque.esRecibido ? (
                            <ArrowUpRightIcon className="text-red-500" />
                          ) : (
                            <ArrowDownLeftIcon className="text-green-500" />
                          )}
                        </div>
                      </td>
                      <td>{cheque.fechaEmision.toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}</td>
                      <td>{cheque.bancoChequeId}</td>
                      <td>{cheque.estado === estadoCheque.PAGADO ? <span className='bg-green-500 p-1 rounded'>{estadoCheque.PAGADO}</span> : <span className='bg-red-500 p-1 rounded'>{estadoCheque.EMITIDO}</span>}</td>
                      <td>{Number(cheque.monto).toLocaleString()}</td>
                      <td>acciones</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) :
            <h1 className='text-red-500 text-2xl'>No hay cheques en la cuenta</h1>
        }
      </div>

    </div>
  )
}