// 🛡️ 全局防止 DOM 节点或 React 内部 Fiber 循环引用导致 JSON.stringify 崩溃
const _originalStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any) {
  const seen = new WeakSet();
  const safeReplacer = (key: string, val: any) => {
    if (val !== null && typeof val === 'object') {
      if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
        return `[DOMElement <${val.tagName ? val.tagName.toLowerCase() : 'element'}>]`;
      }
      if (typeof Node !== 'undefined' && val instanceof Node) {
        return '[DOMNode]';
      }
      if (seen.has(val)) {
        return '[Circular]';
      }
      seen.add(val);
    }
    if (typeof replacer === 'function') {
      return replacer(key, val);
    }
    return val;
  };
  try {
    return _originalStringify(value, safeReplacer, space);
  } catch {
    try {
      return _originalStringify(String(value));
    } catch {
      return '""';
    }
  }
};

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
