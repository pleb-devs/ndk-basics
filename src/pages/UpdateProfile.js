import { useState } from "react";
import { ndk } from "@/pages/index";
import { NDKEvent, NDKKind, NDKNip07Signer } from "@nostr-dev-kit/ndk";

export default function UpdateProfile() {
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [picture, setPicture] = useState("");

  // NDK supports multiple signers, this one relies on a nip07 browser extension
  // https://github.com/nostr-protocol/nips/blob/master/07.md
  const signer = new NDKNip07Signer();

  // For this example we will only update username, about, and picture
  // Kind0 metadata events can contain other fields
  const update = async () => {
    // kind0s are profile metadata events
    // https://github.com/nostr-protocol/nips/blob/master/01.md
    const kind0 = new NDKEvent(ndk, { kind: NDKKind.Metadata });

    // get the user object from the NIP07 browser extension
    const user = await signer.user();

    // the pubkey is set to whichever key is going to sign the event
    kind0.pubkey = user.pubkey;

    // kind0 content is set to a stringified JSON object {name: <username>, about: <string>, picture: <url, string>, ...}
    // https://github.com/nostr-protocol/nips/blob/master/01.md#kinds
    kind0.content = JSON.stringify({
      name: username,
      about,
      picture,
    });

    // use NIP07 to sign the event
    await kind0.sign(signer);

    // publish the event to the relays we connected to in index.js
    await kind0.publish();
  };

  return (
    <div>
      <input
        type="text"
        value={username}
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        value={about}
        placeholder="about"
        onChange={(e) => setAbout(e.target.value)}
      />
      <input
        type="text"
        value={picture}
        placeholder="picture"
        onChange={(e) => setPicture(e.target.value)}
      />
      <button onClick={update}>Update</button>
    </div>
  );
}
