import { useChain } from '@cosmos-kit/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  AdminsIcon,
  BankIcon,
  DarkIcon,
  FactoryIcon,
  GroupsIcon,
  LightIcon,
  QuestionIcon,
} from '@/components/icons';
import { ContactButton } from '@/components/react/ContactButton';
import env from '@/config/env';
import { useTheme } from '@/contexts';
import { useGroupsByAdmin } from '@/hooks';
import { usePoaGetAdmin } from '@/hooks';
import { POA_ADMIN_GROUP_ADDR, getRealLogo } from '@/utils';

import packageInfo from '../../package.json';
import { IconWallet, WalletSection } from '../wallet';

interface SideNavProps {
  isDrawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
}

interface NavItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  tooltip: string;
  label: string;
  active?: boolean;
  iconOnly?: boolean;
}

const NavItem = ({ icon: Icon, href, active, tooltip, label, iconOnly }: NavItemProps) => {
  return (
    <li
      className="w-full mb-5 group tooltip tooltip-primary tooltip-bottom hover:after:delay-1000 hover:before:delay-1000"
      data-tip={tooltip}
    >
      {iconOnly ? (
        <Link
          href={href}
          className={`group active:scale-95 hover:ring-2 hover:ring-primary flex justify-center p-3 items-center rounded-lg transition-all duration-300 ease-in-out w-18
        flex items-center p-2 text-base font-normal rounded-lg transition duration-300 ease-in-out
            ${active ? 'text-white bg-primary' : 'text-[#00000066] dark:text-[#FFFFFF66]  hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary dark:hover:bg-base-300 text-gray-500 hover:text-primary'}`}
        >
          <Icon className="w-8 h-8 duration-300" />
        </Link>
      ) : (
        <Link
          href={href}
          className={`flex items-center p-2 text-base font-normal rounded-lg transition duration-300 ease-in-out ${
            active
              ? 'bg-primary text-white'
              : 'text-[#00000066] dark:text-[#FFFFFF66]  hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary dark:hover:bg-base-300'
          }`}
        >
          <Icon className="w-8 h-8 mr-6" />
          <span className="text-xl">{label}</span>
        </Link>
      )}
    </li>
  );
};

const NavMfxLogo = ({ size, className }: { size: number; className?: string }) => {
  return (
    <Link href={'/#'} className={className}>
      <Image src="/logo.svg" alt="Logo" className="aspect-1" height={size} width={size} priority />
    </Link>
  );
};

const NavList = ({
  isMember,
  iconOnly = false,
  className,
}: {
  isMember: boolean;
  iconOnly?: boolean;
  className?: string;
}) => {
  const { pathname } = useRouter();
  const links = [
    [BankIcon, '/bank', 'Bank', 'Manage your assets'],
    [GroupsIcon, '/groups', 'Groups', 'Create and manage groups'],
    ...(isMember ? [[AdminsIcon, '/admins', 'Admin', 'Manage the network']] : []),
    [FactoryIcon, '/factory', 'Token Factory', 'Create and manage tokens'],
  ] as Array<[React.ComponentType<React.SVGProps<SVGSVGElement>>, string, string, string]>;

  return (
    <ul className={className}>
      {links.map(([Icon, href, label, tooltip]) => (
        <NavItem
          key={href}
          icon={Icon}
          href={href}
          active={pathname === href}
          tooltip={tooltip}
          label={label}
          iconOnly={iconOnly}
        />
      ))}
    </ul>
  );
};

