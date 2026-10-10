import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

export type EntryAction = 'create' | 'join';

export interface EntryHandoff {
  action: EntryAction | null;
  inviteCode?: string;
}

const ACTION_PARAM = 'action';
const CODE_PARAM = 'code';

export const getPathWithParams = ({ action, inviteCode }: EntryHandoff): string => {
  if (!action) return '/chatrooms';

  const params = new URLSearchParams({ [ACTION_PARAM]: action });
  if (inviteCode) {
    params.set(CODE_PARAM, inviteCode);
  }

  return `/chatrooms?${params.toString()}`;
};

export const useEntryHandoff = (): EntryHandoff => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [handoff, setHandoff] = useState<EntryHandoff>(() => {
    const action = searchParams.get(ACTION_PARAM);

    return {
      action: action === 'create' || action === 'join' ? action : null,
      inviteCode: searchParams.get(CODE_PARAM) ?? undefined,
    };
  });

  useEffect(() => {
    if (!handoff.action) return;

    setHandoff((current) => ({ ...current, inviteCode: undefined }));
    const rest = new URLSearchParams(searchParams);
    rest.delete(ACTION_PARAM);
    rest.delete(CODE_PARAM);
    setSearchParams(rest, { replace: true });
  }, [handoff.action]);

  return handoff;
};
