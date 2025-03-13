import { useState } from 'react';
import { MdContacts } from 'react-icons/md';

import { ContactsModal } from '@/components';

export interface ContactButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: boolean;
  editMode?: boolean;
  tooltip?: string;
  onContactSelect?: (value: string) => void;
  iconClassName?: string;
  address?: string;
}

export const ContactButton = ({
  label,
  editMode = false,
  tooltip,
  onContactSelect,
  iconClassName,
  address,
  ...buttonProps
}: ContactButtonProps) => {
  const [open, setOpen] = useState(false);
  const { className, ...props } = buttonProps;

  return (
    <button
      {...props}
      onClick={() => setOpen(true)}
      className={`${tooltip ? 'tooltip tooltip-primary tooltip-top' : ''} flex items-center p-2 text-base font-normal rounded-lg cursor-pointer ${className}`}
      data-tip={tooltip}
    >
      <MdContacts className={iconClassName ? iconClassName : 'w-8 h-8'} />
      {label && <span className="ml-6 text-xl">Contacts</span>}

      {open && (
        <ContactsModal
          open={open}
          onClose={() => setOpen(false)}
          onSelect={onContactSelect}
          selectionMode={!editMode}
          address={address}
        />
      )}
    </button>
  );
};
