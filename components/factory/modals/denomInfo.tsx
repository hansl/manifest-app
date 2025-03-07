import { Dialog } from '@headlessui/react';
import { MetadataSDKType } from '@liftedinit/manifestjs/dist/codegen/cosmos/bank/v1beta1/bank';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { TruncatedAddressWithCopy } from '@/components/react/addressCopy';
import env from '@/config/env';

export const DenomInfoModal: React.FC<{
  openDenomInfoModal: boolean;
  setOpenDenomInfoModal: (open: boolean) => void;
  denom: MetadataSDKType | null;
  modalId: string;
}> = ({ openDenomInfoModal, setOpenDenomInfoModal, denom, modalId }) => {
  let nameIsAddress = false;
  if (denom?.name?.startsWith('factory/manifest1')) {
    nameIsAddress = true;
  }

  const handleClose = () => {
    setOpenDenomInfoModal(false);
  };

  return (
    <Dialog
      open={openDenomInfoModal}
      onClose={handleClose}
      className={`modal modal-open fixed flex p-0 m-0`}
      style={{
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="fixed inset-0 bg-black/30 " aria-hidden="true" />

      <Dialog.Panel className="modal-box max-w-4xl mx-auto rounded-[24px] bg-[#F4F4FF] dark:bg-[#1D192D] shadow-lg">
        <form method="dialog" onSubmit={handleClose}>
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-[#00000099] dark:text-[#FFFFFF99] hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF1A]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </form>
        <h3 className="text-xl font-semibold text-[#161616] dark:text-white mb-6">Denom Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="Name"
            value={denom?.name ?? 'No name available'}
            explorerUrl={env.explorerUrl}
            isAddress={nameIsAddress}
          />
          <InfoItem
            label="Ticker"
            value={denom?.display?.toUpperCase() ?? 'No ticker available'}
            explorerUrl={env.explorerUrl}
          />
          <InfoItem
            label="Description"
            value={denom?.description ?? 'No description available'}
            explorerUrl={env.explorerUrl}
            className="col-span-2 row-span-2"
          />
        </div>
        <h4 className="text-lg font-semibold text-[#161616] dark:text-white mt-6  mb-4">
          Additional Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            label="BASE"
            value={
              denom?.base
                ? (() => {
                    try {
                      return decodeURIComponent(denom?.base);
                    } catch (e) {
                      console.error('Failed to decode BASE value:', e);
                      return denom.base;
                    }
                  })()
                : ''
            }
            explorerUrl={env.explorerUrl}
            isAddress={true}
          />
          <InfoItem
            label="DISPLAY"
            value={denom?.display ?? 'No display available'}
            explorerUrl={env.explorerUrl}
          />
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

function InfoItem({
  label,
  value,
  explorerUrl,
  isAddress = false,
  className = '',
}: {
  label: string;
  value: string;
  explorerUrl: string;
  isAddress?: boolean;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-col ${className}`}>
      <p className="text-sm font-semibold text-[#00000099] dark:text-[#FFFFFF99] mb-2">{label}</p>
      <div className="dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-[16px] p-4 grow h-full">
        {isAddress ? (
          <div className="flex items-center">
            <TruncatedAddressWithCopy address={value} slice={17} />
          </div>
        ) : (
          <p className="text-[#161616] dark:text-white" title={value}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
