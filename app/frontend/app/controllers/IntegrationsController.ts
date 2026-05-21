import type { IntegrationsPayload } from '~/@types/integrations';
import Request from '~/utils/Request';

class IntegrationsController {
  async find() {
    const data = Request.get<IntegrationsPayload>('/integrations');
    return data;
  }
  async save(payload: IntegrationsPayload) {
    const data = Request.post<{ url: string }>('/integrations', payload);
    return data;
  }
}
const instance = new IntegrationsController();
export { instance as IntegrationsController };
