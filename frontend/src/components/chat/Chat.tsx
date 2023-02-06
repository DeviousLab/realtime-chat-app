import { Flex } from "@chakra-ui/react"
import { Session } from "next-auth"
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
    </Flex>
  )
}

export default Chat