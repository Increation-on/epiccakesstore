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
    return (
        <div className="flex justify-center gap-2 mt-8">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
            >
                Назад
            </Button>
            
            <span className="px-4 py-2">
                {currentPage} из {totalPages}
            </span>
            
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
            >
                Вперёд
            </Button>
        </div>
    );
}