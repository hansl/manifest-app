import { TextInput, TrashIcon } from '@/components';
import { MdContacts } from 'react-icons/md';
import React from 'react';

export interface AddressInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const AddressInput: React.FC<AddressInputProps> = ({ value, onChange, ...props }) => {
  return (
    <TextInput
      label={index === 0 ? 'Author name or address' : ''}
      onChange={handleChange}
      rightElement={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveAuthorIndex(index);
              setIsContactsOpen(true);
            }}
            className="btn btn-primary btn-sm text-white"
          >
            <MdContacts className="w-5 h-5" />
          </button>
          {values.authors.length > 1 && index !== 0 && (
            <button
              type="button"
              onClick={() => arrayHelpers.remove(index)}
              className="btn btn-error btn-sm text-white"
              data-testid={`remove-author-btn-${index}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      }
      {...props}
    />
  );
};
