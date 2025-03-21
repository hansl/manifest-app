import { MsgCreateGroupWithPolicy } from '@liftedinit/manifestjs/dist/codegen/cosmos/group/v1/tx';
import { format } from 'react-string-format';

import { getGroupTitle } from '@/components/bank/handlers/group/metadata';
import { registerHandler } from '@/components/bank/handlers/handlerRegistry';
import { GroupsIcon } from '@/components/icons/GroupsIcon';

import { createSenderReceiverHandler } from '../createSenderReceiverHandler';

const createMessage = (template: string, metadata: any) => {
  const title = getGroupTitle(metadata);
  const named = title ? `named: ${title}` : 'with an unknown name';
  const message = format(template, named);
  return <span className={'flex flex-wrap gap-1'}>{message}</span>;
};

export const MsgCreateGroupWithPolicyHandler = createSenderReceiverHandler({
  iconSender: GroupsIcon,
  successSender: tx => createMessage('You created a new group {0}', tx.metadata?.groupMetadata),
  failSender: tx =>
    createMessage('You failed to create a new group {0}', tx.metadata?.groupMetadata),
  successReceiver: tx =>
    createMessage('You were mentioned in a new group {0}', tx.metadata?.groupMetadata),
});

registerHandler(MsgCreateGroupWithPolicy.typeUrl, MsgCreateGroupWithPolicyHandler);
