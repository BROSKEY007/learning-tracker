'use client';
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';
import { gsap } from 'gsap';
const ConfirmationContext = createContext(null);
export function useConfirm() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error('ConfirmationProvider is missing');
  return confirm;
}
export default function ConfirmationProvider({ children }) {
  const [request, setRequest] = useState(null);
  const pending = useRef(null);
  const dialog = useRef(null);
  const cancelButton = useRef(null);
  const animation = useRef(null);
  const closing = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const confirm = useCallback(options => new Promise(resolve => {
    pending.current?.(false);
    pending.current = resolve;
    setRequest(options);
  }), []);
  const finish = useCallback(accepted => {
    if (closing.current || !pending.current) return;
    closing.current = true;
    const element = dialog.current;
    animation.current?.kill();
    const complete = () => {
      element?.close();
      pending.current?.(accepted);
      pending.current = null;
      setRequest(null);
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
    if (!element || reduced) { complete(); return; }
    element.dataset.closing = 'true';
    animation.current = gsap.to(element, { opacity: 0, y: 12, scale: 0.96, filter: 'blur(3px)', duration: document.documentElement.dataset.motion === 'fast' ? 0.1 : 0.18, ease: 'power2.in', onComplete: complete });
  }, []);
  useEffect(() => {
    if (!request) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closing.current = false;
    element.showModal();
    cancelButton.current?.focus();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
    if (!reduced) animation.current = gsap.fromTo(element, { opacity: 0.35, y: 18, scale: 0.95, filter: 'blur(4px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: document.documentElement.dataset.motion === 'fast' ? 0.16 : 0.3, ease: 'power3.out', clearProps: 'opacity,transform,filter' });
    return () => { animation.current?.kill(); element.close(); document.body.style.overflow = previousOverflow; };
  }, [request]);
  useEffect(() => () => { pending.current?.(false); pending.current = null; }, []);
  return <ConfirmationContext.Provider value={confirm}>{children}
    {request && <dialog ref={dialog} className="confirmation-card" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { event.preventDefault(); finish(false); }} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) finish(false); } }}>
      <button type="button" className="confirmation-close" aria-label="Close confirmation" onClick={() => finish(false)}><Icon name="close" size={18}/></button>
      <span className="confirmation-symbol"><Icon name="trash" size={24}/></span>
      <h2 id={titleId}>{request.title || 'Delete this journal?'}</h2>
      <p id={descriptionId}>{request.description}</p>
      {request.subject && <div className="confirmation-subject"><Icon name="note" size={18}/><span>{request.subject}</span></div>}
      <div className="confirmation-actions"><button ref={cancelButton} type="button" className="confirmation-cancel" onClick={() => finish(false)}>Keep it</button><button type="button" className="confirmation-delete" onClick={() => finish(true)}><Icon name="trash" size={16}/>{request.confirmLabel || 'Delete journal'}</button></div>
    </dialog>}
  </ConfirmationContext.Provider>;
}
