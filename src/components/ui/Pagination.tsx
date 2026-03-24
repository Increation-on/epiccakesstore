// src/components/ui/Pagination.tsx
'use client';

import { Button } from './Button';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: PaginationProps) {
    // Генерируем массив страниц для отображения
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 7) {
            // Если страниц мало — показываем все
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Если страниц много — показываем с ... 
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
                variant="outline"
                className="text-(--text) hover:bg-(--mint)"
            >
                ← Назад
            </Button>
            
            <div className="flex items-center gap-1 mx-2">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="px-2 text-(--text-muted)">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`w-9 h-9 rounded-lg transition ${
                                currentPage === page
                                    ? 'bg-(--pink) text-white'
                                    : 'text-(--text) hover:bg-(--mint)'
                            }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
                variant="outline"
                className="text-(--text) hover:bg-(--mint)"
            >
                Вперёд →
            </Button>
        </div>
    );
}