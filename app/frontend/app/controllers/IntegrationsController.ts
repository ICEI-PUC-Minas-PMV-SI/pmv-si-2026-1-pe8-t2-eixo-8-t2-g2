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
    await Request.post('/integrations/test', { integration });
  }
}
const instance = new IntegrationsController();
export { instance as IntegrationsController };
