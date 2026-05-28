class Popup {
  openGoogleAuth(url: string) {
    const width = 500;
    const height = 600;

    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      'googleAuth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    return popup;
  }
}

const instance = new Popup();
export { instance as Popup };
