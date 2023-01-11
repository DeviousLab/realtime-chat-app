import { Button } from "@chakra-ui/react"
import { signOut } from "next-auth/react"

type ChatProps = {}

const Chat = (props: ChatProps) => {
  return (
    <div>
      Chat
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  )
}

export default Chat