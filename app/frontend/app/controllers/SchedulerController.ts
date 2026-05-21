import type { Scheduler, CreateScheduler } from '~/@types/scheduler';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class SchedulerController {
  async create(scheduler: CreateScheduler): Promise<Scheduler> {
    const result = await Request.post<Scheduler>('/scheduler', scheduler);
    return result;
  }

  async update(scheduler: Partial<Scheduler> & { id: string }) {
    const result = await Request.patch<Scheduler>(
      `/scheduler-cancellation/${scheduler.id}`,
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
}

export default new SchedulerController();
