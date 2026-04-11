'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

export default function DataTable({
    columns,
    data,
    searchable = true,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data available',
    onRowClick = null
}) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Filter data based on search
    const filteredData = data.filter(row => {
        if (!search) return true;
        return columns.some(col => {
            const value = col.accessor ? row[col.accessor] : '';
            return String(value).toLowerCase().includes(search.toLowerCase());
        });
    });

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortColumn) return 0;

        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === bVal) return 0;

        const comparison = aVal > bVal ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const handleSort = (accessor) => {
        if (sortColumn === accessor) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(accessor);
            setSortDirection('asc');
        }
    };

    return (
        <div className={d.tableWrapper}>
            {searchable && (
                <div className={`p-4 ${d.tableHead}`}>
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${d.searchIcon}`} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={d.searchInput}
                        />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={d.tableHead}>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    onClick={() => column.sortable && column.accessor && handleSort(column.accessor)}
                                    className={`${d.tableHeadCell} ${column.sortable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && column.accessor && (
                                            <div className="flex flex-col opacity-50">
                                                <ChevronUp className={`w-3 h-3 ${sortColumn === column.accessor && sortDirection === 'asc' ? 'opacity-100' : ''}`} />
                                                <ChevronDown className={`w-3 h-3 -mt-1 ${sortColumn === column.accessor && sortDirection === 'desc' ? 'opacity-100' : ''}`} />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className={`px-6 py-12 text-center ${d.subheading}`}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`${d.tableRow} ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className={d.tableCell}>
                                            {column.render
                                                ? column.render(row)
                                                : column.accessor
                                                    ? row[column.accessor]
                                                    : '—'
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {sortedData.length > 0 && (
                <div className={d.tableFooter}>
                    Showing {sortedData.length} of {data.length} results
                </div>
            )}
        </div>
    );
}
