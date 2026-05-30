import type { Scheduler, CreateScheduler, SchedulerStatus } from '~/@types/scheduler';
import type { RegisterPaymentPayload } from '~/components/payment/PaymentModal';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class SchedulerController {
  async create(scheduler: CreateScheduler): Promise<Scheduler> {
    const result = await Request.post<Scheduler>('/scheduler', scheduler);
    return result;
  }

  async cancellation(scheduler: Partial<Scheduler> & { id: string }) {
    const result = await Request.patch<Scheduler>(
      `/scheduler-cancellation/${scheduler.id}`,
      scheduler,
    );
    return result;
  }

  async update(scheduler: Partial<Scheduler> & { id: string }) {
    const result = await Request.patch<Scheduler>(
      `/scheduler/${scheduler.id}`,
      scheduler,
    );
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/scheduler/${id}`);
    return result;
  }

  async deleteMany(ids: string[]) {
    const result = await Request.delete(`/scheduler`, { data: { ids } });
    return result;
  }

  async list<T>(params: TableParams) {
    return Request.getTableData<T>('/scheduler-list', params);
  }

  async getById(id: string) {
    const result = await Request.get<Scheduler>(`/scheduler/${id}`);
    return result;
  }

  async getCountUnsyncedSchedulers() {
    const result = await Request.get<{ count: number }>(
      `/scheduler/count-unsynced-schedulers`,
    );
    return result;
  }

  async syncUnsyncedSchedulers() {
    const result = await Request.post(`/scheduler/sync-unsynced-schedulers`);
    return result;
  }

  async updateStatus({ id, status }: { id: string; status: SchedulerStatus }) {
    const result = await Request.patch(`/scheduler-status`, { id, status });
    return result;
  }
  async registerPayment(payment: RegisterPaymentPayload) {
    const result = await Request.post(`/scheduler-payment`, payment);
    return result;
  }
}

export default new SchedulerController();
