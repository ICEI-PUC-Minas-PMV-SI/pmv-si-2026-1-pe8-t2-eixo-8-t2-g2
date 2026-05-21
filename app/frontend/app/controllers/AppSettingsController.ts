import type { AppSettingsPayload } from '~/@types/app-settings';
import Request from '~/utils/Request';

class AppSettingsController {
  save(payload: AppSettingsPayload) {
    return Request.post('/app-settings', payload);
  }
  find() {
    return Request.get<AppSettingsPayload>('/app-settings');
  }
}
const instance = new AppSettingsController();
export { instance as AppSettingsController };
