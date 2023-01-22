import { Session } from "next-auth"

type FeedWrapperProps = {
  session: Session
}

const FeedWrapper = ({ session }: FeedWrapperProps) => {
  return (
    <div>FeedWrapper</div>
  )
}

export default FeedWrapper