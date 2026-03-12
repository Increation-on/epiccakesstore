// app/admin/categories/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/domain/categoery.types'

export default function AdminCategoriesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newCategory, setNewCategory] = useState({ name: '', slug: '' })
    const [creating, setCreating] = useState(false)

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

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            })

            if (res.ok) {
                setNewCategory({ name: '', slug: '' })
                setShowForm(false)
                loadCategories()
            } else {
                const error = await res.json()
                alert(error.error || 'Ошибка при создании')
            }
        } catch (error) {
            console.error('Error creating:', error)
            alert('Ошибка при создании категории')
        } finally {
            setCreating(false)
        }
    }

    const handleDelete = async (category: any) => {

        if (category.productCount > 0) {
            alert(`Нельзя удалить категорию "${category.name}", в которой ${category.productCount} товаров. Сначала переместите их в другую категорию.`)
            return
        }

        if (!confirm(`Точно удалить категорию "${category.name}"?`)) return

        const categoryId = String(category.id)

        try {
            const res = await fetch(`/api/admin/categories/${categoryId}`, {
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
        return <div className="p-6">Загрузка...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Управление категориями</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                >
                    {showForm ? 'Отмена' : '+ Добавить категорию'}
                </button>
            </div>

            {/* Форма добавления */}
            {showForm && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Новая категория</h2>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Название <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                placeholder="Например: Торты"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Slug</label>
                            <input
                                type="text"
                                value={newCategory.slug}
                                onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                                placeholder="torty"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Если не указан, создастся из названия
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={creating}
                                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
                            >
                                {creating ? 'Создание...' : 'Создать'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setNewCategory({ name: '', slug: '' })
                                }}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Таблица категорий */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Название
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Товаров
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Действия
                            </th>
                        </tr>
                    </thead>

                    {/* В теле таблицы добавляем ячейку с количеством */}
                    <tbody className="divide-y divide-gray-200">
                        {categories.map((category: any) => (  // пока any, потом добавим тип
                            <tr key={category.id}>
                                <td className="px-6 py-4 font-medium">{category.name}</td>
                                <td className="px-6 py-4 text-gray-600">{category.slug}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded ${category.productCount > 0
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {category.productCount}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => router.push(`/admin/categories/${String(category.id)}`)}
                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category)}
                                        className={`${category.productCount > 0
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-red-600 hover:text-red-800'
                                            }`}
                                        disabled={category.productCount > 0}
                                        title={category.productCount > 0 ? 'Нельзя удалить категорию с товарами' : 'Удалить категорию'}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}