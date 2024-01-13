import { useState } from "react";
import { ndk } from "@/pages/index";
import { nip19 } from "nostr-tools";
import Kind0Event from "./Kind0Event";

const Search = () => {
  const [input, setInput] = useState("");
  const [eventKind, setEventKind] = useState(null);
  const [eventContent, setEventContent] = useState(null);

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
    if (query.startsWith("npub")) {
      const decodedNpub = nip19.decode(query);
      const pubkey = decodedNpub.data;

      filter = kind0Filter(pubkey);
    } else if (query.startsWith("note")) {
      const decodedNote = nip19.decode(query);
      const noteId = decodedNote.data;

      filter = eventIdFilter(noteId);
    }

    console.log("SEARCH FILTER", filter);

    // fetchEvent takes a type of NDKFilter
    // see node_modules/@nostr-dev-kit/ndk/dist/index.d.mts --> "type NDKFilter"
    const event = await ndk.fetchEvent(filter);

    return parseSearchResult(event);
  };

  const parseSearchResult = (event) => {
    if (event.kind === 0) {
      const parsed = JSON.parse(event.content);
      return { parsed, kind: 0 };
    } else {
      return { parsed: event, kind: null };
    }
  };

  const handleSearch = async (query) => {
    const { parsed, kind } = await search(query);

    setEventKind(kind);
    setEventContent(parsed);
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => handleSearch(input)}>Search</button>
      {eventKind === 0 && Kind0Event({ event: eventContent })}
    </div>
  );
};

export default Search;
