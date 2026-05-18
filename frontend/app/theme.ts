import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#E06D5B',
    colorText: '#333333',
    colorBgBase: '#FFFFFF',
    colorLink: '#E06D5B',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  components: {
    Menu: {
      itemSelectedBg: '#E06D5B', // fundo sólido no selecionado
      itemSelectedColor: '#ffffff', // texto branco no selecionado
      // itemBorderRadius: 0, // sem borda arredondada
      // itemMarginInline: 0, // sem margem lateral
      // itemMarginBlock: 0, // sem margem vertical
    },
  },
};
