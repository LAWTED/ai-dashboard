import { create } from 'zustand';

interface SocialJournalStore {
  // 主 drawer 状态
  isOpen: boolean;
  openJournal: () => void;
  closeJournal: () => void;
  setOpen: (open: boolean) => void;

  // 信件详情 drawer 状态
  letterDetailOpen: boolean;
  selectedLetterId: string | null;
  openLetterDetail: (letterId: string) => void;
  closeLetterDetail: () => void;
  setLetterDetailOpen: (open: boolean) => void;

  // 发信 drawer 状态
  sendLetterOpen: boolean;
  openSendLetter: () => void;
  closeSendLetter: () => void;
  setSendLetterOpen: (open: boolean) => void;

  // 登录 drawer 状态
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  setLoginOpen: (open: boolean) => void;

  // 登出 drawer 状态
  logoutOpen: boolean;
  openLogout: () => void;
  closeLogout: () => void;
  setLogoutOpen: (open: boolean) => void;
}

export const useSocialJournalStore = create<SocialJournalStore>((set) => ({
  // 主 drawer
  isOpen: false,
  openJournal: () => set({ isOpen: true }),
  closeJournal: () => set({ isOpen: false }),
  setOpen: (open: boolean) => set({ isOpen: open }),

  // 信件详情 drawer
  letterDetailOpen: false,
  selectedLetterId: null,
  openLetterDetail: (letterId: string) => set({
    letterDetailOpen: true,
    selectedLetterId: letterId
  }),
  closeLetterDetail: () => set({
    letterDetailOpen: false,
    selectedLetterId: null
  }),
  setLetterDetailOpen: (open: boolean) => set({
    letterDetailOpen: open,
    selectedLetterId: open ? undefined : null
  }),

  // 发信 drawer
  sendLetterOpen: false,
  openSendLetter: () => set({ sendLetterOpen: true }),
  closeSendLetter: () => set({ sendLetterOpen: false }),
  setSendLetterOpen: (open: boolean) => set({ sendLetterOpen: open }),

  // 登录 drawer
  loginOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  setLoginOpen: (open: boolean) => set({ loginOpen: open }),

  // 登出 drawer
  logoutOpen: false,
  openLogout: () => set({ logoutOpen: true }),
  closeLogout: () => set({ logoutOpen: false }),
  setLogoutOpen: (open: boolean) => set({ logoutOpen: open }),
}));