import { Button, Flex } from "@chakra-ui/react"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import ConversationsWrapper from "./conversations/ConversationsWrapper"
import FeedWrapper from "./feed/FeedWrapper"

type ChatProps = {
  session: Session
}

const Chat = ({ session }: ChatProps) => {
  return (
    <Flex height="100vh">
      <ConversationsWrapper session={session} />
      <FeedWrapper session={session} />
      <Button onClick={() => signOut()}>Sign Out</Button>
    </Flex>
  )
}

export default Chat