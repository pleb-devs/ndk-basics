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
