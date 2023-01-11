import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
};

export const theme = extendTheme(
  { config },
  {
	colors: {
		brand: {
			100: '#3d4f7',
		},
	},
	styles: {
		global: () => ({
			body: {
				bg: 'whiteAlpha.400',
			},
		}),
	},
});
