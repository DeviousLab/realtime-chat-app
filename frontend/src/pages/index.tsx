import Head from 'next/head'
import { getSession, useSession } from 'next-auth/react'
import { NextPageContext } from 'next';
import { Box } from '@chakra-ui/react';

import Auth from '../components/auth/Auth';
import Chat from '../components/chat/Chat';

export default function Home() {
  const { data: session } = useSession();

  console.log(session)

  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  }

  return (
    <>
      <Head>
        <title>Realtime Chat App</title>
        <meta name="description" content="An app to chat with people in real time" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        {session?.user?.username ? <Chat/> : <Auth session={session} reloadSession={reloadSession} />}
      </Box>
    </>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context)

  return {
    props: {
      session,
    }
  }
}