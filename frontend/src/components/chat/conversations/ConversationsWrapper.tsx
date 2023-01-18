import { Session } from "next-auth"

type ConversationsWrapperProps = {
  session: Session
}

const ConversationsWrapper = ({ session }: ConversationsWrapperProps) => {
  return (
    <div>ConversationsWrapper</div>
  )
}

export default ConversationsWrapper