export default function OrderDetailsSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Заголовок */}
            <div className="mb-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
            </div>

            {/* Сетка */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Левая колонка - товары */}
                <div className="md:col-span-2 space-y-6">
                    <div className="border border-(--border) rounded-lg p-4">
                        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 pb-4 border-b border-(--border) last:border-0">
                                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
                                    </div>
                                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded"></div>
                </div>

                {/* Правая колонка - информация */}
                <div className="space-y-4">
                    <div className="border border-(--border) rounded-lg p-4">
                        <div className="h-5 w-16 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="border border-(--border) rounded-lg p-4">
                        <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-40 bg-gray-200 rounded"></div>
                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                    <div className="border border-(--border) rounded-lg p-4">
                        <div className="h-5 w-16 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="border border-(--border) rounded-lg p-4 bg-(--bg)">
                        <div className="flex justify-between">
                            <div className="h-5 w-16 bg-gray-200 rounded"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}