import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PendingScheduler } from '~/@types/scheduler';
import ReviewController from '~/controllers/ReviewController';
import { useAuthStore } from './useAuthStore';

/**
 * Hook que busca pedidos concluídos ainda não avaliados nem ignorados
 * e controla a exibição do ReviewModal automático no login do cliente.
 *
 * Uso na tela principal do cliente:
 *
 *   const { pendingReview, schedulersPendingReview, clearPendingReview } = useReviewPrompt();
 *
 *   return (
 *     <>
 *       ...
 *       <ReviewModal
 *         mode="list"
 *         open={pendingReview}
 *         schedulers={schedulersPendingReview}
 *         onClose={clearPendingReview}
 *         onSubmitReview={handleReviewSubmit}
 *         onIgnore={handleIgnore}
 *       />
 *     </>
 *   );
 */

export function useReviewPrompt() {
  const { isAdmin } = useAuthStore();
  if (isAdmin()) {
    return {
      pendingReview: false,
      schedulersPendingReview: [],
      clearPendingReview: () => {},
    };
  }
  const [pendingReview, setPendingReview] = useState(false);

  const { data: schedulersPendingReview = [] } = useQuery<PendingScheduler[]>({
    queryKey: ['pending-reviews'],
    queryFn: () => ReviewController.listPendingForCustomer(),
    // Só executa uma vez por sessão
    staleTime: Infinity,
  });

  // Abre automaticamente se houver pedidos pendentes
  useEffect(() => {
    if (schedulersPendingReview.length > 0) {
      // Pequeno delay para não sobrepor animações de login
      const t = setTimeout(() => setPendingReview(true), 800);
      return () => clearTimeout(t);
    }
  }, [schedulersPendingReview.length]);

  const clearPendingReview = () => setPendingReview(false);

  return {
    pendingReview,
    schedulersPendingReview,
    clearPendingReview,
  };
}
