// 扣子 Web SDK 类型定义
declare global {
  interface Window {
    CozeWebSDK: {
      version?: string;
      WebChatClient: new (config: CozeWebSDKConfig) => CozeWebSDKClient;
    };
  }
}

export interface CozeWebSDKConfig {
  config: {
    type?: 'bot' | 'app';
    bot_id?: string;
    isIframe?: boolean;
    appInfo?: {
      appId: string;
      workflowId: string;
    };
  };
  componentProps?: {
    title?: string;
  };
  auth: {
    type: 'unauth' | 'token';
    token?: string;
    onRefreshToken?: () => Promise<string> | string;
  };
  userInfo?: {
    id: string;
    url?: string;
    nickname?: string;
  };
  ui?: {
    base: {
      icon?: string;
      layout: 'pc' | 'mobile';
      lang: 'en' | 'zh-CN';
      zIndex?: number;
    };
    header: {
      isShow: boolean;
      isNeedClose: boolean;  
    };
    asstBtn: {
      isNeed: boolean;
    };
    footer: {
      isShow: boolean;
      expressionText?: string;
    };
    chatBot: {
      title: string;
      uploadable: boolean;
      width: number;
      el?: HTMLElement;
    };
  };
}

export interface CozeWebSDKClient {
  open?: () => void;
  close?: () => void;
  destroy?: () => void;
  sendMessage?: (message: string) => void;
  // 新版本SDK可能不支持这些方法
  // on?: (event: string, callback: (data: any) => void) => void;
  // off?: (event: string, callback: (data: any) => void) => void;
}

export {};