const CollapsedDrawer = ({ isMember }: { isMember: boolean }) => {
  const { toggleTheme, theme } = useTheme();

  return (
    <div className="overflow-y-auto z-30 py-5 px-3 w-32 bg-[#FFFFFF3D] dark:bg-[#FFFFFF0F] flex flex-col items-center h-full">
      <NavMfxLogo size={64} className="mb-12" />

      <NavList isMember={isMember} iconOnly className="flex flex-col items-center grow mt-8" />
      <div className="mt-auto flex flex-col items-center space-y-6 dark:bg-[#FFFFFF0F] bg-[#0000000A] rounded-lg p-4 w-[75%]">
        <ContactButton
          editMode
          tooltip="Contacts"
          className="text-[#00000066] dark:text-[#FFFFFF66] hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary transition duration-300 ease-in-out "
        />
        <div
          className="tooltip tooltip-top tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
          data-tip="Wallet"
        >
          <div className="flex justify-center w-full text-[#00000066] dark:text-[#FFFFFF66]">
            <IconWallet chainName={env.chain} />
          </div>
        </div>
        <label className="swap swap-rotate text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out">
          <input
            type="checkbox"
            className="theme-controller hidden"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => toggleTheme()}
          />
          <DarkIcon className="swap-on fill-current w-9 h-9 duration-300" />
          <LightIcon className="swap-off fill-current w-9 h-9 duration-300" />
        </label>
        <div
          className="tooltip tooltip-top tooltip-primary hover:after:delay-1000 hover:before:delay-1000"
          data-tip="Help Guide"
        >
          <div className="flex justify-center w-full text-[#00000066] dark:text-[#FFFFFF66]">
            <Link href="https://docs.manifestai.org/" target="_blank">
              <QuestionIcon
                className={`w-8 h-8 rounded-xl text-[#00000066] dark:text-[#FFFFFF66] hover:text-primary dark:hover:text-primary transition-all duration-300 ease-in-out`}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SideNav({ isDrawerVisible, setDrawerVisible }: SideNavProps) {
  const { toggleTheme, theme } = useTheme();
  const { address } = useChain(env.chain);

  const { poaAdmin } = usePoaGetAdmin();
  const { groupByAdmin } = useGroupsByAdmin(poaAdmin ?? POA_ADMIN_GROUP_ADDR);

  const group = groupByAdmin?.groups?.[0];

  const isMember = group?.members?.some(member => member?.member?.address === address);

  const toggleDrawer = () => setDrawerVisible(!isDrawerVisible);
  const version = packageInfo.version;

  const SideDrawer: React.FC = () => (
    <div className="overflow-y-auto flex flex-col h-full bg-[#F4F4FF] dark:bg-[#1D192D]  w-64 p-4">
      <div className="flex flex-row gap-2 justify-start ml-2 mt-2 items-center mb-12 space-x-2">
        <NavMfxLogo size={48} />

        <div className="flex flex-col">
          <p className="text-4xl font-bold">Alberto</p>
          {env.chainTier === 'mainnet' ? null : (
            <p className="text-md uppercase">{env.chainTier}</p>
          )}
        </div>
      </div>

      <NavList isMember={isMember} className="grow mt-8 p-1" />

      <div className="mt-auto w-full">
        <div className="mb-4">
          <ContactButton
            className="w-full text-[#00000066] dark:text-[#FFFFFF66] hover:bg-[#0000000A] hover:text-primary dark:hover:text-primary dark:hover:bg-base-300 transition duration-300 ease-in-out"
            label
            editMode
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          {/* Theme toggle */}
          <div className="relative w-full h-[3.6rem] bg-[#0000000A] dark:bg-[#FFFFFF0F] rounded-xl">
            <label className="flex items-center justify-between w-full h-full cursor-pointer">
              <input
                type="checkbox"
                className="theme-controller hidden"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => toggleTheme()}
              />
              <div className="flex items-center justify-center w-1/2 h-full z-10">
                <LightIcon
                  className={`w-8 h-8 ${theme === 'light' ? 'text-white' : 'text-gray-500'} transition-colors duration-300`}
                />
              </div>
              <div className="flex items-center justify-center w-1/2 h-full z-10">
                <DarkIcon
                  className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-500'} transition-colors duration-300`}
                />
              </div>
              <span
                className={`absolute left-1 w-[calc(50%-0.5rem)] h-12 bg-primary rounded-xl transition-all duration-300 ease-in-out transform ${
                  theme === 'dark' ? 'translate-x-[calc(100%+0.5rem)]' : ''
                }`}
              />
            </label>
          </div>
        </div>

        <ul className="pt-5 pb-4">
          <div className="mx-auto w-full justify-center items-center h-full">
            <WalletSection chainName={env.chain} />
          </div>
        </ul>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row justify-between items-center gap-3">
            <Link href="https://github.com/liftedinit/manifest-app" target="_blank">
              <p className="text-sm text-gray-500">v{version}</p>
            </Link>
            <Link
              href="https://docs.manifestai.org/"
              target="_blank"
              className="tooltip tooltip-primary tooltip-top hover:after:delay-1000 hover:before:delay-1000"
              data-tip="Help Guide"
            >
              <QuestionIcon
                className={`w-4 h-4 rounded-xl text-black dark:text-white transition-colors duration-300`}
              />
            </Link>
          </div>
          <div className="flex flex-row justify-between items-center gap-3">
            <Link
              href="https://discord.gg/manifestai"
              target="_blank"
              className="tooltip tooltip-primary tooltip-top hover:after:delay-1000 hover:before:delay-1000"
              data-tip="Discord"
            >
              <Image
                src={getRealLogo('/discord', theme === 'dark')}
                alt={'Manifest Discord'}
                width={12}
                height={12}
                className="w-4 h-4 rounded-xl"
              />
            </Link>
            <Link
              href="https://x.com/ManifestAIs"
              target="_blank"
              className="tooltip tooltip-primary tooltip-top hover:after:delay-1000 hover:before:delay-1000"
              data-tip="X"
            >
              <Image
                src={getRealLogo('/x', theme === 'dark')}
                alt={'Twitter'}
                width={12}
                height={12}
                className="w-4 h-4 rounded-xl"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        id="sidebar-double"
        className="fixed top-0 left-0 h-full z-30 hidden lg:flex transition-all duration-300 ease-in-out"
        aria-label="Sidebar"
      >
        <CollapsedDrawer isMember={isMember} />
      </aside>
      <aside
        id="sidebar-double"
        className={`hidden lg:flex z-40 fixed top-0 left-0 h-full transform ${
          isDrawerVisible ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-500 ease-in-out`}
        aria-label="Sidebar"
      >
        <SideDrawer />
      </aside>

      <button
        onClick={toggleDrawer}
        className={`fixed top-1/2 transform -translate-y-1/2 z-50 hidden lg:block opacity-100 p-2 text-white rounded-full bg-[#C1C1CB] dark:bg-[#444151] hover:bg-primary dark:hover:bg-primary transition-all duration-500 ease-in-out ${
          isDrawerVisible ? 'left-60' : 'left-[6.8rem]'
        }`}
      >
        <svg
          className={`w-5 h-5 transition-all duration-300 ${isDrawerVisible ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
    </>
  );
}
