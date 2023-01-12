import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';

import { theme } from '../chakra/theme';
import { client } from '../graphql/apollo-client';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ApolloProvider client={client}>
			<SessionProvider session={pageProps.session}>
				<ChakraProvider theme={theme}>
					<Component {...pageProps} />
					<Toaster />
				</ChakraProvider>
			</SessionProvider>
		</ApolloProvider>
	);
}
