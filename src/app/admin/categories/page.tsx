'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/domain/categoery.types'
import { Button } from '@/components/ui/Button'
import CategoryEditForm from './_components/CategoryEditForm'

export default function AdminCategoriesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    const loadCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories')
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            console.error('Error loading categories:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [])

    // Защита
    useEffect(() => {
        if (status === 'loading') return
        if (!session || session.user.role !== 'admin') {
            router.push('/')
        }
    }, [session, status, router])

    const handleDelete = async (category: any) => {
        if (category.productCount > 0) {
            alert(`Нельзя удалить категорию "${category.name}", в которой ${category.productCount} товаров. Сначала переместите их в другую категорию.`)
            return
        }

        if (!confirm(`Точно удалить категорию "${category.name}"?`)) return

        try {
            const res = await fetch(`/api/admin/categories/${String(category.id)}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setCategories(categories.filter(c => c.id !== category.id))
            } else {
                const error = await res.json()
                alert(error.error || 'Ошибка при удалении')
            }
        } catch (error) {
            console.error('Error deleting:', error)
            alert('Ошибка при удалении категории')
        }
    }

    if (status === 'loading' || loading) {
        return <div className="p-4 md:p-6">Загрузка...</div>
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Управление категориями</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="whitespace-nowrap"
                >
                    {showForm ? 'Отмена' : '+ Добавить категорию'}
                </Button>
            </div>

            {/* Форма добавления */}
            {showForm && (
                <div className="bg-white p-4 md:p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Новая категория</h2>
                    <CategoryEditForm
                        onSuccess={() => {
                            setShowForm(false)
                            loadCategories()
                        }}
                        onCancel={() => setShowForm(false)}
                        isEditing={false}
                    />
                </div>
            )}

            {/* Таблица — только на десктопе */}
            <div className="hidden md:block bg-white rounded shadow overflow-x-auto">
                <div className="min-w-125">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Название
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Товаров
                                </th>
                                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categories.map((category: any) => (
                                <tr key={category.id}>
                                    <td className="px-4 md:px-6 py-4 font-medium text-sm md:text-base">
                                        {category.name}
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded ${category.productCount > 0
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {category.productCount}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => router.push(`/admin/categories/${String(category.id)}`)}
                                            className="text-blue-600 hover:text-blue-800 mr-3 text-lg md:text-base"
                                            aria-label="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <span
                                            title={category.productCount > 0 ? 'Нельзя удалить категорию в которой есть товары' : 'Удалить категорию'}
                                            className={category.productCount > 0 ? 'cursor-default' : ''}
                                        >
                                            <button
                                                onClick={category.productCount === 0 ? () => handleDelete(category) : undefined}
                                                className={`text-lg md:text-base ${category.productCount > 0
                                                        ? 'text-gray-400 cursor-not-allowed pointer-events-none opacity-50'
                                                        : 'text-red-600 hover:text-red-800 cursor-pointer'
                                                    }`}
                                                disabled={category.productCount > 0}
                                                aria-label="Удалить"
                                            >
                                                🗑️
                                            </button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Карточки — только на мобилке */}
            <div className="md:hidden space-y-3">
                {categories.map((category: any) => (
                    <div key={category.id} className="bg-white rounded shadow p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 text-base">
                                {category.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded ${category.productCount > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {category.productCount} товаров
                            </span>
                        </div>
                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => router.push(`/admin/categories/${String(category.id)}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                                ✏️ Редактировать
                            </button>
                            <button
                                onClick={() => handleDelete(category)}
                                className={`${category.productCount > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-800'
                                    } text-sm flex items-center gap-1`}
                                disabled={category.productCount > 0}
                                title={category.productCount > 0 ? 'Нельзя удалить категорию с товарами' : 'Удалить категорию'}

                            >
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}