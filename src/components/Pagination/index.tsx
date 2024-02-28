import React from 'react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (params: number)=>void;
    className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) => {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map((number: number) => {
        if (number === 1 || number === totalPages || (number >= currentPage - 2 && number <= currentPage + 2)) {
            return (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 mx-1 ${currentPage === number ? 'bg-brand-400 text-white' : ''} rounded-md`}
                >
                    {number}
                </button>
            );
        }

        if (number === currentPage - 3 || number === currentPage + 3) {
            return <span key={number}>...</span>;
        }
    });

    return (
        <div className={`${className} flex justify-center items-center text-white`}>
            {renderPageNumbers}
        </div>
    );
};

export default Pagination;
