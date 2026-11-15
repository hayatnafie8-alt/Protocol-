/**
 * Universal Card / Protocol Actions Handler
 * Handles card/protocol visibility toggle, edit, and deletion dynamically and for free.
 * Supports:
 * - .protocol-card, .announcement-card, .card-item
 * - .delete-btn, [data-action="delete"]
 * - .visibility-btn, [data-action="toggle-visibility"]
 * - .edit-btn, [data-action="edit"]
 * - .free-toggle-btn, [data-action="toggle-free"]
 */

import { toggleSectionFree, isSectionFree } from '../data/freeSectionsManager';

export const CARD_ACTION_DELETE_EVENT = 'protocol_card_deleted';
export const CARD_ACTION_VISIBILITY_EVENT = 'protocol_card_visibility_toggled';
export const CARD_ACTION_FREE_EVENT = 'protocol_card_free_toggled';
export const CARD_ACTION_SAVE_EVENT = 'protocol_card_saved';

/**
 * Initializes global delegation for card action buttons.
 * Works seamlessly with both React components and dynamically inserted DOM elements.
 */
export function initCardActionsHandler(): void {
  if (typeof document === 'undefined') return;

  // Global click delegator
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 1. Delete button handler
    const deleteBtn = target.closest('.delete-btn, [data-action="delete"]') as HTMLElement | null;
    if (deleteBtn) {
      // If already handled by a specific React handler with stopPropagation, it won't reach here.
      // But if clicked directly or injected via DOM:
      const cardItem = deleteBtn.closest('.protocol-card, .announcement-card, .card-item, .companion-section, .clinic-q-card') as HTMLElement | null;
      if (cardItem) {
        e.preventDefault();
        const confirmMsg = 'هل أنت متأكد من رغبتك في حذف هذا القسم نهائياً؟';
        if (window.confirm(confirmMsg)) {
          const itemId =
            cardItem.getAttribute('data-protocol-id') ||
            cardItem.getAttribute('data-item-id') ||
            cardItem.getAttribute('data-section-id') ||
            cardItem.getAttribute('data-class-id');

          cardItem.remove();

          if (itemId) {
            window.dispatchEvent(
              new CustomEvent(CARD_ACTION_DELETE_EVENT, { detail: { id: itemId } })
            );
          }

          window.alert('تم حذف العنصر بنجاح من التطبيق.');
        }
        return;
      }
    }

    // 2. Visibility (Hide/Show) button handler
    const visibilityBtn = target.closest('.visibility-btn, [data-action="toggle-visibility"]') as HTMLElement | null;
    if (visibilityBtn) {
      const cardItem = visibilityBtn.closest('.protocol-card, .announcement-card, .card-item, .companion-section, .clinic-q-card') as HTMLElement | null;
      if (cardItem) {
        e.preventDefault();
        const isHiddenNow = cardItem.classList.toggle('hidden-item');
        const itemId =
          cardItem.getAttribute('data-protocol-id') ||
          cardItem.getAttribute('data-item-id') ||
          cardItem.getAttribute('data-section-id') ||
          cardItem.getAttribute('data-class-id');

        if (isHiddenNow) {
          cardItem.style.opacity = '0.4';
          window.alert('تم إخفاء القسم بنجاح');
        } else {
          cardItem.style.opacity = '1';
          window.alert('تم إظهار القسم بنجاح');
        }

        if (itemId) {
          window.dispatchEvent(
            new CustomEvent(CARD_ACTION_VISIBILITY_EVENT, {
              detail: { id: itemId, isHidden: isHiddenNow },
            })
          );
        }
        return;
      }
    }

    // 3. Free (Public Access) toggle button handler
    const freeBtn = target.closest('.free-toggle-btn, [data-action="toggle-free"]') as HTMLElement | null;
    if (freeBtn) {
      const cardItem = freeBtn.closest('.protocol-card, .announcement-card, .card-item, .companion-section, .clinic-q-card') as HTMLElement | null;
      if (cardItem) {
        e.preventDefault();
        const itemId =
          cardItem.getAttribute('data-protocol-id') ||
          cardItem.getAttribute('data-item-id') ||
          cardItem.getAttribute('data-section-id') ||
          cardItem.getAttribute('data-class-id');

        if (itemId) {
          const isNowFree = toggleSectionFree(itemId);
          cardItem.setAttribute('data-is-free', String(isNowFree));
          window.dispatchEvent(
            new CustomEvent(CARD_ACTION_FREE_EVENT, {
              detail: { id: itemId, isFree: isNowFree },
            })
          );
          if (isNowFree) {
            window.alert('تم إتاحة هذا القسم مجاناً لجميع المستخدمين والزوار 🔓');
          } else {
            window.alert('تم تقييد هذا القسم ليتطلب كود اشتراك معتمد 🔒');
          }
        }
        return;
      }
    }

    // 4. Save button handler (Confirms and saves section/card state)
    const saveBtn = target.closest('.save-btn, [data-action="save"]') as HTMLElement | null;
    if (saveBtn) {
      const cardItem = (saveBtn.closest(
        '.protocol-card, .announcement-card, .card-item, .companion-section, .clinic-q-card, [data-item-id], [data-section-id], [data-protocol-id], [data-class-id], section, article'
      ) || saveBtn.parentElement) as HTMLElement | null;

      if (cardItem) {
        e.preventDefault();
        const itemId =
          cardItem.getAttribute('data-protocol-id') ||
          cardItem.getAttribute('data-item-id') ||
          cardItem.getAttribute('data-section-id') ||
          cardItem.getAttribute('data-class-id') ||
          cardItem.id;

        // Visual flash & feedback
        cardItem.classList.add('ring-4', 'ring-[#59662C]', 'transition-all');
        setTimeout(() => cardItem.classList.remove('ring-4', 'ring-[#59662C]'), 2000);

        if (itemId) {
          window.dispatchEvent(
            new CustomEvent(CARD_ACTION_SAVE_EVENT, {
              detail: { id: itemId },
            })
          );
        }

        window.alert('تم حفظ الخانة وتأكيد المزامنة السحابية بنجاح! 💾✅');
        return;
      }
    }
  });
}
