![ndk-basics-workshop](https://github.com/pleb-devs/ndk-basics/assets/108303703/4aa1ad8d-0666-45ef-9fdc-9bf2eac35e18)

# Nostr Dev Kit (NDK)

[NDK](https://ndkit.com/) is a library that helps you interact with the nostr network.

We will be using the [Javascript API](https://github.com/nostr-dev-kit/ndk)

## Building This Project

This is a basic app that will allow you to fetch a note or profile and then update *your* profile.

The finished product looks something like:

![image](https://github.com/pleb-devs/ndk-basics/assets/108303703/0fea3be2-30ed-4566-9ce6-054b7922584e)

The steps are as follows:

1. Create a new next.js project
2. Clean out [index.js](src/pages/index.js)
3. Clean out [Home.module.css](src/styles/Home.module.css)
5. Create [Search.js](src/pages/Search.js)
6. Create [Event.js](src/pages/Event.js)
8. Create [UpdateProfile.js](src/pages/UpdateProfile.js)
9. ctrl + f "TODO" - finish all the TODOs

### Create a new Next.JS project

```bash
npx create-next-app@latest

# install deps
npm install @nostr-dev-kit/ndk nostr-tools
```
### A Bit of Housekeeping

##### index.js: 

Clean out index.js and create a new instance of NDK.

```javascript
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import NDK from "@nostr-dev-kit/ndk";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="NDK Basics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main}`}>
        */ components /*
      </main>
    </>
  );
}

// define the relays to publish and read from
const defaultRelays = ["wss://relay.damus.io", "wss://relay.primal.net"];

// create a new NDK instance
const ndk = new NDK({ explicitRelayUrls: defaultRelays });

// connect to the relays
ndk
  .connect()
  .then(() => console.log("ndk connected"))
  .catch((err) => console.error(err));

export { ndk };
```

##### Home.module.css:

Define all the styles we will need.

```css
.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6rem;
  min-height: 100vh;
}

.search,
.update {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
}

.searchBar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  width: 100%;
}

.search input,
.update input {
  width: 100%;
}

.search button,
.update button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
```

### Create `src/pages/Search.js

This component is a search bar that allows you to search for notes and npubs.

```javascript
import { useState } from "react";
import styles from "@/styles/Home.module.css";
import { ndk } from "@/pages/index";
import { nip19 } from "nostr-tools";
import Event from "./Event";

const Search = () => {
  const [input, setInput] = useState("");
  const [ndkEvent, setNdkEvent] = useState(null);

  // to serach for a kind 0 event singed by a specific pubkey
  const kind0Filter = (pubkey) => ({
    kinds: [0],
    authors: [pubkey],
  });

  // to search for an event by it's id
  const eventIdFilter = (id) => ({
    ids: [id],
  });

  // takes a query in the form of "note..." or "npub..."
  // TODO: expand to accept more query types
  const search = async (query) => {
    // tell the relays what we're looking for with a "filter"
    // https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
    let filter = {};

    // nip19 defines a standard for bech32 encoding of different data types (pubkey, note id, etc.)
    // https://github.com/nostr-protocol/nips/blob/master/19.md
    if (query.startsWith("npub")) {
      const decodedNpub = nip19.decode(query);
      const pubkey = decodedNpub.data;

      filter = kind0Filter(pubkey); // TODO: search for profile (kind 0) along with kind 1 events authored by this pubkey
    } else if (query.startsWith("note")) {
      const decodedNote = nip19.decode(query);
      const noteId = decodedNote.data;

      filter = eventIdFilter(noteId);
    }

    console.log("SEARCH FILTER", filter);

    // fetchEvent takes a type of NDKFilter
    // see node_modules/@nostr-dev-kit/ndk/dist/index.d.ts --> "type NDKFilter"
    return await ndk.fetchEvent(filter);
  };

  const handleSearch = async (query) => {
    const result = await search(query);
    if (result) {
      console.log("SEARCH RESULT", result);
      setNdkEvent(result);
    }
  };

  return (
    <div className={`${styles.search}`}>
      <h2>Search</h2>
      <p>Search for a profile by npub... or a note by note...</p>
      <div className={`${styles.searchBar}`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => handleSearch(input)}>Search</button>
      </div>
      <Event event={ndkEvent} />
      <hr />
    </div>
  );
};

export default Search;
```

#### Import to `src/pages/index.js`

Make sure you import the new component to your index.js file.

```javascript
import Search from "./Search";
```
```javascript
      <main className={`${styles.main}`}>
        <Search />
      </main>
```

### Create `src/pages/Event.js`

This component is used for rendering different types of events. Currently, Event.js only renders kind 0 events or event json.

```javascript
/* eslint-disable @next/next/no-img-element */
export default function Event({ event }) {
  const stringify = (event) => {
    return JSON.stringify(
      event.rawEvent(),
      null,
      2
    );
  };

  const renderEvent = (event) => {
    if (event.kind === 0) {
      const parsed = JSON.parse(event.content);
      return (
        <div>
          <h3>{parsed.name}</h3>
          <img src={parsed.picture} width={100} height={100} alt="" />
          <div>{parsed.about}</div>
        </div>
      );
    } else {
      // TODO: render other kinds of events. Start with kind 1 (plain text note)
      return (
        <div>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              fontFamily: "monospace",
            }}
          >
            {stringify(event)}
          </pre>
        </div>
      );
    }
  };

  return <div>{event && renderEvent(event)}</div>;
}
```

### Create `src/pages/UpdateProfile.js`

This component consists of three inputs that allow you to update your profile `name`, `about`, and `picture`.

>> Make sure you have NIP07 browser extension.

```javascript
import { useState } from "react";
import styles from "@/styles/Home.module.css";
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

    // kind0 content is set to a stringified JSON object {name: <username>, about: <string>, picture: <url, string>, ...}
    // https://github.com/nostr-protocol/nips/blob/master/01.md#kinds
    kind0.content = JSON.stringify({
      name: username,
      about,
      picture,
    });

    // TIP: we did not set all the required fields for this to be a valid event

    // event format defined here: https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
    // NDK will automatically fill in the missing fields that it can

    // CHALLENGE: What are the missing fields? How does NDK fill them in?

    console.log("Unsigned KIND0", kind0.rawEvent());

    // use NIP07 to sign the event
    await kind0.sign(signer);

    console.log("Signed KIND0", kind0.rawEvent());

    // publish the event to the relays we connected to in index.js
    await kind0.publish();
  };

  return (
    <div className={`${styles.update}`}>
      <h2>Update Profile</h2>
      <p>Create a new/updated kind0</p>
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
```

#### Import to `src/pages/index.js`

And of course, import to index.js

```javascript
import UpdateProfile from "./UpdateProfile";
```

```javascript
      <main className={`${styles.main}`}>
        <Search />
        <UpdateProfile />
      </main>
```

Now that we have the bare bones of the project done, there are a few more items to take care of. Search through the project to find the "TODO" comments. These will be extra challenges to make sure you get what's going on.







