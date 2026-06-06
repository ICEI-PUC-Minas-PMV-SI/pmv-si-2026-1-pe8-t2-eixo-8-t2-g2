import type { AppSettingsPayload } from '~/@types/app-settings';
import Request from '~/utils/Request';
import TextUtil from '~/utils/TextUtil';

class AppSettingsController {
  save(payload: AppSettingsPayload) {
    const data = { ...payload };
    data.whatsapp = TextUtil.unformatPhone(data.whatsapp);
    return Request.post('/app-settings', data);
  }
  find() {
    return Request.get<AppSettingsPayload>('/app-settings');
  }
  findInfo() {
    return Request.get<AppSettingsPayload>('/footerInfo');
  }
}
const instance = new AppSettingsController();
export { instance as AppSettingsController };
