import { HistoryBox, IfWalletConnected } from '@/components';
import { TokenList } from '@/components/bank/components/tokenList';
import {
  useGetMessagesFromAddress,
  useTokenBalances,
  useTokenBalancesResolved,
  useTokenFactoryDenomsMetadata,
} from '@/hooks';
import { useChain } from '@cosmos-kit/react';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { BankIcon } from '@/components/icons';
import { CombinedBalanceInfo } from '@/utils/types';
import { MFX_TOKEN_DATA } from '@/utils/constants';
import env from '@/config/env';
import { SEO } from '@/components';
import { useResponsivePageSize } from '@/hooks/useResponsivePageSize';
import { denomToAsset } from '@/utils';
import { Tab } from '@headlessui/react';
import { PageHeader } from '@/components/layouts/pageHeader';

interface PageSizeConfig {
  tokenList: number;
  history: number;
  skeleton: number;
}

export default function Bank() {
  const { address } = useChain(env.chain);

  const { balances, isBalancesLoading, refetchBalances } = useTokenBalances(address ?? '');
  const {
    balances: resolvedBalances,
    isBalancesLoading: resolvedLoading,
    refetchBalances: resolveRefetch,
  } = useTokenBalancesResolved(address ?? '');

  const { metadatas, isMetadatasLoading } = useTokenFactoryDenomsMetadata();
  const [currentPage, setCurrentPage] = useState(1);

  const sizeLookup: Array<{ height: number; width: number; sizes: PageSizeConfig }> = [
    {
      height: 700,
      width: Infinity,
      sizes: { tokenList: 5, history: 4, skeleton: 5 },
    },
    {
      height: 800,
      width: Infinity,
      sizes: { tokenList: 6, history: 6, skeleton: 7 },
    },
    {
      height: 1000,
      width: 800,
      sizes: { tokenList: 7, history: 7, skeleton: 7 },
    },
    {
      height: 1000,
      width: Infinity,
      sizes: { tokenList: 8, history: 8, skeleton: 8 },
    },
    {
      height: 1300,
      width: Infinity,
      sizes: { tokenList: 9, history: 9, skeleton: 9 },
    },
  ];

  const defaultSizes = { tokenList: 10, history: 10, skeleton: 10 };

  const pageSize = useResponsivePageSize(sizeLookup, defaultSizes);

  const skeletonGroupCount = 1;
  const skeletonTxCount = pageSize.skeleton;
  const tokenListPageSize = pageSize.tokenList;
  const historyPageSize = pageSize.history;

  const {
    sendTxs,
    totalPages,
    isLoading: txLoading,
    isError,
    refetch: refetchHistory,
    totalCount,
  } = useGetMessagesFromAddress(env.indexerUrl, address ?? '', currentPage, historyPageSize);

  const combinedBalances = useMemo(() => {
    if (!balances || !resolvedBalances || !metadatas) return [];

    // Find 'umfx' balance (mfx token)
    const mfxCoreBalance = balances.find(b => b.denom === 'umfx');
    const mfxResolvedBalance = resolvedBalances.find(rb => rb.denom === 'mfx');

    // Create combined balance for 'mfx'
    const mfxCombinedBalance: CombinedBalanceInfo | null = mfxCoreBalance
      ? {
          denom: mfxResolvedBalance?.denom || 'mfx',
          coreDenom: 'umfx',
          amount: mfxCoreBalance.amount,
          metadata: MFX_TOKEN_DATA,
        }
      : null;

    // Process other balances
    const otherBalances = balances
      .filter(coreBalance => coreBalance.denom !== 'umfx')
      .map((coreBalance): CombinedBalanceInfo => {
        const resolvedBalance = resolvedBalances.find(
          rb => rb.denom === coreBalance.denom || rb.denom === coreBalance.denom.split('/').pop()
        );
        const metadata = metadatas.metadatas.find(m => m.base === coreBalance.denom);

        if (coreBalance.denom.startsWith('ibc/')) {
          const assetInfo = denomToAsset(env.chain, coreBalance.denom);

          const baseDenom = assetInfo?.traces?.[1]?.counterparty?.base_denom;

          return {
            denom: baseDenom ?? '', // normalized denom (e.g., 'umfx')
            coreDenom: coreBalance.denom, // full IBC trace
            amount: coreBalance.amount,
            metadata: {
              description: assetInfo?.description ?? '',
              denom_units:
                assetInfo?.denom_units?.map(unit => ({
                  ...unit,
                  aliases: unit.aliases || [],
                })) ?? [],
              base: assetInfo?.base ?? '',
              display: assetInfo?.display ?? '',
              name: assetInfo?.name ?? '',
              symbol: assetInfo?.symbol ?? '',
              uri: assetInfo?.logo_URIs?.svg ?? assetInfo?.logo_URIs?.png ?? '',
              uri_hash: assetInfo?.logo_URIs?.svg ?? assetInfo?.logo_URIs?.png ?? '',
            },
          };
        }

        return {
          denom: resolvedBalance?.denom || coreBalance.denom,
          coreDenom: coreBalance.denom,
          amount: coreBalance.amount,
          metadata: metadata || null,
        };
      });

    // Combine 'mfx' with other balances
    return mfxCombinedBalance ? [mfxCombinedBalance, ...otherBalances] : otherBalances;
  }, [balances, resolvedBalances, metadatas]);

  const isLoading = isBalancesLoading || resolvedLoading || isMetadatasLoading;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen relative px-2 lg:py-0 py-4 mx-auto text-white">
      <SEO title="Bank - Alberto" />

      <div className="flex-grow h-full animate-fadeIn transition-all duration-300">
        <div className="w-full mx-auto">
          <IfWalletConnected description="start interacting with your tokens" icon={BankIcon}>
            <div className="relative w-full h-full overflow-hidden scrollbar-hide p-1">
              <div className="h-full flex flex-col">
                <PageHeader
                  title="Bank"
                  searchPlaceHolder="Search for an asset..."
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                <Tab.Group>
                  <Tab.List className="tabs tabs-bordered tabs-md md:tabs-lg mb-5 flex flex-row">
                    <Tab
                      aria-controls="assets-panel"
                      className={`font-bold tab ui-selected:tab-active`}
                    >
                      Assets
                    </Tab>
                    <Tab
                      aria-controls="history-panel"
                      className={`font-bold tab ui-selected:tab-active`}
                    >
                      Activity
                    </Tab>
                  </Tab.List>

                  <Tab.Panels>
                    <Tab.Panel>
                      {combinedBalances.length === 0 && !isLoading ? (
                        <NoAssetsFound />
                      ) : (
                        <TokenList
                          refetchBalances={refetchBalances || resolveRefetch}
                          isLoading={isLoading}
                          balances={combinedBalances}
                          refetchHistory={refetchHistory}
                          address={address ?? ''}
                          pageSize={tokenListPageSize}
                          searchTerm={searchTerm}
                        />
                      )}
                    </Tab.Panel>
                    <Tab.Panel>
                      {totalPages === 0 ? (
                        <NoActivityFound />
                      ) : (
                        <HistoryBox
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          address={address ?? ''}
                          isLoading={isLoading}
                          sendTxs={sendTxs}
                          totalPages={totalPages}
                          txLoading={txLoading}
                          isError={isError}
                          refetch={refetchHistory}
                          skeletonGroupCount={skeletonGroupCount}
                          skeletonTxCount={skeletonTxCount}
                        />
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </IfWalletConnected>
        </div>
      </div>
    </div>
  );
}

function NoAssetsFound() {
  return (
    <section className="transition-opacity duration-300 h-auto mt-12 ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            No Assets Found
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            You do not have any assets yet.
          </p>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <BankIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}

function NoActivityFound() {
  return (
    <section className="transition-opacity duration-300 h-auto mt-12 ease-in-out animate-fadeIn w-full flex items-center justify-center">
      <div className="grid max-w-4xl bg-base-300 p-12 rounded-md w-full mx-auto gap-8 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-2xl font-extrabold tracking-tight leading-none md:text-3xl xl:text-4xl dark:text-white text-black">
            No Activity Found
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
            You do not have any activity yet. Submit a transaction and revisit this page to view
            your history!
          </p>
        </div>
        <div className="hidden lg:mt-0 lg:ml-24 lg:col-span-5 lg:flex">
          <BankIcon className="h-60 w-60 text-primary" />
        </div>
      </div>
    </section>
  );
}
