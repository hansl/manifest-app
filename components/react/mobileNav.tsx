import { useTheme } from '@/contexts/theme';
import Image from 'next/image';
import Link from 'next/link';
import { TailwindModal } from './modal';

import {
  GroupsIcon,
  BankIcon,
  FactoryIcon,
  AdminsIcon,
  LightIcon,
  DarkIcon,
  ArrowRightIcon,
} from '@/components/icons';
import { WalletSection } from '../wallet';
import { RiMenuUnfoldFill } from 'react-icons/ri';
import { useState } from 'react';
import { MdContacts } from 'react-icons/md';
import env from '@/config/env';
import { useChain } from '@cosmos-kit/react';
import { usePoaGetAdmin } from '@/hooks';
import { useGroupsByAdmin } from '@/hooks';

export default function MobileNav() {
  const { address } = useChain(env.chain);

  const { poaAdmin } = usePoaGetAdmin();

  const { groupByAdmin } = useGroupsByAdmin(
    poaAdmin ?? 'manifest1afk9zr2hn2jsac63h4hm60vl9z3e5u69gndzf7c99cqge3vzwjzsfmy9qj'
  );

  const group = groupByAdmin?.groups?.[0];

  const isMember = group?.members?.some(member => member?.member?.address === address);

  const closeDrawer = () => {
    const drawer = document.getElementById('my-drawer') as HTMLInputElement;
    if (drawer) drawer.checked = false;
  };

  const NavItem: React.FC<{ Icon: React.ElementType; href: string }> = ({ Icon, href }) => {
    return (
      <li>
        <Link href={href} legacyBehavior>
          <div
            onClick={closeDrawer}
            className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary"
          >
            <Icon className="w-8 h-8" />
            <span className="text-2xl">{href.slice(1, 12)}</span>
          </div>
        </Link>
      </li>
    );
  };

  const { toggleTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(theme === 'dark');
  const [isContactsOpen, setContactsOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 p-3 bg-base-300 flex lg:hidden flex-row justify-between items-center">
        <Image src="/logo.svg" height={38} width={38} alt="manifest" />
        <label htmlFor="my-drawer" className="btn btn-sm btn-primary drawer-button">
          <RiMenuUnfoldFill fontSize={'24px'} />
        </label>
      </div>
      <div className="drawer z-50 lg:hidden">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-side min-h-screen h-full ">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-[#F4F4FF] dark:bg-[#1D192D] space-y-3 text-base-content flex flex-col">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4 justify-between items-center">
                <Image src={'/logo.svg'} alt="logo" width={42} height={42} />
                <div className="flex flex-col">
                  <p className="text-2xl leading-tight text-balance">Alberto</p>
                  {env.chainTier === 'mainnet' ? null : (
                    <p className="text-md uppercase">{env.chainTier}</p>
                  )}
                </div>
              </div>

              {/* Updated Theme Toggle */}
              <label className="swap swap-rotate text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out">
                <input
                  type="checkbox"
                  className="theme-controller hidden"
                  value="light"
                  checked={isDark}
                  onChange={() => {
                    setIsDark(!isDark);
                    toggleTheme();
                  }}
                />
                <DarkIcon className="swap-on fill-current w-9 h-9 duration-300" />
                <LightIcon className="swap-off fill-current w-9 h-9 duration-300" />
              </label>
            </div>
            <div className="divider divider-horizon"></div>
            <NavItem Icon={BankIcon} href="/bank" />
            <NavItem Icon={GroupsIcon} href="/groups" />
            {isMember && <NavItem Icon={AdminsIcon} href="/admins" />}
            <NavItem Icon={FactoryIcon} href="/factory" />

            <div className="divider divider-horizon"></div>

            {/* Added Contacts button */}
            <li className="mb-4">
              <button
                onClick={() => {
                  setContactsOpen(true);
                }}
                className="flex flex-row justify-start items-center transition-all duration-300 ease-in-out text-primary"
              >
                <MdContacts className="w-8 h-8" />
                <span className="text-2xl">Contacts</span>
              </button>
            </li>

            <div className="justify-between items-center">
              <WalletSection chainName={env.chain} />
            </div>

            {/* Updated close button - now uses flex-1 and mt-auto to push to bottom */}
            <div className="flex justify-start mt-auto">
              <button onClick={closeDrawer} className="btn btn-sm btn-outline btn-primary">
                <ArrowRightIcon fontSize={'24px'} />
              </button>
            </div>
          </ul>
        </div>
      </div>
      <TailwindModal
        isOpen={isContactsOpen}
        setOpen={setContactsOpen}
        showContacts={true}
        onSelect={undefined}
      />
    </>
  );
}
