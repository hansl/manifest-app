import { SearchIcon } from '@/components';
import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceHolder?: string;
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;

  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  children,
  searchPlaceHolder,
}) => {
  if (
    (searchTerm === undefined && onSearchChange !== undefined) ||
    (searchTerm !== undefined && onSearchChange === undefined)
  ) {
    throw new Error('Either both or none of searchTerm and onSearchChange must be provided');
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        <h1
          className="text-secondary-content"
          style={{ fontSize: '20px', fontWeight: 700, lineHeight: '24px' }}
        >
          {title}
        </h1>

        {
          /* Search Input */ searchTerm !== undefined && (
            <div className="relative w-full sm:w-[224px]">
              <input
                type="text"
                placeholder={searchPlaceHolder ?? ''}
                className="input input-bordered w-full h-[40px] rounded-[12px] border-none bg-secondary text-secondary-content pl-10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                value={searchTerm}
                onChange={e => onSearchChange?.(e.target.value)}
              />
              <SearchIcon className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          )
        }
      </div>
    </div>
  );
};
