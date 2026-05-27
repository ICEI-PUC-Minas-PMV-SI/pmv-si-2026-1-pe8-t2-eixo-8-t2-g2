import type { IntegrationsPayload } from '~/@types/integrations';
import Request from '~/utils/Request';

class IntegrationsController {
  async list() {
    const data = Request.get<IntegrationsPayload>('/integrations');
    return data;
  }
  async save(payload: IntegrationsPayload) {
    const data = Request.post<{ url: string }>('/integrations', payload);
    return data;
  }
  async test(integration: string) {
    return Request.post<{ success: boolean }>('/integrations/test', { integration });
  }
}
const instance = new IntegrationsController();
export { instance as IntegrationsController };
