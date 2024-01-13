import Image from "next/image"

export default function Kind0Event({ event }) {
  return (
    <div>
      <h2>{event.name}</h2>
      <Image src={event.picture} width={200} height={200} alt=""/>
      <p>{event.about}</p>
    </div>
  )
}