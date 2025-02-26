import { Contacts, TextInput } from '@/components';
import React from 'react';
import { MdContacts } from 'react-icons/md';
import { BaseInputProps } from '@/components/react/inputs/BaseInput';
import { Dialog } from '@headlessui/react';
import { useChain } from '@cosmos-kit/react';
import env from '../../../config/env';

export interface AddressInputProps extends BaseInputProps {
  rightElement?: React.ReactNode;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value: initialValue,
  onChange,
  rightElement,
  ...props
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [showContacts, setShowContacts] = React.useState(false);
  const { address } = useChain(env.chain);

  return (
    <>
      <TextInput
        onChange={onChange}
        value={value}
        rightElement={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowContacts(true)}
              className="btn btn-primary btn-sm text-white"
            >
              <MdContacts className="w-5 h-5" />
            </button>
            {rightElement}
          </div>
        }
        {...props}
      />

      {showContacts && (
        <Dialog
          className="modal modal-open top-0 right-0 "
          onClose={() => setShowContacts(false)}
          open={showContacts}
        >
          <div></div>
          <Contacts
            onClose={() => setShowContacts(false)}
            currentAddress={address ?? ''}
            onSelect={address => setValue(address)}
            selectionMode
          />
        </Dialog>
      )}
    </>
  );
};
